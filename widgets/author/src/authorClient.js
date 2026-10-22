// AuthorService over gRPC-Web -- see proto/widgetgrid/v1/author.proto --
// plus image uploads, which go to static-server's POST /media/upload as
// the raw file (see media.proto for why not gRPC-Web).
import {
  ListAuthoringRequest, CreateDraftRequest, GetDraftRequest, SaveDraftRequest, DeleteDraftRequest,
  PreviewRequest, PublishRequest, EmailSubscribersRequest,
} from '@widgetgrid/proto-gen-web/widgetgrid/v1/author_pb.js';
import { AuthorServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/author_grpc_web_pb.js';
import { authMetadata } from '@widgetgrid/auth-web';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new AuthorServicePromiseClient(GRPC_WEB_ORIGIN);

function request(Type, fields) {
  const r = new Type();
  for (const [name, value] of Object.entries(fields)) r[`set${name[0].toUpperCase()}${name.slice(1)}`](value);
  return r;
}

async function send(method, Type, fields = {}) {
  return (await client[method](request(Type, fields), await authMetadata())).toObject();
}

export const authorClient = {
  async list() {
    const r = await send('listAuthoring', ListAuthoringRequest);
    return { posts: r.postsList, drafts: r.draftsList };
  },
  async createDraft(fileName = '') {
    return (await send('createDraft', CreateDraftRequest, { fileName })).draft;
  },
  async getDraft(id) {
    return (await send('getDraft', GetDraftRequest, { id })).draft;
  },
  async saveDraft(fields) {
    return (await send('saveDraft', SaveDraftRequest, fields)).draft;
  },
  async deleteDraft(id) {
    await send('deleteDraft', DeleteDraftRequest, { id });
  },
  async preview(fields) {
    return send('preview', PreviewRequest, fields);
  },
  async publish(draftId) {
    return (await send('publish', PublishRequest, { draftId })).slug;
  },
  async emailSubscribers(slug) {
    return (await send('emailSubscribers', EmailSubscribersRequest, { slug })).sentTo;
  },
  // -> { url, markdown }; throws with the server's message.
  async uploadImage(draftId, file) {
    const response = await fetch(`/media/upload?purpose=draft&draft=${encodeURIComponent(draftId)}`, {
      method: 'POST',
      headers: { ...(await authMetadata()), 'Content-Type': 'application/octet-stream' },
      body: file,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message ?? 'The upload failed. Please try again.');
    return result;
  },
};

// A gRPC error's message, or a generic one.
export function describe(err) {
  return err?.message || 'Something went wrong. Please try again.';
}
