<template>
  <div class="widget widget-account">
    <LoginPage v-if="data.view === 'login'" :return-to="returnTo" />
    <RegisterPage v-else-if="data.view === 'register'" :return-to="returnTo" />
    <AccountPage v-else />
  </div>
</template>

<script>
import LoginPage from './LoginPage.vue';
import RegisterPage from './RegisterPage.vue';
import AccountPage from './AccountPage.vue';

// /site/login, /site/register and /site/account -- one bundle, since they
// lead into each other (MainWidget.vue passes which one as data.view).
// ?return=<path> on login/register is where to land after logging in;
// only same-site paths are honoured, so the link can't send anyone
// off-site.
export default {
  name: 'AccountWidget',
  components: { LoginPage, RegisterPage, AccountPage },
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    const raw = new URLSearchParams(window.location.search).get('return') ?? '';
    return { returnTo: raw.startsWith('/') && !raw.startsWith('//') ? raw : '/' };
  },
};
</script>

<style>
/* Shared by the three pages (unscoped on purpose, prefixed to stay put).
   Same fluid padding as the blog and section pages, so the content column
   doesn't shift between them. */
.widget-account {
  padding: clamp(16px, 4vw, 32px);
  max-width: 560px;
  box-sizing: border-box;
}

.widget-account h2 {
  margin: 0 0 16px;
}

.widget-account form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.widget-account p {
  margin: 0 0 12px;
}

.widget-account form p {
  margin: 0;
}

.account-label {
  font-weight: 600;
}

.account-input {
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 1rem;
}

.account-hint {
  color: #666;
  font-size: 0.85rem;
}

.account-button {
  align-self: flex-start;
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: rgb(5, 5, 5);
  color: #f4ead9;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.account-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.account-link-button {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  color: #0b57d0;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
}

.account-captcha:empty {
  display: none;
}

.account-success {
  color: #1e6b34;
}

.account-error {
  color: #b42318;
}

.account-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ddd;
}
</style>
