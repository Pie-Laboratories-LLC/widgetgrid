import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkup, markupToText, PALETTE } from './index.js';

test('colour directives render as the palette variable, with markup inside', () => {
  const html = renderMarkup('Mind the :red[**lava**] and take the :green[left] path.');
  assert.match(html, /<span style="color: var\(--mk-red, #c62828\)"><strong>lava<\/strong><\/span>/);
  assert.match(html, /<span style="color: var\(--mk-green, #2e7d32\)">left<\/span>/);
});

test('a link inside a colour keeps its brackets', () => {
  const html = renderMarkup(':blue[see [the docs](https://example.com)]');
  assert.match(html, /<span style="color: var\(--mk-blue, [^)]+\)">see <a href="https:\/\/example\.com"/);
});

test('names outside the palette are left as text', () => {
  const html = renderMarkup(':chartreuse[nope] and :red[unclosed');
  assert.doesNotMatch(html, /<span/);
  assert.match(html, /:chartreuse\[nope\]/);
  assert.equal(Object.keys(PALETTE).length, 7);
});

test('raw HTML is shown as text, never passed through', () => {
  const html = renderMarkup('<script>alert(1)</script> and <b onclick="x">hi</b>');
  assert.doesNotMatch(html, /<script|<b /);
  assert.match(html, /&lt;script&gt;/);
});

test('only http(s), mailto and site-relative URLs become links', () => {
  assert.match(renderMarkup('[x](javascript:alert(1))'), /^<p>x<\/p>/);
  assert.match(renderMarkup('[x](//evil.example)'), /^<p>x<\/p>/);
  assert.match(renderMarkup('[x](/blog/life-of-pie)'), /<a href="\/blog\/life-of-pie">x<\/a>/);
  assert.match(renderMarkup('[x](mailto:a@example.com)'), /<a href="mailto:a@example.com">/);
});

test('external links open in a new tab and carry nofollow ugc', () => {
  assert.match(renderMarkup('https://example.com'), /<a href="https:\/\/example\.com" target="_blank" rel="nofollow ugc noopener noreferrer">/);
});

test('posts: headings become bold paragraphs, images become links, tables stay text', () => {
  const html = renderMarkup('# Big\n\n![pic](https://example.com/a.png)\n\n| a | b |\n|---|---|\n| 1 | 2 |');
  assert.match(html, /<p><strong>Big<\/strong><\/p>/);
  assert.doesNotMatch(html, /<img|<table|<h1/);
  assert.match(html, /<a href="https:\/\/example\.com\/a\.png"[^>]*>pic<\/a>/);
});

test('help text allows headings, images and tables', () => {
  const html = renderMarkup('# Big\n\n![pic](/game/a.png)\n\n| a | b |\n|---|---|\n| 1 | 2 |', { profile: 'help' });
  assert.match(html, /<h1>Big<\/h1>/);
  assert.match(html, /<img src="\/game\/a\.png" alt="pic">/);
  assert.match(html, /<table>/);
});

test('single newlines are line breaks, as people expect when typing a post', () => {
  assert.match(renderMarkup('one\ntwo'), /one<br>two/);
});

test('markupToText drops markup and colour but keeps the words', () => {
  assert.equal(markupToText('Mind the :red[**lava**] & <b>run</b>'), 'Mind the lava & <b>run</b>');
});

test('_text_ underlines, *text* stays italic, snake_case is left alone', () => {
  assert.equal(renderMarkup('_under_ and *slanted*'), '<p><u>under</u> and <em>slanted</em></p>\n');
  assert.equal(renderMarkup('call some_long_name now'), '<p>call some_long_name now</p>\n');
  assert.equal(renderMarkup(':blue[_both_]'), '<p><span style="color: var(--mk-blue, #1565c0)"><u>both</u></span></p>\n');
});
