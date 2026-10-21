<template>
  <div>
    <template v-if="identity">
      <h2>You're logged in</h2>
      <p>As {{ identity.username || identity.email }}.</p>
      <a class="account-button" :href="accountPath" @click="go(accountPath, $event)">Your account</a>
    </template>
    <template v-else>
      <h2>Log in</h2>
      <p>You'll go to the Pie Laboratories sign-in page and come straight back.</p>
      <button type="button" class="account-button" @click="logIn">Log in</button>

      <div class="account-section">
        <h3>New here?</h3>
        <p>An account lets you post on the message boards. It takes a minute: an email address, a username and a password.</p>
        <a class="account-button" :href="registerPath" @click="go(registerPath, $event)">Create an account</a>
      </div>
    </template>
  </div>
</template>

<script>
import { startSignIn, getIdentity, IDENTITY_CHANGED_EVENT } from '@widgetgrid/auth-web';
import { sitePath, navigate } from '@widgetgrid/site-routes';

// /site/login. Logging in happens on Cognito's hosted page (email +
// password for site accounts, a button through to Identity Center for
// the site's admins) -- this page only sends people there, or on to
// registration.
export default {
  name: 'LoginPage',
  props: {
    returnTo: { type: String, required: true },
  },
  data() {
    return { identity: getIdentity() };
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
    logIn() {
      startSignIn({ returnTo: this.returnTo });
    },
    go(path, event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(path);
    },
  },
};
</script>
