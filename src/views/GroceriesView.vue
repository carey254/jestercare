<template>
  <div class="groceries-page">
    <div class="groceries-container">
      <!-- Left Sidebar Menu -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Groceries</h2>
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
          <div class="empty-icon">🛒</div>
          <h3>No products found</h3>
          <p>Try selecting a different category</p>
        </div>
      </main>
    </div>

    <!-- Order Window -->
    <OrderWindow 
      :show="showOrderWindow" 
      :product="selectedProduct" 
      @close="closeOrderWindow" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
  pricePerPiece?: number
  averageWeight?: number
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
  { id: 'all', name: 'All Products', icon: '🛒', count: 14 },
  { id: 'fruits', name: 'Fruits', icon: '🍎', count: 8 },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬', count: 3 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', count: 2 },
  { id: 'spices', name: 'Spices', icon: '🌶️', count: 1 },
]

const products: Product[] = [
  {
    id: '1',
    name: 'Fresh Apples',
    description: 'Crisp and sweet red apples',
    price: 240,
    unit: 'kg',
    category: 'fruits',
    image: '/images/categories/groceries/apples.jpeg',
    pricePerPiece: 40,
    averageWeight: 0.17,
    badge: 'Popular'
  },
  {
    id: '2',
    name: 'Fresh Grapes',
    description: 'Sweet seedless grapes',
    price: 450,
    unit: 'kg',
    category: 'fruits',
    image: '/images/categories/groceries/grapes.jpeg',
    pricePerPiece: 15,
    averageWeight: 0.03
  },
  {
    id: '3',
    name: 'Fresh Oranges',
    description: 'Juicy Valencia oranges',
    price: 180,
    unit: 'kg',
    category: 'fruits',
    image: '/images/categories/groceries/oranges.jpeg',
    pricePerPiece: 30,
    averageWeight: 0.17
  },
  {
    id: '4',
    name: 'Pineapple',
    description: 'Sweet tropical pineapple',
    price: 250,
    unit: 'piece',
    category: 'fruits',
    image: '/images/categories/groceries/pinapple.jpeg',
    badge: 'Fresh'
  },
  {
    id: '5',
    name: 'Pawpaw',
    description: 'Ripe sweet pawpaw',
    price: 200,
    unit: 'piece',
    category: 'fruits',
    image: '/images/categories/groceries/pawpaw.jpeg'
  },
  {
    id: '6',
    name: 'Mixed Fruits',
    description: 'Assorted fresh fruits',
    price: 800,
    unit: 'box',
    category: 'fruits',
    image: '/images/categories/groceries/fruits.jpeg',
    badge: 'Best Value'
  },
  {
    id: '7',
    name: 'Watermelon',
    description: 'Large juicy watermelon',
    price: 250,
    unit: 'piece',
    category: 'fruits',
    image: '/images/categories/groceries/fruits2.jpeg',
    badge: 'Seasonal'
  },
  {
    id: '8',
    name: 'Fresh Mangoes',
    description: 'Sweet tropical mangoes',
    price: 320,
    unit: 'kg',
    category: 'fruits',
    image: '/images/categories/groceries/fruits.jpeg',
    pricePerPiece: 50,
    averageWeight: 0.16
  },
  {
    id: '9',
    name: 'Fresh Vegetables',
    description: 'Mixed seasonal vegetables',
    price: 150,
    unit: 'kg',
    category: 'vegetables',
    image: '/images/categories/groceries/fruits2.jpeg'
  },
  {
    id: '10',
    name: 'Tomatoes',
    description: 'Fresh red tomatoes',
    price: 120,
    unit: 'kg',
    category: 'vegetables',
    image: '/images/categories/groceries/grocery1.jpeg',
    pricePerPiece: 10,
    averageWeight: 0.08
  },
  {
    id: '11',
    name: 'Onions',
    description: 'Fresh cooking onions',
    price: 100,
    unit: 'kg',
    category: 'vegetables',
    image: '/images/categories/groceries/grocery2.jpeg',
    pricePerPiece: 8,
    averageWeight: 0.08
  },
  {
    id: '12',
    name: 'Fresh Beverages',
    description: 'Assorted drinks and juices',
    price: 450,
    unit: 'pack',
    category: 'beverages',
    image: '/images/categories/groceries/grocery3.jpeg'
  },
  {
    id: '13',
    name: 'Sodas Collection',
    description: 'Variety of soft drinks',
    price: 600,
    unit: 'pack',
    category: 'beverages',
    image: '/images/categories/groceries/grocery4.jpeg'
  },
  {
    id: '14',
    name: 'Exotic Spices',
    description: 'Premium spice collection',
    price: 350,
    unit: 'set',
    category: 'spices',
    image: '/images/categories/groceries/grocery4.jpeg',
    badge: 'New'
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
.groceries-page {
  min-height: calc(100vh - 200px);
  background: #f8f9fa;
}

.groceries-container {
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
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  display: block;
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
  .groceries-container {
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
