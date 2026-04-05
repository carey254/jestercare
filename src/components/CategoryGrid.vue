<script setup lang="ts">
import { categories } from '../data/categories'
</script>

<template>
  <section id="categories" class="section" aria-label="Service categories">
    <div class="bubbles">
      <RouterLink
        v-for="c in categories"
        :key="c.slug"
        :to="
          c.slug === 'packages'
            ? { name: 'package-delivery' }
            : c.slug === 'groceries'
            ? { name: 'groceries' }
            : c.slug === 'supermarket'
            ? { name: 'supermarket' }
            : c.slug === 'drinks'
            ? { name: 'drinks' }
            : c.slug === 'cleaning'
            ? { name: 'cleaning' }
            : c.slug === 'pharmacy-beauty'
            ? { name: 'pharmacy-beauty' }
            : { name: 'category', params: { slug: c.slug } }
        "
        class="bubble"
        :style="{ '--bubble': c.bubble }"
      >
        <span class="bubble__circle" :aria-hidden="true">
          <svg v-if="c.icon === 'cart'" viewBox="0 0 32 32" fill="none" class="bubble__svg">
            <path
              d="M9 28a2 2 0 100 4 2 2 0 000-4zm16 0a2 2 0 100 4 2 2 0 000-4zM3 6h4l2 14h18l3-10H11"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else-if="c.icon === 'store'" viewBox="0 0 32 32" fill="none" class="bubble__svg">
            <path d="M4 12l4-8h16l4 8v16H4V12z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="M10 28V18h12v10" stroke="currentColor" stroke-width="2" />
          </svg>
          <svg v-else-if="c.icon === 'wine'" viewBox="0 0 32 32" fill="none" class="bubble__svg">
            <path
              d="M12 4h8v6c0 3-2 5-4 5s-4-2-4-5V4zM12 15v13h8V15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else-if="c.icon === 'sparkle'" viewBox="0 0 32 32" fill="none" class="bubble__svg">
            <path
              d="M16 4l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else-if="c.icon === 'box'" viewBox="0 0 32 32" fill="none" class="bubble__svg">
            <path
              d="M4 12l12-6 12 6v14l-12 6-12-6V12z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <path d="M4 12l12 6 12-6M16 18v12" stroke="currentColor" stroke-width="2" />
          </svg>
          <svg v-else viewBox="0 0 32 32" fill="none" class="bubble__svg">
            <rect x="8" y="8" width="16" height="16" rx="3" stroke="currentColor" stroke-width="2" />
            <path d="M16 12v12M11 16h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
        <span class="bubble__label">{{ c.title }}</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 0 1.25rem 2.5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.bubbles {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem 1.25rem;
  justify-content: flex-start;
  overflow-x: auto;
  padding: 0.5rem 0 1rem;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

@media (min-width: 900px) {
  .bubbles {
    flex-wrap: wrap;
    justify-content: center;
    overflow-x: visible;
    gap: 1rem 1.5rem;
  }
}

.bubble {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 96px;
  scroll-snap-align: start;
  color: var(--color-ink);
  text-decoration: none;
}

@media (min-width: 480px) {
  .bubble {
    width: 104px;
  }
}

.bubble__circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--bubble);
  display: grid;
  place-items: center;
  color: var(--color-ink);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.bubble:hover .bubble__circle {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(31, 31, 35, 0.1);
}

.bubble__svg {
  width: 36px;
  height: 36px;
}

.bubble__label {
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
}
</style>
