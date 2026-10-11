<template>
  <div class="push-controls">
    <p class="push-title">Notifications</p>

    <p v-if="support === 'needs-home-screen'" class="push-note">
      To get chat notifications on this iPhone, add this site to your Home Screen
      (Share &rarr; Add to Home Screen), then open it from that icon.
    </p>
    <p v-else-if="support === 'unsupported'" class="push-note">This browser can't receive notifications.</p>

    <template v-else-if="enabled">
      <p class="push-note">On for this device.</p>
      <div class="push-actions">
        <button type="button" class="push-btn" :disabled="busy" @click="test">Send test</button>
        <button type="button" class="push-btn push-btn-quiet" :disabled="busy" @click="turnOff">Turn off</button>
      </div>
    </template>
    <button v-else type="button" class="push-btn" :disabled="busy" @click="turnOn">
      Enable on this device
    </button>

    <p v-if="message" class="push-message">{{ message }}</p>
  </div>
</template>

<script>
import { pushSupport, isEnabledHere, enablePush, disablePush, sendTestPush } from './pushClient.js';

const ERRORS = {
  blocked: 'Notifications are blocked for this site. Allow them in the browser or iOS settings, then try again.',
  dismissed: 'No permission given -- try again when ready.',
  'not-configured': "Push isn't configured on the server yet.",
};

export default {
  name: 'PushControls',
  data() {
    return { support: pushSupport(), enabled: false, busy: false, message: '' };
  },
  async created() {
    if (this.support === 'supported') this.enabled = await isEnabledHere();
  },
  methods: {
    async run(action) {
      this.busy = true;
      this.message = '';
      try {
        await action();
      } catch (err) {
        this.message = ERRORS[err.message] ?? `Something went wrong: ${err.message}`;
      } finally {
        this.busy = false;
      }
    },
    turnOn() {
      return this.run(async () => {
        await enablePush();
        this.enabled = true;
        this.message = 'Enabled. Use Send test to check it arrives.';
      });
    },
    turnOff() {
      return this.run(async () => {
        await disablePush();
        this.enabled = false;
      });
    },
    test() {
      return this.run(async () => {
        const delivered = await sendTestPush();
        this.message = delivered > 0
          ? `Sent to ${delivered} device${delivered === 1 ? '' : 's'}.`
          : 'Sent, but no device accepted it.';
      });
    },
  },
};
</script>

<style scoped>
.push-controls {
  padding: 10px 12px;
  border-bottom: 1px solid #ddd;
  font-size: 0.85rem;
}
.push-title {
  margin: 0 0 4px;
  font-weight: 600;
  color: #333;
}
.push-note,
.push-message {
  margin: 0 0 6px;
  color: #666;
}
.push-message {
  margin: 6px 0 0;
}
.push-actions {
  display: flex;
  gap: 6px;
}
.push-btn {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #150a2e;
  color: #f4ead9;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
}
.push-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.push-btn-quiet {
  background: none;
  color: #666;
  border: 1px solid #ccc;
}
</style>
