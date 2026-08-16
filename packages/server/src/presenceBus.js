import { EventEmitter } from 'node:events';

// In-process pub/sub for "the owner just logged in/out". Unlike
// blogChangeNotifier.js's polling (an S3/local-dir change happens outside
// this process, so there's nothing to be told, only something to check
// for), a login/logout IS this process handling the request that causes
// it -- authService.js just publishes directly when it happens, no
// polling involved.
const emitter = new EventEmitter();
emitter.setMaxListeners(0); // one subscriber per connected browser tab, no fixed cap

export function publishPresence(online) {
  emitter.emit('presence', online);
}

export function subscribePresence(onChange) {
  emitter.on('presence', onChange);
  return () => emitter.off('presence', onChange);
}
