import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { getTestPool, resetData, invoke, testAuthContext } from '../test-support/harness.js';
import { createProjectHandlers } from '../src/services/projectService.js';
import { addServices, loadProto } from '../src/index.js';

let pool;
let projects;
before(async () => {
  pool = await getTestPool();
  projects = createProjectHandlers({ pool });
});
beforeEach(() => resetData(pool));
after(() => pool.end());

const create = (req, user) => invoke(projects, 'CreateProject', { key: 'ffdb', name: 'Fantasy football', color: '', ...req }, user);

test('only signed-in anonyme admins can use it', async () => {
  await assert.rejects(invoke(projects, 'ListProjects', {}, null), { code: grpc.status.UNAUTHENTICATED });
  await assert.rejects(invoke(projects, 'ListProjects', {}, 'member'), { code: grpc.status.PERMISSION_DENIED });
  await invoke(projects, 'ListProjects', {}, 'admin2');
});

test('create, list, get by key, update, delete', async () => {
  const { project } = await create({ key: 'FFDB' });
  assert.equal(project.key, 'ffdb', 'keys are normalized to lowercase');
  assert.equal(project.color, '#4a6fa5', 'default colour');

  await create({ key: 'abc', name: 'Another' });
  const listed = await invoke(projects, 'ListProjects', {});
  assert.deepEqual(listed.projects.map((p) => p.key), ['abc', 'ffdb'], 'sorted by name');

  const fetched = await invoke(projects, 'GetProject', { key: 'ffdb' });
  assert.equal(fetched.project.id, project.id);

  const updated = await invoke(projects, 'UpdateProject', { id: project.id, name: 'FFDB renamed', color: '#112233' });
  assert.equal(updated.project.name, 'FFDB renamed');
  assert.equal(updated.project.key, 'ffdb', 'key never changes');

  await invoke(projects, 'DeleteProject', { id: project.id });
  await assert.rejects(invoke(projects, 'GetProject', { key: 'ffdb' }), { code: grpc.status.NOT_FOUND });
});

test('project keys are validated and unique', async () => {
  for (const key of ['f', '1abc', 'has-dash', 'toolongkey123']) {
    await assert.rejects(create({ key }), { code: grpc.status.INVALID_ARGUMENT }, key);
  }
  await create({});
  await assert.rejects(create({ name: 'Dup' }), { code: grpc.status.ALREADY_EXISTS });
});

test('names and colours are validated', async () => {
  await assert.rejects(create({ name: '   ' }), { code: grpc.status.INVALID_ARGUMENT });
  await assert.rejects(create({ color: 'red' }), { code: grpc.status.INVALID_ARGUMENT });
});

test('every write lands in the change feed', async () => {
  const { project } = await create({});
  await invoke(projects, 'UpdateProject', { id: project.id, name: 'x', color: '' });
  const { rows } = await pool.query('SELECT kind FROM lhoraire.changes ORDER BY id');
  assert.deepEqual(rows.map((r) => r.kind), ['project_created', 'project_updated']);
});

test('services answer over real gRPC', async () => {
  const server = addServices(new grpc.Server(), { pool, authContext: testAuthContext });
  const port = await new Promise((resolve, reject) => {
    server.bindAsync('127.0.0.1:0', grpc.ServerCredentials.createInsecure(), (err, p) => (err ? reject(err) : resolve(p)));
  });
  try {
    const client = new (loadProto().ProjectService)(`127.0.0.1:${port}`, grpc.credentials.createInsecure());
    const metadata = new grpc.Metadata();
    metadata.set('test-user', 'owner');
    await new Promise((resolve, reject) => {
      client.createProject({ key: 'grpc', name: 'Over the wire' }, metadata, (err, res) => (err ? reject(err) : resolve(res)));
    });
    const res = await new Promise((resolve, reject) => {
      client.listProjects({ requestedAtMs: 1 }, metadata, (err, r) => (err ? reject(err) : resolve(r)));
    });
    assert.equal(res.projects[0].key, 'grpc');
    client.close();
  } finally {
    server.forceShutdown();
  }
});
