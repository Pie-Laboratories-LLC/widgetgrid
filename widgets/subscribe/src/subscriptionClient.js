// SubscriptionService over gRPC-Web -- see
// proto/widgetgrid/v1/subscription.proto. Own client per widget, same
// reasoning as widgets/blog/src/blogClient.js.
import {
  SubscribeRequest, ConfirmSubscriptionRequest, UnsubscribeRequest,
} from '@widgetgrid/proto-gen-web/widgetgrid/v1/subscription_pb.js';
import { SubscriptionServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/subscription_grpc_web_pb.js';
import { authMetadata } from '@widgetgrid/auth-web';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new SubscriptionServicePromiseClient(GRPC_WEB_ORIGIN);

export const subscriptionClient = {
  // 'confirmation_sent' | 'subscribed'. Sent with the sign-in token when
  // there is one: subscribing your own account address skips confirmation.
  async subscribe(email, captchaToken) {
    const request = new SubscribeRequest();
    request.setEmail(email);
    request.setCaptchaToken(captchaToken ?? '');
    return (await client.subscribe(request, await authMetadata())).getOutcome();
  },
  async confirm(token) {
    const request = new ConfirmSubscriptionRequest();
    request.setToken(token);
    return (await client.confirmSubscription(request, {})).getEmail();
  },
  async unsubscribe(token) {
    const request = new UnsubscribeRequest();
    request.setToken(token);
    return (await client.unsubscribe(request, {})).getEmail();
  },
};
