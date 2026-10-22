import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { processImage, ImageError } from './imagePipeline.js';

const png = (width, height, withExif = false) => {
  let image = sharp({ create: { width, height, channels: 3, background: '#c62828' } }).png();
  if (withExif) image = image.withMetadata({ exif: { IFD0: { Copyright: 'secret place' } } });
  return image.toBuffer();
};

test('a big image is scaled to fit 2000px and re-encoded, metadata gone', async () => {
  const { webp, jpeg, width, height } = await processImage(await png(4000, 1000, true));
  assert.deepEqual([width, height], [2000, 500]);
  const meta = await sharp(webp).metadata();
  assert.equal(meta.format, 'webp');
  assert.equal(meta.exif, undefined);
  assert.equal((await sharp(jpeg).metadata()).format, 'jpeg');
});

test('a small image keeps its size', async () => {
  const { width, height } = await processImage(await png(300, 200));
  assert.deepEqual([width, height], [300, 200]);
});

test('anything that is not an image is refused', async () => {
  await assert.rejects(processImage(Buffer.from('<?php echo "hi"; ?>')), ImageError);
  await assert.rejects(processImage(Buffer.alloc(0)), ImageError);
  await assert.rejects(processImage(Buffer.alloc(11 * 1024 * 1024)), /10 MB/);
});
