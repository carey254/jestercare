<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getWhatsAppUrl } from '../composables/useWhatsApp'

const router = useRouter()

const formData = ref({
  businessName: '',
  businessType: '',
  contactPerson: '',
  phone: '',
  email: '',
  location: '',
  currentDelivery: '',
  volume: '',
  message: ''
})

const isSubmitting = ref(false)

const businessTypes = [
  'Restaurant/Food Service',
  'Pharmacy',
  'Grocery Store',
  'Supermarket',
  'Cleaning Service',
  'Retail Store',
  'Other'
]

const volumes = [
  '1-10 deliveries per day',
  '11-50 deliveries per day',
  '51-200 deliveries per day',
  '200+ deliveries per day'
]

async function submitApplication() {
  isSubmitting.value = true
  
  const message = `PARTNER APPLICATION - Jester Speed Delivery

Business Details:
• Business Name: ${formData.value.businessName}
• Business Type: ${formData.value.businessType}
• Contact Person: ${formData.value.contactPerson}
• Phone: ${formData.value.phone}
• Email: ${formData.value.email}
• Location: ${formData.value.location}

Current Operations:
• Current Delivery Setup: ${formData.value.currentDelivery}
• Estimated Daily Volume: ${formData.value.volume}

Additional Message:
${formData.value.message}

---
Please also email your business documents to: jestercaredeliveries@gmail.com
We'll review your application and contact you soon!`

  // Open WhatsApp with pre-filled message
  const whatsappUrl = getWhatsAppUrl(message)
  window.open(whatsappUrl, '_blank')
  
  // Show success message
  alert('Application submitted! WhatsApp opened with your details. Please also email your documents to jestercaredeliveries@gmail.com')
  
  isSubmitting.value = false
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="partner-application">
    <div class="application-header">
      <button @click="goBack" class="back-btn">← Back</button>
      <h1>Become a Jester Partner</h1>
      <p>Join Nairobi's fastest delivery network. We handle the logistics, you focus on growing your business.</p>
    </div>

    <div class="application-content">
      <div class="form-section">
        <h2>Business Information</h2>
        <form @submit.prevent="submitApplication">
          <div class="form-group">
            <label for="businessName">Business Name *</label>
            <input
              id="businessName"
              v-model="formData.businessName"
              type="text"
              required
              placeholder="Your registered business name"
            />
          </div>

          <div class="form-group">
            <label for="businessType">Business Type *</label>
            <select id="businessType" v-model="formData.businessType" required>
              <option value="">Select business type</option>
              <option v-for="type in businessTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="contactPerson">Contact Person *</label>
            <input
              id="contactPerson"
              v-model="formData.contactPerson"
              type="text"
              required
              placeholder="Full name of primary contact"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              placeholder="07XX XXX XXX"
            />
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              placeholder="your@email.com"
            />
          </div>

          <div class="form-group">
            <label for="location">Business Location *</label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              required
              placeholder="Your business address/area in Nairobi"
            />
          </div>

          <div class="form-group">
            <label for="currentDelivery">Current Delivery Setup</label>
            <textarea
              id="currentDelivery"
              v-model="formData.currentDelivery"
              rows="3"
              placeholder="Tell us about your current delivery arrangement (if any)"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="volume">Estimated Daily Delivery Volume</label>
            <select id="volume" v-model="formData.volume">
              <option value="">Select volume range</option>
              <option v-for="vol in volumes" :key="vol" :value="vol">
                {{ vol }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="message">Additional Information</label>
            <textarea
              id="message"
              v-model="formData.message"
              rows="4"
              placeholder="Tell us more about your business and why you'd like to partner with Jester"
            ></textarea>
          </div>

          <div class="submit-section">
            <div class="important-note">
              <h3>📧 Important Next Steps</h3>
              <p>After submitting this form, please email your business documents to:</p>
              <p class="email-highlight">jestercaredeliveries@gmail.com</p>
              <p>Include: Business registration, KRA PIN, and any relevant licenses.</p>
            </div>

            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit Application via WhatsApp' }}
            </button>
          </div>
        </form>
      </div>

      <div class="info-section">
        <div class="benefits-card">
          <h3>Why Partner with Jester?</h3>
          <ul>
            <li>✅ Nairobi-wide delivery coverage</li>
            <li>✅ Professional rider network</li>
            <li>✅ Real-time order tracking</li>
            <li>✅ Simple integration process</li>
            <li>✅ Competitive pricing</li>
            <li>✅ Dedicated support team</li>
          </ul>
        </div>

        <div class="contact-card">
          <h3>Have Questions?</h3>
          <p>Reach out to us directly:</p>
          <p><strong>Email:</strong> jestercaredeliveries@gmail.com</p>
          <p><strong>Phone:</strong> Find us on WhatsApp for fastest response</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.partner-application {
  min-height: 100vh;
  background: var(--color-surface);
  padding: 2rem 1.25rem;
}

.application-header {
  max-width: 800px;
  margin: 0 auto 3rem;
  text-align: center;
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  color: var(--color-orange);
}

.application-header h1 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 800;
  color: var(--color-ink);
}

.application-header p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-ink-muted);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.application-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 3rem;
}

.form-section {
  background: #fff;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.form-section h2 {
  margin: 0 0 2rem;
  font-size: 1.5rem;
  font-weight: 700;
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
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  background: var(--color-surface);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.important-note {
  background: var(--color-mint-soft);
  border: 1px solid rgba(22, 163, 74, 0.2);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.important-note h3 {
  margin: 0 0 0.75rem;
  color: #166534;
  font-size: 1.1rem;
}

.important-note p {
  margin: 0.5rem 0;
  color: #166534;
  line-height: 1.5;
}

.email-highlight {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-orange);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: var(--color-orange);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  font-weight: 700;
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

.info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.benefits-card,
.contact-card {
  background: #fff;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.benefits-card h3,
.contact-card h3 {
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-ink);
}

.benefits-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits-card li {
  padding: 0.5rem 0;
  color: var(--color-ink);
  font-weight: 500;
}

.contact-card p {
  margin: 0.75rem 0;
  color: var(--color-ink);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .application-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .info-section {
    order: -1;
  }
}
</style>
