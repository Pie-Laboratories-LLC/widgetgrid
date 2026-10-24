import grpc from '@grpc/grpc-js';
import * as defaultDraftsRepo from '@widgetgrid/db/src/draftsRepo.js';
import * as defaultMailingsRepo from '@widgetgrid/db/src/emailSubscriptionsRepo.js';
import {
  buildPostFile, splitPostFile, postFileName, renderPreview, routeSlug,
} from '../blogSource.js';
import { AlreadySent } from '../postMailer.js';
import { AlreadyPosted, postWebUrl, suggestedText } from '../blueskyPoster.js';

// Writing the blog on the site -- see proto/widgetgrid/v1/author.proto.
// Owner only. Publishing writes an ordinary post file through blogSource
// (the same file a hand upload would be), copying the draft's images from
// the media store next to it; the draft is then deleted. Emailing
// subscribers is a separate, deliberate step.

const MAX_TITLE = 200;
const MAX_TEXT = 200_000;
// Posts dated before this were written before subscribers could be
// emailed, and never are -- no old post goes out by accident.
export const EMAIL_POSTS_FROM = '2026-10-22';

const emailable = (post) => post.publishedAt >= EMAIL_POSTS_FROM;

class AuthorError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const iso = (d) => (d ? new Date(d).toISOString() : '');

// A suggested address part from a title: "Life of Pie!" -> "life-of-pie".
export function slugFromTitle(title) {
  return routeSlug(String(title ?? '')).slice(0, 60).replace(/-+$/, '');
}

export function createAuthorService({
  pool, authContext, blogSource, mediaStore, postMailer, blueskyPoster, timeZone,
  draftsRepo = defaultDraftsRepo, mailingsRepo = defaultMailingsRepo, now = () => new Date(),
}) {
  async function requireOwner(call) {
    const caller = await authContext.getCaller(call);
    if (!caller) throw new AuthorError(grpc.status.UNAUTHENTICATED, 'Log in first.');
    if (caller.role !== 'owner') throw new AuthorError(grpc.status.PERMISSION_DENIED, 'Only the site owner writes the blog.');
    return caller;
  }

  async function loadDraft(id) {
    const draft = await draftsRepo.get(pool, String(id ?? ''));
    if (!draft) throw new AuthorError(grpc.status.NOT_FOUND, 'That draft no longer exists.');
    return draft;
  }

  const fileSlugOf = (fileName) => fileName.replace(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');

  const presentDraft = (draft) => ({
    id: draft.id,
    title: draft.title,
    synopsis: draft.synopsis,
    body: draft.body,
    slug: draft.slug,
    fileName: draft.file_name ?? '',
    publishedSlug: draft.file_name ? routeSlug(fileSlugOf(draft.file_name)) : '',
    updatedAt: iso(draft.updated_at),
  });

  function checkText({ title, synopsis, body }) {
    const t = String(title ?? '');
    if (t.length > MAX_TITLE) throw new AuthorError(grpc.status.INVALID_ARGUMENT, `Titles can be up to ${MAX_TITLE} characters.`);
    if (String(synopsis ?? '').length > MAX_TEXT || String(body ?? '').length > MAX_TEXT) {
      throw new AuthorError(grpc.status.INVALID_ARGUMENT, 'That post is too long to save.');
    }
    return { title: t, synopsis: String(synopsis ?? ''), body: String(body ?? '') };
  }

  // A relative image in the draft ("./x.webp") is one of its own uploads,
  // or -- editing a published post -- one already beside that post.
  function resolveImage(draft) {
    const own = new Set(draft.images ?? []);
    const postDir = draft.file_name?.replace(/\.md$/, '');
    return (name) => (own.has(name) || !postDir ? `/media/drafts/${draft.id}/${name}` : blogSource.assetUrl(postDir, name));
  }

  const handle = (fn) => async (call, callback) => {
    try {
      callback(null, await fn(call.request, call));
    } catch (err) {
      if (err instanceof AuthorError) {
        callback({ code: err.code, message: err.message });
      } else {
        console.error('[authorService] failed:', err);
        callback({ code: grpc.status.INTERNAL, message: 'Something went wrong. Please try again later.' });
      }
    }
  };

  return {
    ListAuthoring: handle(async (_request, call) => {
      await requireOwner(call);
      const [posts, drafts, sent, skeeted] = await Promise.all([
        blogSource.listPosts(), draftsRepo.list(pool), mailingsRepo.listSent(pool), blueskyPoster.listPosted(),
      ]);
      const draftByFile = new Map(drafts.filter((d) => d.file_name).map((d) => [d.file_name, d.id]));
      return {
        posts: posts.map((post) => ({
          fileName: post.fileName,
          slug: post.slug,
          title: post.title,
          publishedAt: post.publishedAt,
          emailedAt: iso(sent.get(post.slug)),
          draftId: draftByFile.get(post.fileName) ?? '',
          canEmail: !sent.has(post.slug) && emailable(post),
          blueskyPostedAt: iso(skeeted.get(post.slug)?.postedAt),
          blueskyUrl: skeeted.has(post.slug) ? postWebUrl(skeeted.get(post.slug).uri, blueskyPoster.handle) : '',
          blueskyText: skeeted.has(post.slug) ? '' : suggestedText(post),
        })),
        drafts: drafts.filter((d) => !d.file_name).map((d) => ({
          id: d.id, title: d.title, updatedAt: iso(d.updated_at), fileName: '',
        })),
      };
    }),

    CreateDraft: handle(async (request, call) => {
      await requireOwner(call);
      const fileName = String(request.fileName ?? '');
      if (!fileName) return { draft: presentDraft(await draftsRepo.create(pool, {})) };
      const existing = await draftsRepo.findByFileName(pool, fileName);
      if (existing) return { draft: presentDraft(existing) };
      const raw = await blogSource.readPost(fileName);
      if (raw === null) throw new AuthorError(grpc.status.NOT_FOUND, 'That post no longer exists.');
      const { title, synopsis, body } = splitPostFile(raw);
      return { draft: presentDraft(await draftsRepo.create(pool, { fileName, title, synopsis, body })) };
    }),

    GetDraft: handle(async (request, call) => {
      await requireOwner(call);
      return { draft: presentDraft(await loadDraft(request.id)) };
    }),

    SaveDraft: handle(async (request, call) => {
      await requireOwner(call);
      const draft = await loadDraft(request.id);
      const text = checkText(request);
      // A published post's slug is its filename's -- never changed here.
      const slug = draft.file_name ? '' : routeSlug(String(request.slug ?? ''));
      return { draft: presentDraft(await draftsRepo.update(pool, { id: draft.id, ...text, slug })) };
    }),

    DeleteDraft: handle(async (request, call) => {
      await requireOwner(call);
      const draft = await loadDraft(request.id);
      await draftsRepo.remove(pool, draft.id);
      for (const name of draft.images ?? []) {
        await mediaStore.remove(`drafts/${draft.id}/${name}`).catch(() => {});
      }
      return {};
    }),

    Preview: handle(async (request, call) => {
      await requireOwner(call);
      const draft = await loadDraft(request.draftId);
      const text = checkText(request);
      const raw = buildPostFile({ title: text.title || 'Untitled', synopsis: text.synopsis, body: text.body });
      const post = renderPreview({ raw, slug: draft.slug || 'preview', resolveImage: resolveImage(draft) });
      return { title: post.title, synopsisHtml: post.synopsisHtml, contentHtml: post.contentHtml };
    }),

    Publish: handle(async (request, call) => {
      await requireOwner(call);
      const draft = await loadDraft(request.draftId);
      if (!draft.title.trim()) throw new AuthorError(grpc.status.INVALID_ARGUMENT, 'Give the post a title before publishing.');
      if (!draft.synopsis.trim()) throw new AuthorError(grpc.status.INVALID_ARGUMENT, 'Write the synopsis before publishing.');

      let fileName = draft.file_name;
      if (!fileName) {
        const slug = routeSlug(draft.slug || slugFromTitle(draft.title));
        if (!slug) throw new AuthorError(grpc.status.INVALID_ARGUMENT, 'Choose an address for the post.');
        const taken = (await blogSource.listPosts()).some((post) => post.slug === slug);
        if (taken) throw new AuthorError(grpc.status.INVALID_ARGUMENT, `There's already a post at /blog/${slug}. Choose another address.`);
        fileName = postFileName(slug, now(), timeZone);
      }
      const postDir = fileName.replace(/\.md$/, '');
      // Images first, so the post never points at one that isn't there yet.
      for (const name of draft.images ?? []) {
        const bytes = await mediaStore.get(`drafts/${draft.id}/${name}`);
        if (bytes) await blogSource.writeAsset(postDir, name, bytes, 'image/webp');
      }
      await blogSource.writePost(fileName, buildPostFile(draft));
      await draftsRepo.remove(pool, draft.id);
      for (const name of draft.images ?? []) {
        await mediaStore.remove(`drafts/${draft.id}/${name}`).catch(() => {});
      }
      return { slug: routeSlug(fileSlugOf(fileName)) };
    }),

    EmailSubscribers: handle(async (request, call) => {
      await requireOwner(call);
      const post = (await blogSource.listPosts()).find((p) => p.slug === String(request.slug ?? ''));
      if (!post) throw new AuthorError(grpc.status.NOT_FOUND, 'That post no longer exists.');
      if (!emailable(post)) throw new AuthorError(grpc.status.FAILED_PRECONDITION, 'Posts from before emailing existed are never sent.');
      try {
        return { sentTo: await postMailer.send(post) };
      } catch (err) {
        if (err instanceof AlreadySent) throw new AuthorError(grpc.status.FAILED_PRECONDITION, 'Subscribers were already emailed about this post.');
        throw err;
      }
    }),

    // Any post, old ones included: unlike an email, nobody is sent
    // anything they didn't follow the account for.
    PostToBluesky: handle(async (request, call) => {
      await requireOwner(call);
      const post = (await blogSource.listPosts()).find((p) => p.slug === String(request.slug ?? ''));
      if (!post) throw new AuthorError(grpc.status.NOT_FOUND, 'That post no longer exists.');
      try {
        const uri = await blueskyPoster.send(post, request.text);
        return { url: uri ? postWebUrl(uri, blueskyPoster.handle) : '' };
      } catch (err) {
        if (err instanceof AlreadyPosted) throw new AuthorError(grpc.status.FAILED_PRECONDITION, 'This post is already on Bluesky.');
        if (err instanceof RangeError) throw new AuthorError(grpc.status.INVALID_ARGUMENT, err.message);
        if (/^Bluesky /.test(err.message)) {
          console.error('[authorService] Bluesky refused:', err.message);
          throw new AuthorError(grpc.status.UNAVAILABLE, "Bluesky didn't take the post. Try again in a little while.");
        }
        throw err;
      }
    }),
  };
}
