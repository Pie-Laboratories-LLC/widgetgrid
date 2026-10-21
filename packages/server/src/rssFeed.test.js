import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRssFeed } from './rssFeed.js';

const posts = [
  {
    slug: 'life-of-pie', title: 'Life & Pie', publishedAt: '2026-10-18T18:00',
    synopsisHtml: '<p>The story. <img src="/blog-assets/x/pie.png"> ]]> done</p>',
  },
  { slug: 'what-the', title: 'What the...?', publishedAt: '2026-08-16T12:00', synopsisHtml: '<p>Hi</p>' },
];

test('one item per post, linking to its /blog page', () => {
  const xml = buildRssFeed({ siteOrigin: 'https://example.com', posts });
  assert.equal((xml.match(/<item>/g) ?? []).length, 2);
  assert.match(xml, /<link>https:\/\/example\.com\/blog\/life-of-pie<\/link>/);
  assert.match(xml, /<guid isPermaLink="true">https:\/\/example\.com\/blog\/what-the<\/guid>/);
  assert.match(xml, /<atom:link href="https:\/\/example\.com\/rss\.xml" rel="self"/);
});

test('escapes titles, anchors relative URLs, and survives "]]>" in a synopsis', () => {
  const xml = buildRssFeed({ siteOrigin: 'https://example.com', posts });
  assert.match(xml, /<title>Life &amp; Pie<\/title>/);
  assert.match(xml, /src="https:\/\/example\.com\/blog-assets\/x\/pie\.png"/);
  assert.match(xml, /]]]]><!\[CDATA\[>/);
});

test('pubDate is RFC 822, the filename time taken as UTC', () => {
  const xml = buildRssFeed({ siteOrigin: 'https://example.com', posts });
  assert.match(xml, /<pubDate>Sun, 18 Oct 2026 18:00:00 GMT<\/pubDate>/);
});
