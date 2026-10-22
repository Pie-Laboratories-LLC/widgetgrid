import grpc from '@grpc/grpc-js';
import * as defaultRepo from '@widgetgrid/db/src/boardRepo.js';
import * as defaultImagesRepo from '@widgetgrid/db/src/boardImagesRepo.js';
import { GROUP_ADMINS } from '@widgetgrid/auth-node';
import { renderMarkup, markupToText, imageUrls } from '@widgetgrid/markup';
import { boardImageId, imagesFrom, MAX_IMAGES_PER_POST } from '../boardImages.js';

// The message boards -- see proto/widgetgrid/v1/board.proto.
const MAX_TITLE = 200;
const MAX_BODY = 20_000;
// Flood limit: at most this many posts (threads + replies) per window.
const FLOOD_POSTS = 6;
const FLOOD_WINDOW_MS = 10 * 60 * 1000;
const EXCERPT_CHARS = 400;

class BoardError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const iso = (d) => (d ? new Date(d).toISOString() : '');

function excerpt(body) {
  const text = markupToText(body);
  return text.length > EXCERPT_CHARS ? `${text.slice(0, EXCERPT_CHARS).trimEnd()}…` : text;
}

export function threadPath(sectionSlug, threadId, postId) {
  return `/site/messages/${sectionSlug}/${threadId}${postId && postId !== threadId ? `#post-${postId}` : ''}`;
}

export function createBoardService({
  pool, authContext, pushSender, emailSender, siteOrigin, mediaStore,
  repo = defaultRepo, imagesRepo = defaultImagesRepo, now = () => Date.now(),
}) {
  // The caller and what they may do. A signed-in user's ban is looked up
  // per call (not cached with the caller) so a ban bites immediately.
  async function viewerFor(call) {
    const caller = await authContext.getCaller(call);
    if (!caller) return { caller: null, viewer: { signedIn: false, username: '', canPost: false, banned: false, moderator: false } };
    const banned = await repo.isBanned(pool, caller.userId);
    const moderator = caller.role === 'owner' || caller.groups.includes(GROUP_ADMINS);
    const canPost = !!caller.username && !banned;
    const from = imagesFrom(caller, { moderator });
    const waiting = !!from && from.getTime() > now();
    return {
      caller,
      viewer: {
        signedIn: true,
        username: caller.username ?? '',
        canPost,
        banned,
        moderator,
        canUploadImages: canPost && !waiting,
        imagesFrom: canPost && waiting ? from.toISOString() : '',
      },
    };
  }

  // The uploaded images a body uses, as ids (anything else is just a URL).
  const imageIdsIn = (body) => [...new Set(imageUrls(body).map(boardImageId).filter(Boolean))];

  function checkImages(body) {
    if (imageIdsIn(body).length > MAX_IMAGES_PER_POST) {
      throw new BoardError(grpc.status.INVALID_ARGUMENT, `Posts can have up to ${MAX_IMAGES_PER_POST} images.`);
    }
  }

  // The rows for every uploaded image these posts use -- one query.
  async function imagesFor(rows) {
    const ids = [...new Set(rows.flatMap((row) => imageIdsIn(row.body ?? '')))];
    return new Map((await imagesRepo.findMany(pool, ids)).map((img) => [img.id, img]));
  }

  // How each image in a post shows: only the author's own uploads appear
  // as images (anyone else's is just a link); held ones say so; refused
  // ones vanish.
  const imagePolicy = (row, images) => (url) => {
    const image = images.get(boardImageId(url));
    if (!image || image.user_id !== row.author_id) return null;
    if (image.status === 'ok') return { src: url };
    if (image.status === 'held') return { held: true };
    return { omit: true };
  };

  async function requirePoster(call) {
    const { caller, viewer } = await viewerFor(call);
    if (!caller) throw new BoardError(grpc.status.UNAUTHENTICATED, 'Log in to post.');
    if (!caller.username) throw new BoardError(grpc.status.FAILED_PRECONDITION, 'Choose a username on your account page before posting.');
    if (viewer.banned) throw new BoardError(grpc.status.PERMISSION_DENIED, "You can't post on the message boards.");
    return { caller, viewer };
  }

  async function checkFlood(caller) {
    const recent = await repo.countPostsSince(pool, { authorId: caller.userId, since: new Date(now() - FLOOD_WINDOW_MS) });
    if (recent >= FLOOD_POSTS) throw new BoardError(grpc.status.RESOURCE_EXHAUSTED, "You're posting a lot quickly. Wait a few minutes and try again.");
  }

  function checkBody(raw) {
    const body = String(raw ?? '').trim();
    if (!body) throw new BoardError(grpc.status.INVALID_ARGUMENT, 'Write something first.');
    if (body.length > MAX_BODY) throw new BoardError(grpc.status.INVALID_ARGUMENT, `Posts can be up to ${MAX_BODY.toLocaleString('en-US')} characters.`);
    return body;
  }

  function checkTitle(raw) {
    const title = String(raw ?? '').trim();
    if (!title) throw new BoardError(grpc.status.INVALID_ARGUMENT, 'Give the thread a title.');
    if (title.length > MAX_TITLE) throw new BoardError(grpc.status.INVALID_ARGUMENT, `Titles can be up to ${MAX_TITLE} characters.`);
    return title;
  }

  // A post as the viewer may see it: text withheld when deleted, or
  // removed (except from moderators); the source only on their own.
  function present(row, { caller, viewer }, images = new Map()) {
    const mine = !!caller && row.author_id === caller.userId;
    const removed = !!row.hidden_at;
    const deleted = !!row.deleted_at;
    const showBody = !deleted && (!removed || viewer.moderator);
    return {
      id: row.id,
      parentId: row.parent_id ?? '',
      author: deleted ? '' : row.author_username ?? '',
      title: row.parent_id ? '' : (removed && !viewer.moderator ? '[removed]' : row.title ?? ''),
      bodyHtml: showBody ? renderMarkup(row.body, { image: imagePolicy(row, images) }) : '',
      body: mine && !deleted ? row.body : '',
      createdAt: iso(row.created_at),
      editedAt: iso(row.edited_at),
      deleted,
      removed,
      mine,
      notifyReplies: mine ? row.notify_replies : false,
      authorBanned: viewer.moderator ? !!row.author_banned : false,
    };
  }

  const presentSection = (s, threadCount = 0) => ({
    slug: s.slug, name: s.name, description: s.description, threadCount: s.thread_count ?? threadCount,
  });

  async function loadOwnPost(caller, postId) {
    const post = await repo.getPost(pool, String(postId ?? ''));
    if (!post || post.deleted_at) throw new BoardError(grpc.status.NOT_FOUND, 'That post no longer exists.');
    if (post.author_id !== caller.userId) throw new BoardError(grpc.status.PERMISSION_DENIED, 'You can only change your own posts.');
    return post;
  }

  // Everything that happens after a new post is saved -- best effort:
  // a failed push or email never fails the post itself.
  async function announce({ section, threadId, postId, caller, body, parent }) {
    const url = threadPath(section.slug, threadId, postId);
    if (caller.role !== 'owner') {
      pushSender.sendToOwner({
        title: `New post in ${section.name}`,
        body: `${caller.username}: ${excerpt(body)}`,
        tag: `board-${threadId}`,
        url,
      }).catch((err) => console.error('[boardService] owner push failed:', err));
    }
    // "Email me about replies" on the post being replied to -- direct
    // replies only, and never for replying to yourself.
    if (parent?.notify_replies && parent.author_id !== caller.userId && !parent.deleted_at && !parent.hidden_at) {
      const author = await repo.findUserById(pool, parent.author_id);
      if (!author?.email) return;
      const link = `${siteOrigin}${url}`;
      const text = [
        `${caller.username} replied to your post in ${section.name}:`,
        '',
        excerpt(body),
        '',
        `Read and reply: ${link}`,
        '',
        '--',
        'You asked to be emailed about replies to this post. To stop, untick "Email me about replies" on it.',
      ].join('\n');
      const html = `<p><strong>${escapeHtml(caller.username)}</strong> replied to your post in ${escapeHtml(section.name)}:</p>
<blockquote style="border-left:3px solid #ccc;margin:0;padding-left:12px">${renderMarkup(body)}</blockquote>
<p><a href="${escapeHtml(link)}">Read and reply</a></p>
<hr><p style="color:#666;font-size:0.85em">You asked to be emailed about replies to this post. To stop, untick "Email me about replies" on it.</p>`;
      emailSender.send({ to: author.email, subject: `${caller.username} replied to you on Pie Laboratories`, text, html })
        .catch((err) => console.error('[boardService] reply email failed:', err));
    }
  }

  const handle = (fn) => async (call, callback) => {
    try {
      callback(null, await fn(call.request, call));
    } catch (err) {
      if (err instanceof BoardError) {
        callback({ code: err.code, message: err.message });
      } else {
        console.error('[boardService] failed:', err);
        callback({ code: grpc.status.INTERNAL, message: 'Something went wrong. Please try again later.' });
      }
    }
  };

  return {
    ListSections: handle(async (_request, call) => {
      const { viewer } = await viewerFor(call);
      const sections = await repo.listSections(pool);
      return { sections: sections.map((s) => presentSection(s)), viewer };
    }),

    ListThreads: handle(async (request, call) => {
      const who = await viewerFor(call);
      const section = await repo.findSectionBySlug(pool, String(request.section ?? ''));
      if (!section) throw new BoardError(grpc.status.NOT_FOUND, 'There is no such section.');
      const limit = 30;
      const rows = await repo.listThreads(pool, {
        sectionId: section.id, before: request.before || null, limit: limit + 1, includeHidden: who.viewer.moderator,
      });
      const page = rows.slice(0, limit);
      return {
        section: presentSection(section),
        threads: page.map((row) => {
          const removed = !!row.hidden_at;
          return {
            id: row.id,
            title: row.title,
            author: row.deleted_at ? '' : row.author_username ?? '',
            createdAt: iso(row.created_at),
            replyCount: row.reply_count,
            lastReplyAt: iso(row.last_reply_at),
            removed,
          };
        }),
        nextBefore: rows.length > limit ? page[page.length - 1].id : '',
        viewer: who.viewer,
      };
    }),

    GetThread: handle(async (request, call) => {
      const who = await viewerFor(call);
      const rows = await repo.getThread(pool, String(request.threadId ?? ''));
      if (!rows.length || (rows[0].hidden_at && !who.viewer.moderator)) {
        throw new BoardError(grpc.status.NOT_FOUND, 'That thread no longer exists.');
      }
      const section = await repo.findSectionById(pool, rows[0].section_id);
      const images = await imagesFor(rows);
      return { section: presentSection(section), posts: rows.map((row) => present(row, who, images)), viewer: who.viewer };
    }),

    CreateThread: handle(async (request, call) => {
      const { caller } = await requirePoster(call);
      const section = await repo.findSectionBySlug(pool, String(request.section ?? ''));
      if (!section) throw new BoardError(grpc.status.NOT_FOUND, 'There is no such section.');
      const title = checkTitle(request.title);
      const body = checkBody(request.body);
      checkImages(body);
      await checkFlood(caller);
      const threadId = await repo.createThread(pool, {
        sectionId: section.id, authorId: caller.userId, title, body, notifyReplies: !!request.notifyReplies,
      });
      await imagesRepo.attachToPost(pool, { ids: imageIdsIn(body), userId: caller.userId, postId: threadId });
      await announce({ section, threadId, postId: threadId, caller, body });
      return { threadId };
    }),

    Reply: handle(async (request, call) => {
      const who = await requirePoster(call);
      const parent = await repo.getPost(pool, String(request.parentId ?? ''));
      if (!parent || (parent.hidden_at && !who.viewer.moderator)) throw new BoardError(grpc.status.NOT_FOUND, 'That post no longer exists.');
      const body = checkBody(request.body);
      checkImages(body);
      await checkFlood(who.caller);
      const postId = await repo.createReply(pool, {
        parent, authorId: who.caller.userId, body, notifyReplies: !!request.notifyReplies,
      });
      await imagesRepo.attachToPost(pool, { ids: imageIdsIn(body), userId: who.caller.userId, postId });
      const section = await repo.findSectionById(pool, parent.section_id);
      await announce({ section, threadId: parent.thread_id ?? parent.id, postId, caller: who.caller, body, parent });
      const row = await repo.getPost(pool, postId);
      return { post: present(row, who, await imagesFor([row])) };
    }),

    EditPost: handle(async (request, call) => {
      const who = await requirePoster(call);
      const post = await loadOwnPost(who.caller, request.postId);
      const body = checkBody(request.body);
      checkImages(body);
      const title = post.parent_id ? null : checkTitle(request.title);
      await repo.editPost(pool, { id: post.id, title, body });
      await imagesRepo.attachToPost(pool, { ids: imageIdsIn(body), userId: who.caller.userId, postId: post.id });
      const row = await repo.getPost(pool, post.id);
      return { post: present(row, who, await imagesFor([row])) };
    }),

    // Not gated on a ban: anyone may take their own words down.
    DeletePost: handle(async (request, call) => {
      const { caller } = await viewerFor(call);
      if (!caller) throw new BoardError(grpc.status.UNAUTHENTICATED, 'Log in first.');
      const post = await loadOwnPost(caller, request.postId);
      // Its images go with it -- rows first, then the files.
      const imageIds = await imagesRepo.deleteForPost(pool, post.id);
      await repo.deletePost(pool, post.id);
      for (const id of imageIds) {
        await mediaStore.remove(`board/${id}.webp`).catch((err) => console.error('[boardService] image delete failed:', err));
      }
      return {};
    }),

    SetReplyNotifications: handle(async (request, call) => {
      const { caller } = await viewerFor(call);
      if (!caller) throw new BoardError(grpc.status.UNAUTHENTICATED, 'Log in first.');
      const post = await loadOwnPost(caller, request.postId);
      await repo.setNotifyReplies(pool, { id: post.id, enabled: !!request.enabled });
      return {};
    }),

    HidePost: handle(async (request, call) => {
      const { caller, viewer } = await viewerFor(call);
      if (!viewer.moderator) throw new BoardError(grpc.status.PERMISSION_DENIED, 'Moderators only.');
      const post = await repo.getPost(pool, String(request.postId ?? ''));
      if (!post) throw new BoardError(grpc.status.NOT_FOUND, 'That post no longer exists.');
      await repo.setHidden(pool, { id: post.id, hidden: !!request.hidden, by: caller.userId });
      return {};
    }),

    BanUser: handle(async (request, call) => {
      const { caller, viewer } = await viewerFor(call);
      if (!viewer.moderator) throw new BoardError(grpc.status.PERMISSION_DENIED, 'Moderators only.');
      const target = await repo.findUserByUsername(pool, String(request.username ?? ''));
      if (!target) throw new BoardError(grpc.status.NOT_FOUND, 'No user by that name.');
      if (target.role === 'owner') throw new BoardError(grpc.status.PERMISSION_DENIED, "The site owner can't be banned.");
      await repo.setBanned(pool, { userId: target.id, banned: !!request.banned, by: caller.userId, reason: String(request.reason ?? '') });
      return {};
    }),

    ListHeldImages: handle(async (_request, call) => {
      const { viewer } = await viewerFor(call);
      if (!viewer.moderator) throw new BoardError(grpc.status.PERMISSION_DENIED, 'Moderators only.');
      const held = await imagesRepo.listHeld(pool);
      const images = [];
      for (const image of held) {
        const data = await mediaStore.get(`board/${image.id}.webp`);
        if (!data) continue;
        images.push({
          id: image.id,
          uploader: image.username ?? '',
          uploadedAt: iso(image.created_at),
          labels: image.labels.map((l) => `${l.name} ${Math.round(l.confidence)}%`),
          dataUrl: `data:image/webp;base64,${data.toString('base64')}`,
        });
      }
      return { images };
    }),

    ReviewImage: handle(async (request, call) => {
      const { caller, viewer } = await viewerFor(call);
      if (!viewer.moderator) throw new BoardError(grpc.status.PERMISSION_DENIED, 'Moderators only.');
      const reviewed = await imagesRepo.review(pool, { id: String(request.id ?? ''), approve: !!request.approve, by: caller.userId });
      if (!reviewed) throw new BoardError(grpc.status.NOT_FOUND, 'That image was already reviewed.');
      return {};
    }),
  };
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
