<script setup lang="ts">
import { ref, onMounted } from 'vue'
import OrderWindow from '../components/OrderWindow.vue'

const groceryCategories = ref([
  {
    title: 'Fresh Vegetables',
    description: 'All types of fresh vegetables from any store you choose'
  },
  {
    title: 'Fresh Fruits',
    description: 'All varieties of fresh fruits from supermarkets or markets'
  },
  {
    title: 'Dairy Products',
    description: 'Milk, cheese, yogurt and all dairy items'
  },
  {
    title: 'Bakery Items',
    description: 'Bread, pastries and all baked goods'
  },
  {
    title: 'Pantry Essentials',
    description: 'Cooking essentials, spices and staples'
  },
  {
    title: 'Beverages',
    description: 'All types of drinks and beverages'
  }
])

const showOrderWindow = ref(false)
const selectedCategory = ref('')
const gallery = ref<HTMLElement | null>(null)

const openOrderWindow = (category: string) => {
  console.log('Order window clicked for category:', category)
  selectedCategory.value = category
  showOrderWindow.value = true
}

onMounted(() => {
  // Animate gallery images on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-in')
        }, index * 100)
      }
    })
  }, { threshold: 0.1 })

  // Observe all gallery images
  if (gallery.value) {
    const images = gallery.value.querySelectorAll('.gallery-img')
    images.forEach(img => observer.observe(img))
  }

  // Animate category cards
  const categoryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('slide-up')
        }, index * 150)
      }
    })
  }, { threshold: 0.1 })

  const categoryCards = document.querySelectorAll('.category-card')
  categoryCards.forEach(card => categoryObserver.observe(card))
})
</script>

<template>
  <div class="groceries-page">
    <div class="page-header">
      <RouterLink to="/" class="back-link">« Back to Home</RouterLink>
      <h1>Groceries Delivery</h1>
      <p>We shop for groceries from any store you choose and deliver them to your location across Nairobi.</p>
    </div>

    <!-- Image Gallery -->
    <div class="image-gallery" ref="gallery">
      <img src="/images/categories/groceries/groceries1.png" alt="Fresh Groceries" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/fruits.jpeg" alt="Fresh Fruits" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/vegetables.webp" alt="Fresh Vegetables" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/eggs.jpeg" alt="Fresh Eggs" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/groceries2.png" alt="Grocery Items" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/apples.jpeg" alt="Fresh Apples" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/oranges.jpeg" alt="Fresh Oranges" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/grapes.jpeg" alt="Fresh Grapes" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/pawpaw.jpeg" alt="Fresh Pawpaw" class="gallery-img" loading="lazy">
      <img src="/images/categories/groceries/pinapple.jpeg" alt="Fresh Pineapple" class="gallery-img" loading="lazy">
    </div>

    <div class="categories-grid">
      <div v-for="category in groceryCategories" :key="category.title" class="category-card">
        <h3>{{ category.title }}</h3>
        <p>{{ category.description }}</p>
        <button @click="openOrderWindow(category.title)" class="order-btn">Order Now</button>
      </div>
    </div>

    <!-- Order Window -->
    <OrderWindow 
      v-if="showOrderWindow"
      :show="showOrderWindow"
      :category="selectedCategory"
      @close="showOrderWindow = false"
    />
  </div>
</template>

<style scoped>
.groceries-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.back-link {
  display: inline-block;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 2rem;
}

.back-link:hover {
  text-decoration: underline;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.page-header p {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 0 1rem;
}

.gallery-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.gallery-img.animate-in {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.gallery-img:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.category-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  border: 1px solid rgba(229, 231, 235, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(40px);
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b35, #f97316, #fb923c);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.category-card.slide-up {
  opacity: 1;
  transform: translateY(0);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #ff6b35;
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-card h3 {
  font-size: 1.375rem;
  margin-bottom: 1rem;
  color: #1f2937;
  font-weight: 700;
  letter-spacing: -0.02em;
  transition: color 0.3s ease;
}

.category-card:hover h3 {
  color: #ff6b35;
}

.category-card p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.7;
  min-height: 3rem;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.category-card:hover p {
  color: #4b5563;
}

.order-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #f97316 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
  z-index: 999;
  pointer-events: auto;
}

.order-btn:hover {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 107, 53, 0.4);
}

.order-btn:active {
  transform: translateY(0);
}

/* Debug styles */
.order-btn {
  border: 2px solid red !important;
  background: orange !important;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}
</style>
