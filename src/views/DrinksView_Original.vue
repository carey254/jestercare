<template>
  <div class="drinks-page">
    <div class="drinks-container">
      <!-- Left Sidebar Menu -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Drinks</h2>
        </div>
        <nav class="category-nav">
          <ul class="category-list">
            <li 
              v-for="category in categories" 
              :key="category.id"
              :class="{ active: selectedCategory === category.id }"
              @click="selectCategory(category.id)"
              class="category-item"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">({{ category.count }})</span>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <div class="content-header">
          <h1>{{ getCurrentCategoryName() }}</h1>
          <div class="filters">
            <select v-model="sortBy" class="sort-select">
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="product-card"
            @click="openOrderModal(product)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-badge" v-if="product.badge">
                {{ product.badge }}
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-price">
                <span class="price">KSH {{ product.price }}</span>
                <span class="unit">/ {{ product.unit }}</span>
              </div>
              <button class="add-to-cart-btn" @click.stop="openOrderModal(product)">
                Order Now
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredProducts.length === 0" class="empty-state">
          <div class="empty-icon">🍻</div>
          <h3>No drinks found</h3>
          <p>Try selecting a different category</p>
        </div>
      </main>
    </div>

    <!-- Order Modal -->
    <div v-if="showOrderModal" class="modal-overlay" @click="closeOrderModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Order {{ selectedProduct?.name }}</h2>
          <button class="close-btn" @click="closeOrderModal">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Product Image and Basic Info -->
          <div class="product-summary">
            <img :src="selectedProduct?.image" :alt="selectedProduct?.name" class="modal-product-image" />
            <div class="product-details">
              <h3>{{ selectedProduct?.name }}</h3>
              <p>{{ selectedProduct?.description }}</p>
              <div class="price-display">
                <span class="base-price">KSH {{ selectedProduct?.price }} / {{ selectedProduct?.unit }}</span>
              </div>
            </div>
          </div>

          <!-- Quantity Selection -->
          <div class="quantity-section">
            <h4>Select Quantity</h4>
            <div class="quantity-options">
              <div class="quantity-type">
                <label>
                  <input 
                    type="radio" 
                    v-model="orderData.quantityType" 
                    value="pieces" 
                    @change="updateQuantity"
                  />
                  Order by {{ getUnitLabel() }}
                </label>
                <div v-if="orderData.quantityType === 'pieces'" class="quantity-input">
                  <input 
                    type="number" 
                    v-model="orderData.quantityPieces" 
                    min="1" 
                    placeholder="Enter quantity"
                  />
                </div>
              </div>
              
              <div class="quantity-type" v-if="selectedProduct?.unit === 'crate'">
                <label>
                  <input 
                    type="radio" 
                    v-model="orderData.quantityType" 
                    value="crate" 
                    @change="updateQuantity"
                  />
                  Order by Crate
                </label>
                <div v-if="orderData.quantityType === 'crate'" class="quantity-input">
                  <input 
                    type="number" 
                    v-model="orderData.quantityCrates" 
                    min="1" 
                    placeholder="Enter number of crates"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Total Price -->
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>KSH {{ orderData.subtotal }}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>KSH {{ orderData.deliveryFee }}</span>
            </div>
            <div class="total-row final">
              <span>Total:</span>
              <span>KSH {{ orderData.total }}</span>
            </div>
          </div>

          <!-- Location Selection -->
          <div class="location-section">
            <h4>Delivery Location</h4>
            <div class="location-options">
              <label>
                <input 
                  type="radio" 
                  v-model="orderData.locationType" 
                  value="current" 
                />
                Use Current Location
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="orderData.locationType" 
                  value="custom" 
                />
                Enter Custom Location
              </label>
            </div>
            <div v-if="orderData.locationType === 'custom'" class="location-input">
              <textarea 
                v-model="orderData.customLocation" 
                placeholder="Enter your delivery address (landmark, building name, etc.)"
                rows="3"
              ></textarea>
            </div>
            <div v-if="orderData.locationType === 'current'" class="current-location">
              <p>📍 We'll use your current location for delivery</p>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="comments-section">
            <h4>Special Instructions (Optional)</h4>
            <textarea 
              v-model="orderData.comments" 
              placeholder="Any special requests or delivery instructions..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="continue-shopping-btn" @click="closeOrderModal">
            Continue Shopping
          </button>
          <button class="confirm-order-btn" @click="confirmOrder">
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getWhatsAppUrl } from '../composables/useWhatsApp'

interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  category: string
  image: string
  badge?: string
  cratePrice?: number
}

interface Category {
  id: string
  name: string
  icon: string
  count: number
}

interface OrderData {
  quantityType: 'kg' | 'pieces'
  quantityKg: number
  quantityPieces: number
  subtotal: number
  deliveryFee: number
  total: number
  locationType: 'current' | 'custom'
  customLocation: string
  comments: string
  paymentMethod: string
  paymentTiming: string
  deliveryDistance: string
  tipOption: string
}

const selectedCategory = ref('all')
const sortBy = ref('name')
const showOrderModal = ref(false)
const selectedProduct = ref<Product | null>(null)
const cartItems = ref<Product[]>([])

const orderData = ref<OrderData>({
  quantityType: 'pieces',
  quantityPieces: 1,
  quantityCrates: 1,
  subtotal: 0,
  deliveryFee: 150,
  total: 0,
  locationType: 'current',
  customLocation: '',
  comments: ''
})

const categories: Category[] = [
  { id: 'all', name: 'All Drinks', icon: '🍻', count: 10 },
  { id: 'beer', name: 'Beer', icon: '🍺', count: 3 },
  { id: 'spirits', name: 'Spirits', icon: '🥃', count: 4 },
  { id: 'wine', name: 'Wine', icon: '🍷', count: 1 },
  { id: 'soda', name: 'Soda & Soft Drinks', icon: '🥤', count: 2 },
]

const products: Product[] = [
  // Beer Category
  {
    id: '1',
    name: 'Tusker Beer',
    description: 'Kenya\'s favorite beer - smooth and refreshing',
    price: 180,
    unit: 'bottle',
    category: 'beer',
    image: '/images/categories/drinks/tusker beer.jfif',
    cratePrice: 2000,
    badge: 'Popular'
  },
  {
    id: '2',
    name: 'Heineken Beer',
    description: 'Premium international lager',
    price: 220,
    unit: 'bottle',
    category: 'beer',
    image: '/images/categories/drinks/heineken beer.jfif',
    cratePrice: 2500
  },
  {
    id: '3',
    name: 'Whitecap Beer',
    description: 'Classic Kenyan beer with rich taste',
    price: 170,
    unit: 'bottle',
    category: 'beer',
    image: '/images/categories/drinks/whitecap beer.jfif',
    cratePrice: 1900
  },
  
  // Spirits Category
  {
    id: '4',
    name: 'Captain Morgan Rum',
    description: 'Premium spiced Caribbean rum',
    price: 2800,
    unit: 'bottle',
    category: 'spirits',
    image: '/images/categories/drinks/captain morgan.jfif',
    badge: 'Premium'
  },
  {
    id: '5',
    name: 'Smirnoff Vodka',
    description: 'Smooth premium vodka',
    price: 2200,
    unit: 'bottle',
    category: 'spirits',
    image: '/images/categories/drinks/smirnoff.jfif'
  },
  {
    id: '6',
    name: 'Johnnie Walker Red Label',
    description: 'Classic blended Scotch whisky',
    price: 3200,
    unit: 'bottle',
    category: 'spirits',
    image: '/images/categories/drinks/red label.jfif',
    badge: 'Best Seller'
  },
  {
    id: '7',
    name: 'Chrome Gin',
    description: 'Premium London dry gin',
    price: 1800,
    unit: 'bottle',
    category: 'spirits',
    image: '/images/categories/drinks/chrom gin.jfif'
  },
  
  // Wine Category
  {
    id: '8',
    name: 'Premium Wine',
    description: 'Selection of fine wines',
    price: 1500,
    unit: 'bottle',
    category: 'wine',
    image: '/images/categories/drinks/wine.jfif'
  },
  
  // Soda & Soft Drinks Category
  {
    id: '9',
    name: 'Soda Collection',
    description: 'Assorted soft drinks variety pack',
    price: 450,
    unit: 'pack',
    category: 'soda',
    image: '/images/categories/drinks/soda.png',
    badge: 'Value Pack'
  },
  {
    id: '10',
    name: 'Mixed Drinks',
    description: 'Variety of beverages and soft drinks',
    price: 680,
    unit: 'pack',
    category: 'soda',
    image: '/images/categories/drinks/drinks.jfif'
  }
]

const filteredProducts = computed(() => {
  let filtered = selectedCategory.value === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory.value)
  
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      default:
        return 0
    }
  })
  
  return filtered
})

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

const getCurrentCategoryName = () => {
  const category = categories.find(c => c.id === selectedCategory.value)
  return category ? category.name : 'All Drinks'
}

const getUnitLabel = () => {
  if (!selectedProduct.value) return 'pieces'
  
  switch (selectedProduct.value.unit) {
    case 'bottle':
      return 'Bottles'
    case 'pack':
      return 'Packs'
    default:
      return 'Pieces'
  }
}

const openOrderModal = (product: Product) => {
  selectedProduct.value = product
  showOrderModal.value = true
  orderData.value = {
    quantityType: 'pieces',
    quantityPieces: 1,
    quantityCrates: 1,
    subtotal: product.price,
    deliveryFee: 150,
    total: product.price + 150,
    locationType: 'current',
    customLocation: '',
    comments: ''
  }
}

const closeOrderModal = () => {
  showOrderModal.value = false
  selectedProduct.value = null
}

const updateQuantity = () => {
  if (!selectedProduct.value) return
  
  let subtotal = 0
  
  if (orderData.value.quantityType === 'crate' && selectedProduct.value.cratePrice) {
    subtotal = selectedProduct.value.cratePrice * orderData.value.quantityCrates
  } else {
    subtotal = selectedProduct.value.price * orderData.value.quantityPieces
  }
  
  orderData.value.subtotal = subtotal
  orderData.value.total = subtotal + orderData.value.deliveryFee
}

const confirmOrder = () => {
  if (!selectedProduct.value) return
  
  const order = {
    product: selectedProduct.value,
    orderData: { ...orderData.value },
    timestamp: new Date()
  }
  
  cartItems.value.push(order as any)
  console.log('Order confirmed:', order)
  
  alert(`Order confirmed! Total: KSH ${orderData.value.total}`)
  
  closeOrderModal()
}

onMounted(() => {
  categories.forEach(category => {
    if (category.id === 'all') {
      category.count = products.length
    } else {
      category.count = products.filter(p => p.category === category.id).length
    }
  })
})

// Watch for quantity changes to update totals
watch(
  () => [orderData.value.quantityPieces, orderData.value.quantityCrates, orderData.value.quantityType],
  () => {
    updateQuantity()
  },
  { deep: true }
)
</script>

<style scoped>
.drinks-page {
  min-height: calc(100vh - 200px);
  background: #f8f9fa;
}

.drinks-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
  padding: 2rem;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.category-nav {
  padding: 1rem 0;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.category-item:hover {
  background: #f8f9fa;
  border-left-color: #ff6b35;
}

.category-item.active {
  background: #fff5f0;
  border-left-color: #ff6b35;
  color: #ff6b35;
}

.category-icon {
  font-size: 1.2rem;
  margin-right: 0.75rem;
  min-width: 24px;
}

.category-name {
  flex: 1;
  font-weight: 500;
}

.category-count {
  color: #6c757d;
  font-size: 0.875rem;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.content-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #ff6b35;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-info {
  padding: 1.5rem;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}

.product-description {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.product-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 1rem;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b35;
}

.unit {
  color: #6c757d;
  font-size: 0.875rem;
  margin-left: 0.25rem;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-to-cart-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff6b35;
}

.modal-body {
  padding: 1.5rem;
}

.product-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.product-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.product-details p {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.base-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff6b35;
}

.quantity-section,
.location-section,
.comments-section {
  margin-bottom: 1.5rem;
}

.quantity-section h4,
.location-section h4,
.comments-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}

.quantity-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quantity-type label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.quantity-input input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.location-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.location-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.location-input textarea,
.comments-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.current-location {
  background: #e8f4fd;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ff6b35;
}

.current-location p {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
}

.total-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.total-row:last-child {
  margin-bottom: 0;
}

.total-row.final {
  border-top: 2px solid #ff6b35;
  padding-top: 0.5rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: #ff6b35;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.continue-shopping-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-shopping-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.confirm-order-btn {
  flex: 2;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-order-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.empty-state p {
  color: #6c757d;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .drinks-container {
    flex-direction: column;
    padding: 1rem;
  }
  
  .sidebar {
    width: 100%;
    position: static;
  }
  
  .category-list {
    display: flex;
    overflow-x: auto;
    padding: 0 1rem;
  }
  
  .category-item {
    min-width: 150px;
    flex-direction: column;
    text-align: center;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .category-item.active {
    border-left: none;
    border-bottom-color: #ff6b35;
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .product-summary {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .continue-shopping-btn,
  .confirm-order-btn {
    flex: 1;
  }
}
</style>
