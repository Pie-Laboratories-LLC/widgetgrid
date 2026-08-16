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
    // mode=grpcweb (binary framing over fetch/streams), not grpcwebtext --
    // behaves better for server-streaming, relevant once
    // SubscribeWidgetUpdates is implemented. Envoy's grpc_web filter
    // supports both.
    `--grpc-web_out=import_style=commonjs,mode=grpcweb:${OUT_DIR}`,
    `--plugin=protoc-gen-grpc-web=${GRPC_WEB_PLUGIN}`,
    path.join(PROTO_ROOT, 'widgetgrid/v1/page.proto'),
    path.join(PROTO_ROOT, 'widgetgrid/v1/widget.proto'),
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
