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

    <!-- Order Window -->
    <OrderWindow 
      :show="showOrderWindow" 
      :product="selectedProduct" 
      @close="closeOrderWindow" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  cratePrice?: number
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
    price: 300,
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
    price: 300,
    unit: 'bottle',
    category: 'beer',
    image: '/images/categories/drinks/heineken beer.jfif',
    cratePrice: 2500
  },
  {
    id: '3',
    name: 'Whitecap Beer',
    description: 'Classic Kenyan beer with rich taste',
    price: 300,
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
    price: 1800,
    unit: 'bottle',
    category: 'spirits',
    image: '/images/categories/drinks/captain morgan.jfif',
    badge: 'Premium'
  },
  {
    id: '5',
    name: 'Smirnoff Vodka',
    description: 'Smooth premium vodka',
    price: 1500,
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
    price: 1200,
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
