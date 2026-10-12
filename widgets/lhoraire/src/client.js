// gRPC-Web access to lhoraire-server (proto/lhoraire/v1/lhoraire.proto).
// Callers pass and get plain objects: requests are built from them with the
// generated setters, and responses are toObject()'d with the generated
// "...List" / "...Map" suffixes stripped, so `{ projects: [...] }` rather
// than `{ projectsList: [...] }`.
import * as pb from '@widgetgrid/proto-gen-web/lhoraire/v1/lhoraire_pb.js';
import * as services from '@widgetgrid/proto-gen-web/lhoraire/v1/lhoraire_grpc_web_pb.js';
import { authMetadata } from '@widgetgrid/auth-web';

const ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const clients = {};

const cap = (s) => s[0].toUpperCase() + s.slice(1);

// Repeated message fields, by request type and field: their element type.
const NESTED = {
  UpdateWorkflowRequest: { states: 'WorkflowStateInput', transitions: 'WorkflowTransition', stateMappings: 'StateMapping' },
  DeleteIssueTypeRequest: { stateMappings: 'StateMapping' },
};

// Scalars -> setX; arrays -> setXList (elements of repeated message fields
// built recursively); plain objects -> getXMap() entries. undefined is
// skipped, which is how optional fields stay unset.
function build(Type, values, typeName = '') {
  const message = new Type();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    const element = NESTED[typeName]?.[key];
    if (Array.isArray(value) && element) message[`set${cap(key)}List`](value.map((v) => build(pb[element], v, element)));
    else if (Array.isArray(value)) message[`set${cap(key)}List`](value);
    else if (value !== null && typeof value === 'object') {
      const map = message[`get${cap(key)}Map`]();
      for (const [k, v] of Object.entries(value)) map.set(k, v);
    } else message[`set${cap(key)}`](value);
  }
  return message;
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value === null || typeof value !== 'object') return value;
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    if (key.endsWith('List') && Array.isArray(v)) out[key.slice(0, -4)] = normalize(v);
    else if (key.endsWith('Map') && Array.isArray(v)) out[key.slice(0, -3)] = Object.fromEntries(v);
    else out[key] = normalize(v);
  }
  return out;
}

// call('IssueService', 'CreateIssue', { ... }) -> plain response object.
// Errors keep grpc-web's { code, message }.
export async function call(service, method, values = {}) {
  clients[service] ??= new services[`${service}PromiseClient`](ORIGIN);
  const Request = pb[`${method}Request`];
  const rpc = method[0].toLowerCase() + method.slice(1);
  const response = await clients[service][rpc](build(Request, values, `${method}Request`), await authMetadata());
  return normalize(response.toObject());
}

// Server-streaming call; onEvent gets plain objects. Returns { cancel }.
export async function subscribe(service, method, values, { onEvent, onEnd }) {
  clients[service] ??= new services[`${service}PromiseClient`](ORIGIN);
  const Request = pb[`${method}Request`];
  const rpc = method[0].toLowerCase() + method.slice(1);
  const stream = clients[service][rpc](build(Request, values), await authMetadata());
  stream.on('data', (m) => onEvent(normalize(m.toObject())));
  stream.on('error', (err) => onEnd?.(err));
  stream.on('end', () => onEnd?.(null));
  return stream;
}

// Exposed for tests: builds a request message exactly as call() does.
export const buildRequest = (method, values) => build(pb[`${method}Request`], values, `${method}Request`);

// DeleteIssueTypeRequest.Mode values.
export const DELETE_MODE = { UNSPECIFIED: 0, REASSIGN: 1, DELETE_ISSUES: 2 };

export const GRPC_CODES = { ABORTED: 10, FAILED_PRECONDITION: 9, INVALID_ARGUMENT: 3, NOT_FOUND: 5, PERMISSION_DENIED: 7, UNAUTHENTICATED: 16 };
