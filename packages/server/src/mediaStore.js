import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3';

// Where uploaded images live: board screenshots (board/<id>.webp) and
// images added to a blog draft (drafts/<draft>/<name>.webp) until
// publishing copies them next to the post. Private either way -- every
// byte is served by mediaService.js through the site, which is what lets
// hiding a post or holding an image actually stop it being seen.
// createS3MediaStore is AWS (MEDIA_S3_BUCKET); createLocalMediaStore is
// local dev. Same interface.

// Keys are built by this server, never taken from a request as they are;
// this is the backstop.
const KEY_PATTERN = /^[a-z0-9_-]+(\/[A-Za-z0-9_-]+)*\.(webp|png|jpe?g|gif)$/;

function checkKey(key) {
  if (!KEY_PATTERN.test(key)) throw new Error(`bad media key "${key}"`);
  return key;
}

export function createLocalMediaStore({ dir }) {
  const file = (key) => path.join(dir, checkKey(key));
  return {
    async put(key, bytes) {
      await mkdir(path.dirname(file(key)), { recursive: true });
      await writeFile(file(key), bytes);
    },
    async get(key) {
      try {
        return await readFile(file(key));
      } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
      }
    },
    async remove(key) {
      await rm(file(key), { force: true });
    },
  };
}

export function createS3MediaStore({ bucket }) {
  const client = new S3Client({});
  return {
    async put(key, bytes, contentType) {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: checkKey(key), Body: bytes, ContentType: contentType }));
    },
    async get(key) {
      try {
        const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: checkKey(key) }));
        return Buffer.from(await object.Body.transformToByteArray());
      } catch (err) {
        if (err.name === 'NoSuchKey') return null;
        throw err;
      }
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: checkKey(key) }));
    },
  };
}

export function contentTypeOf(key) {
  const ext = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
  return { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif' }[ext] ?? 'application/octet-stream';
}
