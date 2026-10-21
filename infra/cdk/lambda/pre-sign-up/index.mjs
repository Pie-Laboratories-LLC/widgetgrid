// Cognito pre-sign-up trigger: self sign-up is on for the pool, but the
// only way in is the site's own registration (/site/register), which
// signs up through widgetgrid-server so its captcha and username checks
// can't be skipped (packages/server/src/services/accountService.js). That
// server uses the registration app client; a sign-up arriving through any
// other client -- the SPA's public client id, or the "Sign up" link on the
// hosted sign-in page -- is refused here. Identity Center's first sign-in
// (PreSignUp_ExternalProvider) and admin-created users pass untouched.
//
// Matched by client *name*, looked up at runtime, rather than an id baked
// into this function's environment: the client is created on the same
// pool this trigger is attached to, so an id here would be a circular
// dependency in the CDK stack.
import { CognitoIdentityProviderClient, DescribeUserPoolClientCommand } from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});
const REGISTRATION_CLIENT_NAME = process.env.REGISTRATION_CLIENT_NAME;
const REGISTER_URL = process.env.REGISTER_URL;
const clientNames = new Map(); // clientId -> name, for the life of the container

export const handler = async (event) => {
  if (event.triggerSource !== 'PreSignUp_SignUp') return event;

  const clientId = event.callerContext?.clientId;
  if (!clientNames.has(clientId)) {
    const { UserPoolClient } = await client.send(new DescribeUserPoolClientCommand({
      UserPoolId: event.userPoolId, ClientId: clientId,
    }));
    clientNames.set(clientId, UserPoolClient.ClientName);
  }
  if (clientNames.get(clientId) !== REGISTRATION_CLIENT_NAME) {
    // Shown on the hosted page as "PreSignUp failed with error <this>".
    throw new Error(`Please create your account at ${REGISTER_URL}`);
  }
  return event;
};
