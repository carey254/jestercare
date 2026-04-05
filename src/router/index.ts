import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/category/packages',
      name: 'package-delivery',
      component: () => import('../views/PackageDeliveryView.vue'),
    },
    {
      path: '/category/groceries',
      name: 'groceries',
      component: () => import('../views/GroceriesView.vue'),
    },
    {
      path: '/category/supermarket',
      name: 'supermarket',
      component: () => import('../views/SupermarketView.vue'),
    },
    {
      path: '/category/drinks',
      name: 'drinks',
      component: () => import('../views/DrinksView_Original.vue'),
    },
    {
      path: '/category/cleaning',
      name: 'cleaning',
      component: () => import('../views/CleaningView.vue'),
    },
    {
      path: '/category/pharmacy-beauty',
      name: 'pharmacy-beauty',
      component: () => import('../views/PharmacyView.vue'),
    },
    {
      path: '/category/:slug',
      name: 'category',
      component: () => import('../views/CategoryPlaceholderView.vue'),
    },
    {
      path: '/partner-application',
      name: 'partner-application',
      component: () => import('../views/PartnerApplicationView.vue'),
    },
    {
      path: '/rider-application',
      name: 'rider-application',
      component: () => import('../views/RiderApplicationView.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
