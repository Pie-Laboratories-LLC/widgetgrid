// BoardService over gRPC-Web -- see proto/widgetgrid/v1/board.proto. Own
// client per widget, same reasoning as widgets/blog/src/blogClient.js.
// Every call carries the sign-in token when there is one: reads say what
// the viewer may do (BoardViewer), writes need it.
import {
  ListSectionsRequest, ListThreadsRequest, GetThreadRequest, CreateThreadRequest, ReplyRequest,
  EditPostRequest, DeletePostRequest, SetReplyNotificationsRequest, HidePostRequest, BanUserRequest,
  ListHeldImagesRequest, ReviewImageRequest,
} from '@widgetgrid/proto-gen-web/widgetgrid/v1/board_pb.js';
import { BoardServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/board_grpc_web_pb.js';
import { authMetadata } from '@widgetgrid/auth-web';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new BoardServicePromiseClient(GRPC_WEB_ORIGIN);

// .toObject() names repeated fields "<name>List" -- see
// packages/web-app/src/grpc/normalize.js.
const section = (s) => s && { slug: s.slug, name: s.name, description: s.description, threadCount: s.threadCount };
const post = (p) => p && { ...p };

function request(Type, fields) {
  const r = new Type();
  for (const [name, value] of Object.entries(fields)) r[`set${name[0].toUpperCase()}${name.slice(1)}`](value);
  return r;
}

async function send(method, Type, fields = {}) {
  return (await client[method](request(Type, fields), await authMetadata())).toObject();
}

export const boardClient = {
  async listHeldImages() {
    return (await send('listHeldImages', ListHeldImagesRequest)).imagesList.map((img) => ({ ...img, labels: img.labelsList }));
  },
  async reviewImage(id, approve) {
    await send('reviewImage', ReviewImageRequest, { id, approve });
  },
  // An image for a post -> { url, markdown, status } ('ok', or 'held' for
  // a moderator to look at). The raw file goes to static-server's
  // POST /media/upload (see proto/widgetgrid/v1/media.proto); throws with
  // the server's message.
  async uploadImage(file) {
    const response = await fetch('/media/upload?purpose=board', {
      method: 'POST',
      headers: { ...(await authMetadata()), 'Content-Type': 'application/octet-stream' },
      body: file,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message ?? 'The upload failed. Please try again.');
    return result;
  },
  async listSections() {
    const r = await send('listSections', ListSectionsRequest);
    return { sections: r.sectionsList.map(section), viewer: r.viewer };
  },
  async listThreads(sectionSlug, before = '') {
    const r = await send('listThreads', ListThreadsRequest, { section: sectionSlug, before });
    return { section: section(r.section), threads: r.threadsList, nextBefore: r.nextBefore, viewer: r.viewer };
  },
  async getThread(threadId) {
    const r = await send('getThread', GetThreadRequest, { threadId });
    return { section: section(r.section), posts: r.postsList.map(post), viewer: r.viewer };
  },
  async createThread({ section: sectionSlug, title, body, notifyReplies }) {
    return (await send('createThread', CreateThreadRequest, { section: sectionSlug, title, body, notifyReplies })).threadId;
  },
  async reply({ parentId, body, notifyReplies }) {
    return post((await send('reply', ReplyRequest, { parentId, body, notifyReplies })).post);
  },
  async editPost({ postId, body, title = '' }) {
    return post((await send('editPost', EditPostRequest, { postId, body, title })).post);
  },
  async deletePost(postId) {
    await send('deletePost', DeletePostRequest, { postId });
  },
  async setReplyNotifications(postId, enabled) {
    await send('setReplyNotifications', SetReplyNotificationsRequest, { postId, enabled });
  },
  async hidePost(postId, hidden) {
    await send('hidePost', HidePostRequest, { postId, hidden });
  },
  async banUser(username, banned) {
    await send('banUser', BanUserRequest, { username, banned });
  },
};

// gRPC-Web errors carry the server's message, written for the reader;
// anything else (network) gets a generic one.
export function describe(err) {
  return typeof err?.code === 'number' && err.message ? err.message : 'Something went wrong. Please try again later.';
}

const RELATIVE = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];

// "3 hours ago" -- with the exact time as a title on the element.
export function relativeTime(iso) {
  if (!iso) return '';
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return RELATIVE.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export function exactTime(iso) {
  return iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}
