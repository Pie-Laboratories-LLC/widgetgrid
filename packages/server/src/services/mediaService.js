import crypto from 'node:crypto';
import grpc from '@grpc/grpc-js';
import * as defaultImagesRepo from '@widgetgrid/db/src/boardImagesRepo.js';
import * as defaultDraftsRepo from '@widgetgrid/db/src/draftsRepo.js';
import * as defaultBoardRepo from '@widgetgrid/db/src/boardRepo.js';
import { GROUP_ADMINS } from '@widgetgrid/auth-node';
import { processImage, ImageError } from '../imagePipeline.js';
import { decide } from '../moderation.js';
import { contentTypeOf } from '../mediaStore.js';
import {
  boardImageUrl, imagesFrom, MAX_UPLOADS_PER_HOUR,
} from '../boardImages.js';

// Uploaded images -- see proto/widgetgrid/v1/media.proto. Everything that
// comes in is decoded, shrunk and re-encoded (imagePipeline.js); board
// images are also scanned (moderation.js) and only stored if the scan
// doesn't refuse them. Everything that goes out is checked first: a held
// or refused image, or one in a hidden or deleted post, isn't served.

class MediaError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const randomId = (bytes) => crypto.randomBytes(bytes).toString('base64url');

const BOARD_PATH = /^board\/([A-Za-z0-9_-]{22})\.webp$/;
const DRAFT_PATH = /^drafts\/(\d+)\/([A-Za-z0-9_-]{16}\.webp)$/;

export function createMediaService({
  pool, authContext, mediaStore, moderator,
  imagesRepo = defaultImagesRepo, draftsRepo = defaultDraftsRepo, boardRepo = defaultBoardRepo,
  now = () => Date.now(),
}) {
  async function process(data) {
    try {
      return await processImage(Buffer.from(data ?? []));
    } catch (err) {
      if (err instanceof ImageError) throw new MediaError(grpc.status.INVALID_ARGUMENT, err.message);
      throw err;
    }
  }

  async function uploadToDraft(caller, request) {
    if (caller.role !== 'owner') throw new MediaError(grpc.status.PERMISSION_DENIED, 'Only the site owner writes the blog.');
    const draft = await draftsRepo.get(pool, String(request.draftId ?? ''));
    if (!draft) throw new MediaError(grpc.status.NOT_FOUND, 'That draft no longer exists.');
    const { webp } = await process(request.data);
    const name = `${randomId(12)}.webp`;
    const key = `drafts/${draft.id}/${name}`;
    await mediaStore.put(key, webp, 'image/webp');
    await draftsRepo.addImage(pool, { id: draft.id, name });
    return { url: `/media/${key}`, markdown: `![](./${name})`, status: 'ok' };
  }

  async function uploadToBoard(caller, request) {
    if (!caller.username) throw new MediaError(grpc.status.FAILED_PRECONDITION, 'Choose a username on your account page first.');
    if (await boardRepo.isBanned(pool, caller.userId)) throw new MediaError(grpc.status.PERMISSION_DENIED, "You can't post on the message boards.");
    const moderatorCaller = caller.role === 'owner' || caller.groups.includes(GROUP_ADMINS);
    const from = imagesFrom(caller, { moderator: moderatorCaller });
    if (from && from.getTime() > now()) {
      throw new MediaError(grpc.status.PERMISSION_DENIED, `New accounts can add images after ${from.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`);
    }
    const recent = await imagesRepo.countByUserSince(pool, { userId: caller.userId, since: new Date(now() - 60 * 60 * 1000) });
    if (recent >= MAX_UPLOADS_PER_HOUR) throw new MediaError(grpc.status.RESOURCE_EXHAUSTED, "That's a lot of images in an hour. Try again later.");

    const { webp, jpeg, width, height } = await process(request.data);
    let labels;
    try {
      labels = await moderator.scan(jpeg);
    } catch (err) {
      // Never let an unscanned image through.
      console.error('[mediaService] moderation scan failed:', err);
      throw new MediaError(grpc.status.UNAVAILABLE, "We couldn't check that image just now. Please try again.");
    }
    const status = decide(labels);
    if (status === 'rejected') {
      console.log(`[mediaService] refused an upload from ${caller.username}: ${JSON.stringify(labels)}`);
      throw new MediaError(grpc.status.PERMISSION_DENIED, "That image can't be posted here.");
    }
    const id = randomId(16);
    await mediaStore.put(`board/${id}.webp`, webp, 'image/webp');
    await imagesRepo.create(pool, { id, userId: caller.userId, status, labels, width, height, bytes: webp.length });
    const url = boardImageUrl(id);
    return { url, markdown: `![](${url})`, status };
  }

  async function mayServe(path) {
    const board = BOARD_PATH.exec(path);
    if (board) {
      const image = await imagesRepo.findForServing(pool, board[1]);
      return !!image && image.status === 'ok' && !image.hidden_at && !image.deleted_at;
    }
    // Draft images: the name is random and only reaches the owner's editor.
    const draft = DRAFT_PATH.exec(path);
    if (draft) {
      const found = await draftsRepo.get(pool, draft[1]);
      return !!found && found.images.includes(draft[2]);
    }
    return false;
  }

  const handle = (fn) => async (call, callback) => {
    try {
      callback(null, await fn(call.request, call));
    } catch (err) {
      if (err instanceof MediaError) {
        callback({ code: err.code, message: err.message });
      } else {
        console.error('[mediaService] failed:', err);
        callback({ code: grpc.status.INTERNAL, message: 'Something went wrong. Please try again later.' });
      }
    }
  };

  return {
    UploadImage: handle(async (request, call) => {
      const caller = await authContext.getCaller(call);
      if (!caller) throw new MediaError(grpc.status.UNAUTHENTICATED, 'Log in to add images.');
      if (request.purpose === 'draft') return uploadToDraft(caller, request);
      if (request.purpose === 'board') return uploadToBoard(caller, request);
      throw new MediaError(grpc.status.INVALID_ARGUMENT, 'Unknown upload.');
    }),

    GetImage: handle(async (request) => {
      const path = String(request.path ?? '');
      if (!(await mayServe(path))) throw new MediaError(grpc.status.NOT_FOUND, 'No such image.');
      const data = await mediaStore.get(path);
      if (!data) throw new MediaError(grpc.status.NOT_FOUND, 'No such image.');
      return { data, contentType: contentTypeOf(path) };
    }),
  };
}
