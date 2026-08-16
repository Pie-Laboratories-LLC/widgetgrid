<template>
  <div class="widget widget-login">
    <button
      v-if="ownerToken && !showPanel" type="button" class="login-logout-link"
      @click="logout"
    >Log out</button>

    <div v-if="showPanel" class="login-overlay" @click.self="close">
      <div class="login-panel">
        <button type="button" class="login-close" aria-label="Close" @click="close">&times;</button>

        <template v-if="step === 'code'">
          <p class="login-prompt">Enter the code that was texted to you.</p>
          <form @submit.prevent="submitCode">
            <input
              v-model="code" type="text" inputmode="numeric" autocomplete="one-time-code"
              class="login-input" placeholder="123456" autofocus
            />
            <button type="submit" class="login-submit" :disabled="busy || !code">Verify</button>
          </form>
          <p v-if="error" class="login-error">{{ error }}</p>
        </template>

        <template v-else>
          <p class="login-prompt">Text yourself a one-time login code?</p>
          <button type="button" class="login-submit" :disabled="busy" @click="requestCode">
            {{ busy ? 'Sending…' : 'Send code' }}
          </button>
          <p v-if="error" class="login-error">{{ error }}</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { authClient } from './authClient.js';

// localStorage key the owner's session token lives under -- widgets/chat
// and widgets/topbar each read this same key directly (independently
// built widgets, no shared module to hold the constant in).
const TOKEN_KEY = 'widgetgrid:ownerToken';

export default {
  name: 'LoginWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return {
      ownerToken: localStorage.getItem(TOKEN_KEY),
      showPanel: false,
      step: 'request', // 'request' | 'code'
      code: '',
      busy: false,
      error: '',
      clickCount: 0,
    };
  },
  created() {
    // TopBarWidget.vue dispatches this on every logo click -- it owns the
    // DOM element the click lands on, this widget owns the "5 clicks
    // within 2s reveals the login panel" logic, so a plain relayed event
    // is the only thing connecting them (same reasoning as every other
    // cross-widget window event in this app).
    window.addEventListener('widgetgrid:logo-click', this.onLogoClick);
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:logo-click', this.onLogoClick);
    clearTimeout(this.clickResetTimer);
  },
  methods: {
    onLogoClick() {
      if (this.ownerToken) return; // already logged in -- nothing to reveal
      this.clickCount += 1;
      clearTimeout(this.clickResetTimer);
      this.clickResetTimer = setTimeout(() => { this.clickCount = 0; }, 2000);
      if (this.clickCount >= 5) {
        this.clickCount = 0;
        this.showPanel = true;
        this.step = 'request';
        this.error = '';
      }
    },
    close() {
      this.showPanel = false;
      this.code = '';
      this.error = '';
    },
    async requestCode() {
      this.busy = true;
      this.error = '';
      try {
        await authClient.requestLoginCode();
        this.step = 'code';
      } catch {
        this.error = "Couldn't send the code -- try again.";
      } finally {
        this.busy = false;
      }
    },
    async submitCode() {
      this.busy = true;
      this.error = '';
      try {
        const token = await authClient.verifyLoginCode(this.code);
        if (!token) {
          this.error = 'Wrong code -- request a new one.';
          this.step = 'request';
          this.code = '';
          return;
        }
        localStorage.setItem(TOKEN_KEY, token);
        this.ownerToken = token;
        this.showPanel = false;
        this.code = '';
        // widgets/main/src/MainWidget.vue's chat-event subscription reads
        // this same localStorage key, but only once, at page-load time
        // (before this login flow can possibly have run) -- without this,
        // that subscription would stay open as an anonymous visitor for
        // the rest of the page's lifetime even after this exact login
        // succeeds, silently never delivering the owner their own chat
        // events until a reload opens a fresh subscription.
        window.dispatchEvent(new CustomEvent('widgetgrid:identity-changed'));
      } catch {
        this.error = 'Something went wrong -- try again.';
      } finally {
        this.busy = false;
      }
    },
    async logout() {
      const token = this.ownerToken;
      localStorage.removeItem(TOKEN_KEY);
      this.ownerToken = null;
      window.dispatchEvent(new CustomEvent('widgetgrid:identity-changed'));
      try {
        await authClient.logout(token);
      } catch {
        // Session row is already gone client-side (icon greys out via the
        // presence push regardless) -- a failed cleanup call server-side
        // isn't worth surfacing to a single owner logging themselves out.
      }
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

.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(10, 5, 20, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-panel {
  position: relative;
  width: 320px;
  max-width: calc(100vw - 40px);
  background: #150a2e;
  color: #f4ead9;
  border-radius: 12px;
  padding: 32px 24px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.login-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: #f4ead9;
  opacity: 0.6;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

.login-close:hover {
  opacity: 1;
}

.login-prompt {
  margin: 0 0 16px;
  font-size: 0.95rem;
}

.login-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid rgba(244, 234, 217, 0.3);
  background: rgba(244, 234, 217, 0.06);
  color: #f4ead9;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
}

.login-submit {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: none;
  background: #e5322d;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.login-submit:disabled {
  opacity: 0.5;
  cursor: default;
}

.login-error {
  margin: 12px 0 0;
  color: #ff9d97;
  font-size: 0.85rem;
}
</style>
