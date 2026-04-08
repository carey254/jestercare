<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { user, isAuthenticated } from '../composables/useAuth'
import { cartItems, cartTotal, addToCart, removeFromCart, updateQuantity as updateCartQuantity } from '../composables/useCart'
import {
  calculateServiceFee,
  calculateOrderTotal,
  calculateDelivery,
  getDeliveryTimeMessage,
  SERVICE_AREAS,
  searchStoreLocations,
  parseGoogleMapsLatLng,
  calculateDeliveryFromPickupToDropoff,
  type ServiceArea,
  type StoreLocation
} from '../composables/useDelivery'

const props = defineProps<{
  show: boolean
  category?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const notes = ref('')
const deliveryLocation = ref('')
const useCurrentLocation = ref(false)
const locationLoading = ref(false)
const locationError = ref('')

const selectedArea = ref<ServiceArea | ''>('')
const storeSearch = ref('')
const selectedStore = ref<StoreLocation | null>(null)

// For custom item entry
const newItemName = ref('')
const newItemPrice = ref<number | null>(null)
const newItemUnit = ref('')

// OrderWindow uses the global cart so items never get lost across pages.
const subtotal = computed(() => cartTotal.value)
const hasItems = computed(() => cartItems.value.length > 0)

// VAT is 13% of items amount (subtotal)
const vat = computed(() => calculateServiceFee(subtotal.value))
const deliveryCharge = ref(40)
const riderFee = ref(100) // Fixed rider fee
const effectiveDeliveryCharge = computed(() => (hasItems.value ? deliveryCharge.value : 0))
const effectiveRiderFee = computed(() => (hasItems.value ? riderFee.value : 0))
const total = computed(() =>
  subtotal.value + vat.value + effectiveRiderFee.value + effectiveDeliveryCharge.value
)
const deliveryTimeMessage = ref('')

const serviceChargeLabel = computed(() => effectiveRiderFee.value)

const storeMatches = computed<StoreLocation[]>(() => {
  return searchStoreLocations(storeSearch.value, selectedArea.value || null)
})

watch(
  () => selectedArea.value,
  () => {
    storeSearch.value = ''
    selectedStore.value = null
  }
)

watch(
  () => storeSearch.value,
  () => {
    // If user changes query, don't silently keep a potentially wrong selection.
    selectedStore.value = null
  }
)

const updateQuantity = (itemId: string, newQuantity: number) => {
  updateCartQuantity(itemId, Math.max(1, newQuantity))
}

const removeItem = (itemId: string) => {
  removeFromCart(itemId)
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
  
  addToCart({
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: newItemName.value.trim(),
    price: newItemPrice.value,
    unit: newItemUnit.value.trim() || 'pcs',
    category: props.category,
  })
  
  // Clear inputs
  newItemName.value = ''
  newItemPrice.value = null
  newItemUnit.value = ''
}

const getCurrentLocation = () => {
  locationError.value = ''
  if (!selectedStore.value) {
    alert('Select an area and pickup store first.')
    return
  }
  locationLoading.value = true
  useCurrentLocation.value = true

  if (!('geolocation' in navigator)) {
    locationError.value = 'Geolocation is not supported in this browser.'
    locationLoading.value = false
    return
  }

  // Browsers require a secure context (HTTPS) for geolocation, except localhost.
  if (typeof window !== 'undefined' && 'isSecureContext' in window && !window.isSecureContext) {
    locationError.value = 'Live location requires HTTPS. Open the site on https:// or localhost.'
    locationLoading.value = false
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      // Store a clickable maps link (not raw coordinates text)
      deliveryLocation.value = `https://www.google.com/maps?q=${latitude},${longitude}`
      locationLoading.value = false
    },
    (error) => {
      console.error('Geolocation error:', error)
      deliveryLocation.value = ''
      locationLoading.value = false
      if (error.code === 1) {
        locationError.value = 'Location permission was blocked. Allow location access in your browser/site settings, then try again.'
      } else if (error.code === 2) {
        locationError.value = 'Unable to determine your location. Please try again or paste a Google Maps link.'
      } else if (error.code === 3) {
        locationError.value = 'Location request timed out. Please try again.'
      } else {
        locationError.value = 'Unable to get your live location. Please paste a Google Maps link or describe your location.'
      }
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  )
}

const placeOrder = async () => {
  if (cartItems.value.length === 0) return
  
  // Require user-provided delivery location each order (live link or description)
  const locationToUse = deliveryLocation.value

  if (!selectedArea.value) {
    alert('Please select your area first.')
    return
  }
  if (!selectedStore.value) {
    alert('Please select the store you want us to pick from before placing your order.')
    return
  }
  // storeSearch can be empty if user simply picked from the full list.
  if (!locationToUse.trim()) {
    alert('Please enter your delivery location (Google Maps link OR type it manually).')
    return
  }

  // Pricing:
  // - If user provides a Google Maps link/lat,lng: compute accurate pickup->dropoff delivery.
  // - Otherwise: accept manual text and fall back to text-based estimation.
  const dropoffLatLng = parseGoogleMapsLatLng(locationToUse)
  if (dropoffLatLng) {
    const pickup = { lat: selectedStore.value.lat, lng: selectedStore.value.lng }
    const delivery = calculateDeliveryFromPickupToDropoff(pickup, dropoffLatLng)
    deliveryCharge.value = delivery.deliveryCharge
    deliveryTimeMessage.value = getDeliveryTimeMessage(delivery.distance)
  } else {
    try {
      const delivery = await calculateDelivery(locationToUse.trim())
      deliveryCharge.value = delivery.deliveryCharge
      deliveryTimeMessage.value = getDeliveryTimeMessage(delivery.distance)
    } catch {
      // Keep defaults if estimation fails
      deliveryCharge.value = 40
      deliveryTimeMessage.value = ''
    }
  }
  
  let message = '🛒 *ORDER DETAILS*\n\n'
  
  message += '*Service Area:*\n'
  message += `${selectedArea.value}\n\n`

  message += '*Pickup Store:*\n'
  message += `${selectedStore.value.displayName}\n`
  message += `Area: ${selectedStore.value.area}\n`
  message += `Pickup location: ${selectedStore.value.pickupAddress}\n\n`
  
    
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
    const isLink = /^https?:\/\/\S+$/i.test(deliveryLocation.value.trim())
    message += isLink ? '*Delivery Location (Google Maps):*\n' : '*Delivery Location:*\n'
    message += `${deliveryLocation.value.trim()}\n\n`
  } else if (user.value?.address) {
    message += '*Delivery Location:*\n'
    message += `${user.value.address}\n\n`
  }
  
  message += '*Items:*\n'

  cartItems.value.forEach((item, index) => {
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
  message += 'Items Amount: KSH ' + subtotal.value + '\n'
  message += 'VAT: KSH ' + vat.value + '\n'
  message += 'Service Charge: KSH ' + serviceChargeLabel.value + '\n'
  message += 'Delivery Charge: KSH ' + effectiveDeliveryCharge.value + '\n'
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

        <div class="area-select">
          <label for="areaSelect">Your area *</label>
          <select id="areaSelect" v-model="selectedArea" class="area-input">
            <option value="" disabled>Select your area…</option>
            <option v-for="a in SERVICE_AREAS" :key="a" :value="a">{{ a }}</option>
          </select>
          <p class="area-help">Choose your area first. We will show stores available in that area.</p>
        </div>

        <div class="store-pickup">
          <label for="storeSearch">Pick up store *</label>
          <input
            id="storeSearch"
            v-model="storeSearch"
            type="text"
            class="store-input"
            placeholder="Search store (e.g., Quickmart, Naivas, Carrefour)…"
            :disabled="!selectedArea"
          />
          <p class="store-help" v-if="!selectedArea">Select your area above to unlock store selection.</p>
          <p class="store-help" v-else>Showing stores in <strong>{{ selectedArea }}</strong>.</p>

          <div v-if="selectedArea" class="store-results">
            <div v-if="storeMatches.length === 0" class="store-empty">
              No matching stores found in this area. Try a different name.
            </div>
            <button
              v-for="s in storeMatches"
              :key="s.id"
              type="button"
              class="store-option"
              :class="{ 'store-option--selected': selectedStore?.id === s.id }"
              @click="selectedStore = s"
            >
              <div class="store-option__name">{{ s.displayName }}</div>
              <div class="store-option__meta">
                <span class="pill">{{ s.area }}</span>
                <span class="muted">{{ s.pickupAddress }}</span>
              </div>
            </button>
          </div>

          <div v-if="selectedStore" class="store-selected">
            <div class="store-selected__title">Selected pickup</div>
            <div class="store-selected__line"><strong>{{ selectedStore.displayName }}</strong></div>
            <div class="store-selected__line">{{ selectedStore.pickupAddress }}</div>
          </div>
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

        <div v-if="cartItems.length === 0" class="empty-order">
          <p>No items in your order. Add items above to get started.</p>
        </div>

        <div v-else class="order-items">
          <div v-for="item in cartItems" :key="item.id" class="order-item">
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
              placeholder="Paste a Google Maps link or describe your location…"
              class="location-input"
              :disabled="!selectedStore"
            />
            <button 
              @click="getCurrentLocation"
              :disabled="locationLoading || !selectedStore"
              class="location-btn"
            >
              <span v-if="locationLoading">🔄</span>
              <span v-else>📍</span>
              {{ locationLoading ? 'Getting...' : 'Use Current Location' }}
            </button>
          </div>
          <p class="location-help">
            <span v-if="!selectedStore">Select an area + pickup store first, then add your live location for delivery.</span>
            <span v-else>Use “Use Current Location” to generate a Google Maps link, or type a clear delivery description.</span>
          </p>
          <p v-if="locationError" class="location-error">{{ locationError }}</p>
        </div>

        <!-- Pricing & Delivery Disclaimer -->
        <div class="order-disclaimer">
          <h4>Pricing & Delivery Disclaimer:</h4>
          <p>Prices are subject to change due to market conditions, weather patterns, and other external factors. Final receipts will be provided once your order has been picked and processed.</p>
          <p>We currently deliver across Nairobi, including Kilimani, Westlands, Lavington, Lang'ata, and Kileleshwa, ensuring a reliable and convenient service for all your orders.</p>
        </div>

        <div class="order-summary">
          <div class="price-note">
            Estimated charges are shown for transparency. Final pricing is confirmed after we pick and process your items.
          </div>
          <div class="price-row">
            <span>Items Amount</span>
            <span>KSH {{ subtotal.toLocaleString() }}.00</span>
          </div>
          <div class="price-row">
            <span>VAT</span>
            <span>KSH {{ vat.toLocaleString() }}.00</span>
          </div>
          <div class="price-row">
            <span>Service Charge</span>
            <span>KSH {{ serviceChargeLabel.toLocaleString() }}.00</span>
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
        <button class="checkout-btn" @click="placeOrder">
          Place Your Order • KSH {{ total.toLocaleString() }}.00
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

.area-select {
  margin-bottom: 1.25rem;
}

.area-select label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.area-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #fff;
}

.area-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.area-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0 0;
  line-height: 1.4;
}

.store-pickup {
  margin-bottom: 1.5rem;
}

.store-pickup label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.store-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.15s;
}

.store-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.store-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0 0;
  line-height: 1.4;
}

.store-results {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.store-empty {
  padding: 0.75rem;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.store-option {
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 10px;
  padding: 0.75rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}

.store-option:hover {
  border-color: #c7d2fe;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.store-option--selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.store-option__name {
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.35rem;
}

.store-option__meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #3730a3;
  font-size: 0.75rem;
  font-weight: 700;
}

.muted {
  color: #6b7280;
  font-size: 0.8rem;
}

.store-selected {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
}

.store-selected__title {
  font-weight: 800;
  color: #166534;
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
}

.store-selected__line {
  color: #166534;
  font-size: 0.875rem;
  line-height: 1.35;
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

.location-error {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  line-height: 1.35;
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

.price-note {
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.35;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
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
</style>
