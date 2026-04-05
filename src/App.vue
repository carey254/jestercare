<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import WhatsAppFloat from './components/WhatsAppFloat.vue'
</script>

<template>
  <div class="app-shell">
    <header class="site-head">
      <AppHeader />
    </header>
    <main class="main">
      <RouterView />
    </main>
    <AppFooter />
    <WhatsAppFloat />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
}

.site-head {
  position: sticky;
  top: 0;
  z-index: 80;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.main {
  flex: 1;
}
</style>
