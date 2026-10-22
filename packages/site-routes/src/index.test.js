import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSitePath, sitePath, boardPath, writePath, isSitePath, sectionOf } from './index.js';

test('parseSitePath maps each view path, with or without a trailing slash', () => {
  assert.deepEqual(parseSitePath('/'), { view: 'blog', post: null });
  assert.deepEqual(parseSitePath('/blog'), { view: 'blog', post: null });
  assert.deepEqual(parseSitePath('/blog/'), { view: 'blog', post: null });
  assert.deepEqual(parseSitePath('/blog/life-of-pie'), { view: 'blog', post: 'life-of-pie' });
  assert.deepEqual(parseSitePath('/games'), { view: 'games', post: null });
  assert.deepEqual(parseSitePath('/games/solitaire'), { view: 'solitaire', post: null });
  assert.deepEqual(parseSitePath('/games/embuscade/'), { view: 'embuscade', post: null });
  assert.deepEqual(parseSitePath('/site/'), { view: 'site', post: null });
  assert.deepEqual(parseSitePath('/site/lhoraire'), { view: 'lhoraire', post: null });
  assert.deepEqual(parseSitePath('/site/subscribe'), { view: 'subscribe', post: null });
  assert.deepEqual(parseSitePath('/site/register'), { view: 'register', post: null });
  assert.deepEqual(parseSitePath('/chat'), { view: 'chat', post: null });
});

test('parseSitePath returns null for anything that is not a view', () => {
  assert.equal(parseSitePath('/blog/a/b'), null);
  assert.equal(parseSitePath('/about'), null);
});

test('sitePath round-trips through parseSitePath', () => {
  for (const view of ['blog', 'games', 'solitaire', 'embuscade', 'site', 'lhoraire', 'messages', 'subscribe', 'login', 'register', 'account', 'chat']) {
    assert.equal(parseSitePath(sitePath(view)).view, view);
  }
  assert.deepEqual(parseSitePath(sitePath('blog', 'what-the')), { view: 'blog', post: 'what-the' });
  assert.equal(sitePath('nonsense'), '/');
});

test('isSitePath covers the sections, not other pages', () => {
  assert.ok(isSitePath('/'));
  assert.ok(isSitePath('/games'));
  assert.ok(isSitePath('/site/messages'));
  assert.ok(!isSitePath('/about'));
  assert.ok(!isSitePath('/blogroll'));
});

test('sectionOf groups each view under its topbar icon', () => {
  assert.equal(sectionOf('blog'), 'blog');
  assert.equal(sectionOf('embuscade'), 'games');
  assert.equal(sectionOf('lhoraire'), 'site');
  assert.equal(sectionOf('chat'), 'chat');
});

test('message board paths carry the section and thread', () => {
  assert.deepEqual(parseSitePath('/site/messages'), { view: 'messages', post: null, board: { section: null, thread: null } });
  assert.deepEqual(parseSitePath('/site/messages/game-feedback'), { view: 'messages', post: null, board: { section: 'game-feedback', thread: null } });
  assert.deepEqual(parseSitePath('/site/messages/game-feedback/123/'), { view: 'messages', post: null, board: { section: 'game-feedback', thread: '123' } });
  assert.equal(parseSitePath('/site/messages/game-feedback/abc'), null);
  assert.equal(boardPath({ section: 'site-feedback', thread: '9', post: '12' }), '/site/messages/site-feedback/9#post-12');
  assert.equal(boardPath({ section: 'site-feedback', thread: '9', post: '9' }), '/site/messages/site-feedback/9');
  assert.equal(boardPath({ section: 'site-feedback' }), '/site/messages/site-feedback');
  assert.equal(sectionOf('messages'), 'site');
});

test('the blog editor: the list and one draft', () => {
  assert.deepEqual(parseSitePath('/site/write'), { view: 'write', post: null, draft: null });
  assert.deepEqual(parseSitePath('/site/write/12/'), { view: 'write', post: null, draft: '12' });
  assert.equal(parseSitePath('/site/write/abc'), null);
  assert.equal(writePath(), '/site/write');
  assert.equal(writePath('12'), '/site/write/12');
  assert.equal(sectionOf('write'), 'site');
});
