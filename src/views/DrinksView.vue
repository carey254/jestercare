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
            @click="openOrderWindow(product)"
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
              <button 
                class="add-to-cart-btn" 
                @click.stop="openOrderWindow(product)"
              >
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

    <OrderWindow 
      :show="showOrderWindow" 
      :product="selectedProduct" 
      @close="closeOrderWindow" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getWhatsAppUrl } from '../composables/useWhatsApp'
import OrderWindow from '../components/OrderWindow.vue'

interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  category: string
  image: string
  badge?: string
}

interface Category {
  id: string
  name: string
  icon: string
  count: number
}

const selectedCategory = ref('all')
const sortBy = ref('name')
const showOrderWindow = ref(false)
const selectedProduct = ref<Product | null>(null)

const categories: Category[] = [
  { id: 'all', name: 'All Products', icon: '🍻', count: 8 },
  { id: 'soft-drinks', name: 'Soft Drinks', icon: '🥤', count: 3 },
  { id: 'juices', name: 'Juices', icon: '🧃', count: 2 },
  { id: 'energy', name: 'Energy Drinks', icon: '⚡', count: 2 },
  { id: 'water', name: 'Water', icon: '💧', count: 1 },
]

const products: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola',
    description: 'Classic refreshing cola drink',
    price: 60,
    unit: 'bottle',
    category: 'soft-drinks',
    image: '/images/categories/drinks/coca-cola.png',
    badge: 'Popular'
  },
  {
    id: '2',
    name: 'Pepsi',
    description: 'Refreshing cola with a unique taste',
    price: 55,
    unit: 'bottle',
    category: 'soft-drinks',
    image: '/images/categories/drinks/pepsi.png'
  },
  {
    id: '3',
    name: 'Fanta Orange',
    description: 'Sweet and tangy orange soda',
    price: 55,
    unit: 'bottle',
    category: 'soft-drinks',
    image: '/images/categories/drinks/fanta.png'
  },
  {
    id: '4',
    name: 'Fresh Orange Juice',
    description: '100% pure orange juice',
    price: 120,
    unit: 'litre',
    category: 'juices',
    image: '/images/categories/drinks/orange-juice.jpeg',
    badge: 'Healthy'
  },
  {
    id: '5',
    name: 'Apple Juice',
    description: 'Fresh pressed apple juice',
    price: 110,
    unit: 'litre',
    category: 'juices',
    image: '/images/categories/drinks/apple-juice.jpeg'
  },
  {
    id: '6',
    name: 'Red Bull',
    description: 'Energy drink for boost',
    price: 180,
    unit: 'can',
    category: 'energy',
    image: '/images/categories/drinks/red-bull.png',
    badge: 'Energy'
  },
  {
    id: '7',
    name: 'Monster Energy',
    description: 'High energy drink',
    price: 170,
    unit: 'can',
    category: 'energy',
    image: '/images/categories/drinks/monster.png'
  },
  {
    id: '8',
    name: 'Mineral Water',
    description: 'Pure refreshing mineral water',
    price: 40,
    unit: 'bottle',
    category: 'water',
    image: '/images/categories/drinks/water.png'
  }
]

const filteredProducts = computed(() => {
  let products = selectedCategory.value === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory.value)
  
  // Sort products
  if (sortBy.value === 'name') {
    products.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'price-low') {
    products.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-high') {
    products.sort((a, b) => b.price - a.price)
  }
  
  return products
})

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

const getCurrentCategoryName = () => {
  const category = categories.find(c => c.id === selectedCategory.value)
  return category ? category.name : 'All Products'
}

const openOrderWindow = (product: Product) => {
  selectedProduct.value = product
  showOrderWindow.value = true
}

const closeOrderWindow = () => {
  showOrderWindow.value = false
  selectedProduct.value = null
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.category-item:hover {
  background: #f8f9fa;
}

.category-item.active {
  background: linear-gradient(135deg, #fff8f5 0%, #ffedd9 100%);
  border-left-color: #ff6b35;
  font-weight: 600;
}

.category-icon {
  font-size: 1.25rem;
}

.category-name {
  flex: 1;
  color: #495057;
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
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.content-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #ff6b35;
}

/* Product Grid */
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
}

.product-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
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
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
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
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  display: block;
  transition: all 0.2s ease;
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
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
.payment-section,
.tip-section,
.comments-section {
  margin-bottom: 1.5rem;
}

.quantity-section h4,
.location-section h4,
.payment-section h4,
.tip-section h4,
.comments-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Payment Methods */
.payment-methods {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.payment-method:hover {
  border-color: #ff6b35;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
}

.payment-method.active {
  border-color: #ff6b35;
  background: linear-gradient(135deg, #fff8f5 0%, #ffedd9 100%);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.2);
}

.method-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.method-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.method-name {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.method-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

/* Payment Timings */
.payment-timings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.payment-timing {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.payment-timing:hover {
  border-color: #ff6b35;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
}

.payment-timing.active {
  border-color: #ff6b35;
  background: linear-gradient(135deg, #fff8f5 0%, #ffedd9 100%);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.2);
}

.timing-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.timing-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timing-name {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.timing-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

/* Delivery Distances */
.delivery-distances {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.delivery-distance {
  padding: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.delivery-distance:hover {
  border-color: #ff6b35;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
}

.delivery-distance.active {
  border-color: #ff6b35;
  background: linear-gradient(135deg, #fff8f5 0%, #ffedd9 100%);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.2);
}

.distance-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.distance-label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.distance-desc {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.distance-fee {
  font-weight: 700;
  color: #ff6b35;
  font-size: 1.1rem;
  margin-top: 4px;
}

/* Tip Options */
.tip-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.tip-option {
  padding: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  text-align: center;
}

.tip-option:hover {
  border-color: #ff6b35;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
}

.tip-option.active {
  border-color: #ff6b35;
  background: linear-gradient(135deg, #fff8f5 0%, #ffedd9 100%);
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.2);
}

.tip-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.tip-desc {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.3;
}

.tip-amount {
  font-weight: 700;
  color: #ff6b35;
  font-size: 0.9rem;
  margin-top: 4px;
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
  cursor: pointer;
  font-weight: 500;
}

.quantity-input input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.quantity-input input:focus {
  outline: none;
  border-color: #ff6b35;
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
  padding: 0.5rem 0;
}

.total-row.final {
  border-top: 2px solid #ff6b35;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-weight: 700;
  font-size: 1.125rem;
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
  cursor: pointer;
  font-weight: 500;
}

.location-input textarea,
.comments-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
}

.location-input textarea:focus,
.comments-section textarea:focus {
  outline: none;
  border-color: #ff6b35;
}

.current-location {
  background: #e8f5e8;
  padding: 0.75rem;
  border-radius: 8px;
  color: #155724;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.continue-shopping-btn,
.confirm-order-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-shopping-btn {
  background: #6c757d;
  color: white;
  border: none;
}

.continue-shopping-btn:hover {
  background: #5a6268;
}

.confirm-order-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
}

.confirm-order-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .drinks-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    position: static;
    margin-bottom: 2rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .drinks-container {
    padding: 1rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .content-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .content-header h1 {
    font-size: 1.5rem;
  }
}
</style>
