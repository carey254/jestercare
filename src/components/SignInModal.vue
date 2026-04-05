<script setup lang="ts">
import { ref } from 'vue'
import { signIn } from '../composables/useAuth'

const emit = defineEmits<{
  close: []
  switchToSignUp: []
}>()

const formData = ref({
  email: '',
  password: ''
})

const isSubmitting = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  
  // Validation
  if (!formData.value.email || !formData.value.password) {
    error.value = 'Please fill in all fields'
    return
  }
  
  isSubmitting.value = true
  
  try {
    const result = await signIn({
      email: formData.value.email,
      password: formData.value.password
    })
    
    if (result.success) {
      emit('close')
      // Show success message
      alert(`Welcome back, ${result.user?.name}!`)
    } else {
      error.value = result.error || 'Sign in failed'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}

function switchToSignUp() {
  emit('switchToSignUp')
}
</script>

<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Sign In</h2>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="email">Email Address *</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="your@email.com"
            autocomplete="email"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password *</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="modal-footer">
        <p>
          Don't have an account?
          <button @click="switchToSignUp" class="link-btn">Sign Up</button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  border-radius: var(--radius-lg);
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-ink);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-ink-muted);
  cursor: pointer;
  padding: 0.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  background: var(--color-surface);
  color: var(--color-ink);
}

.auth-form {
  padding: 1.5rem 2rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-ink);
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  background: var(--color-surface);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: var(--color-orange);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-orange-hover);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1rem 2rem 1.5rem;
  text-align: center;
  border-top: 1px solid var(--color-border);
}

.modal-footer p {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.link-btn {
  background: none;
  border: none;
  color: var(--color-orange);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.link-btn:hover {
  color: var(--color-orange-hover);
}

@media (max-width: 480px) {
  .modal-content {
    margin: 0;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    max-height: 100vh;
  }
  
  .modal-header,
  .auth-form,
  .modal-footer {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
</style>
