// Live-update subscription to lhoraire-server's ChangeService with
// automatic reconnect. Remembers the highest change seq seen and resumes
// from it, so a dropped stream misses nothing; when the server can't
// replay (away too long), onResync() asks the caller to reload everything.
import { subscribe } from './client.js';

const RECONNECT_MS = 2000;

// openLive('SubscribeProject', { projectId }, { onChange, onResync }) ->
// close function.
export function openLive(method, values, { onChange, onResync }) {
  let lastSeq = 0;
  let helloSeq = 0;
  let stream = null;
  let closed = false;
  let timer = null;

  const retry = () => {
    if (closed) return;
    clearTimeout(timer);
    timer = setTimeout(connect, RECONNECT_MS);
  };

  async function connect() {
    if (closed) return;
    try {
      stream = await subscribe('ChangeService', method, { ...values, afterSeq: lastSeq }, {
        onEvent(event) {
          if (event.kind === 'heartbeat') return;
          if (event.kind === 'hello') {
            helloSeq = event.seq;
            if (lastSeq === 0) lastSeq = event.seq; // first connect: start from now
            return;
          }
          if (event.kind === 'resync_required') {
            lastSeq = Math.max(lastSeq, helloSeq);
            onResync();
            return;
          }
          lastSeq = Math.max(lastSeq, event.seq);
          onChange(event);
        },
        onEnd: retry,
      });
      if (closed) stream.cancel();
    } catch {
      retry();
    }
  }

  connect();
  return () => {
    closed = true;
    clearTimeout(timer);
    stream?.cancel();
  };
}

// Collapses a burst of calls into one, `ms` after the last.
export function debounce(fn, ms = 150) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
