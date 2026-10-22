import sharp from 'sharp';

// Every uploaded image goes through here before anything is stored: it
// has to decode as a real image, it's scaled down to a sensible size, and
// it's re-encoded -- which also drops everything that isn't pixels (EXIF,
// including a phone photo's GPS location). What comes out is all that's
// ever kept.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
// Long side, in pixels. Plenty for a screenshot to stay readable.
const MAX_DIMENSION = 2000;
// Decoding refuses anything bigger -- a small file can claim enormous
// dimensions (a "decompression bomb").
const MAX_INPUT_PIXELS = 50_000_000;

export class ImageError extends Error {}

// bytes -> { webp, jpeg, width, height }: webp is what's stored and
// served; jpeg is the same picture for the moderation scan, which doesn't
// take webp.
export async function processImage(bytes) {
  if (!bytes?.length) throw new ImageError('That file is empty.');
  if (bytes.length > MAX_UPLOAD_BYTES) throw new ImageError('Images can be up to 10 MB.');
  let pipeline;
  try {
    pipeline = sharp(bytes, { limitInputPixels: MAX_INPUT_PIXELS, animated: false })
      .rotate() // honour the camera's orientation before the EXIF goes
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true });
    const { data: webp, info } = await pipeline.clone().webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const jpeg = await pipeline.clone().jpeg({ quality: 85 }).toBuffer();
    return { webp, jpeg, width: info.width, height: info.height };
  } catch (err) {
    if (err instanceof ImageError) throw err;
    throw new ImageError("That file isn't an image we can read. Use PNG, JPEG, WebP or GIF.");
  }
}
