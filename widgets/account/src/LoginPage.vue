<template>
  <div>
    <template v-if="identity">
      <h2>You're logged in</h2>
      <p>As {{ identity.username || identity.email }}.</p>
      <a class="account-button" :href="accountPath" @click="go(accountPath, $event)">Your account</a>
    </template>
    <template v-else>
      <h2>Log in</h2>

      <div class="login-choices">
        <button
          v-for="provider in socialProviders" :key="provider"
          type="button" :class="['login-provider', `login-provider-${provider.toLowerCase()}`]"
          @click="logIn(provider)"
        >
          <!-- Each provider's own mark, per its button guidelines. -->
          <svg v-if="provider === 'Google'" class="login-provider-mark" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          <svg v-else-if="provider === 'Microsoft'" class="login-provider-mark" viewBox="0 0 21 21" aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          <svg v-else-if="provider === 'LinkedIn'" class="login-provider-mark" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#fff" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Continue with {{ provider }}
        </button>

        <p v-if="socialProviders.length" class="login-or">or</p>
        <button type="button" class="login-provider login-provider-email" @click="logIn(emailProvider)">
          Log in with email and password
        </button>
      </div>

      <div class="account-section">
        <h3>New here?</h3>
        <p v-if="socialProviders.length">
          Use one of the buttons above, or create an account with your email address: it takes a minute, with a username and a password.
        </p>
        <p v-else>An account lets you post on the message boards. It takes a minute: an email address, a username and a password.</p>
        <a class="account-button" :href="registerPath" @click="go(registerPath, $event)">Create an account</a>
      </div>

      <p class="login-staff">
        <button type="button" class="account-link-button" @click="logIn(staffProvider)">Staff sign-in</button>
      </p>
    </template>
  </div>
</template>

<script>
import {
  startSignIn, getIdentity, IDENTITY_CHANGED_EVENT, SOCIAL_PROVIDERS, EMAIL_PROVIDER, STAFF_PROVIDER,
} from '@widgetgrid/auth-web';
import { sitePath, navigate } from '@widgetgrid/site-routes';

// /site/login: a button per way in, each going straight there -- a social
// provider, Cognito's email + password page for site-registered accounts,
// or Identity Center for staff. Picking here rather than on Cognito's page
// keeps the wording and look ours (Cognito's text can't be changed).
// Social sign-ins without a site account yet get one, and pick a username
// the first time they need it, as Identity Center users do.
export default {
  name: 'LoginPage',
  props: {
    returnTo: { type: String, required: true },
  },
  data() {
    return {
      identity: getIdentity(),
      socialProviders: SOCIAL_PROVIDERS,
      emailProvider: EMAIL_PROVIDER,
      staffProvider: STAFF_PROVIDER,
    };
  },
  computed: {
    accountPath() {
      return sitePath('account');
    },
    registerPath() {
      return this.returnTo === '/' ? sitePath('register') : `${sitePath('register')}?return=${encodeURIComponent(this.returnTo)}`;
    },
  },
  created() {
    window.addEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
  },
  beforeUnmount() {
    window.removeEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
  },
  methods: {
    onIdentityChanged() {
      this.identity = getIdentity();
    },
    logIn(provider) {
      startSignIn({ returnTo: this.returnTo, provider });
    },
    go(path, event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(path);
    },
  },
};
</script>

<style scoped>
.login-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 320px;
}

/* Same size and shape for every way in; colours follow each provider's
   button guidelines (light theme). */
.login-provider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #747775;
  border-radius: 6px;
  background: #fff;
  color: #1f1f1f;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
}

.login-provider:hover {
  background: #f4f4f4;
}

.login-provider-mark {
  width: 20px;
  height: 20px;
  flex: none;
}

.login-provider-microsoft {
  border-color: #8c8c8c;
  color: #5e5e5e;
}

.login-provider-linkedin {
  border-color: #0a66c2;
  background: #0a66c2;
  color: #fff;
}

.login-provider-linkedin:hover {
  background: #004182;
}

.login-provider-email {
  border-color: rgb(5, 5, 5);
  background: rgb(5, 5, 5);
  color: #f4ead9;
}

.login-provider-email:hover {
  background: #2a2a2a;
}

.login-or {
  margin: 2px 0;
  text-align: center;
  color: #666;
  font-size: 0.85rem;
}

.login-staff {
  margin-top: 24px;
}
</style>
