import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Stack, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { EMAIL_DOMAIN } from './dns-stack.js';
import { addSocialProviders, LINKABLE_PROVIDERS } from './social-login.js';
import { addManagedLoginStyle } from './managed-login.js';

export const AUTH_HOST = 'auth.pie-laboratories.com';
const IDENTITY_STORE_ID = 'd-90667a98cd';
// The app client widgetgrid-server signs people up through -- the only
// one the pre-sign-up trigger accepts (see lambda/pre-sign-up).
const REGISTRATION_CLIENT_NAME = 'widgetgrid-registration';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Per-application metadata from the Identity Center "widgetgrid" SAML app
// (each Identity Center app has its own entity id/SSO URL).
const SAML_METADATA_XML = readFileSync(path.join(__dirname, '../identity-center-saml-metadata-widgetgrid.xml'), 'utf8');

// Where the SPA's OIDC redirect lands, per origin it's served from.
const SPA_ORIGINS = [
  'https://www.pie-laboratories.com',
  'https://pie-laboratories.com',
  'https://dev.pie-laboratories.com',
  'http://localhost:5173',
];

// Sign-in for both environments: IAM Identity Center is the identity
// source (users + the "anonyme users"/"anonyme admins" groups), Cognito is
// the SAML service provider that turns an Identity Center sign-in into
// OIDC tokens. Shared by dev and prod -- it replaced the dev-only pool
// that lived in WidgetgridDevGatewayStack (2026-10), so tearing down dev
// no longer takes sign-in with it.
export class IdentityStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { hostedZone } = props;

    // RETAIN: recreating the pool changes its id, which is baked into the
    // Identity Center SAML app's audience -- a replacement would break
    // sign-in until that's re-entered by hand in the console.
    //
    // Two kinds of account share it: Identity Center users (the SAML
    // provider below) and people who register on the site itself
    // (/site/register, 2026-10). Self sign-up is on for the latter, but
    // only through widgetgrid-server's registration client -- the
    // pre-sign-up trigger refuses every other route in. Everything changed
    // here for registration (self sign-up, auto-verify, email settings,
    // account recovery) updates the pool in place; signInAliases is the
    // one setting that would replace it, and it's unchanged.
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'widgetgrid',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      // Verification codes and password resets go out through SES from the
      // site's own domain (the identity is in dns-stack.js), not Cognito's
      // built-in sender, which is capped at 50 emails a day.
      email: cognito.UserPoolEmail.withSES({
        fromEmail: `noreply@${EMAIL_DOMAIN}`,
        fromName: 'Pie Laboratories',
        replyTo: `webmaster@${EMAIL_DOMAIN}`,
        sesVerifiedDomain: EMAIL_DOMAIN,
      }),
      userVerification: {
        emailSubject: 'Your Pie Laboratories verification code',
        emailBody: 'Your verification code is {####}. Enter it on the registration page to finish creating your account.',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Custom domain so the hosted sign-in page lives on our own host. ACM
    // cert must be in us-east-1 (Cognito fronts custom domains with
    // CloudFront), which this whole app already is. Cognito also requires
    // the parent domain to resolve, which the prod apex A record covers.
    const authCertificate = new Certificate(this, 'AuthCertificate', {
      domainName: AUTH_HOST,
      validation: CertificateValidation.fromDns(hostedZone),
    });
    // Managed login (the newer pages, with branding -- see
    // managed-login.js) rather than the classic hosted UI. Updates the
    // domain in place.
    const userPoolDomain = userPool.addDomain('UserPoolDomain', {
      customDomain: { domainName: AUTH_HOST, certificate: authCertificate },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });
    new route53.ARecord(this, 'AuthAliasRecord', {
      zone: hostedZone,
      recordName: 'auth',
      target: route53.RecordTarget.fromAlias(new route53Targets.UserPoolDomainTarget(userPoolDomain)),
    });

    // Identity Center app assignment (the "anonyme users" and "anonyme
    // admins" groups) is the gate: anyone Identity Center lets through is
    // allowed to hold a token. What they may do is decided by the
    // cognito:groups claim the trigger below adds.
    const identityCenterProvider = new cognito.UserPoolIdentityProviderSaml(this, 'IdentityCenterSaml', {
      userPool,
      name: 'IdentityCenter',
      metadata: cognito.UserPoolIdentityProviderSamlMetadata.file(SAML_METADATA_XML),
      // Subject (NameID) is the user's email; Cognito still needs a real
      // "email" attribute statement to populate the attribute, mapped on
      // the Identity Center app's attribute-mapping page.
      attributeMapping: { email: cognito.ProviderAttribute.other('email') },
    });

    const preTokenGroups = new lambda.Function(this, 'PreTokenGroups', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/pre-token-groups')),
      timeout: Duration.seconds(5),
      environment: { IDENTITY_STORE_ID },
    });
    preTokenGroups.addToRolePolicy(new iam.PolicyStatement({
      actions: ['identitystore:GetUserId', 'identitystore:ListGroupMembershipsForMember', 'identitystore:DescribeGroup'],
      resources: ['*'],
    }));
    userPool.addTrigger(cognito.UserPoolOperation.PRE_TOKEN_GENERATION, preTokenGroups);

    const preSignUp = new lambda.Function(this, 'PreSignUp', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/pre-sign-up')),
      timeout: Duration.seconds(5),
      environment: {
        REGISTRATION_CLIENT_NAME,
        REGISTER_URL: `https://www.${EMAIL_DOMAIN}/site/register`,
        LINKABLE_PROVIDERS: LINKABLE_PROVIDERS.join(','),
      },
    });
    // Any pool in the account, by ARN pattern rather than this pool's ARN:
    // the trigger is attached to this pool, so referencing it here would be
    // a circular dependency. ListUsers + AdminLinkProviderForUser join a
    // social sign-in to an existing site account.
    preSignUp.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:DescribeUserPoolClient', 'cognito-idp:ListUsers', 'cognito-idp:AdminLinkProviderForUser'],
      resources: [this.formatArn({ service: 'cognito-idp', resource: 'userpool', resourceName: '*' })],
    }));
    userPool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, preSignUp);

    const idp = [cognito.UserPoolClientIdentityProvider.custom(identityCenterProvider.providerName)];
    const social = addSocialProviders(this, userPool);

    // The dev ALB's authenticate-cognito action: confidential client, and
    // ALB's callback path is fixed by AWS.
    const devAlbClient = userPool.addClient('DevAlbClient', {
      generateSecret: true,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
        callbackUrls: ['https://dev.pie-laboratories.com/oauth2/idpresponse'],
      },
      supportedIdentityProviders: idp,
    });
    devAlbClient.node.addDependency(identityCenterProvider);
    addManagedLoginStyle(this, 'DevAlbLoginStyle', { userPool, client: devAlbClient, branded: false });

    // The widgetgrid SPA's own sign-in (the topbar's "Log in"): public
    // client, authorization code + PKCE, tokens sent as Bearer on gRPC-web.
    // /site/login has a button per provider and names the one picked
    // (identity_provider=), so Cognito's page only ever shows its email +
    // password form, for site-registered accounts; Google etc. and
    // Identity Center ("Staff sign-in") go straight through.
    const spaClient = userPool.addClient('SpaClient', {
      generateSecret: false,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: SPA_ORIGINS.map((o) => `${o}/auth/callback`),
        logoutUrls: SPA_ORIGINS.map((o) => `${o}/`),
      },
      supportedIdentityProviders: [...idp, ...social.clientIdps, cognito.UserPoolClientIdentityProvider.COGNITO],
      preventUserExistenceErrors: true,
      // How long the browser stays signed in without seeing Identity
      // Center again (Cognito's default is 30 days). 90 keeps phone
      // sign-ins to a few a year; a lost device is handled by revoking
      // sessions (see infra/cdk/README.md). Access/ID tokens stay 1 hour,
      // so group changes still apply within the hour.
      refreshTokenValidity: Duration.days(90),
    });
    spaClient.node.addDependency(identityCenterProvider, ...social.providers);
    addManagedLoginStyle(this, 'SpaLoginStyle', { userPool, client: spaClient });

    // widgetgrid-server's registration client (packages/server/src/registrar.js):
    // SignUp / ConfirmSignUp / ResendConfirmationCode only, no OAuth. The
    // secret is what makes it server-only; infra/eks/deploy.sh reads it
    // into widgetgrid-server-secret.
    const registrationClient = userPool.addClient('RegistrationClient', {
      userPoolClientName: REGISTRATION_CLIENT_NAME,
      generateSecret: true,
      disableOAuth: true,
      supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
    });

    this.userPool = userPool;
    this.userPoolDomain = userPoolDomain;
    this.devAlbClient = devAlbClient;
    this.spaClient = spaClient;

    // Values to enter on the Identity Center SAML application.
    new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new CfnOutput(this, 'SamlAcsUrl', { value: `https://${AUTH_HOST}/saml2/idpresponse` });
    new CfnOutput(this, 'SpaClientId', { value: spaClient.userPoolClientId });
    new CfnOutput(this, 'RegistrationClientId', { value: registrationClient.userPoolClientId });
    new CfnOutput(this, 'DevAlbClientId', { value: devAlbClient.userPoolClientId });
    new CfnOutput(this, 'SamlAudience', { value: `urn:amazon:cognito:sp:${userPool.userPoolId}` });
  }
}
