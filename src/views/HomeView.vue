<script setup lang="ts">
import HeroSearch from '../components/HeroSearch.vue'
import CategoryGrid from '../components/CategoryGrid.vue'
import FoodOrderingSection from '../components/FoodOrderingSection.vue'
import DeliveryShowcase from '../components/DeliveryShowcase.vue'
import TogetherSection from '../components/TogetherSection.vue'
</script>

<template>
  <div class="home">
    <!-- Pricing & Delivery Disclaimer -->
    <div class="disclaimer-section">
      <div class="disclaimer-container">
        <div class="pricing-disclaimer">
          <h3>Pricing & Delivery Disclaimer:</h3>
          <p>Prices are subject to change due to market conditions, weather patterns, and other external factors. Final receipts will be provided once your order has been picked and processed. We are committed to offering you the best value at competitive rates.</p>
          <p>We currently deliver across Nairobi, including Kilimani, Westlands, Lavington, Lang'ata, and Kileleshwa, ensuring a reliable and convenient service for all your orders.</p>
        </div>
      </div>
    </div>
    
    <HeroSearch />
    <CategoryGrid />
    <FoodOrderingSection />
    <DeliveryShowcase />
    <TogetherSection />
  </div>
</template>

<style scoped>
.home {
  background: var(--color-surface);
  min-height: 60vh;
}

.disclaimer-section {
  padding: 1rem 0;
}

.disclaimer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.pricing-disclaimer {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1.5rem;
}

.pricing-disclaimer h3 {
  margin: 0 0 1rem 0;
  color: #856404;
  font-size: 1.1rem;
  font-weight: 600;
}

.pricing-disclaimer p {
  margin: 0.5rem 0;
  color: #856404;
  font-size: 0.875rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .disclaimer-container {
    padding: 0 1rem;
  }
  
  .pricing-disclaimer {
    padding: 1rem;
  }
  
  .pricing-disclaimer h3 {
    font-size: 1rem;
  }
}
</style>
