<template>
  <div class="widget widget-subscribe">
    <h2 class="subscribe-heading">Email updates</h2>

    <!-- Arrived from a confirmation email. -->
    <template v-if="mode === 'confirm'">
      <p v-if="status === 'working'">Confirming…</p>
      <p v-else-if="status === 'done'" class="subscribe-success">
        You're subscribed: {{ resultEmail }} will get an email whenever a new post goes up.
      </p>
      <p v-else class="subscribe-error">{{ error }}</p>
    </template>

    <!-- Arrived from an email's unsubscribe link. Asks first rather than
         acting on page load: mail scanners open every link in a message. -->
    <template v-else-if="mode === 'unsubscribe'">
      <p v-if="status === 'done'" class="subscribe-success">
        You're unsubscribed{{ resultEmail ? `: ${resultEmail} won't get any more emails` : '' }}.
      </p>
      <template v-else>
        <p>Stop getting an email for each new post?</p>
        <button type="button" class="subscribe-button" :disabled="status === 'working'" @click="unsubscribe">
          Unsubscribe
        </button>
        <p v-if="status === 'error'" class="subscribe-error">{{ error }}</p>
      </template>
    </template>

    <template v-else>
      <p v-if="status === 'done' && outcome === 'subscribed'" class="subscribe-success">
        You're subscribed: {{ resultEmail }} will get an email whenever a new post goes up.
      </p>
      <p v-else-if="status === 'done'" class="subscribe-success">
        Check {{ resultEmail }} for a confirmation link. Nothing is sent until you click it.
      </p>
      <form v-else class="subscribe-form" @submit.prevent="subscribe">
        <p>Get an email whenever a new blog post goes up. One email per post, nothing else, unsubscribe any time.</p>
        <p>Your email address will never be shared, sold, or used for any other purpose.</p>
        <label class="subscribe-label" for="subscribe-email">Email address</label>
        <input
          id="subscribe-email" v-model="email" class="subscribe-input" type="email"
          autocomplete="email" required maxlength="254"
        />
        <p v-if="usesOwnAddress" class="subscribe-note">That's your account's address, so no confirmation email is needed.</p>
        <!-- Turnstile renders here; skipped for a signed-in user's own address. -->
        <div v-show="!usesOwnAddress" ref="captcha" class="subscribe-captcha"></div>
        <button type="submit" class="subscribe-button" :disabled="status === 'working' || !canSubmit">Subscribe</button>
        <p v-if="status === 'error'" class="subscribe-error">{{ error }}</p>
      </form>
      <p class="subscribe-alt">Prefer a feed reader? <a href="/rss.xml">RSS feed</a></p>
    </template>
  </div>
</template>

<script>
import { getIdentity, IDENTITY_CHANGED_EVENT } from '@widgetgrid/auth-web';
import { sitePath, navigate } from '@widgetgrid/site-routes';
import { subscriptionClient } from './subscriptionClient.js';

// Public site key (the secret half is widgetgrid-server's
// TURNSTILE_SECRET_KEY). Defaults to Cloudflare's always-passes test key,
// so the widget behaves for real in local dev; production builds get the
// real key via VITE_TURNSTILE_SITE_KEY (see infra/eks/deploy.sh).
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileLoading = null;
function loadTurnstile() {
  turnstileLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      turnstileLoading = null;
      reject(new Error('captcha failed to load'));
    };
    document.head.appendChild(script);
  });
  return turnstileLoading;
}

// gRPC-Web errors carry the server's message; anything else (network) gets
// a generic one.
function describe(err) {
  return typeof err?.code === 'number' && err.message ? err.message : 'Something went wrong. Please try again later.';
}

// /site/subscribe: sign up for an email per new post, plus the landing
// page for the confirmation and unsubscribe links those emails carry
// (?confirm=<token>, ?unsubscribe=<token>). See
// proto/widgetgrid/v1/subscription.proto for the flow.
export default {
  name: 'SubscribeWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    const params = new URLSearchParams(window.location.search);
    const confirmToken = params.get('confirm');
    const unsubscribeToken = params.get('unsubscribe');
    return {
      mode: confirmToken ? 'confirm' : unsubscribeToken ? 'unsubscribe' : 'form',
      token: confirmToken ?? unsubscribeToken ?? '',
      identity: getIdentity(),
      email: getIdentity()?.email ?? '',
      captchaToken: '',
      status: 'idle', // 'idle' | 'working' | 'done' | 'error'
      outcome: '',
      resultEmail: '',
      error: '',
    };
  },
  computed: {
    usesOwnAddress() {
      return !!this.identity?.email && this.email.trim().toLowerCase() === this.identity.email.toLowerCase();
    },
    canSubmit() {
      return this.usesOwnAddress || !!this.captchaToken;
    },
  },
  created() {
    window.addEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
    if (this.token) {
      // The token has done its job once it's in this component -- drop it
      // from the address bar so a reload or a shared screenshot doesn't
      // carry it around.
      navigate(sitePath('subscribe'), { replace: true });
    }
    if (this.mode === 'confirm') this.confirm();
  },
  mounted() {
    if (this.mode === 'form') this.renderCaptcha();
  },
  beforeUnmount() {
    window.removeEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
    if (this.captchaWidgetId !== undefined) window.turnstile?.remove(this.captchaWidgetId);
  },
  methods: {
    onIdentityChanged() {
      this.identity = getIdentity();
    },
    async renderCaptcha() {
      try {
        const turnstile = await loadTurnstile();
        if (!this.$refs.captcha) return; // navigated away while loading
        this.captchaWidgetId = turnstile.render(this.$refs.captcha, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => { this.captchaToken = token; },
          'expired-callback': () => { this.captchaToken = ''; },
          'error-callback': () => { this.captchaToken = ''; },
        });
      } catch (err) {
        this.status = 'error';
        this.error = "The captcha couldn't load. Check your connection or ad blocker and reload the page.";
      }
    },
    async subscribe() {
      this.status = 'working';
      this.error = '';
      const email = this.email.trim();
      try {
        this.outcome = await subscriptionClient.subscribe(email, this.usesOwnAddress ? '' : this.captchaToken);
        this.resultEmail = email;
        this.status = 'done';
      } catch (err) {
        this.status = 'error';
        this.error = describe(err);
        // A Turnstile token is single-use -- get a fresh one for a retry.
        this.captchaToken = '';
        if (this.captchaWidgetId !== undefined) window.turnstile?.reset(this.captchaWidgetId);
      }
    },
    async confirm() {
      this.status = 'working';
      try {
        this.resultEmail = await subscriptionClient.confirm(this.token);
        this.status = 'done';
      } catch (err) {
        this.status = 'error';
        if (err?.code === 5) { // NOT_FOUND
          // Straight to the form, message and all, to start over.
          this.error = 'That confirmation link has expired or was already used. You can subscribe again here.';
          this.mode = 'form';
          this.$nextTick(this.renderCaptcha);
          return;
        }
        this.error = describe(err);
      }
    },
    async unsubscribe() {
      this.status = 'working';
      try {
        this.resultEmail = await subscriptionClient.unsubscribe(this.token);
        this.status = 'done';
      } catch (err) {
        this.status = 'error';
        this.error = describe(err);
      }
    },
  },
};
</script>

<style scoped>
/* Same fluid padding as BlogWidget.vue and the section pages, so the
   content column doesn't shift between them. */
.widget-subscribe {
  padding: clamp(16px, 4vw, 32px);
  max-width: 560px;
  box-sizing: border-box;
}

.subscribe-heading {
  margin: 0 0 16px;
}

.subscribe-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subscribe-form p {
  margin: 0;
}

.subscribe-label {
  font-weight: 600;
}

.subscribe-input {
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 1rem;
}

.subscribe-captcha:empty {
  display: none;
}

.subscribe-button {
  align-self: flex-start;
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: rgb(5, 5, 5);
  color: #f4ead9;
  font-size: 1rem;
  cursor: pointer;
}

.subscribe-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.subscribe-note,
.subscribe-alt {
  color: #666;
  font-size: 0.9rem;
}

.subscribe-alt {
  margin-top: 24px;
}

.subscribe-success {
  color: #1e6b34;
}

.subscribe-error {
  color: #b42318;
}
</style>
