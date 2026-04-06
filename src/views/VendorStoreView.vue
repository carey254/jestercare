<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getVendorById, getActiveProductsByVendor, saveOrder, type Vendor, type Product } from '../composables/useVendorData'

const route = useRoute()
const router = useRouter()

const vendorId = route.params.id as string
const selectedCategory = ref('all')
const searchQuery = ref('')
const cartItems = ref([])
const showCart = ref(false)
const isLoading = ref(true)
const vendor = ref<Vendor | null>(null)
const products = ref<Product[]>([])

const categories = computed(() => {
  if (!products.value.length) return []
  
  const categoryMap = new Map()
  categoryMap.set('all', { name: 'All Products', count: products.value.length })
  
  products.value.forEach(product => {
    const existing = categoryMap.get(product.category.toLowerCase())
    if (existing) {
      existing.count++
    } else {
      categoryMap.set(product.category.toLowerCase(), { 
        name: product.category, 
        count: 1 
      })
    }
  })
  
  return Array.from(categoryMap.entries()).map(([id, data]) => ({ id, ...data }))
})

const filteredProducts = computed(() => {
  let filtered = products.value

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(p => 
      p.category.toLowerCase() === selectedCategory.value
    )
  }

  if (searchQuery.value) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const cartItemsCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

const canCheckout = computed(() => {
  return cartTotal.value >= (vendor.value?.minOrder || 500)
})

function addToCart(product: Product) {
  const existingItem = cartItems.value.find(item => item.id === product.id)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    })
  }
}

function removeFromCart(productId: string) {
  cartItems.value = cartItems.value.filter(item => item.id !== productId)
}

function updateQuantity(productId: string, quantity: number) {
  const item = cartItems.value.find(item => item.id === productId)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      item.quantity = quantity
    }
  }
}

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
}

function proceedToCheckout() {
  if (!canCheckout.value || !vendor.value) return
  
  // Store cart data and proceed to checkout
  const orderData = {
    vendor: vendor.value,
    items: cartItems.value,
    total: cartTotal.value,
    deliveryFee: vendor.value.deliveryFee || 150,
    finalTotal: cartTotal.value + (vendor.value.deliveryFee || 150)
  }
  
  // Navigate to checkout with order data
  router.push({
    name: 'vendor-checkout',
    params: { id: vendorId },
    query: { data: JSON.stringify(orderData) }
  })
}

function loadVendorData() {
  isLoading.value = true
  
  try {
    // Load vendor information
    const vendorData = getVendorById(vendorId)
    if (!vendorData) {
      router.push('/vendor-directory')
      return
    }
    
    vendor.value = vendorData
    
    // Load vendor products
    products.value = getActiveProductsByVendor(vendorId)
    
  } catch (error) {
    console.error('Error loading vendor data:', error)
    router.push('/vendor-directory')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadVendorData()
})
</script>

<template>
  <div class="vendor-store">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">⏳ Loading store...</div>
    </div>

    <!-- Store Content -->
    <div v-else-if="vendor" class="store-content">
      <!-- Store Header -->
      <div class="store-header">
        <div class="store-banner">
          <img :src="vendor.image || '/api/placeholder/400/300'" :alt="vendor.businessName" />
          <div class="banner-overlay">
            <div class="store-info">
              <div class="store-title">
                <h1>{{ vendor.businessName }}</h1>
                <div class="store-badges">
                  <span v-if="vendor.verified" class="verified-badge">✅ Verified</span>
                  <span class="rating-badge">⭐ {{ vendor.rating || 'New' }} ({{ vendor.totalReviews || 0 }})</span>
                </div>
              </div>
              <p class="store-description">{{ vendor.businessDescription }}</p>
              <div class="store-meta">
                <span class="meta-item">📍 {{ vendor.location }}</span>
                <span class="meta-item">🕐 {{ vendor.operatingHours }}</span>
                <span class="meta-item">🚚 {{ vendor.deliveryTime || '30-45 min' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="store-main-content">
        <!-- Sidebar -->
        <div class="store-sidebar">
          <!-- Store Info Card -->
          <div class="info-card">
            <h3>Store Information</h3>
            <div class="info-item">
              <span class="label">Type:</span>
              <span class="value">{{ vendor.businessType }}</span>
            </div>
            <div class="info-item">
              <span class="label">Phone:</span>
              <span class="value">{{ vendor.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">Min Order:</span>
              <span class="value">Ksh {{ vendor.minOrder || 500 }}</span>
            </div>
            <div class="info-item">
              <span class="label">Delivery Fee:</span>
              <span class="value">Ksh {{ vendor.deliveryFee || 150 }}</span>
            </div>
            <div class="info-item">
              <span class="label">Delivery Time:</span>
              <span class="value">{{ vendor.deliveryTime || '30-45 min' }}</span>
            </div>
          </div>

          <!-- Categories -->
          <div class="categories-card">
            <h3>Categories</h3>
            <div class="categories-list">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectCategory(category.id)"
                :class="{ active: selectedCategory === category.id }"
                class="category-btn"
              >
                {{ category.name }}
                <span class="count">({{ category.count }})</span>
              </button>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="contact-card">
            <h3>Contact Store</h3>
            <button class="contact-btn whatsapp-btn">
              📱 WhatsApp
            </button>
            <button class="contact-btn phone-btn">
              📞 Call Store
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="store-main">
          <!-- Search and Filters -->
          <div class="store-filters">
            <div class="search-bar">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="search-input"
              />
              <button class="search-btn">🔍</button>
            </div>
            <div class="filter-options">
              <select class="filter-select">
                <option>Sort by: Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          <!-- Products Section -->
          <div class="products-section">
            <div class="section-header">
              <h2>Products ({{ filteredProducts.length }})</h2>
              <div class="view-toggle">
                <button class="view-btn active">Grid</button>
                <button class="view-btn">List</button>
              </div>
            </div>

            <div v-if="filteredProducts.length === 0" class="no-products">
              <p>No products found matching your criteria.</p>
            </div>

            <div v-else class="products-grid">
              <div v-for="product in filteredProducts" :key="product.id" class="product-card">
                <div class="product-image">
                  <img :src="product.image || '/api/placeholder/200/200'" :alt="product.name" />
                  <span v-if="product.discount" class="discount-badge">
                    -{{ product.discount }}%
                  </span>
                </div>
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p class="product-category">{{ product.category }}</p>
                  <p class="product-description">{{ product.description }}</p>
                  <div class="product-rating">
                    <span class="stars">⭐ {{ product.rating || 'New' }}</span>
                    <span class="orders">({{ product.orders }} orders)</span>
                  </div>
                  <div class="product-price">
                    <span class="current-price">Ksh {{ product.price }}</span>
                    <span v-if="product.originalPrice" class="original-price">
                      Ksh {{ product.originalPrice }}
                    </span>
                  </div>
                  <div class="product-stock">
                    <span :class="['stock-status', product.stock > 10 ? 'in-stock' : 'low-stock']">
                      {{ product.stock > 10 ? '✅ In Stock' : `⚠️ Only ${product.stock} left` }}
                    </span>
                  </div>
                </div>
                <div class="product-actions">
                  <button @click="addToCart(product)" class="add-to-cart-btn">
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Cart -->
      <div class="floating-cart" :class="{ 'has-items': cartItemsCount > 0 }">
        <button @click="showCart = !showCart" class="cart-toggle">
          🛒 Cart ({{ cartItemsCount }})
          <span class="cart-total">Ksh {{ cartTotal }}</span>
        </button>
        
        <div v-if="showCart && cartItemsCount > 0" class="cart-dropdown">
          <div class="cart-header">
            <h3>Your Cart</h3>
            <button @click="showCart = false" class="close-cart">×</button>
          </div>
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <img :src="item.image || '/api/placeholder/50/50'" :alt="item.name" class="item-image" />
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p>Ksh {{ item.price }}</p>
              </div>
              <div class="item-quantity">
                <button @click="updateQuantity(item.id, item.quantity - 1)" class="qty-btn">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="updateQuantity(item.id, item.quantity + 1)" class="qty-btn">+</button>
              </div>
            </div>
          </div>
          <div class="cart-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>Ksh {{ cartTotal }}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee:</span>
              <span>Ksh {{ vendor.deliveryFee || 150 }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>Ksh {{ cartTotal + (vendor.deliveryFee || 150) }}</span>
            </div>
            <div v-if="!canCheckout" class="min-order-warning">
              ⚠️ Minimum order is Ksh {{ vendor.minOrder || 500 }}
            </div>
          </div>
          <button 
            @click="proceedToCheckout" 
            :disabled="!canCheckout"
            class="checkout-btn"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>

    <!-- Vendor Not Found -->
    <div v-else class="vendor-not-found">
      <h2>Store Not Found</h2>
      <p>This store may not be available or has been removed.</p>
      <button @click="router.push('/vendor-directory')" class="browse-stores-btn">
        Browse All Stores
      </button>
    </div>
  </div>
</template>

<style scoped>
.vendor-store {
  min-height: 100vh;
  background: var(--color-surface);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--color-ink-muted);
}

.loading-spinner {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vendor-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--color-ink-muted);
}

.vendor-not-found h2 {
  margin: 0 0 1rem;
  color: var(--color-ink);
}

.browse-stores-btn {
  background: var(--color-orange);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.store-content {
  display: flex;
  flex-direction: column;
}

.store-main-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.store-header {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.store-banner {
  position: relative;
  height: 100%;
}

.store-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  padding: 3rem 2rem 2rem;
}

.store-info {
  max-width: 1200px;
  margin: 0 auto;
  color: white;
}

.store-title h1 {
  margin: 0 0 0.5rem;
  font-size: 2.5rem;
  font-weight: 800;
}

.store-badges {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.verified-badge {
  background: var(--color-mint);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
}

.rating-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.store-description {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 600px;
}

.store-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.store-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.store-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card,
.categories-card,
.contact-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
}

.info-card h3,
.categories-card h3,
.contact-card h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-ink);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-item .label {
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.info-item .value {
  font-weight: 600;
  color: var(--color-ink);
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-btn {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  text-align: left;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-btn:hover {
  background: var(--color-surface);
}

.category-btn.active {
  background: var(--color-orange-soft);
  color: var(--color-orange);
  font-weight: 600;
}

.count {
  color: var(--color-ink-muted);
  font-size: 0.8rem;
}

.contact-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s ease;
}

.whatsapp-btn {
  background: #25d366;
  color: white;
}

.whatsapp-btn:hover {
  background: #128c7e;
}

.phone-btn {
  background: var(--color-orange);
  color: white;
}

.phone-btn:hover {
  background: var(--color-orange-hover);
}

.store-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.store-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-bar {
  display: flex;
  flex: 1;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  font-size: 1rem;
}

.search-btn {
  background: var(--color-orange);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  cursor: pointer;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  background: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
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

.no-products {
  text-align: center;
  padding: 3rem;
  color: var(--color-ink-muted);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-image {
  position: relative;
  height: 200px;
  background: var(--color-surface);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--color-red);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-ink);
}

.product-category {
  margin: 0 0 0.5rem;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.product-description {
  margin: 0 0 1rem;
  color: var(--color-ink);
  font-size: 0.9rem;
  line-height: 1.4;
}

.product-rating {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.stars {
  color: #fbbf24;
  font-weight: 600;
}

.orders {
  color: var(--color-ink-muted);
}

.product-price {
  margin-bottom: 0.75rem;
}

.current-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-orange);
}

.original-price {
  margin-left: 0.5rem;
  text-decoration: line-through;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.product-stock {
  margin-bottom: 1rem;
}

.stock-status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.in-stock {
  background: var(--color-mint-soft);
  color: #166534;
}

.low-stock {
  background: var(--color-orange-soft);
  color: #92400e;
}

.product-actions {
  padding: 0 1rem 1rem;
}

.add-to-cart-btn {
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

.add-to-cart-btn:hover {
  background: var(--color-orange-hover);
}

.floating-cart {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.floating-cart.has-items .cart-toggle {
  background: var(--color-orange);
  color: white;
}

.cart-toggle {
  background: white;
  border: 2px solid var(--color-orange);
  color: var(--color-orange);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-total {
  font-weight: 700;
}

.cart-dropdown {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.cart-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.close-cart {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-ink-muted);
}

.cart-items {
  padding: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.cart-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.item-details p {
  margin: 0;
  color: var(--color-orange);
  font-weight: 600;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
}

.cart-summary {
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.min-order-warning {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--color-orange-soft);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: #92400e;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: var(--color-orange);
  color: white;
  border: none;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.checkout-btn:hover:not(:disabled) {
  background: var(--color-orange-hover);
}

.checkout-btn:disabled {
  background: var(--color-ink-muted);
  cursor: not-allowed;
}

.store-content {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .store-main-content {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .store-sidebar {
    order: 2;
  }
  
  .store-main {
    order: 1;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .cart-dropdown {
    width: 300px;
  }
  
  .floating-cart {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>
