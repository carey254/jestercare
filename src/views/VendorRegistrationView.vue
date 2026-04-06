<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getWhatsAppUrl } from '../composables/useWhatsApp'
import { saveVendor, type Vendor } from '../composables/useVendorData'

const router = useRouter()

const formData = ref({
  businessName: '',
  businessType: '',
  businessCategory: '',
  contactPerson: '',
  phone: '',
  email: '',
  location: '',
  businessDescription: '',
  operatingHours: '',
  deliveryRadius: '',
  bankAccount: '',
  bankName: '',
  agreeTerms: false
})

const isSubmitting = ref(false)
const submissionError = ref('')

const businessTypes = [
  'Restaurant/Food Service',
  'Hotel/Accommodation',
  'Grocery Store',
  'Supermarket',
  'Pharmacy',
  'Liquor Store',
  'Cleaning Service',
  'Beauty Salon/Spa',
  'Electronics Store',
  'Fashion Boutique',
  'Hardware Store',
  'Bookstore',
  'Pet Store',
  'Bakery',
  'Butchery',
  'Fishmonger',
  'Flower Shop',
  'Gift Shop',
  'Convenience Store',
  'Other'
]

const businessCategories = [
  'Food & Beverages',
  'Accommodation',
  'Health & Beauty',
  'Home & Garden',
  'Electronics & Appliances',
  'Fashion & Accessories',
  'Sports & Outdoors',
  'Books & Stationery',
  'Pet Supplies',
  'Toys & Games',
  'Automotive',
  'Office Supplies',
  'Cleaning Services',
  'Other'
]

const deliveryRadii = [
  'Within 2km',
  'Within 5km',
  'Within 10km',
  'Within 15km',
  'Nairobi Wide',
  'Custom (specify in notes)'
]

async function submitRegistration() {
  if (!formData.value.agreeTerms) {
    submissionError.value = 'You must agree to the terms and conditions'
    return
  }

  isSubmitting.value = true
  submissionError.value = ''
  
  try {
    // Save vendor data to localStorage
    const vendor = saveVendor(formData.value)
    
    // Create WhatsApp message with vendor details
    const message = `NEW VENDOR REGISTRATION - Jester Speed Delivery

Business Information:
• Business Name: ${formData.value.businessName}
• Business Type: ${formData.value.businessType}
• Business Category: ${formData.value.businessCategory}
• Contact Person: ${formData.value.contactPerson}
• Phone: ${formData.value.phone}
• Email: ${formData.value.email}
• Location: ${formData.value.location}

Business Details:
• Description: ${formData.value.businessDescription}
• Operating Hours: ${formData.value.operatingHours}
• Delivery Radius: ${formData.value.deliveryRadius}

Banking Information:
• Bank Name: ${formData.value.bankName}
• Account Number: ${formData.value.bankAccount}

Vendor ID: ${vendor.id}
Registration Date: ${new Date().toLocaleDateString()}

---
Next Steps:
1. Review vendor application in admin panel
2. Verify business documents
3. Approve/reject registration
4. Vendor receives login credentials upon approval

Vendor Dashboard: /vendor-dashboard
Admin Panel: Review pending applications

Questions? Email: vendors@jesterdelivery.com`

    // Open WhatsApp with pre-filled message
    const whatsappUrl = getWhatsAppUrl(message)
    window.open(whatsappUrl, '_blank')
    
    // Show success message
    alert(`Registration submitted successfully!\n\nYour Vendor ID: ${vendor.id}\n\nWe'll review your application within 24-48 hours.\nYou'll receive an email with your login credentials once approved.\n\nCheck WhatsApp for confirmation message.`)
    
    // Redirect to home page
    router.push('/')
    
  } catch (error) {
    console.error('Error saving vendor:', error)
    submissionError.value = 'Failed to submit registration. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="vendor-registration">
    <div class="registration-header">
      <button @click="goBack" class="back-btn">← Back</button>
      <h1>Start Selling on Jester</h1>
      <p>Join thousands of Nairobi businesses reaching customers with fast delivery. List your products and start selling today!</p>
    </div>

    <div class="registration-content">
      <div class="form-section">
        <h2>Business Registration</h2>
        <form @submit.prevent="submitRegistration">
          <!-- Business Information -->
          <div class="form-section-group">
            <h3>Business Information</h3>
            
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
              <label for="businessCategory">Business Category *</label>
              <select id="businessCategory" v-model="formData.businessCategory" required>
                <option value="">Select category</option>
                <option v-for="category in businessCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="businessDescription">Business Description *</label>
              <textarea
                id="businessDescription"
                v-model="formData.businessDescription"
                rows="3"
                required
                placeholder="Tell customers about your business and what you offer"
              ></textarea>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="form-section-group">
            <h3>Contact Information</h3>
            
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
          </div>

          <!-- Operations -->
          <div class="form-section-group">
            <h3>Operations</h3>
            
            <div class="form-group">
              <label for="operatingHours">Operating Hours *</label>
              <input
                id="operatingHours"
                v-model="formData.operatingHours"
                type="text"
                required
                placeholder="e.g., Mon-Fri 8AM-8PM, Sat-Sun 9AM-6PM"
              />
            </div>

            <div class="form-group">
              <label for="deliveryRadius">Delivery Area *</label>
              <select id="deliveryRadius" v-model="formData.deliveryRadius" required>
                <option value="">Select delivery radius</option>
                <option v-for="radius in deliveryRadii" :key="radius" :value="radius">
                  {{ radius }}
                </option>
              </select>
            </div>
          </div>

          <!-- Banking Information -->
          <div class="form-section-group">
            <h3>Payment Information</h3>
            
            <div class="form-group">
              <label for="bankName">Bank Name *</label>
              <input
                id="bankName"
                v-model="formData.bankName"
                type="text"
                required
                placeholder="e.g., Equity Bank, KCB, Cooperative Bank"
              />
            </div>

            <div class="form-group">
              <label for="bankAccount">Account Number *</label>
              <input
                id="bankAccount"
                v-model="formData.bankAccount"
                type="text"
                required
                placeholder="Your business bank account number"
              />
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="form-section-group">
            <div class="terms-section">
              <h3>Terms & Conditions</h3>
              <div class="terms-content">
                <p>By registering as a vendor, you agree to:</p>
                <ul>
                  <li>Provide accurate business information</li>
                  <li>Maintain product quality and accurate descriptions</li>
                  <li>Process orders within your stated operating hours</li>
                  <li>Pay vendor commission fees (15% per successful delivery)</li>
                  <li>Follow Jester's vendor policies and guidelines</li>
                  <li>Maintain proper business licenses and permits</li>
                </ul>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="formData.agreeTerms"
                    required
                  />
                  <span>I agree to the terms and conditions *</span>
                </label>
              </div>
            </div>
          </div>

          <div class="submit-section">
            <div v-if="submissionError" class="error-message">
              {{ submissionError }}
            </div>
            <div class="important-note">
              <h3>📋 What Happens Next?</h3>
              <ol>
                <li>We'll review your application within 24-48 hours</li>
                <li>You'll receive vendor login credentials via email</li>
                <li>Complete business verification (documents required)</li>
                <li>Access your vendor dashboard and start listing products</li>
                <li>Begin receiving orders and growing your business!</li>
              </ol>
              <p class="document-note">📧 Have business documents ready: Registration certificate, KRA PIN, operating license</p>
            </div>

            <button type="submit" class="submit-btn" :disabled="isSubmitting || !formData.agreeTerms">
              {{ isSubmitting ? 'Submitting...' : 'Complete Registration' }}
            </button>
          </div>
        </form>
      </div>

      <div class="info-section">
        <div class="benefits-card">
          <h3>Why Sell on Jester?</h3>
          <ul>
            <li>Instant access to thousands of Nairobi customers</li>
            <li>Easy-to-use vendor dashboard</li>
            <li>Secure payment processing</li>
            <li>Professional delivery fleet</li>
            <li>Real-time sales analytics</li>
            <li>Quick setup - start selling in 48 hours</li>
          </ul>
        </div>

        <div class="requirements-card">
          <h3>Requirements</h3>
          <ul>
            <li>✅ Registered Kenyan business</li>
            <li>✅ Valid business license</li>
            <li>✅ KRA PIN certificate</li>
            <li>✅ Bank account for payments</li>
            <li>✅ Phone/email for orders</li>
            <li>✅ Products ready to sell</li>
          </ul>
        </div>

        <div class="contact-card">
          <h3>Need Help?</h3>
          <p>Our vendor support team is ready to assist you:</p>
          <p><strong>Email:</strong> vendors@jesterdelivery.com</p>
          <p><strong>WhatsApp:</strong> Fastest response time</p>
          <p><strong>Phone:</strong> Available during business hours</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vendor-registration {
  min-height: 100vh;
  background: var(--color-surface);
  padding: 2rem 1.25rem;
}

.registration-header {
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

.registration-header h1 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 800;
  color: var(--color-ink);
}

.registration-header p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-ink-muted);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.registration-content {
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

.form-section-group {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.form-section-group:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section-group h3 {
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

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
  margin-top: 2px;
}

.terms-section {
  background: var(--color-mint-soft);
  border: 1px solid rgba(22, 163, 74, 0.2);
  border-radius: var(--radius-md);
  padding: 1.5rem;
}

.terms-content {
  margin-bottom: 1.5rem;
}

.terms-content p {
  margin: 0 0 1rem;
  color: #166534;
  font-weight: 600;
}

.terms-content ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #166534;
}

.terms-content li {
  margin-bottom: 0.5rem;
}

.submit-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.important-note {
  background: linear-gradient(135deg, var(--color-orange-soft), var(--color-mint-soft));
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.important-note h3 {
  margin: 0 0 1rem;
  color: var(--color-ink);
  font-size: 1.1rem;
}

.important-note ol {
  margin: 0 0 1rem;
  padding-left: 1.5rem;
  color: var(--color-ink);
}

.important-note li {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.document-note {
  margin: 1rem 0 0;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--color-ink);
}

.email-highlight {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-orange);
}

.error-message {
  background: var(--color-red-soft);
  border: 1px solid var(--color-red);
  color: var(--color-red);
  padding: 1rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  font-weight: 500;
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
.requirements-card,
.contact-card {
  background: #fff;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.benefits-card h3,
.requirements-card h3,
.contact-card h3 {
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-ink);
}

.benefits-card ul,
.requirements-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits-card li,
.requirements-card li {
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
  .registration-content {
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
