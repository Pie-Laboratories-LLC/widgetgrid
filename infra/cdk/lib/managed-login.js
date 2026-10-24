import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as cognito from 'aws-cdk-lib/aws-cognito';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../..');

// The site's look on Cognito's sign-in page: dark, the topbar's logo, red
// buttons. Since /site/login has its own provider buttons, that page only
// shows the email + password form (and password reset). Cognito won't let
// its text be changed -- only colours and images.
//
// The settings file is a partial document: Cognito fills in everything
// it leaves out with its defaults, but refuses any key not in its schema
// (the deploy fails). There's no setting for link colours.
// To see the full schema with the current values:
//   aws cognito-idp describe-managed-login-branding-by-client \
//     --user-pool-id <pool> --client-id <client> --return-merged-resources
const SETTINGS = JSON.parse(readFileSync(path.join(__dirname, '../managed-login-branding.json'), 'utf8'));

function asset(category, file, extension) {
  return {
    category,
    colorMode: 'DARK',
    extension,
    bytes: readFileSync(path.join(REPO_ROOT, file)).toString('base64'),
  };
}

// Every app client that shows the managed login pages needs a style of its
// own -- without one Cognito shows "Login pages unavailable" instead.
// branded: false gives Cognito's plain default (fine for the dev ALB's
// gate, which only ever passes straight through to Identity Center).
export function addManagedLoginStyle(scope, id, { userPool, client, branded = true }) {
  const style = new cognito.CfnManagedLoginBranding(scope, id, {
    userPoolId: userPool.userPoolId,
    clientId: client.userPoolClientId,
    ...(branded
      ? {
        settings: SETTINGS,
        assets: [
          asset('FORM_LOGO', 'widgets/topbar/src/assets/logo-h255.png', 'PNG'),
          asset('FAVICON_ICO', 'packages/web-app/public/favicon.ico', 'ICO'),
        ],
      }
      : { useCognitoProvidedValues: true }),
  });
  return style;
}
