import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  buildPostFile, splitPostFile, postFileName, renderPreview, createLocalBlogSource,
} from './blogSource.js';

test('a post file splits back into the parts it was built from', () => {
  const parts = { title: 'Life of Pie', synopsis: 'The story.\n\nTwo paragraphs.', body: 'Body text.\n\n## More' };
  assert.deepEqual(splitPostFile(buildPostFile(parts)), parts);
});

test('a file without a SYNOPSIS section comes back whole as the body', () => {
  assert.deepEqual(splitPostFile('Just words.\n'), { title: '', synopsis: '', body: 'Just words.' });
});

test('published filenames are dated in the blog time zone', () => {
  const date = new Date('2026-10-22T04:30:00Z'); // 22:30 the evening before in Denver
  assert.equal(postFileName('my-post', date, 'America/Denver'), '2026-10-21-22-30-my-post.md');
});

test('the preview resolves relative images through resolveImage', () => {
  const raw = buildPostFile({ title: 'T', synopsis: 'S', body: '![x](./a.webp)' });
  const post = renderPreview({ raw, slug: 't', resolveImage: (name) => `/media/drafts/1/${name}` });
  assert.equal(post.title, 'T');
  assert.match(post.contentHtml, /src="\/media\/drafts\/1\/a\.webp"/);
});

test('the local source writes posts and assets that listPosts then reads', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'blog-'));
  try {
    const source = createLocalBlogSource({ dir, assetsBaseUrl: '/blog-assets' });
    await source.writeAsset('2026-10-22-12-00-new', 'pic.webp', Buffer.from('x'));
    await source.writePost('2026-10-22-12-00-new.md', buildPostFile({ title: 'New', synopsis: 'S', body: '![p](./pic.webp)' }));
    const [post] = await source.listPosts();
    assert.equal(post.fileName, '2026-10-22-12-00-new.md');
    assert.equal(post.slug, 'new');
    assert.match(post.contentHtml, /\/blog-assets\/2026-10-22-12-00-new\/pic\.webp/);
    assert.match(await source.readPost('2026-10-22-12-00-new.md'), /# New/);
    assert.equal(await source.readPost('2026-01-01-00-00-missing.md'), null);
    await assert.rejects(source.writePost('../escape.md', 'x'), /bad post file name/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
