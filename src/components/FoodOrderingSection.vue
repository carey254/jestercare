<script setup lang="ts">
import { ref } from 'vue'

const showOrderModal = ref(false)
const selectedCategory = ref('')
const orderDetails = ref({
  name: '',
  phone: '',
  location: '',
  items: '',
  quantity: '',
  instructions: ''
})

function openOrderModal(category: string) {
  selectedCategory.value = category
  showOrderModal.value = true
}

function closeModal() {
  showOrderModal.value = false
  resetForm()
}

function resetForm() {
  orderDetails.value = {
    name: '',
    phone: '',
    location: '',
    items: '',
    quantity: '',
    instructions: ''
  }
}

function submitOrder() {
  if (!orderDetails.value.name || !orderDetails.value.phone || !orderDetails.value.location) {
    alert('Please fill in all required fields')
    return
  }

  // Create WhatsApp message
  const message = `*FOOD ORDER - JESTER DELIVERY*

*Category:* ${selectedCategory.value}
*Name:* ${orderDetails.value.name}
*Phone:* ${orderDetails.value.phone}
*Location:* ${orderDetails.value.location}
*Items:* ${orderDetails.value.items}
*Quantity:* ${orderDetails.value.quantity}
*Special Instructions:* ${orderDetails.value.instructions || 'None'}

*Please process my order for delivery.*
*Delivery Fee:* Ksh 150-${orderDetails.value.location.includes('Westlands') || orderDetails.value.location.includes('Kilimani') ? '200' : '150'}*

*Thank you!*`

  // Open WhatsApp with order details
  const whatsappUrl = `https://wa.me/254712345678?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
  
  // Close modal and reset form
  closeModal()
}
</script>

<template>
  <section class="food-ordering">
    <div class="food-container">
      <!-- Quick Order CTA -->
      <div class="quick-order-cta">
        <div class="cta-content">
          <h3>Order Food & Meals</h3>
          <p>Order eggs, samaki, lunch specials, fresh juices, and more from verified local restaurants</p>
          <div class="cta-actions">
            <button @click="openOrderModal('breakfast')" class="cta-btn secondary">
              Order Breakfast
            </button>
            <button @click="openOrderModal('lunch')" class="cta-btn secondary">
              Lunch Specials
            </button>
            <button @click="openOrderModal('fish')" class="cta-btn primary">
              Fresh Samaki
            </button>
            <button @click="openOrderModal('juices')" class="cta-btn secondary">
              Fresh Juices
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Modal -->
    <div v-if="showOrderModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Order {{ selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitOrder" class="order-form">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Full Name *</label>
                <input 
                  v-model="orderDetails.name" 
                  type="text" 
                  id="name" 
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input 
                  v-model="orderDetails.phone" 
                  type="tel" 
                  id="phone" 
                  required
                  placeholder="07XX XXX XXX"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="location">Delivery Location *</label>
              <input 
                v-model="orderDetails.location" 
                type="text" 
                id="location" 
                required
                placeholder="e.g., Westlands, Kilimani, CBD, etc."
              />
            </div>

            <div class="form-group">
              <label for="items">What would you like to order? *</label>
              <textarea 
                v-model="orderDetails.items" 
                id="items" 
                required
                placeholder="e.g., 2 eggs with toast, Fresh tilapia with ugali, Mango juice 500ml..."
                rows="3"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="quantity">Quantity/Portions</label>
                <input 
                  v-model="orderDetails.quantity" 
                  type="text" 
                  id="quantity"
                  placeholder="e.g., 1 plate, 2 bottles, 4 pieces"
                />
              </div>
              <div class="form-group">
                <label for="instructions">Special Instructions</label>
                <input 
                  v-model="orderDetails.instructions" 
                  type="text" 
                  id="instructions"
                  placeholder="e.g., Extra spicy, No onions, Deliver ASAP"
                />
              </div>
            </div>

            <div class="order-summary">
              <h4>Order Summary</h4>
              <div class="summary-item">
                <span>Category:</span>
                <span>{{ selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) }}</span>
              </div>
              <div class="summary-item">
                <span>Delivery Fee:</span>
                <span>Ksh 150-200 (based on location)</span>
              </div>
              <div class="summary-item">
                <span>Payment:</span>
                <span>Cash on Delivery</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-cancel">
                Cancel
              </button>
              <button type="submit" class="btn-submit">
                Send Order via WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.food-ordering {
  padding: 4rem 1.25rem;
  background: linear-gradient(180deg, var(--color-surface) 0%, #fff 50%, var(--color-surface) 100%);
}

.food-container {
  max-width: 1200px;
  margin: 0 auto;
}

.quick-order-cta {
  background: linear-gradient(135deg, var(--color-orange-soft), var(--color-mint-soft));
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
}

.cta-content h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: var(--color-ink);
}

.cta-content p {
  font-size: 1.1rem;
  color: var(--color-ink-muted);
  margin: 0 0 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.cta-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.cta-btn.primary {
  background: var(--color-orange);
  color: white;
}

.cta-btn.primary:hover {
  background: var(--color-orange-hover);
  transform: translateY(-2px);
}

.cta-btn.secondary {
  background: white;
  color: var(--color-ink);
  border: 2px solid var(--color-border);
}

.cta-btn.secondary:hover {
  border-color: var(--color-orange);
  transform: translateY(-2px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, var(--color-orange) 0%, var(--color-mint) 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 2rem;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-ink);
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-orange);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.order-summary {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.order-summary h4 {
  margin: 0 0 1rem;
  color: var(--color-ink);
  font-size: 1.1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.summary-item span:first-child {
  color: var(--color-ink-muted);
}

.summary-item span:last-child {
  font-weight: 600;
  color: var(--color-ink);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: var(--color-surface);
  color: var(--color-ink);
  border: 2px solid var(--color-border);
}

.btn-cancel:hover {
  border-color: var(--color-ink);
}

.btn-submit {
  background: var(--color-orange);
  color: white;
}

.btn-submit:hover {
  background: var(--color-orange-hover);
}

@media (max-width: 768px) {
  .food-title {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
