// Token verification and caller resolution live in @widgetgrid/auth-node
// (shared with lhoraire-server); re-exported here for this server's code.
export { createAuthContext, createCognitoVerifiers, COGNITO_USER_POOL_ID, COGNITO_SPA_CLIENT_ID } from '@widgetgrid/auth-node';

// The browser-generated localStorage UUID identifying a visitor's browser
// (see widgets/chat) -- there's no account behind it, this header *is*
// the identity, same trust level a session cookie would carry here. Sent
// by every browser, signed in or not: a signed-in member who isn't the
// owner still chats as a visitor.
export function getVisitorId(call) {
  return call.metadata.get('visitor-id')[0] ?? null;
}
