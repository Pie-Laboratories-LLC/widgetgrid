<template>
  <div>
    <h2>Create an account</h2>

    <form v-if="step === 'details'" @submit.prevent="register">
      <label class="account-label" for="register-email">Email address</label>
      <input id="register-email" v-model="email" class="account-input" type="email" autocomplete="email" required maxlength="254" @change="onUsernameInput" />
      <p class="account-hint">Used to log in and for the verification code. Never shown to anyone, shared or sold.</p>

      <label class="account-label" for="register-username">Username</label>
      <input
        id="register-username" v-model="username" class="account-input" type="text" autocomplete="username"
        required minlength="3" maxlength="20" spellcheck="false" @input="onUsernameInput"
      />
      <p v-if="usernameCheck.problem" class="account-error">{{ usernameCheck.problem }}</p>
      <p v-else-if="usernameCheck.available" class="account-success">{{ username }} is available.</p>
      <p v-else class="account-hint">Shown on your message board posts. 3-20 letters, digits, _ or -. It can't be changed later.</p>

      <label class="account-label" for="register-password">Password</label>
      <input id="register-password" v-model="password" class="account-input" type="password" autocomplete="new-password" required minlength="8" />
      <p class="account-hint">At least 8 characters, with upper and lower case letters, a digit and a symbol.</p>

      <div ref="captcha" class="account-captcha"></div>
      <button type="submit" class="account-button" :disabled="working || !captchaToken || usernameCheck.problem !== ''">Create account</button>
      <p v-if="error" class="account-error">{{ error }}</p>
      <p class="account-hint">Already have an account? <a :href="loginPath" @click="go(loginPath, $event)">Log in</a></p>
    </form>

    <form v-else-if="step === 'code'" @submit.prevent="confirm">
      <p>We've emailed a 6-digit code to <strong>{{ email }}</strong>. Enter it here to finish.</p>
      <label class="account-label" for="register-code">Verification code</label>
      <input
        id="register-code" v-model="code" class="account-input" type="text" inputmode="numeric"
        autocomplete="one-time-code" pattern="\d{6}" maxlength="6" required
      />
      <button type="submit" class="account-button" :disabled="working">Verify</button>
      <p v-if="error" class="account-error">{{ error }}</p>
      <p v-if="resent" class="account-success">A new code is on its way.</p>
      <button type="button" class="account-link-button" :disabled="working" @click="resend">Send a new code</button>
    </form>

    <template v-else>
      <p class="account-success">Your account is ready. Log in to finish setting it up: your username will be <strong>{{ username }}</strong>.</p>
      <button type="button" class="account-button" @click="logIn">Log in</button>
    </template>
  </div>
</template>

<script>
import { startSignIn } from '@widgetgrid/auth-web';
import { sitePath, navigate } from '@widgetgrid/site-routes';
import { renderTurnstile } from '@widgetgrid/turnstile-web';
import { accountClient, describe } from './accountClient.js';

const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;

// /site/register: details -> the code Cognito emails -> log in. The
// username is reserved at the first step and becomes the account's at its
// first log-in (AuthService.RegisterSignIn) -- see
// proto/widgetgrid/v1/account.proto.
export default {
  name: 'RegisterPage',
  props: {
    returnTo: { type: String, required: true },
  },
  data() {
    return {
      step: 'details', // 'details' | 'code' | 'done'
      email: '',
      username: '',
      password: '',
      code: '',
      captchaToken: '',
      // problem: '' means none known (yet); available: confirmed free.
      usernameCheck: { available: false, problem: '' },
      working: false,
      error: '',
      resent: false,
    };
  },
  computed: {
    loginPath() {
      return this.returnTo === '/' ? sitePath('login') : `${sitePath('login')}?return=${encodeURIComponent(this.returnTo)}`;
    },
  },
  mounted() {
    this.renderCaptcha();
  },
  beforeUnmount() {
    clearTimeout(this.usernameTimer);
    this.captcha?.remove();
  },
  methods: {
    async renderCaptcha() {
      try {
        const captcha = await renderTurnstile(this.$refs.captcha, (token) => { this.captchaToken = token; });
        if (this.$.isUnmounted) captcha.remove();
        else this.captcha = captcha;
      } catch {
        this.error = "The captcha couldn't load. Check your connection or ad blocker and reload the page.";
      }
    },
    // Checked as they type (debounced), so a taken name shows up before
    // the whole form is filled in. The server checks again on submit.
    onUsernameInput() {
      clearTimeout(this.usernameTimer);
      this.usernameCheck = { available: false, problem: '' };
      const name = this.username.trim();
      if (name.length < 3) return;
      if (!USERNAME_PATTERN.test(name)) {
        this.usernameCheck = { available: false, problem: 'Usernames are 3-20 characters: letters, digits, _ or -.' };
        return;
      }
      this.usernameTimer = setTimeout(async () => {
        try {
          const result = await accountClient.checkUsername(name, this.email.trim());
          if (name === this.username.trim()) this.usernameCheck = result;
        } catch {
          // Not worth bothering anyone over -- submit checks again.
        }
      }, 400);
    },
    async register() {
      this.working = true;
      this.error = '';
      try {
        this.email = this.email.trim();
        this.username = this.username.trim();
        await accountClient.register({
          email: this.email, username: this.username, password: this.password, captchaToken: this.captchaToken,
        });
        this.password = '';
        this.step = 'code';
      } catch (err) {
        this.error = describe(err);
        this.captchaToken = '';
        this.captcha?.reset();
      } finally {
        this.working = false;
      }
    },
    async confirm() {
      this.working = true;
      this.error = '';
      this.resent = false;
      try {
        await accountClient.confirm({ email: this.email, code: this.code.trim() });
        this.step = 'done';
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.working = false;
      }
    },
    async resend() {
      this.working = true;
      this.error = '';
      try {
        await accountClient.resendCode(this.email);
        this.resent = true;
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.working = false;
      }
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
