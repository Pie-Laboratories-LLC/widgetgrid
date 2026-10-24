import { SecretValue } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';

// "Continue with Google / Microsoft / LinkedIn" on /site/login (2026-10).
// Each provider is a developer app registered in that provider's own
// console, with this as its redirect (callback) URI:
//   https://auth.pie-laboratories.com/oauth2/idpresponse
// plus, while a temporary dev is up, the dev pool's domain with the same
// path (DevIdentityStack's AuthOrigin output).
//
// A provider stays off until its clientId is filled in here. The client
// ids aren't secret; the client secrets are, and live in Secrets Manager
// as one JSON secret, created by hand:
//   aws secretsmanager create-secret --name widgetgrid/social-login \
//     --secret-string '{"googleClientSecret":"…","microsoftClientSecret":"…","linkedinClientSecret":"…"}'
// The site's buttons are a separate list (SOCIAL_PROVIDERS in
// packages/auth-web) -- add a name there only once it's deployed here.
export const SOCIAL_LOGIN_SECRET = 'widgetgrid/social-login';

export const SOCIAL_CLIENT_IDS = {
  // Google Cloud console -> APIs & Services -> Credentials -> OAuth client
  // ID (type "Web application").
  google: '314021222703-3f9nd0afrb5iofro1d08jerknrk5hoov.apps.googleusercontent.com',
  // Entra admin center -> App registrations, "Personal Microsoft accounts
  // only". Work/school accounts would need an OIDC shim in front: their
  // tokens' issuer names each tenant, which Cognito won't accept.
  // Its client secret EXPIRES 2027-04-21 (Entra allows 24 months at most):
  // before then, make a new one under Certificates & secrets and put its
  // Value in the secret's microsoftClientSecret, or Microsoft sign-in stops.
  microsoft: '86813528-7d78-48ad-859d-1e0a24c05196',
  // LinkedIn developer portal, with the "Sign In with LinkedIn using
  // OpenID Connect" product added.
  linkedin: '8618vdnfhilmpe',
};

// Personal Microsoft accounts all sign in through this one tenant, so its
// issuer is fixed.
const MICROSOFT_CONSUMERS_ISSUER = 'https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0';

function clientSecret(field) {
  return SecretValue.secretsManager(SOCIAL_LOGIN_SECRET, { jsonField: field });
}

// Adds the providers that have a client id to the pool. Returns them as
// { providers, clientIdps }: the constructs (an app client that offers
// them must depend on them) and the entries for its
// supportedIdentityProviders.
//
// email_verified is mapped wherever the provider sends it: the pre-sign-up
// trigger only joins a social sign-in to an existing site account when
// it's true. Microsoft doesn't send it, so Microsoft sign-ins never join.
export function addSocialProviders(scope, userPool) {
  const providers = [];
  if (SOCIAL_CLIENT_IDS.google) {
    providers.push(new cognito.UserPoolIdentityProviderGoogle(scope, 'GoogleIdp', {
      userPool,
      clientId: SOCIAL_CLIENT_IDS.google,
      clientSecretValue: clientSecret('googleClientSecret'),
      scopes: ['openid', 'email', 'profile'],
      attributeMapping: {
        email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        emailVerified: cognito.ProviderAttribute.GOOGLE_EMAIL_VERIFIED,
      },
    }));
  }
  if (SOCIAL_CLIENT_IDS.microsoft) {
    providers.push(new cognito.UserPoolIdentityProviderOidc(scope, 'MicrosoftIdp', {
      userPool,
      name: 'Microsoft',
      clientId: SOCIAL_CLIENT_IDS.microsoft,
      // A dynamic reference, resolved by CloudFormation -- the secret
      // itself never appears in the template.
      clientSecret: clientSecret('microsoftClientSecret').unsafeUnwrap(),
      issuerUrl: MICROSOFT_CONSUMERS_ISSUER,
      scopes: ['openid', 'email', 'profile'],
      attributeMapping: { email: cognito.ProviderAttribute.other('email') },
    }));
  }
  if (SOCIAL_CLIENT_IDS.linkedin) {
    providers.push(new cognito.UserPoolIdentityProviderOidc(scope, 'LinkedInIdp', {
      userPool,
      name: 'LinkedIn',
      clientId: SOCIAL_CLIENT_IDS.linkedin,
      clientSecret: clientSecret('linkedinClientSecret').unsafeUnwrap(),
      issuerUrl: 'https://www.linkedin.com/oauth',
      scopes: ['openid', 'email', 'profile'],
      attributeMapping: {
        email: cognito.ProviderAttribute.other('email'),
        emailVerified: cognito.ProviderAttribute.other('email_verified'),
      },
    }));
  }
  const clientIdps = providers.map((p) => cognito.UserPoolClientIdentityProvider.custom(p.providerName));
  return { providers, clientIdps };
}

// Providers whose sign-ins the pre-sign-up trigger may join to an existing
// site account (by verified email) -- never Identity Center.
export const LINKABLE_PROVIDERS = ['Google', 'LinkedIn'];
