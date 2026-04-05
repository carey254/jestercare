<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn } from '../composables/useAuth'
import SignInModal from '../components/SignInModal.vue'
import SignUpModal from '../components/SignUpModal.vue'

const router = useRouter()
const showSignInModal = ref(false)
const showSignUpModal = ref(false)

const openSignIn = () => {
  showSignInModal.value = true
  showSignUpModal.value = false
}

const openSignUp = () => {
  showSignUpModal.value = true
  showSignInModal.value = false
}

const closeModals = () => {
  showSignInModal.value = false
  showSignUpModal.value = false
}

const switchToSignUp = () => {
  showSignInModal.value = false
  showSignUpModal.value = true
}

const switchToSignIn = () => {
  showSignUpModal.value = false
  showSignInModal.value = true
}

const handleAuthSuccess = () => {
  closeModals()
  router.push('/')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <RouterLink to="/" class="back-home">
          ← Back to Home
        </RouterLink>
        <h1>Welcome to Jester Speed</h1>
        <p>Your trusted delivery partner in Nairobi</p>
      </div>
      
      <div class="auth-content">
        <div class="auth-info">
          <div class="info-card">
            <h2>Why Join Us?</h2>
            <ul>
              <li>✓ Fast and reliable delivery</li>
              <li>✓ Easy ordering system</li>
              <li>✓ Real-time tracking</li>
              <li>✓ Secure payments</li>
              <li>✓ 24/7 customer support</li>
            </ul>
          </div>
          
          <div class="info-card">
            <h2>Get Started</h2>
            <p>Sign in to your account or create a new one to start placing orders. It only takes a minute!</p>
          </div>
        </div>
        
        <div class="auth-actions">
          <button @click="openSignIn" class="auth-btn primary">
            Sign In
          </button>
          <button @click="openSignUp" class="auth-btn secondary">
            Create Account
          </button>
        </div>
      </div>
    </div>
    
    <!-- Authentication Modals -->
    <SignInModal 
      v-if="showSignInModal" 
      @close="closeModals" 
      @switch-to-sign-up="switchToSignUp"
    />
    <SignUpModal 
      v-if="showSignUpModal" 
      @close="closeModals" 
      @switch-to-sign-in="switchToSignIn"
    />
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--color-surface);
  padding: 2rem 1.25rem;
}

.auth-container {
  max-width: 800px;
  margin: 0 auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 3rem;
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-ink-muted);
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: color 0.2s ease;
}

.back-home:hover {
  color: var(--color-orange);
}

.auth-header h1 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 800;
  color: var(--color-ink);
}

.auth-header p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-ink-muted);
  line-height: 1.6;
}

.auth-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.auth-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.info-card h2 {
  margin: 0 0 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-ink);
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-card li {
  padding: 0.5rem 0;
  color: var(--color-ink);
  font-weight: 500;
}

.info-card p {
  margin: 0;
  color: var(--color-ink-muted);
  line-height: 1.6;
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-btn {
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-align: center;
}

.auth-btn.primary {
  background: var(--color-orange);
  color: white;
}

.auth-btn.primary:hover {
  background: var(--color-orange-hover);
  transform: translateY(-2px);
}

.auth-btn.secondary {
  background: white;
  color: var(--color-orange);
  border: 2px solid var(--color-orange);
}

.auth-btn.secondary:hover {
  background: var(--color-orange);
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .auth-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .auth-actions {
    order: -1;
  }
  
  .info-card {
    padding: 1.5rem;
  }
}
</style>
