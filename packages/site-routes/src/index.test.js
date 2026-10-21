import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSitePath, sitePath, isSitePath, sectionOf } from './index.js';

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
  assert.deepEqual(parseSitePath('/chat'), { view: 'chat', post: null });
});

test('parseSitePath returns null for anything that is not a view', () => {
  assert.equal(parseSitePath('/site/messages'), null);
  assert.equal(parseSitePath('/blog/a/b'), null);
  assert.equal(parseSitePath('/about'), null);
});

test('sitePath round-trips through parseSitePath', () => {
  for (const view of ['blog', 'games', 'solitaire', 'embuscade', 'site', 'lhoraire', 'subscribe', 'chat']) {
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
