import { EventEmitter } from 'node:events';

// "Is the owner here right now" = does the owner have the site open
// somewhere, measured by their live SubscribeChatEvents streams (every
// page holds one for its whole lifetime, see widgets/main's
// chatSubscriptionClient.js). Not "signed in": a Cognito sign-in lasts up
// to 30 days, which would make the owner look online almost permanently
// and suppress every offline alert.
//
// In-process only -- correct while widgetgrid-server runs a single
// replica (infra/eks/manifests/widgetgrid-server.yaml). More replicas
// would need this shared (e.g. Postgres LISTEN/NOTIFY).
const emitter = new EventEmitter();
emitter.setMaxListeners(0); // one subscriber per connected browser tab, no fixed cap

// Streams drop and reconnect routinely (proxy idle timeouts; the client
// reconnects after 2s). Going offline waits this long so a reconnect
// doesn't flap presence or fire an offline push mid-conversation.
const OFFLINE_GRACE_MS = 15 * 1000;

let ownerConnections = 0;
let online = false;
let offlineTimer = null;

function setOnline(value) {
  if (online === value) return;
  online = value;
  emitter.emit('presence', online);
}

// Call when an owner stream opens; call the returned function when it
// closes (safe to call more than once).
export function ownerConnected() {
  ownerConnections += 1;
  clearTimeout(offlineTimer);
  offlineTimer = null;
  setOnline(true);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    ownerConnections -= 1;
    if (ownerConnections === 0) {
      offlineTimer = setTimeout(() => setOnline(false), OFFLINE_GRACE_MS);
      offlineTimer.unref?.();
    }
  };
}

export function isOwnerOnline() {
  return online;
}

export function subscribePresence(onChange) {
  emitter.on('presence', onChange);
  return () => emitter.off('presence', onChange);
}
