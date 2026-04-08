<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const vendorId = route.params.id as string
const orderData = ref(null)
const isSubmitting = ref(false)

// Form data
const customerInfo = ref({
  name: '',
  phone: '',
  email: '',
  deliveryAddress: '',
  deliveryInstructions: '',
  paymentMethod: 'mpesa'
})

// Sample order data from query params
onMounted(() => {
  try {
    const data = route.query.data as string
    if (data) {
      orderData.value = JSON.parse(data)
    }
  } catch (error) {
    console.error('Error parsing order data:', error)
    router.push(`/vendor-store/${vendorId}`)
  }
})

const orderTotal = computed(() => {
  if (!orderData.value) return 0
  return orderData.value.finalTotal || 0
})

const itemCount = computed(() => {
  if (!orderData.value) return 0
  return orderData.value.items?.reduce((total, item) => total + item.quantity, 0) || 0
})

function submitOrder() {
  if (!customerInfo.value.name || !customerInfo.value.phone || !customerInfo.value.deliveryAddress) {
    alert('Please fill in all required fields')
    return
  }

  isSubmitting.value = true

  // Create order object
  const order = {
    id: `ORD-${Date.now()}`,
    vendor: orderData.value.vendor,
    items: orderData.value.items,
    customer: customerInfo.value,
    totals: {
      subtotal: orderData.value.total,
      deliveryFee: orderData.value.deliveryFee,
      total: orderData.value.finalTotal
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedDelivery: '30-45 minutes'
  }

  // In real app, send order to backend
  console.log('Order submitted:', order)

  // Show success message
  setTimeout(() => {
    alert(`Order placed successfully!\n\nOrder ID: ${order.id}\nEstimated delivery: ${order.estimatedDelivery}\n\nWe'll notify you when your order is being prepared.`)
    router.push('/')
  }, 2000)
}

function goBack() {
  router.push(`/vendor-store/${vendorId}`)
}
</script>

<template>
  <div class="vendor-checkout">
    <div class="checkout-header">
      <button @click="goBack" class="back-btn">← Back to Store</button>
      <h1>Checkout</h1>
    </div>

    <div v-if="!orderData" class="loading">
      <p>Loading checkout...</p>
    </div>

    <div v-else class="checkout-content">
      <div class="checkout-grid">
        <!-- Order Summary -->
        <div class="order-summary">
          <div class="vendor-info">
            <img :src="orderData.vendor.image" :alt="orderData.vendor.businessName" />
            <div class="vendor-details">
              <h3>{{ orderData.vendor.businessName }}</h3>
              <p>{{ orderData.vendor.location }}</p>
              <p>⏱️ {{ orderData.vendor.deliveryTime }} delivery</p>
            </div>
          </div>

          <div class="order-items">
            <h4>Order Items ({{ itemCount }})</h4>
            <div class="items-list">
              <div v-for="item in orderData.items" :key="item.id" class="item-row">
                <div class="item-info">
                  <img :src="item.image" :alt="item.name" class="item-image" />
                  <div class="item-details">
                    <h5>{{ item.name }}</h5>
                    <p>Qty: {{ item.quantity }}</p>
                  </div>
                </div>
                <div class="item-price">
                  Ksh {{ (item.price * item.quantity).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>Ksh {{ orderData.total.toLocaleString() }}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>Ksh {{ orderData.deliveryFee }}</span>
            </div>
            <div class="total-row final">
              <span>Total:</span>
              <span>Ksh {{ orderTotal.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="customer-form">
          <h2>Delivery Information</h2>
          
          <form @submit.prevent="submitOrder">
            <div class="form-section">
              <h3>Contact Details</h3>
              <div class="form-group">
                <label for="name">Full Name *</label>
                <input
                  id="name"
                  v-model="customerInfo.name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input
                  id="phone"
                  v-model="customerInfo.phone"
                  type="tel"
                  required
                  placeholder="07XX XXX XXX"
                />
              </div>
              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  id="email"
                  v-model="customerInfo.email"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div class="form-section">
              <h3>Delivery Address</h3>
              <div class="form-group">
                <label for="deliveryAddress">Delivery Address *</label>
                <textarea
                  id="deliveryAddress"
                  v-model="customerInfo.deliveryAddress"
                  required
                  rows="3"
                  placeholder="Enter your complete delivery address in Nairobi"
                ></textarea>
              </div>
              <div class="form-group">
                <label for="deliveryInstructions">Delivery Instructions (Optional)</label>
                <textarea
                  id="deliveryInstructions"
                  v-model="customerInfo.deliveryInstructions"
                  rows="2"
                  placeholder="Any special instructions for delivery (e.g., landmarks, gate codes)"
                ></textarea>
              </div>
            </div>

            <div class="form-section">
              <h3>Payment Method</h3>
              <div class="payment-options">
                <label class="payment-option">
                  <input
                    type="radio"
                    v-model="customerInfo.paymentMethod"
                    value="mpesa"
                    checked
                  />
                  <div class="payment-info">
                    <span class="payment-name">M-Pesa</span>
                    <span class="payment-desc">Pay via M-Pesa on delivery</span>
                  </div>
                </label>
                <label class="payment-option">
                  <input
                    type="radio"
                    v-model="customerInfo.paymentMethod"
                    value="cash"
                  />
                  <div class="payment-info">
                    <span class="payment-name">Cash</span>
                    <span class="payment-desc">Pay cash on delivery</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="checkout-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>Ksh {{ orderData.total.toLocaleString() }}</span>
              </div>
              <div class="summary-row">
                <span>Delivery Fee:</span>
                <span>Ksh {{ orderData.deliveryFee }}</span>
              </div>
              <div class="summary-row total">
                <span>Total to Pay:</span>
                <span>Ksh {{ orderTotal.toLocaleString() }}</span>
              </div>
            </div>

            <button
              type="submit"
              class="place-order-btn"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Placing Order...' : `Place Order - Ksh ${orderTotal.toLocaleString()}` }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vendor-checkout {
  min-height: 100vh;
  background: var(--color-surface);
  padding: 2rem 1rem;
}

.checkout-header {
  max-width: 1200px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  color: var(--color-orange);
}

.checkout-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-ink);
}

.loading {
  text-align: center;
  padding: 4rem;
  color: var(--color-ink-muted);
}

.checkout-content {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.order-summary {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-card);
  height: fit-content;
}

.vendor-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.vendor-info img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.vendor-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-ink);
}

.vendor-details p {
  margin: 0.25rem 0;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.order-items h4 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-ink);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.item-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.item-image {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.item-details h5 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-ink);
}

.item-details p {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.item-price {
  font-weight: 700;
  color: var(--color-orange);
  font-size: 1.1rem;
}

.order-totals {
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.total-row.final {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-ink);
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.customer-form {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-card);
}

.customer-form h2 {
  margin: 0 0 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-ink);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-ink);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-ink);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-option:hover {
  border-color: var(--color-orange);
  background: var(--color-orange-soft);
}

.payment-option input[type="radio"] {
  width: auto;
  margin: 0;
}

.payment-info {
  display: flex;
  flex-direction: column;
}

.payment-name {
  font-weight: 600;
  color: var(--color-ink);
}

.payment-desc {
  font-size: 0.9rem;
  color: var(--color-ink-muted);
}

.checkout-summary {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-ink);
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.place-order-btn {
  width: 100%;
  padding: 1rem;
  background: var(--color-orange);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.place-order-btn:hover:not(:disabled) {
  background: var(--color-orange-hover);
}

.place-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .checkout-header {
    padding: 0 1rem;
  }
  
  .checkout-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .order-summary,
  .customer-form {
    padding: 1.5rem;
  }
  
  .vendor-info {
    flex-direction: column;
    text-align: center;
  }
  
  .item-row {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .item-info {
    width: 100%;
  }
}
</style>
