<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const titles: Record<string, string> = {
  groceries: 'Groceries',
  supermarket: 'Supermarket',
  alcohol: 'Alcohol',
  cleaning: 'Cleaning services',
  packages: 'Package delivery',
  'pharmacy-beauty': 'Pharmacy & beauty',
}

const slug = computed(() => String(route.params.slug || ''))
const title = computed(() => titles[slug.value] || 'Category')
</script>

<template>
  <div class="page">
    <div class="page__inner">
      <RouterLink to="/" class="back">← Back to home</RouterLink>
      <h1 class="page__title">{{ title }}</h1>
      <p class="page__lead">
        Store listings and checkout will load here from your Laravel API (e.g.
        <code>GET /api/categories/{{ slug }}/stores</code>).
      </p>
      <div class="placeholder">
        <p class="placeholder__text">Vue frontend is ready — connect endpoints when the backend is live.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem 1.25rem 4rem;
}

.page__inner {
  max-width: 720px;
  margin: 0 auto;
}

.back {
  display: inline-block;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-mint);
  margin-bottom: 1.25rem;
}

.back:hover {
  text-decoration: underline;
}

.page__title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page__lead {
  margin: 0 0 1.5rem;
  color: var(--color-ink-muted);
  line-height: 1.55;
}

.page__lead code {
  font-size: 0.85em;
  background: var(--color-bg);
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.placeholder {
  background: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
}

.placeholder__text {
  margin: 0;
  font-weight: 600;
  color: var(--color-ink-muted);
}
</style>
