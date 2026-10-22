<template>
  <section v-if="images.length || error" class="held">
    <h3>Images waiting for review</h3>
    <p class="board-muted">The automatic check wasn't sure about these. Approved ones show in their posts; rejected ones disappear.</p>
    <p v-if="error" class="board-error">{{ error }}</p>
    <div class="held-grid">
      <figure v-for="image in images" :key="image.id" class="held-item">
        <img :src="image.dataUrl" alt="" />
        <figcaption>
          <span>{{ image.uploader || '[deleted]' }} · {{ when(image.uploadedAt) }}</span>
          <span class="board-muted">{{ image.labels.join(', ') }}</span>
          <span class="held-actions">
            <button type="button" class="board-action" :disabled="busy" @click="review(image, true)">approve</button>
            <button type="button" class="board-action" :disabled="busy" @click="review(image, false)">reject</button>
          </span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script>
import { boardClient, describe } from './boardClient.js';

// Moderators only: images the scan held back, with what it saw, to
// approve or reject. Shown on the sections page; nothing when the queue
// is empty.
export default {
  name: 'HeldImages',
  data() {
    return { images: [], error: '', busy: false };
  },
  async created() {
    try {
      this.images = await boardClient.listHeldImages();
    } catch (err) {
      this.error = describe(err);
    }
  },
  methods: {
    when(iso) {
      return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    },
    async review(image, approve) {
      this.busy = true;
      this.error = '';
      try {
        await boardClient.reviewImage(image.id, approve);
        this.images = this.images.filter((i) => i.id !== image.id);
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>

<style scoped>
.held {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.held h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.held-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.held-item {
  margin: 0;
}

.held-item img {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
  background: #f5f5f5;
  border-radius: 4px;
}

.held-item figcaption {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8rem;
  margin-top: 4px;
}

.held-actions {
  display: flex;
  gap: 12px;
}
</style>
