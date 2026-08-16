// Its own small gRPC-Web client, same reasoning as
// widgets/main/src/blogSubscriptionClient.js. Owned directly by this
// widget (not relayed through MainWidget like blog/chat events are) --
// see TopBarWidget.vue's comment for why presence isn't tied to which
// main-content view is showing.
import { SubscribeOwnerPresenceRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_pb.js';
import { AuthServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_grpc_web_pb.js';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new AuthServicePromiseClient(GRPC_WEB_ORIGIN);

// Returns an unsubscribe function. onChange receives a plain boolean.
export function subscribeOwnerPresence(onChange) {
  const stream = client.subscribeOwnerPresence(new SubscribeOwnerPresenceRequest(), {});
  stream.on('data', (event) => onChange(event.toObject().online));
  // Same "no reconnect/backoff loop" call as blogSubscriptionClient.js,
  // and the same known local-k8s mesh limitation applies here too.
  return () => stream.cancel();
}
