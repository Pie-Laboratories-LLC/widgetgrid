<template>
  <div class="widget widget-login">
    <button
      v-if="identity" type="button" class="login-logout-link"
      :title="identity.email" @click="logout"
    >Log out</button>
  </div>
</template>

<script>
import { startSignIn, signOut, getIdentity, IDENTITY_CHANGED_EVENT } from '@widgetgrid/auth-web';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';

export default {
  name: 'LoginWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return {
      identity: getIdentity(),
      clickCount: 0,
    };
  },
  created() {
    // TopBarWidget.vue dispatches this on every logo click -- it owns the
    // DOM element the click lands on, this widget owns the "5 clicks
    // within 2s starts sign-in" logic, so a plain relayed event is the
    // only thing connecting them (same reasoning as every other
    // cross-widget window event in this app).
    window.addEventListener('widgetgrid:logo-click', this.onLogoClick);
    window.addEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:logo-click', this.onLogoClick);
    window.removeEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
    clearTimeout(this.clickResetTimer);
  },
  methods: {
    onLogoClick() {
      if (this.identity) return; // already signed in
      this.clickCount += 1;
      clearTimeout(this.clickResetTimer);
      this.clickResetTimer = setTimeout(() => { this.clickCount = 0; }, 2000);
      if (this.clickCount >= 5) {
        this.clickCount = 0;
        // Full-page redirect to the Cognito hosted UI / Identity Center;
        // packages/web-app finishes the sign-in on /auth/callback.
        startSignIn();
      }
    },
    onIdentityChanged() {
      this.identity = getIdentity();
    },
    logout() {
      signOut({ grpcWebOrigin: GRPC_WEB_ORIGIN });
    },
  },
};
</script>

<style scoped>
.login-logout-link {
  background: none;
  border: none;
  color: #f4ead9;
  opacity: 0.7;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 6px 4px;
}

.login-logout-link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
