<template>
  <div>
    <template v-if="!identity">
      <h2>Your account</h2>
      <p>You're not logged in.</p>
      <a class="account-button" :href="paths.login" @click="go(paths.login, $event)">Log in or create an account</a>
    </template>
    <template v-else>
      <h2>Your account</h2>
      <p>Logged in as <strong>{{ identity.username || identity.email }}</strong>.</p>

      <!-- Identity Center accounts, or a registration whose reserved name
           lapsed before first log-in, have none yet. -->
      <form v-if="!identity.username" @submit.prevent="chooseUsername">
        <label class="account-label" for="account-username">Choose a username</label>
        <input
          id="account-username" v-model="username" class="account-input" type="text" autocomplete="username"
          required minlength="3" maxlength="20" spellcheck="false"
        />
        <p class="account-hint">Shown on your message board posts. 3-20 letters, digits, _ or -. It can't be changed later.</p>
        <button type="submit" class="account-button" :disabled="working">Save username</button>
        <p v-if="error" class="account-error">{{ error }}</p>
      </form>

      <dl class="account-details">
        <dt>Email</dt>
        <dd>{{ identity.email }}</dd>
        <template v-if="identity.username">
          <dt>Username</dt>
          <dd>{{ identity.username }}</dd>
        </template>
      </dl>

      <p><a :href="paths.subscribe" @click="go(paths.subscribe, $event)">Email updates on new posts</a></p>
      <button type="button" class="account-button" @click="logOut">Log out</button>
    </template>
  </div>
</template>

<script>
import { getIdentity, setUsername, signOut, IDENTITY_CHANGED_EVENT } from '@widgetgrid/auth-web';
import { sitePath, navigate } from '@widgetgrid/site-routes';
import { accountClient, describe } from './accountClient.js';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';

// /site/account: who you're logged in as, choosing a username if you
// don't have one, and logging out.
export default {
  name: 'AccountPage',
  data() {
    return {
      identity: getIdentity(),
      username: '',
      working: false,
      error: '',
      paths: { login: sitePath('login'), subscribe: sitePath('subscribe') },
    };
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
    async chooseUsername() {
      this.working = true;
      this.error = '';
      try {
        setUsername(await accountClient.chooseUsername(this.username.trim()));
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.working = false;
      }
    },
    logOut() {
      signOut({ grpcWebOrigin: GRPC_WEB_ORIGIN });
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
.account-details {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 16px;
  margin: 16px 0 24px;
}

.account-details dt {
  font-weight: 600;
}

.account-details dd {
  margin: 0;
}
</style>
