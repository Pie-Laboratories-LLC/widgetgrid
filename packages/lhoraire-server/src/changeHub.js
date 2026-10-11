import { EventEmitter } from 'node:events';

// One LISTEN connection per server process, fanned out in-process to every
// open stream (changeService.js). Each notification carries the whole
// change (see changes.js), so forwarding needs no query. If the listening
// connection drops, changes committed meanwhile are never delivered, so on
// reconnect every stream is told to resync.
//
// connect: () => an unconnected pg.Client for the database.
export function createChangeHub({ connect, reconnectDelayMs = 2000, log = console }) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0); // one per open stream
  let client = null;
  let stopped = false;
  let timer = null;
  let hadConnection = false;

  async function open() {
    if (stopped) return;
    const c = connect();
    c.on('notification', (msg) => {
      if (msg.channel !== 'lhoraire_changes') return;
      try {
        emitter.emit('change', JSON.parse(msg.payload));
      } catch (err) {
        log.error('bad lhoraire_changes payload:', err);
      }
    });
    c.on('error', (err) => {
      log.error('change listener connection lost:', err.message);
      retry(c);
    });
    c.on('end', () => retry(c));
    try {
      await c.connect();
      await c.query('LISTEN lhoraire_changes');
      client = c;
      if (hadConnection) emitter.emit('resync');
      hadConnection = true;
    } catch (err) {
      log.error('change listener could not connect:', err.message);
      retry(c);
    }
  }

  function retry(c) {
    if (stopped || client !== c && client !== null) return;
    client = null;
    c.removeAllListeners('notification');
    c.end().catch(() => {});
    clearTimeout(timer);
    timer = setTimeout(open, reconnectDelayMs);
    timer.unref?.();
  }

  return {
    start: open,
    // onChange(change) for each committed change; onResync() when changes
    // may have been missed. Returns an unsubscribe function.
    subscribe(onChange, onResync) {
      emitter.on('change', onChange);
      emitter.on('resync', onResync);
      return () => {
        emitter.off('change', onChange);
        emitter.off('resync', onResync);
      };
    },
    async stop() {
      stopped = true;
      clearTimeout(timer);
      const c = client;
      client = null;
      if (c) await c.end().catch(() => {});
    },
  };
}
