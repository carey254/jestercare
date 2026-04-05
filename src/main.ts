import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { loadUserFromStorage } from './composables/useAuth'

// Initialize authentication state
loadUserFromStorage()

createApp(App).use(router).mount('#app')
