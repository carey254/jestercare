<script setup lang="ts">
import { ref, computed } from 'vue'
import { getWhatsAppUrl } from '../composables/useWhatsApp'

interface PharmacyRequest {
  productType: string
  specificProduct: string
  brand: string
  strength: string
  quantity: string
  prescriptionRequired: boolean
  prescriptionFile: string | null
  preferredSource: string
  preferredPharmacy: string
  urgency: string
  deliveryLocation: string
  customLocation: string
  additionalNotes: string
  contactMethod: string
  contactInfo: string
  priceRange: string
  allergies: string
  medicalConditions: string
}

const formData = ref<PharmacyRequest>({
  productType: '',
  specificProduct: '',
  brand: '',
  strength: '',
  quantity: '',
  prescriptionRequired: false,
  prescriptionFile: null,
  preferredSource: 'any',
  preferredPharmacy: '',
  urgency: 'normal',
  deliveryLocation: 'current',
  customLocation: '',
  additionalNotes: '',
  contactMethod: 'phone',
  contactInfo: '',
  priceRange: 'any',
  allergies: '',
  medicalConditions: ''
})

const showConfirmation = ref(false)
const isSubmitting = ref(false)

const productTypes = [
  'Prescription Medicine',
  'Over-the-Counter Medicine',
  'Vitamins & Supplements',
  'Personal Care',
  'Beauty Products',
  'Medical Supplies',
  'Baby Care',
  'First Aid',
  'Other'
]

const commonPharmacies = [
  'Pharmacy & Poisons Board',
  'Medi-Plus Pharmacy',
  'Goodlife Pharmacy',
  'Uchumi Supermarket Pharmacy',
  'Nakumatt Pharmacy',
  'Java House Pharmacy',
  'Local Community Pharmacy',
  'Hospital Pharmacy',
  'Online Pharmacy',
  'Other'
]

const urgencyLevels = [
  { value: 'urgent', label: 'Urgent (Within 2 hours)', color: '#dc3545' },
  { value: 'same-day', label: 'Same Day (Within 6 hours)', color: '#ff6b35' },
  { value: 'normal', label: 'Normal (Within 24 hours)', color: '#28a745' },
  { value: 'flexible', label: 'Flexible (2-3 days)', color: '#6c757d' }
]

const priceRanges = [
  { value: 'any', label: 'Any Price Range' },
  { value: 'budget', label: 'Budget (Under KSH 500)' },
  { value: 'mid', label: 'Mid-Range (KSH 500-2000)' },
  { value: 'premium', label: 'Premium (KSH 2000+)' }
]

const contactMethods = [
  { value: 'phone', label: 'Phone Call', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'sms', label: 'SMS', icon: '📱' },
  { value: 'email', label: 'Email', icon: '📧' }
]

const isFormValid = computed(() => {
  return formData.value.productType && 
         formData.value.specificProduct &&
         formData.value.quantity &&
         formData.value.contactInfo &&
         (!formData.value.prescriptionRequired || formData.value.prescriptionFile)
})

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    formData.value.prescriptionFile = file.name
  }
}

const submitRequest = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  // Generate WhatsApp message
  const message = generateWhatsAppMessage()
  const whatsappUrl = getWhatsAppUrl(message)
  
  // Open WhatsApp in new tab
  window.open(whatsappUrl, '_blank')
  
  // Show confirmation after a short delay
  setTimeout(() => {
    showConfirmation.value = true
    isSubmitting.value = false
  }, 1000)
}

const resetForm = () => {
  formData.value = {
    productType: '',
    specificProduct: '',
    brand: '',
    strength: '',
    quantity: '',
    prescriptionRequired: false,
    prescriptionFile: null,
    preferredSource: 'any',
    preferredPharmacy: '',
    urgency: 'normal',
    deliveryLocation: 'current',
    customLocation: '',
    additionalNotes: '',
    contactMethod: 'phone',
    contactInfo: '',
    priceRange: 'any',
    allergies: '',
    medicalConditions: ''
  }
  showConfirmation.value = false
}

const getUrgencyColor = (urgency: string) => {
  const level = urgencyLevels.find(l => l.value === urgency)
  return level ? level.color : '#6c757d'
}

const generateWhatsAppMessage = () => {
  const urgency = urgencyLevels.find(l => l.value === formData.value.urgency)?.label || 'Normal'
  const priceRange = priceRanges.find(r => r.value === formData.value.priceRange)?.label || 'Any'
  const contactMethod = contactMethods.find(m => m.value === formData.value.contactMethod)?.label || 'Phone'
  
  let message = `🏥 PHARMACY ORDER REQUEST\n\n`
  message += `📋 PRODUCT DETAILS:\n`
  message += `• Type: ${formData.value.productType}\n`
  message += `• Product: ${formData.value.specificProduct}\n`
  
  if (formData.value.brand) message += `• Brand: ${formData.value.brand}\n`
  if (formData.value.strength) message += `• Strength/Size: ${formData.value.strength}\n`
  message += `• Quantity: ${formData.value.quantity}\n`
  message += `• Price Range: ${priceRange}\n`
  
  if (formData.value.prescriptionRequired) {
    message += `\n📄 PRESCRIPTION REQUIRED: Yes\n`
    if (formData.value.prescriptionFile) {
      message += `• Prescription file: ${formData.value.prescriptionFile}\n`
    }
  }
  
  message += `\n🏪 SOURCE PREFERENCES:\n`
  if (formData.value.preferredSource === 'specific' && formData.value.preferredPharmacy) {
    message += `• Pharmacy: ${formData.value.preferredPharmacy}\n`
  }
  message += `• Urgency: ${urgency}\n`
  
  message += `\n🚚 DELIVERY:\n`
  if (formData.value.deliveryLocation === 'custom' && formData.value.customLocation) {
    message += `• Location: ${formData.value.customLocation}\n`
  } else {
    message += `• Location: Current location\n`
  }
  
  if (formData.value.allergies) {
    message += `\n⚕️ ALLERGIES: ${formData.value.allergies}\n`
  }
  
  if (formData.value.medicalConditions) {
    message += `⚕️ MEDICAL CONDITIONS: ${formData.value.medicalConditions}\n`
  }
  
  message += `\n📞 CONTACT: ${formData.value.contactInfo} via ${contactMethod}\n`
  
  if (formData.value.additionalNotes) {
    message += `\n📝 NOTES: ${formData.value.additionalNotes}\n`
  }
  
  message += `\n---\nPlease confirm availability and total cost. Thank you!`
  
  return message
}
</script>

<template>
  <div class="pharmacy-page">
    <div class="pharmacy-container">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-image">
            <img src="/images/categories/pharmacy/med3.jpg" alt="Pharmacy & Beauty" />
          </div>
          <div class="header-text">
            <h1>Pharmacy & Beauty</h1>
            <p>Get your medicines, health products, and beauty essentials delivered to your doorstep. We help you find what you need from trusted sources.</p>
          </div>
        </div>
      </div>

      <!-- Main Form -->
      <div class="form-container">
        <div class="form-header">
          <h2>🏥 Pharmacy Request Form</h2>
          <p>Please fill in your requirements and we'll help you get your products</p>
        </div>

        <form @submit.prevent="submitRequest" class="pharmacy-form">
          <!-- Product Information -->
          <div class="form-section">
            <h3>📋 Product Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Product Type *</label>
                <select v-model="formData.productType" required class="form-control">
                  <option value="">Select product type</option>
                  <option v-for="type in productTypes" :key="type" :value="type">
                    {{ type }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Specific Product Name *</label>
                <input 
                  type="text" 
                  v-model="formData.specificProduct" 
                  placeholder="e.g., Panadol, Cetaphil, Vitamin C"
                  required
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Brand (Optional)</label>
                <input 
                  type="text" 
                  v-model="formData.brand" 
                  placeholder="e.g., GSK, Neutrogena, Centrum"
                  class="form-control"
                />
              </div>
              
              <div class="form-group">
                <label>Strength/Size (Optional)</label>
                <input 
                  type="text" 
                  v-model="formData.strength" 
                  placeholder="e.g., 500mg, 100ml, 30 tablets"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Quantity *</label>
                <input 
                  type="text" 
                  v-model="formData.quantity" 
                  placeholder="e.g., 1 bottle, 2 boxes, 3 packs"
                  required
                  class="form-control"
                />
              </div>
              
              <div class="form-group">
                <label>Price Range</label>
                <select v-model="formData.priceRange" class="form-control">
                  <option v-for="range in priceRanges" :key="range.value" :value="range.value">
                    {{ range.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Prescription -->
          <div class="form-section">
            <h3>📄 Prescription</h3>
            
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="formData.prescriptionRequired"
                />
                <span>This product requires a prescription</span>
              </label>
            </div>

            <div v-if="formData.prescriptionRequired" class="prescription-upload">
              <div class="form-group">
                <label>Upload Prescription (Optional)</label>
                <div class="file-upload">
                  <input 
                    type="file" 
                    @change="handleFileUpload"
                    accept="image/*,.pdf"
                    id="prescription-file"
                    class="file-input"
                  />
                  <label for="prescription-file" class="file-label">
                    <span class="file-icon">📎</span>
                    <span class="file-text">
                      {{ formData.prescriptionFile || 'Click to upload prescription' }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Source Preferences -->
          <div class="form-section">
            <h3>🏪 Source Preferences</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Preferred Source</label>
                <select v-model="formData.preferredSource" class="form-control">
                  <option value="any">Any trusted source</option>
                  <option value="specific">Specific pharmacy</option>
                  <option value="online">Online pharmacy</option>
                  <option value="hospital">Hospital pharmacy</option>
                </select>
              </div>
              
              <div class="form-group" v-if="formData.preferredSource === 'specific'">
                <label>Preferred Pharmacy</label>
                <select v-model="formData.preferredPharmacy" class="form-control">
                  <option value="">Select pharmacy</option>
                  <option v-for="pharmacy in commonPharmacies" :key="pharmacy" :value="pharmacy">
                    {{ pharmacy }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Urgency Level</label>
                <div class="urgency-options">
                  <div 
                    v-for="level in urgencyLevels" 
                    :key="level.value"
                    :class="['urgency-option', { active: formData.urgency === level.value }]"
                    :style="{ '--urgency-color': level.color }"
                    @click="formData.urgency = level.value"
                  >
                    <div class="urgency-dot"></div>
                    <span>{{ level.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Delivery Information -->
          <div class="form-section">
            <h3>🚚 Delivery Information</h3>
            
            <div class="form-group">
              <label>Delivery Location</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input 
                    type="radio" 
                    value="current" 
                    v-model="formData.deliveryLocation"
                  />
                  <span>Current Location</span>
                </label>
                <label class="radio-label">
                  <input 
                    type="radio" 
                    value="custom" 
                    v-model="formData.deliveryLocation"
                  />
                  <span>Custom Location</span>
                </label>
              </div>
            </div>

            <div v-if="formData.deliveryLocation === 'custom'" class="form-group">
              <label>Custom Location</label>
              <textarea 
                v-model="formData.customLocation" 
                placeholder="Enter your address or location details"
                class="form-control"
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- Medical Information -->
          <div class="form-section">
            <h3>⚕️ Medical Information (Optional)</h3>
            
            <div class="form-group">
              <label>Allergies</label>
              <textarea 
                v-model="formData.allergies" 
                placeholder="List any allergies you have (e.g., penicillin, nuts, latex)"
                class="form-control"
                rows="2"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Medical Conditions</label>
              <textarea 
                v-model="formData.medicalConditions" 
                placeholder="Any relevant medical conditions we should know about"
                class="form-control"
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="form-section">
            <h3>📞 Contact Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Preferred Contact Method *</label>
                <div class="contact-methods">
                  <div 
                    v-for="method in contactMethods" 
                    :key="method.value"
                    :class="['contact-method', { active: formData.contactMethod === method.value }]"
                    @click="formData.contactMethod = method.value"
                  >
                    <span class="method-icon">{{ method.icon }}</span>
                    <span>{{ method.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Contact Information *</label>
              <input 
                type="text" 
                v-model="formData.contactInfo" 
                :placeholder="formData.contactMethod === 'email' ? 'your.email@example.com' : '+254 XXX XXX XXX'"
                required
                class="form-control"
              />
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="form-section">
            <h3>📝 Additional Notes</h3>
            
            <div class="form-group">
              <textarea 
                v-model="formData.additionalNotes" 
                placeholder="Any other details or special requirements..."
                class="form-control"
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="!isFormValid || isSubmitting"
              class="submit-btn"
            >
              <span v-if="isSubmitting">🔄 Processing...</span>
              <span v-else>🏥 Order via WhatsApp</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Confirmation Modal -->
      <div v-if="showConfirmation" class="modal-overlay" @click="showConfirmation = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>✅ Request Submitted Successfully!</h3>
          </div>
          <div class="modal-body">
            <p>Your pharmacy request has been submitted to WhatsApp. We'll contact you soon at:</p>
            <div class="contact-summary">
              <strong>{{ formData.contactInfo }}</strong> via {{ contactMethods.find(m => m.value === formData.contactMethod)?.label }}
            </div>
            <div class="whatsapp-notice">
              <p>💬 You should see a WhatsApp window open with your order details</p>
              <p>If WhatsApp doesn't open, please check your browser's pop-up settings</p>
            </div>
            <p class="urgency-notice" :style="{ color: getUrgencyColor(formData.urgency) }">
              <strong>Urgency Level:</strong> {{ urgencyLevels.find(l => l.value === formData.urgency)?.label }}
            </p>
          </div>
          <div class="modal-footer">
            <button @click="resetForm" class="new-request-btn">Submit New Request</button>
            <button @click="showConfirmation = false" class="close-btn">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pharmacy-page {
  background: linear-gradient(135deg, #fff8f5 0%, #ffedd9 100%);
  min-height: 100vh;
  padding: 20px;
}

.pharmacy-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Header Styles */
.page-header {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.2);
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  padding: 0;
}

.header-image {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-text {
  flex: 1;
  padding: 32px;
}

.header-text h1 {
  margin: 0 0 16px 0;
  color: white;
  font-size: 2.2rem;
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Form Container */
.form-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-header h2 {
  margin: 0 0 8px 0;
  color: #ff6b35;
  font-size: 1.8rem;
  font-weight: 700;
}

.form-header p {
  margin: 0;
  color: #666;
}

/* Form Sections */
.form-section {
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 2px solid #fff8f5;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #fff8f5 100%);
  padding: 24px;
  margin: 0 0 24px 0;
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #ff6b35;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-control {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.15);
  transform: translateY(-1px);
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

/* Checkbox and Radio Styles */
.checkbox-group,
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input,
.radio-label input {
  width: 18px;
  height: 18px;
  accent-color: #ff6b35;
}

/* File Upload */
.file-upload {
  position: relative;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-label:hover {
  border-color: #ff6b35;
  background: #fff8f5;
}

.file-icon {
  font-size: 24px;
}

.file-text {
  color: #666;
}

/* Urgency Options */
.urgency-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.urgency-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.urgency-option:hover {
  border-color: var(--urgency-color);
}

.urgency-option.active {
  border-color: var(--urgency-color);
  background: var(--urgency-color);
  color: white;
}

.urgency-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--urgency-color);
}

/* Contact Methods */
.contact-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  justify-content: center;
}

.contact-method:hover {
  border-color: #ff6b35;
}

.contact-method.active {
  border-color: #ff6b35;
  background: #ff6b35;
  color: white;
}

.method-icon {
  font-size: 18px;
}

/* Submit Button */
.form-actions {
  margin-top: 32px;
  text-align: center;
}

.submit-btn {
  padding: 18px 40px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 280px;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.modal-header {
  padding: 24px 24px 16px 24px;
}

.modal-header h3 {
  margin: 0;
  color: #ff6b35;
  font-size: 1.4rem;
  font-weight: 700;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #666;
}

.whatsapp-notice {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: white;
  padding: 16px;
  border-radius: 12px;
  margin: 16px 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.whatsapp-notice p {
  margin: 4px 0;
  font-weight: 500;
}

.contact-summary {
  background: linear-gradient(135deg, #fff8f5 0%, #ffedd9 100%);
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  color: #ff6b35;
  font-size: 1.2rem;
  font-weight: 700;
  border: 2px solid rgba(255, 107, 53, 0.2);
}

.urgency-notice {
  margin: 16px 0 0 0;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 0 24px 24px 24px;
}

.new-request-btn,
.close-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-request-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.new-request-btn:hover {
  background: linear-gradient(135deg, #e55a2b 0%, #ff6b35 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.close-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.close-btn:hover {
  background: #e8e8e8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pharmacy-page {
    padding: 12px;
  }
  
  .header-content {
    flex-direction: column;
  }
  
  .header-image {
    width: 100%;
    height: 200px;
  }
  
  .header-text {
    padding: 24px;
  }
  
  .header-text h1 {
    font-size: 1.8rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .contact-methods {
    grid-template-columns: 1fr;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .submit-btn {
    min-width: 100%;
    font-size: 1.1rem;
  }
}
</style>
