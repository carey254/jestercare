<script setup lang="ts">
import { ref } from 'vue'
import OrderWindow from './OrderWindow.vue'

const showOrderWindow = ref(false)
const selectedCategory = ref('General Delivery')

function openOrderModal() {
  console.log('DeliveryShowcase Order Now clicked!')
  showOrderWindow.value = true
}

function closeOrderWindow() {
  showOrderWindow.value = false
}
</script>

<template>
  <section class="delivery-showcase" aria-labelledby="delivery-heading">
    <h2 id="delivery-heading" class="delivery-showcase__heading">Place Your Order</h2>
    <p class="delivery-showcase__subtext">We deliver right to your doorstep! Fast, reliable service across Nairobi.</p>
    
    <div class="delivery-showcase__images">
      <div class="delivery-showcase__image-wrapper">
        <img 
          src="/images/delivery1.jpeg" 
          alt="Jester delivery in action" 
          class="delivery-showcase__image"
          loading="lazy"
        />
      </div>
      <div class="delivery-showcase__image-wrapper">
        <img 
          src="/images/jester.jpeg" 
          alt="Jester delivery service" 
          class="delivery-showcase__image"
          loading="lazy"
        />
      </div>
    </div>
    
    <div class="delivery-showcase__cta">
      <button @click="openOrderModal" class="delivery-showcase__btn primary">
        Order Now
      </button>
    </div>

    <!-- Order Window -->
    <OrderWindow 
      :show="showOrderWindow" 
      :category="selectedCategory"
      @close="closeOrderWindow" 
    />
  </section>
</template>
<style scoped>
.delivery-showcase {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.25rem;
  text-align: center;
}

.delivery-showcase__heading {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-ink);
}

.delivery-showcase__subtext {
  margin: 0 0 2.5rem;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.delivery-showcase__images {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 768px) {
  .delivery-showcase__images {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

.delivery-showcase__image-wrapper {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  aspect-ratio: 16/9;
}

.delivery-showcase__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.delivery-showcase__image-wrapper:hover .delivery-showcase__image {
  transform: scale(1.05);
}

.delivery-showcase__cta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 640px) {
  .delivery-showcase__cta {
    flex-direction: row;
    justify-content: center;
  }
}

.delivery-showcase__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
  min-width: 160px;
}

.delivery-showcase__btn.primary {
  background: var(--color-orange);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
}

.delivery-showcase__btn.primary:hover {
  background: var(--color-orange-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

/* Debug styles */
.delivery-showcase__btn {
  border: 3px solid red !important;
  z-index: 999 !important;
  pointer-events: auto !important;
  position: relative !important;
}

.delivery-showcase__btn.secondary {
  background: var(--color-surface);
  color: var(--color-ink);
  border: 2px solid var(--color-border);
}

.delivery-showcase__btn.secondary:hover {
  border-color: var(--color-orange);
  color: var(--color-orange);
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
}
</style>
