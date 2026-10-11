import grpc from '@grpc/grpc-js';
import { GROUP_ADMINS } from '@widgetgrid/auth-node';

// Errors a service throws to end a call with a specific gRPC status; the
// message is shown to the user, so it says what to do.
export class RpcError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export const invalid = (message) => new RpcError(grpc.status.INVALID_ARGUMENT, message);
export const notFound = (message) => new RpcError(grpc.status.NOT_FOUND, message);
export const conflict = (message) => new RpcError(grpc.status.FAILED_PRECONDITION, message);
export const alreadyExists = (message) => new RpcError(grpc.status.ALREADY_EXISTS, message);
export const stale = (message = 'Changed by someone else since you loaded it -- reload and try again.') =>
  new RpcError(grpc.status.ABORTED, message);

// Postgres errors the rules can trigger, mapped to user-facing statuses.
function fromPg(err) {
  if (err.code === '23505') return alreadyExists('That already exists.');
  if (err.code === '23503') return conflict('Something it refers to is missing or still in use.');
  if (err.code === '23514') return invalid('A value is out of range or badly formatted.');
  return null;
}

// Wraps every handler: resolves and authorizes the caller (signed in, in
// "anonyme admins"), runs the handler with it, and turns thrown errors into
// gRPC statuses. Unary handlers return the response object.
export function createHandlers(authContext, handlers) {
  const wrapped = {};
  for (const [name, handler] of Object.entries(handlers)) {
    wrapped[name] = async (call, callback) => {
      try {
        const caller = await authContext.getCaller(call);
        if (!caller) throw new RpcError(grpc.status.UNAUTHENTICATED, 'Sign in first.');
        if (!caller.groups.includes(GROUP_ADMINS)) throw new RpcError(grpc.status.PERMISSION_DENIED, "l'horaire is for anonyme admins only.");
        const response = await handler(call.request, caller, call);
        callback?.(null, response ?? {});
      } catch (err) {
        const mapped = err instanceof RpcError ? err : fromPg(err);
        if (!mapped) console.error(`${name} failed:`, err);
        const status = mapped ?? { code: grpc.status.INTERNAL, message: 'Internal error.' };
        if (callback) callback({ code: status.code, message: status.message });
        else call.emit('error', { code: status.code, message: status.message });
      }
    };
  }
  return wrapped;
}

export async function withTransaction(pool, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
