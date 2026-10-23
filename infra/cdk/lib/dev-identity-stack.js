import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Stack, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { EMAIL_DOMAIN } from './dns-stack.js';
import { addSocialProviders, LINKABLE_PROVIDERS } from './social-login.js';
import { addManagedLoginStyle } from './managed-login.js';

const DEV_ORIGIN = 'https://dev.pie-laboratories.com';
// Same name as the shared pool's client -- the pre-sign-up trigger
// matches on it (see lambda/pre-sign-up).
const REGISTRATION_CLIENT_NAME = 'widgetgrid-registration';
// Who gets 'anonyme admins' (l'horaire, moderation) on dev. While SES is
// in the sandbox only verified addresses can register at all.
const DEV_ADMIN_EMAILS = ['webmaster@pie-laboratories.com'];
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The app's sign-in for a temporarily stood-up dev environment: its own
// throwaway user pool, so testing registration there never touches the
// shared pool behind the live site's login (WidgetgridIdentityStack).
// Only the site-registration half of that stack -- no Identity Center
// SAML (that's tied to the shared pool's audience), so on dev everyone is
// a site-registered account; registering with OWNER_EMAIL is how the
// owner tests moderation. Hosted sign-in is on a Cognito-provided domain
// rather than auth.pie-laboratories.com. Everything here is destroyed
// with the stack.
//
// The dev ALB's own gate (WidgetgridDevGatewayStack) still signs in
// through the shared pool's Identity Center client -- that's what keeps
// dev private, and it's unrelated to the app's sign-in.
export class DevIdentityStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'widgetgrid-dev',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      // Through SES, as on the shared pool -- this is the test of that.
      // While SES is in the sandbox, only verified addresses receive it.
      email: cognito.UserPoolEmail.withSES({
        fromEmail: `noreply@${EMAIL_DOMAIN}`,
        fromName: 'Pie Laboratories (dev)',
        replyTo: `webmaster@${EMAIL_DOMAIN}`,
        sesVerifiedDomain: EMAIL_DOMAIN,
      }),
      userVerification: {
        emailSubject: 'Your Pie Laboratories verification code',
        emailBody: 'Your verification code is {####}. Enter it on the registration page to finish creating your account.',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Prefix domains are global across AWS; the account id keeps it ours.
    const userPoolDomain = userPool.addDomain('UserPoolDomain', {
      cognitoDomain: { domainPrefix: `widgetgrid-dev-${this.account}` },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });

    const preSignUp = new lambda.Function(this, 'PreSignUp', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/pre-sign-up')),
      timeout: Duration.seconds(5),
      environment: {
        REGISTRATION_CLIENT_NAME,
        REGISTER_URL: `${DEV_ORIGIN}/site/register`,
        LINKABLE_PROVIDERS: LINKABLE_PROVIDERS.join(','),
      },
    });
    // By ARN pattern, same circular-dependency reason as identity-stack.js.
    preSignUp.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:DescribeUserPoolClient', 'cognito-idp:ListUsers', 'cognito-idp:AdminLinkProviderForUser'],
      resources: [this.formatArn({ service: 'cognito-idp', resource: 'userpool', resourceName: '*' })],
    }));
    userPool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, preSignUp);

    // On the shared pool, admins come from Identity Center via the
    // pre-token-groups trigger. Here a trigger does the same for the
    // emails listed below -- not a Cognito group, because group names
    // can't contain spaces and the claim the servers look for is
    // 'anonyme admins' (GROUP_ADMINS in packages/auth-node).
    const preTokenAdmins = new lambda.Function(this, 'PreTokenAdmins', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const admins = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').filter(Boolean);
        exports.handler = async (event) => {
          const email = (event.request.userAttributes.email || '').toLowerCase();
          if (admins.includes(email)) {
            event.response.claimsOverrideDetails = { groupOverrideDetails: { groupsToOverride: ['anonyme admins'] } };
          }
          return event;
        };
      `),
      timeout: Duration.seconds(5),
      environment: { ADMIN_EMAILS: DEV_ADMIN_EMAILS.join(',') },
    });
    userPool.addTrigger(cognito.UserPoolOperation.PRE_TOKEN_GENERATION, preTokenAdmins);

    // The same social providers as the shared pool (same developer apps;
    // each needs this pool's domain + /oauth2/idpresponse added as a
    // redirect URI while dev is up).
    const social = addSocialProviders(this, userPool);

    // localhost too, so a local Vite build can be pointed at this pool.
    const origins = [DEV_ORIGIN, 'http://localhost:5173'];
    const spaClient = userPool.addClient('SpaClient', {
      generateSecret: false,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: origins.map((o) => `${o}/auth/callback`),
        logoutUrls: origins.map((o) => `${o}/`),
      },
      supportedIdentityProviders: [...social.clientIdps, cognito.UserPoolClientIdentityProvider.COGNITO],
      preventUserExistenceErrors: true,
    });
    spaClient.node.addDependency(...social.providers);
    addManagedLoginStyle(this, 'SpaLoginStyle', { userPool, client: spaClient });

    const registrationClient = userPool.addClient('RegistrationClient', {
      userPoolClientName: REGISTRATION_CLIENT_NAME,
      generateSecret: true,
      disableOAuth: true,
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
    });

    // Same output names as WidgetgridIdentityStack's, plus where the hosted
    // sign-in lives -- infra/eks/deploy.sh reads whichever stack is the
    // environment's.
    new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new CfnOutput(this, 'SpaClientId', { value: spaClient.userPoolClientId });
    new CfnOutput(this, 'RegistrationClientId', { value: registrationClient.userPoolClientId });
    new CfnOutput(this, 'AuthOrigin', { value: userPoolDomain.baseUrl() });
  }
}
