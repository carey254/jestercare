<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import OrderWindow from '../components/OrderWindow.vue'

interface Service {
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
const selectedService = ref<Service | null>(null)

const categories: Category[] = [
  { id: 'all', name: 'All Services', icon: '🧹', count: 2 },
  { id: 'shoes', name: 'Shoe Cleaning', icon: '👟', count: 1 },
  { id: 'carpets', name: 'Carpet Cleaning', icon: '🧺', count: 1 },
]

const services: Service[] = [
  {
    id: '1',
    name: 'Sneaker Cleaning',
    description: 'Professional sneaker and shoe cleaning service',
    price: 250,
    unit: 'pair',
    category: 'shoes',
    image: '/images/categories/Cleaning/sneaker cleaning.png',
    badge: 'Popular'
  },
  {
    id: '2',
    name: 'Carpet Cleaning',
    description: 'Deep carpet cleaning and stain removal',
    price: 600,
    unit: 'piece',
    category: 'carpets',
    image: '/images/categories/Cleaning/carpet.jfif'
  }
]

const filteredServices = computed(() => {
  let filtered = selectedCategory.value === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory.value)
  
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
  return category ? category.name : 'All Services'
}

const openOrderWindow = (service: Service) => {
  selectedService.value = service
  showOrderWindow.value = true
}

const closeOrderWindow = () => {
  showOrderWindow.value = false
  selectedService.value = null
}

onMounted(() => {
  categories.forEach(category => {
    if (category.id === 'all') {
      category.count = services.length
    } else {
      category.count = services.filter(s => s.category === category.id).length
    }
  })
})
</script>

<template>
  <div class="cleaning-page">
    <div class="cleaning-container">
      <!-- Left Sidebar Menu -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Cleaning Services</h2>
        </div>
        
        <!-- 12-Hour Service Notice -->
        <div class="service-notice">
          <div class="notice-icon">⚡</div>
          <div class="notice-text">
            <strong>12-Hour Service</strong><br>
            We offer pickup and delivery within 12 hours
          </div>
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

        <!-- Services Grid -->
        <div class="services-grid">
          <div 
            v-for="service in filteredServices" 
            :key="service.id"
            class="service-card"
            @click="openOrderWindow(service)"
          >
            <div class="service-image">
              <img :src="service.image" :alt="service.name" />
              <div class="service-badge" v-if="service.badge">
                {{ service.badge }}
              </div>
            </div>
            <div class="service-content">
              <h3>{{ service.name }}</h3>
              <p class="service-description">{{ service.description }}</p>
              <div class="service-price">
                <span class="price">KSH {{ service.price }}</span>
                <span class="unit">/ {{ service.unit }}</span>
              </div>
            </div>
            <button 
              class="order-btn" 
              @click.stop="openOrderWindow(service)"
            >
              Order Now
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Order Window -->
    <OrderWindow 
      :show="showOrderWindow" 
      :product="selectedService" 
      @close="closeOrderWindow" 
    />
  </div>
</template>

<style scoped>
.cleaning-page {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
}

.cleaning-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.sidebar-header h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
}

.service-notice {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.notice-icon {
  font-size: 24px;
}

.notice-text {
  font-size: 0.9rem;
  line-height: 1.3;
}

.notice-text strong {
  display: block;
  margin-bottom: 2px;
}

.category-nav {
  margin-top: 20px;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.category-item:hover {
  background: #f5f5f5;
}

.category-item.active {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: white;
}

.category-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.category-name {
  flex: 1;
  font-weight: 600;
}

.category-count {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Main Content */
.main-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.content-header h1 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.filters {
  display: flex;
  gap: 12px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.service-card {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.service-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff6b35;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.service-content {
  padding: 20px;
}

.service-content h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.2rem;
}

.service-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 12px 0;
}

.service-price {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 16px;
}

.price {
  font-weight: 700;
  color: #ff6b35;
  font-size: 1.1rem;
}

.unit {
  color: #666;
  font-size: 0.9rem;
}

.order-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
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

.order-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
}

.modal-body {
  padding: 24px;
}

.service-info {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.service-modal-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.service-details h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.service-details p {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 12px 0;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.quantity-input,
.location-input,
.comments-textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.comments-textarea {
  min-height: 80px;
  resize: vertical;
}

.location-options {
  display: flex;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.order-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-row.total {
  font-weight: 700;
  color: #333;
  font-size: 1.1rem;
  padding-top: 8px;
  border-top: 1px solid #ddd;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.confirm-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .cleaning-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .service-info {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-content {
    margin: 20px;
  }
}
</style>
