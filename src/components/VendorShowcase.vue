<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getActiveVendors, getProductsByVendor, type Vendor } from '../composables/useVendorData'

const router = useRouter()
const isLoading = ref(true)
const featuredVendors = ref<(Vendor & { products: number })[]>([])

function visitVendorStore(vendorId: string) {
  router.push(`/vendor-store/${vendorId}`)
}

function browseAllStores() {
  router.push('/vendor-directory')
}

function loadFeaturedVendors() {
  isLoading.value = true
  
  try {
    const vendors = getActiveVendors()
    
    // Add product count to each vendor and take first 4 as featured
    featuredVendors.value = vendors
      .slice(0, 4)
      .map(vendor => {
        const products = getProductsByVendor(vendor.id)
        return {
          ...vendor,
          products: products.length
        }
      })
      
  } catch (error) {
    console.error('Error loading featured vendors:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFeaturedVendors()
})
</script>

<template>
  <section class="vendor-showcase">
    <div class="showcase-container">
      <div class="showcase-header">
        <h2>Shop from Local Nairobi Stores</h2>
        <p>Discover verified businesses selling everything from groceries to electronics. We handle delivery!</p>
        <button @click="browseAllStores" class="browse-all-btn">
          Browse All Stores →
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">⏳ Loading stores...</div>
      </div>

      <!-- Vendors Grid -->
      <div v-else-if="featuredVendors.length > 0" class="vendors-grid">
        <div v-for="vendor in featuredVendors" :key="vendor.id" class="vendor-card">
          <div class="vendor-image">
            <img :src="vendor.image || '/api/placeholder/300/200'" :alt="vendor.businessName" />
            <div class="vendor-badges">
              <span v-if="vendor.verified" class="verified-badge">✅ Verified</span>
            </div>
          </div>
          <div class="vendor-info">
            <div class="vendor-header">
              <h3>{{ vendor.businessName }}</h3>
              <div class="vendor-rating">
                <span class="stars">⭐ {{ vendor.rating || 'New' }}</span>
                <span class="reviews">({{ vendor.totalReviews || 0 }})</span>
              </div>
            </div>
            <p class="vendor-description">{{ vendor.businessDescription }}</p>
            <div class="vendor-meta">
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                <span>{{ vendor.location }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🕐</span>
                <span>{{ vendor.deliveryTime || '30-45 min' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📦</span>
                <span>{{ vendor.products || 0 }} products</span>
              </div>
            </div>
            <div class="vendor-delivery">
              <span class="delivery-fee">Ksh {{ vendor.deliveryFee || 150 }} delivery</span>
            </div>
          </div>
          <div class="vendor-actions">
            <button @click="visitVendorStore(vendor.id)" class="visit-store-btn">
              Visit Store
            </button>
          </div>
        </div>
      </div>

      <!-- No Stores State -->
      <div v-else class="no-stores">
        <h3>No Stores Available Yet</h3>
        <p>Be the first to register your business and start selling!</p>
        <RouterLink to="/vendor-registration" class="register-btn">
          Register Your Business
        </RouterLink>
      </div>

      <div class="showcase-footer">
        <div class="footer-content">
          <h3>Own a Business? Start Selling Today!</h3>
          <p>Join hundreds of Nairobi businesses reaching thousands of customers daily.</p>
          <div class="footer-actions">
            <RouterLink to="/vendor-registration" class="cta-btn primary">
              Register Your Business
            </RouterLink>
            <RouterLink to="/vendor-directory" class="cta-btn secondary">
              Explore Stores
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vendor-showcase {
  padding: 4rem 2rem;
  background: white;
}

.showcase-container {
  max-width: 1200px;
  margin: 0 auto;
}

.showcase-header {
  text-align: center;
  margin-bottom: 3rem;
}

.showcase-header h2 {
  margin: 0 0 1rem;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-ink);
}

.showcase-header p {
  margin: 0 0 2rem;
  font-size: 1.2rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.browse-all-btn {
  background: var(--color-orange);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.browse-all-btn:hover {
  background: var(--color-orange-hover);
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.vendor-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease;
}

.vendor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.vendor-image {
  position: relative;
  height: 200px;
  background: var(--color-surface);
}

.vendor-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vendor-badges {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.verified-badge {
  background: var(--color-mint);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.vendor-info {
  padding: 1.5rem;
}

.vendor-header {
  margin-bottom: 1rem;
}

.vendor-header h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-ink);
}

.vendor-rating {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.stars {
  color: #fbbf24;
  font-weight: 600;
}

.reviews {
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.vendor-description {
  margin: 0 0 1rem;
  color: var(--color-ink);
  line-height: 1.5;
}

.vendor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-ink-muted);
}

.meta-icon {
  font-size: 1rem;
}

.vendor-delivery {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.delivery-fee {
  font-weight: 600;
  color: var(--color-orange);
}

.vendor-actions {
  padding: 0 1.5rem 1.5rem;
}

.visit-store-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-orange);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.visit-store-btn:hover {
  background: var(--color-orange-hover);
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-ink-muted);
}

.loading-spinner {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.no-stores {
  text-align: center;
  padding: 3rem;
  color: var(--color-ink-muted);
}

.no-stores h3 {
  margin: 0 0 1rem;
  color: var(--color-ink);
}

.register-btn {
  background: var(--color-orange);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin-top: 1rem;
}

.showcase-footer {
  background: linear-gradient(135deg, var(--color-mint-soft), var(--color-orange-soft));
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
}

.footer-content h3 {
  margin: 0 0 1rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-ink);
}

.footer-content p {
  margin: 0 0 2rem;
  font-size: 1.1rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
}

.footer-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-btn.primary {
  background: var(--color-orange);
  color: white;
}

.cta-btn.primary:hover {
  background: var(--color-orange-hover);
}

.cta-btn.secondary {
  background: white;
  color: var(--color-orange);
  border: 2px solid var(--color-orange);
}

.cta-btn.secondary:hover {
  background: var(--color-orange-soft);
}

@media (max-width: 768px) {
  .vendor-showcase {
    padding: 3rem 1rem;
  }
  
  .showcase-header h2 {
    font-size: 2rem;
  }
  
  .vendors-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .showcase-footer {
    padding: 2rem;
  }
  
  .footer-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
