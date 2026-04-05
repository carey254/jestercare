<script setup lang="ts">
import HeroSearch from '../components/HeroSearch.vue'
import CategoryGrid from '../components/CategoryGrid.vue'
import DeliveryShowcase from '../components/DeliveryShowcase.vue'
import TogetherSection from '../components/TogetherSection.vue'
</script>

<template>
  <div class="home">
    <HeroSearch />
    <CategoryGrid />
    <DeliveryShowcase />
    <TogetherSection />
  </div>
</template>

<style scoped>
.home {
  background: var(--color-surface);
  min-height: 60vh;
}
</style>
