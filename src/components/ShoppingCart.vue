<script setup lang="ts">
import { computed } from 'vue'
import { cartItems, cartTotal, removeFromCart, updateQuantity, generateWhatsAppMessage } from '../composables/useCart'
import { isAuthenticated } from '../composables/useAuth'

const emit = defineEmits<{
  close: []
  placeOrder: [orderDetails: any[]]
  requireAuth: []
}>()

const subtotal = computed(() => cartTotal.value)
const deliveryFee = computed(() => subtotal.value > 0 ? 200 : 0)
const total = computed(() => subtotal.value + deliveryFee.value)
const savings = computed(() => {
  // Calculate savings based on some business logic
  return cartItems.value.reduce((total, item) => {
    const originalPrice = item.price * 1.3 // Assume 30% was the original price
    return total + ((originalPrice - item.price) * item.quantity)
  }, 0)
})

const placeOrder = () => {
  if (cartItems.value.length === 0) return
  
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    emit('requireAuth')
    return
  }
  
  const message = generateWhatsAppMessage()
  const whatsappUrl = `https://wa.me/254703735924?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
  
  emit('placeOrder', cartItems.value)
  emit('close')
}

const continueShopping = () => {
  emit('close')
}
</script>
</script>

<template>
  <div class="cart-sidebar" @click.stop>
    <div class="cart-header">
      <h2>Your order</h2>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="cart-content">
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <button class="continue-shopping-btn" @click="continueShopping">
          Continue Shopping
        </button>
      </div>

      <div v-else class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p class="item-price">KSH {{ item.price.toLocaleString() }}</p>
            <p class="item-unit">{{ item.unit }}</p>
          </div>
          
          <div class="item-controls">
            <div class="quantity-controls">
              <button 
                class="quantity-btn" 
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
              >
                −
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button 
                class="quantity-btn" 
                @click="updateQuantity(item.id, item.quantity + 1)"
              >
                +
              </button>
            </div>
            
            <button class="remove-btn" @click="removeItem(item.id)">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div v-if="cartItems.length > 0" class="cart-summary">
        <div v-if="savings > 0" class="savings-message">
          <span class="savings-icon">✨</span>
          Nice! You've just saved KSh{{ savings.toLocaleString() }}.00
        </div>
        
        <div class="price-breakdown">
          <div class="price-row">
            <span>Subtotal</span>
            <span>KSH {{ subtotal.toLocaleString() }}.00</span>
          </div>
          <div class="price-row">
            <span>Delivery Fee</span>
            <span>KSH {{ deliveryFee.toLocaleString() }}.00</span>
          </div>
          <div class="price-row total">
            <span>Total</span>
            <span>KSH {{ total.toLocaleString() }}.00</span>
          </div>
        </div>

        <div class="payment-info">
          <div class="payment-method">
            <span class="payment-icon">💬</span>
            <span>Payment via WhatsApp</span>
          </div>
          <p class="payment-note">
            We accept payment through WhatsApp. You'll receive payment instructions after placing your order.
          </p>
        </div>
      </div>
    </div>

    <div v-if="cartItems.length > 0" class="cart-footer">
      <button class="place-order-btn" @click="placeOrder">
        Place Your Order • KSH {{ total.toLocaleString() }}.00
      </button>
      <button class="continue-shopping-btn" @click="continueShopping">
        Continue Shopping
      </button>
    </div>
  </div>
</template>

<style scoped>
.cart-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 400px;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

@media (max-width: 480px) {
  .cart-sidebar {
    width: 100vw;
  }
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-cart p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.cart-items {
  margin-bottom: 2rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.item-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.item-price {
  font-weight: 700;
  color: #059669;
  margin: 0 0 0.25rem 0;
}

.item-unit {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-btn {
  background: #f9fafb;
  border: none;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  padding: 0 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.remove-btn:hover {
  background: #fef2f2;
}

.cart-summary {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.savings-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-weight: 600;
  margin-bottom: 1rem;
}

.savings-icon {
  font-size: 1.25rem;
}

.price-breakdown {
  margin-bottom: 1.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #6b7280;
}

.price-row.total {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 0.5rem;
  font-weight: 700;
  color: #1f2937;
  font-size: 1.1rem;
}

.payment-info {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.payment-icon {
  font-size: 1.25rem;
}

.payment-note {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.place-order-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.place-order-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
}

.continue-shopping-btn {
  width: 100%;
  padding: 0.75rem;
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-shopping-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
</style>
