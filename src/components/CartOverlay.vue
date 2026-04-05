<script setup lang="ts">
import { ref } from 'vue'
import ShoppingCart from './ShoppingCart.vue'
import SignInModal from './SignInModal.vue'
import SignUpModal from './SignUpModal.vue'

const showCart = ref(false)
const showSignInModal = ref(false)
const showSignUpModal = ref(false)

const openCart = () => {
  showCart.value = true
  document.body.style.overflow = 'hidden'
}

const closeCart = () => {
  showCart.value = false
  document.body.style.overflow = ''
}

const handleRequireAuth = () => {
  closeCart()
  showSignInModal.value = true
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

// Expose methods for parent components
defineExpose({
  openCart,
  closeCart
})

// Listen for custom events to open cart
if (typeof window !== 'undefined') {
  window.addEventListener('open-cart', openCart)
  window.addEventListener('close-cart', closeCart)
}
</script>

<template>
  <div>
    <!-- Cart Overlay -->
    <div 
      v-if="showCart" 
      class="cart-overlay" 
      @click="closeCart"
    >
      <ShoppingCart 
        @close="closeCart" 
        @place-order="closeCart" 
        @require-auth="handleRequireAuth"
      />
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
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: flex-end;
}
</style>
