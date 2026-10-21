<template>
  <p v-if="!viewer.signedIn" class="board-notice">
    <a :href="loginPath" @click="go(loginPath, $event)">Log in or create an account</a> to post.
  </p>
  <p v-else-if="viewer.banned" class="board-notice">You can read the boards, but you can't post on them.</p>
  <p v-else-if="!viewer.username" class="board-notice">
    <a :href="accountPath" @click="go(accountPath, $event)">Choose a username</a> to post.
  </p>
</template>

<script>
import { sitePath, navigate } from '@widgetgrid/site-routes';

// What someone who can't post (yet) needs to do about it. Renders nothing
// for someone who can.
export default {
  name: 'PostingNotice',
  props: {
    viewer: { type: Object, required: true },
  },
  computed: {
    loginPath() {
      return `${sitePath('login')}?return=${encodeURIComponent(window.location.pathname)}`;
    },
    accountPath() {
      return sitePath('account');
    },
  },
  methods: {
    go(path, event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(path);
    },
  },
};
</script>

<style scoped>
.board-notice {
  padding: 10px 14px;
  border-radius: 6px;
  background: #f5f2ec;
}
</style>
