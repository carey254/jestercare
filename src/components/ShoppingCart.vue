<script setup lang="ts">
import { computed, ref } from 'vue'
import { cartItems, cartTotal, removeFromCart, updateQuantity, generateWhatsAppMessage } from '../composables/useCart'
import { isAuthenticated } from '../composables/useAuth'
import { calculateServiceFee, calculateOrderTotal, calculateDelivery, calculateOrderBreakdown, geocodeAddress, getCurrentLocationWithGeocoding } from '../composables/useDelivery'
import { user } from '../composables/useAuth'

const emit = defineEmits<{
  close: []
  placeOrder: [orderDetails: any[]]
}>()

const deliveryCharge = ref(40)
const orderBreakdown = computed(() => calculateOrderBreakdown(cartTotal.value, deliveryCharge.value))
const subtotal = computed(() => orderBreakdown.value.subtotal)
const serviceFee = computed(() => orderBreakdown.value.vat)
const total = computed(() => orderBreakdown.value.total)
const savings = computed(() => {
  // Calculate savings based on some business logic
  return cartItems.value.reduce((total, item) => {
    const originalPrice = item.price * 1.3 // Assume 30% was the original price
    return total + ((originalPrice - item.price) * item.quantity)
  }, 0)
})

const deliveryLocation = ref('')
const locationError = ref('')
const locationData = ref(null)
const locationLoading = ref(false)
const locationLink = ref('')

const canPlaceOrder = computed(() => {
  return cartItems.value.length > 0 && deliveryLocation.value.trim().length > 0
})

const processLocation = async (address: string) => {
  if (!address.trim()) {
    locationData.value = null
    locationLink.value = ''
    return
  }
  
  try {
    locationLoading.value = true
    locationError.value = ''
    
    const geocoded = await geocodeAddress(address)
    locationData.value = geocoded
    locationLink.value = geocoded.googleMapsUrl
    deliveryLocation.value = geocoded.formattedAddress
  } catch (error) {
    console.error('Location processing failed:', error)
    locationError.value = 'Unable to process location. Please try a different address.'
    locationData.value = null
    locationLink.value = ''
  } finally {
    locationLoading.value = false
  }
}

const getCurrentLocation = async () => {
  try {
    locationLoading.value = true
    locationError.value = ''
    
    const location = await getCurrentLocationWithGeocoding()
    locationData.value = location
    locationLink.value = location.googleMapsUrl
    deliveryLocation.value = location.formattedAddress
  } catch (error) {
    console.error('Current location failed:', error)
    locationError.value = error.message || 'Unable to get your location. Please enter address manually.'
  } finally {
    locationLoading.value = false
  }
}

const viewLocationOnMap = () => {
  if (locationLink.value) {
    window.open(locationLink.value, '_blank')
  }
}

const placeOrder = async () => {
  if (cartItems.value.length === 0) {
    alert('Your cart is empty')
    return
  }
  
  if (!deliveryLocation.value.trim()) {
    locationError.value = 'Please add your delivery location to continue'
    return
  }
  
  locationError.value = ''
  
  try {
    const delivery = await calculateDelivery(deliveryLocation.value)
    deliveryCharge.value = delivery.deliveryCharge
  } catch (error) {
    console.error('Delivery calculation failed:', error)
    deliveryCharge.value = 40 // fallback
  }
  
  const message = await generateWhatsAppMessage(deliveryLocation.value, locationLink.value)
  const whatsappUrl = `https://wa.me/254703735924?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
  
  emit('placeOrder', cartItems.value)
  emit('close')
}

const continueShopping = () => {
  emit('close')
}
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
        <div class="location-section">
          <label class="field">
            <span class="field__label">Delivery Location *</span>
            <div class="location-input-group">
              <input
                v-model="deliveryLocation"
                type="text"
                class="field__input"
                placeholder="Enter your delivery address..."
                @input="locationError = ''"
                @blur="processLocation(deliveryLocation)"
              />
              <button 
                @click="getCurrentLocation"
                :disabled="locationLoading"
                class="location-btn"
                type="button"
              >
                <span v-if="locationLoading" class="loading-icon">...</span>
                <span v-else class="location-icon"></span>
                {{ locationLoading ? 'Getting...' : 'Use Current Location' }}
              </button>
            </div>
            <span v-if="locationError" class="field__error">{{ locationError }}</span>
            <div v-if="locationLink && !locationLoading" class="location-link">
              <button @click="viewLocationOnMap" class="map-link-btn">
                View on Map
              </button>
            </div>
          </label>
        </div>
        
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
            <span>VAT</span>
            <span>KSH {{ serviceFee.toLocaleString() }}.00</span>
          </div>
          <div class="price-row">
            <span>Service Charge</span>
            <span>KSH {{ orderBreakdown.serviceCharge.toLocaleString() }}.00</span>
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
          <div class="service-info">
            <span class="service-icon">🏍️</span>
            <span>Delivery service includes professional rider handling</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cartItems.length > 0" class="cart-footer">
      <button 
        class="place-order-btn" 
        @click="placeOrder"
        :disabled="!canPlaceOrder"
        :class="{ 'place-order-btn--disabled': !canPlaceOrder }"
      >
        {{ canPlaceOrder ? `Place Your Order • KSH ${total.toLocaleString()}.00` : 'Add Delivery Location to Continue' }}
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

.price-disclaimer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  color: #92400e;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.disclaimer-icon {
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

.service-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #0369a1;
}

.service-icon {
  font-size: 1.1rem;
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

.location-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field__label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #1f2937;
}

.field__input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  font-family: inherit;
  background: white;
  color: #1f2937;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field__input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.field__error {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.place-order-btn--disabled {
  background: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.6;
}

.place-order-btn--disabled:hover {
  transform: none;
  box-shadow: none;
}

.location-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.location-btn {
  padding: 0.75rem 1rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-btn:hover:not(:disabled) {
  background: #047857;
}

.location-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.location-icon::before {
  content: "Location";
  font-weight: 600;
}

.loading-icon {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.location-link {
  margin-top: 0.5rem;
}

.map-link-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #059669;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.map-link-btn:hover {
  background: #e5e7eb;
  border-color: #059669;
}

.map-link-btn::before {
  content: "View on Map";
}
</style>
