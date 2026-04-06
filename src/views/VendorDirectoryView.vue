<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getActiveVendors, searchVendors, getProductsByVendor, type Vendor } from '../composables/useVendorData'

const router = useRouter()

const selectedCategory = ref('all')
const selectedLocation = ref('all')
const searchQuery = ref('')
const sortBy = ref('popular')
const isLoading = ref(true)
const vendors = ref<Vendor[]>([])

const categories = [
  { id: 'all', name: 'All Stores', icon: '🏪' },
  { id: 'grocery', name: 'Grocery', icon: '🥬' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
  { id: 'bakery', name: 'Bakery', icon: '🥖' },
  { id: 'liquor', name: 'Liquor', icon: '🍺' },
  { id: 'hotel', name: 'Hotel', icon: '🏨' },
  { id: 'meat', name: 'Butchery', icon: '🥩' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'fashion', name: 'Fashion', icon: '👗' }
]

const locations = [
  { id: 'all', name: 'All Nairobi' },
  { id: 'westlands', name: 'Westlands' },
  { id: 'kilimani', name: 'Kilimani' },
  { id: 'lavington', name: 'Lavington' },
  { id: 'kileleshwa', name: 'Kileleshwa' },
  { id: 'cbd', name: 'CBD' },
  { id: 'parklands', name: 'Parklands' },
  { id: 'langata', name: 'Langata' }
]

const sortOptions = [
  { id: 'popular', name: 'Popular' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'delivery-time', name: 'Fastest Delivery' },
  { id: 'delivery-fee', name: 'Lowest Delivery Fee' },
  { id: 'newest', name: 'Newest First' }
]

const filteredVendors = computed(() => {
  let filtered = vendors.value

  // Apply search and filters
  if (searchQuery.value || selectedCategory.value !== 'all' || selectedLocation.value !== 'all') {
    filtered = searchVendors(searchQuery.value, {
      category: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
      location: selectedLocation.value === 'all' ? undefined : selectedLocation.value
    })
  }

  // Sort vendors
  switch (sortBy.value) {
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    case 'delivery-time':
      filtered.sort((a, b) => {
        const timeA = parseInt(a.deliveryTime?.split('-')[0] || '0')
        const timeB = parseInt(b.deliveryTime?.split('-')[0] || '0')
        return timeA - timeB
      })
      break
    case 'delivery-fee':
      filtered.sort((a, b) => (a.deliveryFee || 0) - (b.deliveryFee || 0))
      break
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'popular':
    default:
      // Sort by rating and reviews
      filtered.sort((a, b) => {
        const scoreA = (a.rating || 0) * (a.totalReviews || 0)
        const scoreB = (b.rating || 0) * (b.totalReviews || 0)
        return scoreB - scoreA
      })
      break
  }

  return filtered
})

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
}

function selectLocation(locationId: string) {
  selectedLocation.value = locationId
}

function visitVendorStore(vendorId: string) {
  router.push(`/vendor-store/${vendorId}`)
}

function resetFilters() {
  selectedCategory.value = 'all'
  selectedLocation.value = 'all'
  searchQuery.value = ''
  sortBy.value = 'popular'
}

function loadVendors() {
  isLoading.value = true
  try {
    vendors.value = getActiveVendors()
    
    // Add product count to each vendor
    vendors.value = vendors.value.map(vendor => {
      const products = getProductsByVendor(vendor.id)
      return {
        ...vendor,
        products: products.length
      }
    })
  } catch (error) {
    console.error('Error loading vendors:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadVendors()
})
</script>

<template>
  <div class="vendor-directory">
    <!-- Header -->
    <div class="directory-header">
      <div class="header-content">
        <h1>Shop from Nairobi's Best Stores</h1>
        <p>Discover and order from verified local businesses. We handle the delivery!</p>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-container">
        <!-- Search Bar -->
        <div class="search-section">
          <div class="search-bar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search stores, products, or categories..."
              class="search-input"
            />
            <button class="search-btn">🔍</button>
          </div>
        </div>

        <!-- Filter Pills -->
        <div class="filter-pills">
          <!-- Category Filter -->
          <div class="filter-group">
            <label>Category:</label>
            <div class="pill-list">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectCategory(category.id)"
                :class="{ active: selectedCategory === category.id }"
                class="filter-pill"
              >
                <span class="pill-icon">{{ category.icon }}</span>
                {{ category.name }}
              </button>
            </div>
          </div>

          <!-- Location Filter -->
          <div class="filter-group">
            <label>Location:</label>
            <select v-model="selectedLocation" class="location-select">
              <option v-for="location in locations" :key="location.id" :value="location.id">
                {{ location.name }}
              </option>
            </select>
          </div>

          <!-- Sort Filter -->
          <div class="filter-group">
            <label>Sort by:</label>
            <select v-model="sortBy" class="sort-select">
              <option v-for="sort in sortOptions" :key="sort.id" :value="sort.id">
                {{ sort.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="results-section">
      <div class="results-container">
        <!-- Results Header -->
        <div class="results-header">
          <h2>{{ filteredVendors.length }} Stores Found</h2>
          <div class="view-toggle">
            <button class="view-btn active">Grid View</button>
            <button class="view-btn">Map View</button>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="!isLoading && filteredVendors.length === 0" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No stores found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button @click="resetFilters" class="reset-btn">Reset Filters</button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">⏳ Loading stores...</div>
        </div>

        <!-- Vendors Grid -->
        <div v-else-if="!isLoading" class="vendors-grid">
          <div v-for="vendor in filteredVendors" :key="vendor.id" class="vendor-card">
            <div class="vendor-image">
              <img :src="vendor.image || '/api/placeholder/300/200'" :alt="vendor.businessName" />
              <div class="vendor-badges">
                <span v-if="vendor.verified" class="verified-badge">✅ Verified</span>
                <span class="category-badge">{{ vendor.businessType }}</span>
              </div>
            </div>
            <div class="vendor-info">
              <div class="vendor-header">
                <h3>{{ vendor.businessName }}</h3>
                <div class="vendor-rating">
                  <span class="stars">⭐ {{ vendor.rating || 'New' }}</span>
                  <span v-if="vendor.totalReviews" class="reviews">({{ vendor.totalReviews }})</span>
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
                <div class="delivery-info">
                  <span class="delivery-fee">Ksh {{ vendor.deliveryFee || 150 }} delivery</span>
                  <span class="min-order">Min: Ksh {{ vendor.minOrder || 500 }}</span>
                </div>
              </div>
            </div>
            <div class="vendor-actions">
              <button @click="visitVendorStore(vendor.id)" class="visit-store-btn">
                Visit Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Become a Vendor CTA -->
    <div class="cta-section">
      <div class="cta-content">
        <div class="cta-text">
          <h2>Own a Business? Join Our Platform!</h2>
          <p>Start selling to thousands of Nairobi customers. We handle delivery, you focus on your business.</p>
        </div>
        <div class="cta-actions">
          <RouterLink to="/vendor-registration" class="cta-btn primary">
            Register Your Business
          </RouterLink>
          <RouterLink to="/partner-application" class="cta-btn secondary">
            Learn More
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vendor-directory {
  min-height: 100vh;
  background: var(--color-surface);
}

.directory-header {
  background: linear-gradient(135deg, var(--color-orange), var(--color-orange-hover));
  color: white;
  padding: 4rem 2rem 3rem;
  text-align: center;
}

.header-content h1 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
}

.header-content p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.filters-section {
  background: white;
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.filters-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.search-section {
  margin-bottom: 1.5rem;
}

.search-bar {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-orange);
}

.search-btn {
  background: var(--color-orange);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  font-size: 1.2rem;
  cursor: pointer;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  justify-content: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-group label {
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
}

.pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-pill {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.filter-pill:hover {
  background: var(--color-orange-soft);
  border-color: var(--color-orange);
}

.filter-pill.active {
  background: var(--color-orange);
  color: white;
  border-color: var(--color-orange);
}

.pill-icon {
  font-size: 1rem;
}

.location-select,
.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  background: white;
}

.results-section {
  padding: 2rem 0;
}

.results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.results-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-ink);
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.view-btn.active {
  background: var(--color-orange);
  color: white;
  border-color: var(--color-orange);
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-results h3 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  color: var(--color-ink);
}

.no-results p {
  margin: 0 0 2rem;
  color: var(--color-ink-muted);
}

.reset-btn {
  background: var(--color-orange);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: var(--color-ink-muted);
}

.loading-spinner {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.vendor-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease;
}

.vendor-card:hover {
  transform: translateY(-2px);
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
  display: flex;
  gap: 0.5rem;
}

.verified-badge {
  background: var(--color-mint);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.category-badge {
  background: rgba(0, 0, 0, 0.7);
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
}

.delivery-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delivery-fee {
  font-weight: 600;
  color: var(--color-ink);
}

.min-order {
  color: var(--color-ink-muted);
  font-size: 0.9rem;
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

.cta-section {
  background: linear-gradient(135deg, var(--color-mint-soft), var(--color-orange-soft));
  padding: 4rem 2rem;
  margin-top: 4rem;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.cta-text h2 {
  margin: 0 0 1rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-ink);
}

.cta-text p {
  margin: 0 0 2rem;
  font-size: 1.1rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
}

.cta-actions {
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
  .directory-header {
    padding: 3rem 1rem 2rem;
  }
  
  .filters-container {
    padding: 0 1rem;
  }
  
  .filter-pills {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pill-list {
    justify-content: center;
  }
  
  .results-container {
    padding: 0 1rem;
  }
  
  .vendors-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
