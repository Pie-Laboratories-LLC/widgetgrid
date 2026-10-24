// Cognito pre-sign-up trigger: self sign-up is on for the pool, but the
// only way in is the site's own registration (/site/register), which
// signs up through widgetgrid-server so its captcha and username checks
// can't be skipped (packages/server/src/services/accountService.js). That
// server uses the registration app client; a sign-up arriving through any
// other client -- the SPA's public client id, or the "Sign up" link on the
// hosted sign-in page -- is refused here. Admin-created users pass
// untouched.
//
// A first sign-in through an outside provider (PreSignUp_ExternalProvider)
// always goes through. If it's a social one (LINKABLE_PROVIDERS: Google,
// LinkedIn) whose provider vouches for the email (email_verified), and a
// site account already has that verified email, the two are joined
// instead of making a second account -- same person, same username,
// either way in. Identity Center and Microsoft (no email_verified) never
// join.
//
// Matched by client *name*, looked up at runtime, rather than an id baked
// into this function's environment: the client is created on the same
// pool this trigger is attached to, so an id here would be a circular
// dependency in the CDK stack.
import {
  CognitoIdentityProviderClient, DescribeUserPoolClientCommand, ListUsersCommand, AdminLinkProviderForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});
const REGISTRATION_CLIENT_NAME = process.env.REGISTRATION_CLIENT_NAME;
const REGISTER_URL = process.env.REGISTER_URL;
const LINKABLE_PROVIDERS = (process.env.LINKABLE_PROVIDERS ?? '').split(',').filter(Boolean);
const clientNames = new Map(); // clientId -> name, for the life of the container

function attribute(user, name) {
  return user.Attributes?.find((a) => a.Name === name)?.Value;
}

async function linkToSiteAccount(event) {
  // userName is "<provider>_<the provider's id for them>".
  const split = event.userName.indexOf('_');
  const providerName = event.userName.slice(0, split);
  const providerUserId = event.userName.slice(split + 1);
  const { email, email_verified: emailVerified } = event.request.userAttributes;
  if (!LINKABLE_PROVIDERS.includes(providerName) || String(emailVerified) !== 'true') return;
  if (!email || email.includes('"') || email.includes('\\')) return;

  const { Users = [] } = await client.send(new ListUsersCommand({
    UserPoolId: event.userPoolId, Filter: `email = "${email}"`,
  }));
  // Only a site-registered account (not another federated one), and only
  // once it has proved the address itself.
  const siteAccount = Users.find((u) => u.UserStatus !== 'EXTERNAL_PROVIDER'
    && attribute(u, 'email_verified') === 'true');
  if (!siteAccount) return;
  await client.send(new AdminLinkProviderForUserCommand({
    UserPoolId: event.userPoolId,
    DestinationUser: { ProviderName: 'Cognito', ProviderAttributeValue: siteAccount.Username },
    SourceUser: { ProviderName: providerName, ProviderAttributeName: 'Cognito_Subject', ProviderAttributeValue: providerUserId },
  }));
}

export const handler = async (event) => {
  if (event.triggerSource === 'PreSignUp_ExternalProvider') {
    await linkToSiteAccount(event);
    return event;
  }
  if (event.triggerSource !== 'PreSignUp_SignUp') return event;

  const clientId = event.callerContext?.clientId;
  if (!clientNames.has(clientId)) {
    const { UserPoolClient } = await client.send(new DescribeUserPoolClientCommand({
      UserPoolId: event.userPoolId, ClientId: clientId,
    }));
    clientNames.set(clientId, UserPoolClient.ClientName);
  }
  if (clientNames.get(clientId) !== REGISTRATION_CLIENT_NAME) {
    // Shown on the hosted page as "PreSignUp failed with error <this>",
    // as plain text -- it can't be a link. Cognito shows its "Sign up"
    // link whenever self sign-up is on, which the site's own registration
    // needs, so this is the best that page can do.
    throw new Error(`accounts are created on the site itself, not here. Go to ${REGISTER_URL} to create one.`);
  }
  return event;
};
