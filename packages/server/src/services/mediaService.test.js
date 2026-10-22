import { test } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import sharp from 'sharp';
import { createMediaService } from './mediaService.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-10-22T12:00:00Z');
const png = () => sharp({ create: { width: 40, height: 30, channels: 3, background: '#2e7d32' } }).png().toBuffer();

function setup({ caller, labels = [], banned = false, recentUploads = 0, scanFails = false } = {}) {
  const files = new Map();
  const images = new Map();
  const drafts = new Map([['7', { id: '7', images: [] }]]);
  const service = createMediaService({
    pool: {},
    now: () => NOW,
    authContext: { getCaller: async () => caller },
    mediaStore: {
      put: async (key, bytes) => { files.set(key, bytes); },
      get: async (key) => files.get(key) ?? null,
      remove: async (key) => { files.delete(key); },
    },
    moderator: { scan: async () => { if (scanFails) throw new Error('down'); return labels; } },
    imagesRepo: {
      create: async (_p, row) => { images.set(row.id, { ...row, user_id: row.userId }); },
      countByUserSince: async () => recentUploads,
      findForServing: async (_p, id) => images.get(id) ?? null,
    },
    draftsRepo: {
      get: async (_p, id) => drafts.get(id) ?? null,
      addImage: async (_p, { id, name }) => { drafts.get(id).images.push(name); },
    },
    boardRepo: { isBanned: async () => banned },
  });
  const call = (method, request) => new Promise((resolve) => {
    service[method]({ request, metadata: { get: () => [] } }, (err, res) => resolve({ err, res }));
  });
  return { call, files, images, drafts };
}

const MEMBER = { userId: 'u1', username: 'alice', role: 'member', groups: [], joinedAt: new Date(NOW - 10 * DAY) };

test('a board upload is re-encoded, scanned, stored and served', async () => {
  const { call, files } = setup({ caller: MEMBER });
  const { err, res } = await call('UploadImage', { data: await png(), purpose: 'board' });
  assert.equal(err, null);
  assert.match(res.url, /^\/media\/board\/[A-Za-z0-9_-]{22}\.webp$/);
  assert.equal(res.markdown, `![](${res.url})`);
  assert.equal(res.status, 'ok');
  assert.equal(files.size, 1);
  const served = await call('GetImage', { path: res.url.slice('/media/'.length) });
  assert.equal(served.res.contentType, 'image/webp');
});

test('new accounts wait five days; moderators do not', async () => {
  const fresh = { ...MEMBER, joinedAt: new Date(NOW - 2 * DAY) };
  assert.equal((await setup({ caller: fresh }).call('UploadImage', { data: await png(), purpose: 'board' })).err.code, grpc.status.PERMISSION_DENIED);
  const admin = { ...fresh, groups: ['anonyme admins'] };
  assert.equal((await setup({ caller: admin }).call('UploadImage', { data: await png(), purpose: 'board' })).err, null);
});

test('signed out, banned, too fast, or not an image are all refused', async () => {
  const data = await png();
  assert.equal((await setup({}).call('UploadImage', { data, purpose: 'board' })).err.code, grpc.status.UNAUTHENTICATED);
  assert.equal((await setup({ caller: MEMBER, banned: true }).call('UploadImage', { data, purpose: 'board' })).err.code, grpc.status.PERMISSION_DENIED);
  assert.equal((await setup({ caller: MEMBER, recentUploads: 30 }).call('UploadImage', { data, purpose: 'board' })).err.code, grpc.status.RESOURCE_EXHAUSTED);
  assert.equal((await setup({ caller: MEMBER }).call('UploadImage', { data: Buffer.from('nope'), purpose: 'board' })).err.code, grpc.status.INVALID_ARGUMENT);
});

test('the scan refuses, holds, or fails closed', async () => {
  const data = await png();
  const refused = setup({ caller: MEMBER, labels: [{ name: 'Explicit Nudity', confidence: 99 }] });
  assert.equal((await refused.call('UploadImage', { data, purpose: 'board' })).err.code, grpc.status.PERMISSION_DENIED);
  assert.equal(refused.files.size, 0);

  const held = setup({ caller: MEMBER, labels: [{ name: 'Suggestive', confidence: 80 }] });
  const { res } = await held.call('UploadImage', { data, purpose: 'board' });
  assert.equal(res.status, 'held');
  // Held images aren't served.
  assert.equal((await held.call('GetImage', { path: res.url.slice('/media/'.length) })).err.code, grpc.status.NOT_FOUND);

  assert.equal((await setup({ caller: MEMBER, scanFails: true }).call('UploadImage', { data, purpose: 'board' })).err.code, grpc.status.UNAVAILABLE);
});

test('images in a hidden or deleted post are not served', async () => {
  const { call, images } = setup({ caller: MEMBER });
  const { res } = await call('UploadImage', { data: await png(), purpose: 'board' });
  const id = res.url.match(/board\/(.+)\.webp/)[1];
  images.get(id).hidden_at = new Date();
  assert.equal((await call('GetImage', { path: `board/${id}.webp` })).err.code, grpc.status.NOT_FOUND);
});

test('draft uploads are the owner\'s, relative in the markdown, and served while the draft has them', async () => {
  const owner = { ...MEMBER, role: 'owner' };
  const { call, drafts } = setup({ caller: owner });
  const { res } = await call('UploadImage', { data: await png(), purpose: 'draft', draftId: '7' });
  assert.match(res.markdown, /^!\[\]\(\.\/[A-Za-z0-9_-]{16}\.webp\)$/);
  assert.equal(drafts.get('7').images.length, 1);
  assert.equal((await call('GetImage', { path: res.url.slice('/media/'.length) })).err, null);
  assert.equal((await call('GetImage', { path: 'drafts/7/AAAAAAAAAAAAAAAA.webp' })).err.code, grpc.status.NOT_FOUND);

  assert.equal((await setup({ caller: MEMBER }).call('UploadImage', { data: await png(), purpose: 'draft', draftId: '7' })).err.code, grpc.status.PERMISSION_DENIED);
});

test('paths outside the two shapes are never read', async () => {
  const { call } = setup({ caller: MEMBER });
  for (const path of ['../.env', 'board/../../x.webp', 'drafts/7/../../x.webp', '']) {
    assert.equal((await call('GetImage', { path })).err.code, grpc.status.NOT_FOUND, path);
  }
});
