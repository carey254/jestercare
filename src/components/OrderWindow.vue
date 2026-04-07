<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { user, isAuthenticated } from '../composables/useAuth'
import { calculateServiceFee, calculateOrderTotal, calculateDelivery, getDeliveryTimeMessage, calculateOrderBreakdown, geocodeAddress, getCurrentLocationWithGeocoding } from '../composables/useDelivery'

interface OrderItem {
  id: string
  name: string
  price: number
  unit: string
  quantity: number
  image?: string
}

const props = defineProps<{
  show: boolean
  category?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const orderItems = ref<OrderItem[]>([])
const quantity = ref(1)
const notes = ref('')
const deliveryLocation = ref('')
const useCurrentLocation = ref(false)
const locationLoading = ref(false)
const locationError = ref('')
const locationData = ref(null)
const locationLink = ref('')

// For custom item entry
const newItemName = ref('')
const newItemPrice = ref<number | null>(null)
const newItemUnit = ref('')

// OrderWindow opens with empty cart - user adds items manually

const deliveryCharge = ref(40)
const riderFee = ref(100) // Fixed rider fee (hidden from user)
const orderBreakdown = computed(() => calculateOrderBreakdown(orderItems.value.reduce((total, item) => total + (item.price * item.quantity), 0), deliveryCharge.value))
const subtotal = computed(() => orderBreakdown.value.subtotal)
const serviceFee = computed(() => orderBreakdown.value.vat)
const total = computed(() => orderBreakdown.value.total + riderFee.value)
const deliveryTimeMessage = ref('')

const updateQuantity = (itemId: string, newQuantity: number) => {
  const item = orderItems.value.find(item => item.id === itemId)
  if (item) {
    item.quantity = Math.max(1, newQuantity)
  }
}

const removeItem = (itemId: string) => {
  const index = orderItems.value.findIndex(item => item.id === itemId)
  if (index > -1) {
    orderItems.value.splice(index, 1)
  }
}

const addCustomItem = () => {
  if (!newItemName.value.trim()) {
    alert('Please enter an item name')
    return
  }
  
  if (!newItemPrice.value || newItemPrice.value <= 0) {
    alert('Please enter a valid price')
    return
  }
  
  const newItem: OrderItem = {
    id: Date.now().toString(),
    name: newItemName.value.trim(),
    price: newItemPrice.value,
    unit: newItemUnit.value.trim() || 'pcs',
    quantity: 1
  }
  
  orderItems.value.push(newItem)
  
  // Clear inputs
  newItemName.value = ''
  newItemPrice.value = null
  newItemUnit.value = ''
}

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
    useCurrentLocation.value = true
    
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

const canPlaceOrder = computed(() => {
  return orderItems.value.length > 0 && deliveryLocation.value.trim().length > 0
})

const placeOrder = async () => {
  if (orderItems.value.length === 0) {
    alert('Please add at least one item to your order')
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
    deliveryTimeMessage.value = getDeliveryTimeMessage(delivery.distance)
  } catch (error) {
    console.error('Delivery calculation failed:', error)
    deliveryCharge.value = 40 // fallback
  }
  
  let message = '🛒 *ORDER DETAILS*\n\n'
  
    
  // Add customer information if user is logged in
  if (user.value) {
    message += '*Customer Information:*\n'
    message += `Name: ${user.value.name}\n`
    if (user.value.phone) {
      message += `Phone: ${user.value.phone}\n`
    }
    if (user.value.email) {
      message += `Email: ${user.value.email}\n`
    }
    if (user.value.address) {
      message += `Address: ${user.value.address}\n`
    }
    message += '\n'
  }
  
  // Add delivery location
  if (deliveryLocation.value) {
    message += '*Delivery Location:*\n'
    message += `${deliveryLocation.value}\n\n`
  }
  
  message += '*Items:*\n'
  
  orderItems.value.forEach((item, index) => {
    message += (index + 1) + '. ' + item.name + '\n'
    message += '   Quantity: ' + item.quantity + ' ' + item.unit + '\n'
    message += '   Price: KSH ' + item.price + ' each\n'
    message += '   Subtotal: KSH ' + (item.price * item.quantity) + '\n\n'
  })
  
  if (notes.value.trim()) {
    message += '*Special Instructions:*\n'
    message += notes.value + '\n\n'
  }
  
  message += '*Order Summary:*\n'
  message += 'Subtotal: KSH ' + subtotal.value + '\n'
  message += 'VAT: KSH ' + serviceFee.value + '\n'
  message += 'Service Charge: KSH ' + deliveryCharge.value + '\n'
  message += 'Total: KSH ' + total.value + '\n\n'
  
  if (deliveryTimeMessage.value) {
    message += deliveryTimeMessage.value + '\n\n'
  }
  
  message += '*Payment Method:* M-Pesa Pay\n\n'
  message += 'Pay to: 0703735924\n\n'
  message += 'Thank you for your order! 🎉'
  
  const whatsappUrl = `https://wa.me/254703735924?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
  
  emit('close')
}

const addMoreItems = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show" class="order-overlay" @click="emit('close')">
    <div class="order-window" @click.stop>
      <div class="order-header">
        <h2>Your Order</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="order-content">
        <div class="category-info" v-if="props.category">
          <h3>{{ props.category }}</h3>
          <p>Add specific items you need from this category below.</p>
        </div>

        <div class="add-item-section">
          <h4>Add Items</h4>
          <div class="item-input-group">
            <input 
              v-model="newItemName"
              type="text"
              placeholder="Enter item name (e.g., Tomatoes, Milk, Bread)"
              class="item-input"
              @keyup.enter="addCustomItem"
            />
            <input 
              v-model.number="newItemPrice"
              type="number"
              placeholder="Price"
              class="price-input"
              @keyup.enter="addCustomItem"
            />
            <input 
              v-model="newItemUnit"
              type="text"
              placeholder="Unit (e.g., kg, pcs, liters)"
              class="unit-input"
              @keyup.enter="addCustomItem"
            />
            <button @click="addCustomItem" class="add-item-btn">Add</button>
          </div>
        </div>

        <div v-if="orderItems.length === 0" class="empty-order">
          <p>No items in your order. Add items above to get started.</p>
        </div>

        <div v-else class="order-items">
          <div v-for="item in orderItems" :key="item.id" class="order-item">
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

        <div class="order-notes">
          <label for="notes">Special Instructions (Optional)</label>
          <textarea 
            id="notes"
            v-model="notes"
            placeholder="Add any special requests or delivery instructions..."
            rows="3"
          ></textarea>
        </div>

        <div class="delivery-location">
          <label for="location">Delivery Location *</label>
          <div class="location-input-group">
            <input 
              id="location"
              v-model="deliveryLocation"
              type="text"
              placeholder="Enter your delivery address or click 'Use Current Location'"
              class="location-input"
              @input="locationError = ''"
              @blur="processLocation(deliveryLocation)"
            />
            <span v-if="locationError" class="location-error">{{ locationError }}</span>
            <button 
              @click="getCurrentLocation"
              :disabled="locationLoading"
              class="location-btn"
              type="button"
            >
              <span v-if="locationLoading" class="loading-icon">...</span>
              <span v-else class="location-icon">Use Current Location</span>
            </button>
          </div>
          <div v-if="locationLink && !locationLoading" class="location-link">
            <button @click="viewLocationOnMap" class="map-link-btn">
              View on Map
            </button>
          </div>
          <p class="location-help">
            You can enter your address manually or use your current location for accurate delivery.
          </p>
        </div>

        <!-- Pricing & Delivery Disclaimer -->
        <div class="order-disclaimer">
          <h4>Pricing & Delivery Disclaimer:</h4>
          <p>Prices are subject to change due to market conditions, weather patterns, and other external factors. Final receipts will be provided once your order has been picked and processed.</p>
          <p>We currently deliver across Nairobi, including Kilimani, Westlands, Lavington, Lang'ata, and Kileleshwa, ensuring a reliable and convenient service for all your orders.</p>
        </div>

        <div class="order-summary">
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
            <span>KSH {{ deliveryCharge.toLocaleString() }}.00</span>
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

      <div class="order-footer">
        <button class="add-more-btn" @click="addMoreItems">
          + Add More Items
        </button>
        <button 
          class="checkout-btn" 
          @click="placeOrder"
          :disabled="!canPlaceOrder"
          :class="{ 'checkout-btn--disabled': !canPlaceOrder }"
        >
          {{ canPlaceOrder ? `Place Your Order • KSH ${total.toLocaleString()}.00` : 'Add Delivery Location to Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.order-window {
  width: 550px;
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 480px) {
  .order-window {
    width: 100vw;
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.order-header h2 {
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

.order-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.empty-order {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.order-items {
  margin-bottom: 1.5rem;
}

.order-item {
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

.order-notes {
  margin-bottom: 1.5rem;
}

.order-notes label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.order-notes textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.order-notes textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.delivery-location {
  margin-bottom: 1.5rem;
}

.delivery-location label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.location-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.location-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.15s;
}

.location-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.location-btn {
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.location-btn:hover:not(:disabled) {
  background: #2563eb;
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.location-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.category-info {
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.category-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1e40af;
  font-size: 1.125rem;
}

.category-info p {
  margin: 0;
  color: #1e40af;
  font-size: 0.875rem;
}

.add-item-section {
  margin-bottom: 1.5rem;
}

.add-item-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.item-input-group {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 0.5rem;
  align-items: end;
}

.item-input, .price-input, .unit-input {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.15s;
}

.item-input:focus, .price-input:focus, .unit-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-item-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  height: fit-content;
}

.add-item-btn:hover {
  background: #059669;
}

.order-summary {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.order-disclaimer {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.order-disclaimer h4 {
  margin: 0 0 0.5rem 0;
  color: #856404;
  font-size: 0.9rem;
  font-weight: 600;
}

.order-disclaimer p {
  margin: 0.25rem 0;
  color: #856404;
  font-size: 0.8rem;
  line-height: 1.3;
}

.disclaimer-icon {
  font-size: 1.25rem;
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
  background: #f0fdf4;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  margin-bottom: 1.5rem;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 0.5rem;
}

.payment-icon {
  font-size: 1.25rem;
}

.payment-note {
  font-size: 0.875rem;
  color: #166534;
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

.order-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.add-more-btn {
  width: 100%;
  padding: 0.75rem;
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.add-more-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
}

.checkout-btn--disabled {
  background: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.6;
}

.checkout-btn--disabled:hover {
  transform: none;
  box-shadow: none;
}

.location-error {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
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

.location-help {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.loading-icon {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.location-icon {
  font-weight: 600;
}
</style>
