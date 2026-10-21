<template>
  <div class="widget widget-login">
    <button
      v-if="identity" type="button" class="login-link"
      :title="identity.username || identity.email" @click="logout"
    >Log out</button>
    <a v-else class="login-link" :href="loginHref" @click="onLoginClick">Log in</a>
  </div>
</template>

<script>
import { signOut, getIdentity, IDENTITY_CHANGED_EVENT } from '@widgetgrid/auth-web';
import { sitePath, navigate, ROUTE_EVENT } from '@widgetgrid/site-routes';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const ACCOUNT_VIEWS = ['/site/login', '/site/register', '/site/account'];

// The topbar's "Log in" / "Log out" (TopBarWidget.vue mounts it). Log in
// goes to /site/login, which offers logging in on Cognito's hosted page or
// registering -- carrying the current page along (?return=) so either ends
// up back where the visitor was. Replaced the old five-clicks-on-the-logo
// gesture, which only Identity Center admins ever knew about.
export default {
  name: 'LoginWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return { identity: getIdentity(), here: window.location.pathname };
  },
  computed: {
    loginHref() {
      // From one of the account pages themselves, no point coming back.
      if (ACCOUNT_VIEWS.includes(this.here)) return sitePath('login');
      return `${sitePath('login')}?return=${encodeURIComponent(this.here)}`;
    },
  },
  created() {
    window.addEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
    window.addEventListener(ROUTE_EVENT, this.onRoute);
  },
  beforeUnmount() {
    window.removeEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
    window.removeEventListener(ROUTE_EVENT, this.onRoute);
  },
  methods: {
    onIdentityChanged() {
      this.identity = getIdentity();
    },
    onRoute(event) {
      this.here = event.detail.path;
    },
    onLoginClick(event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(this.loginHref);
    },
    logout() {
      signOut({ grpcWebOrigin: GRPC_WEB_ORIGIN });
    },
  },
};
</script>

<style scoped>
.login-link {
  background: none;
  border: none;
  color: #f4ead9;
  opacity: 0.7;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 6px 4px;
  white-space: nowrap;
  text-decoration: none;
}

.login-link:hover,
.login-link:focus-visible {
  opacity: 1;
  text-decoration: underline;
}
</style>
