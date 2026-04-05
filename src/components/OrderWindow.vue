<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { user, isAuthenticated } from '../composables/useAuth'

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
  product?: {
    id: string
    name: string
    price: number
    unit: string
    image?: string
  }
}>()

const emit = defineEmits<{
  close: []
}>()

const orderItems = ref<OrderItem[]>([])
const quantity = ref(1)
const notes = ref('')

// Add product to order when component opens
watch(() => props.show, (newShow) => {
  if (newShow && props.product) {
    const existingItem = orderItems.value.find(item => item.id === props.product!.id)
    if (!existingItem) {
      orderItems.value.push({
        id: props.product!.id,
        name: props.product!.name,
        price: props.product!.price,
        unit: props.product!.unit,
        quantity: quantity.value,
        image: props.product!.image
      })
    }
  }
})

const subtotal = computed(() => {
  return orderItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const deliveryFee = computed(() => subtotal.value > 0 ? 200 : 0)
const total = computed(() => subtotal.value + deliveryFee.value)

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

const placeOrder = () => {
  if (orderItems.value.length === 0) return
  
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    alert('Please sign in to place an order')
    emit('close')
    return
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
  message += 'Delivery Fee: KSH ' + deliveryFee.value + '\n'
  message += 'Total: KSH ' + total.value + '\n\n'
  message += '*Payment Method:* WhatsApp Pay\n\n'
  
  if (!user.value) {
    message += '📍 *Delivery Information Needed*\n'
    message += 'Please provide your delivery address and contact information.\n\n'
  } else if (!user.value.address) {
    message += '📍 *Delivery Address Needed*\n'
    message += 'Please provide your delivery address.\n\n'
  }
  
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
        <div v-if="orderItems.length === 0" class="empty-order">
          <p>No items in your order</p>
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

        <div class="order-summary">
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
  width: 400px;
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

.order-summary {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
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
