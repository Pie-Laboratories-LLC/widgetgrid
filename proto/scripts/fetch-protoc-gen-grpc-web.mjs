#!/usr/bin/env node
// Downloads the official protoc-gen-grpc-web binary directly from grpc-web's
// GitHub releases, rather than relying on the `protoc-gen-grpc-web` npm
// package's own installer.
//
// Why: that npm package (an unofficial third-party wrapper, not published
// by the grpc-web project -- see widget.proto's history / the plan doc)
// pulls in `download` -> `decompress` -> `got` -> `http-cache-semantics`,
// and `decompress` has a critical-severity, no-fix-available Zip Slip
// vulnerability (arbitrary file write via archive extraction,
// GHSA-mp2f-45pm-3cg9) purely to unpack this one binary at install time.
// This script does the same fetch directly over HTTPS from the official
// release -- no archive extraction, no vulnerable dependency chain, and the
// binary this produces is byte-identical to what that package would have
// installed. See docs/LOCAL_DEV_PREREQUISITES.md.
import { createWriteStream } from 'node:fs';
import { access, chmod, mkdir } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const VERSION = '1.5.0';
const DEST_DIR = path.resolve(import.meta.dirname, '../../.tools');
const DEST = path.join(DEST_DIR, 'protoc-gen-grpc-web');

const PLATFORM_ASSETS = {
  'linux-x64': `protoc-gen-grpc-web-${VERSION}-linux-x86_64`,
  'darwin-x64': `protoc-gen-grpc-web-${VERSION}-darwin-x86_64`,
  'darwin-arm64': `protoc-gen-grpc-web-${VERSION}-darwin-aarch64`,
  'win32-x64': `protoc-gen-grpc-web-${VERSION}-windows-x86_64.exe`,
};

async function main() {
  const key = `${process.platform}-${process.arch}`;
  const asset = PLATFORM_ASSETS[key];
  if (!asset) {
    throw new Error(
      `No known protoc-gen-grpc-web release asset for ${key}. ` +
      `Download manually from https://github.com/grpc/grpc-web/releases/tag/${VERSION} ` +
      `and place it at ${DEST}.`,
    );
  }

  if (await exists(DEST)) {
    console.log(`${DEST} already present, skipping download.`);
    return;
  }

  await mkdir(DEST_DIR, { recursive: true });
  const url = `https://github.com/grpc/grpc-web/releases/download/${VERSION}/${asset}`;
  console.log(`Downloading ${url} ...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText} for ${url}`);
  }
  await pipeline(response.body, createWriteStream(DEST));
  await chmod(DEST, 0o755);
  console.log(`Saved to ${DEST}`);
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
