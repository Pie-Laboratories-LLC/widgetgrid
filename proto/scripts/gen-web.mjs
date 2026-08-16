#!/usr/bin/env node
// Generates browser-side grpc-web client code (message classes + service
// stubs) from the .proto files. No system `protoc` install needed --
// `grpc-tools` ships a bundled protoc binary. protoc-gen-grpc-web itself is
// fetched separately (see fetch-protoc-gen-grpc-web.mjs and its comment for
// why) rather than via its npm package's own installer.
//
// Server-side needs none of this: @grpc/proto-loader reads the .proto files
// directly at process startup (see packages/server/src/loadProto.js).
import { execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const PROTO_ROOT = path.join(REPO_ROOT, 'proto');
const OUT_DIR = path.join(REPO_ROOT, 'packages/proto-gen-web');
const PROTOC = path.join(REPO_ROOT, 'node_modules/.bin/grpc_tools_node_protoc');
const GRPC_WEB_PLUGIN = path.join(REPO_ROOT, '.tools/protoc-gen-grpc-web');

async function main() {
  if (!(await exists(GRPC_WEB_PLUGIN))) {
    throw new Error(
      `${GRPC_WEB_PLUGIN} not found. Run: node proto/scripts/fetch-protoc-gen-grpc-web.mjs`,
    );
  }

  const args = [
    '-I', PROTO_ROOT,
    `--js_out=import_style=commonjs,binary:${OUT_DIR}`,
    // mode=grpcwebtext (base64-over-XHR framing), NOT grpcweb. This used to
    // be grpcweb (binary/arraybuffer) on the theory that binary framing
    // "behaves better for server-streaming" -- backwards, at least for this
    // JS client (grpc-web npm package, GrpcWebClientBase): binary mode sets
    // xhr.responseType = 'arraybuffer', and per the XHR spec, arraybuffer/
    // blob/json response types only populate `.response` once the request
    // reaches readyState 4 (DONE) -- there is no incremental access during
    // readyState 3 (LOADING) the way there is for responseText. So every
    // server-streaming call (SubscribeNewPosts, SubscribeOwnerPresence,
    // SubscribeChatEvents) silently delivered nothing to any 'data'
    // listener until the whole response completed -- which a long-lived
    // subscription never does on its own. This produced a misleading
    // symptom that looked exactly like local-k8s's separate, real ~12-15s
    // mesh-hop cutoff (see blogSubscriptionClient.js's comment on that) --
    // easy to conflate, since both manifest as "nothing arrives, then
    // ERR_INCOMPLETE_CHUNKED_ENCODING" -- but confirmed as a distinct root
    // cause by reading the raw bytes off the wire with `fetch()` +
    // ReadableStream directly in Chromium: the server's first message
    // arrives in ~50ms, well before any mesh cutoff, and well before the
    // grpc-web client ever surfaces it. grpcwebtext's base64 response is
    // read via plain `xhr.responseText`, which *does* update incrementally
    // during readyState 3, and the client parses newly-arrived base64
    // chunks as they come in (see grpc-web's own XhrIo readystatechange
    // handler) -- that's what actually gets live pushes to a 'data'
    // listener before the connection ends.
    `--grpc-web_out=import_style=commonjs,mode=grpcwebtext:${OUT_DIR}`,
    `--plugin=protoc-gen-grpc-web=${GRPC_WEB_PLUGIN}`,
    path.join(PROTO_ROOT, 'widgetgrid/v1/page.proto'),
    path.join(PROTO_ROOT, 'widgetgrid/v1/widget.proto'),
    path.join(PROTO_ROOT, 'widgetgrid/v1/blog.proto'),
    path.join(PROTO_ROOT, 'widgetgrid/v1/auth.proto'),
    path.join(PROTO_ROOT, 'widgetgrid/v1/chat.proto'),
  ];

  console.log(`${PROTOC} ${args.join(' ')}`);
  execFileSync(PROTOC, args, { stdio: 'inherit' });
  console.log(`Generated browser proto/grpc-web JS into ${OUT_DIR}`);
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
  console.error(err.message ?? err);
  process.exitCode = 1;
});
