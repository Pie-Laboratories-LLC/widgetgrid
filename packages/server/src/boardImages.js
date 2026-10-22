// The message boards' image rules, shared by the upload (mediaService.js)
// and the posts that use the images (boardService.js).

// New accounts wait this long before uploading -- drive-by accounts made
// to post something ugly don't wait five days. Moderators don't wait.
export const IMAGE_WAIT_MS = 5 * 24 * 60 * 60 * 1000;
export const MAX_IMAGES_PER_POST = 5;
// Uploads per account per hour -- each one costs a moderation scan.
export const MAX_UPLOADS_PER_HOUR = 30;

// "/media/board/<id>.webp" -> id, or null for any other URL.
const BOARD_IMAGE_URL = /^\/media\/board\/([A-Za-z0-9_-]{22})\.webp$/;

export function boardImageId(url) {
  return BOARD_IMAGE_URL.exec(url)?.[1] ?? null;
}

export function boardImageUrl(id) {
  return `/media/board/${id}.webp`;
}

// When this caller may upload: null if now (or never mind -- moderators).
export function imagesFrom(caller, { moderator = false } = {}) {
  if (moderator || !caller.joinedAt) return null;
  return new Date(new Date(caller.joinedAt).getTime() + IMAGE_WAIT_MS);
}
