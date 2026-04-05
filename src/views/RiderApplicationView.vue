<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getWhatsAppUrl } from '../composables/useWhatsApp'

const router = useRouter()

const formData = ref({
  fullName: '',
  phone: '',
  email: '',
  age: '',
  location: '',
  experience: '',
  vehicleType: '',
  availability: '',
  whyJoin: '',
  message: ''
})

const isSubmitting = ref(false)

const vehicleTypes = [
  'Motorcycle (Boda Boda)',
  'Bicycle',
  'Car/Van',
  'Foot (Walking)'
]

const experienceLevels = [
  'No experience - willing to learn',
  'Less than 1 year',
  '1-2 years',
  '3-5 years',
  'More than 5 years'
]

const availabilityOptions = [
  'Full-time (6+ days per week)',
  'Part-time (3-5 days per week)',
  'Weekends only',
  'Flexible/On-demand'
]

async function submitApplication() {
  isSubmitting.value = true
  
  const message = `RIDER APPLICATION - Jester Speed Delivery

Personal Details:
• Full Name: ${formData.value.fullName}
• Phone: ${formData.value.phone}
• Email: ${formData.value.email}
• Age: ${formData.value.age}
• Location: ${formData.value.location}

Experience & Availability:
• Delivery Experience: ${formData.value.experience}
• Vehicle Type: ${formData.value.vehicleType}
• Availability: ${formData.value.availability}

Why Join Jester:
${formData.value.whyJoin}

Additional Message:
${formData.value.message}

---
IMPORTANT: Please email your documents to: jestercaredeliveries@gmail.com
Required documents:
- National ID/Passport copy
- Driver's license (if applicable)
- Vehicle registration (if applicable)
- Certificate of Good Conduct
- Recent passport photo

We'll review your application and contact you soon!`

  // Open WhatsApp with pre-filled message
  const whatsappUrl = getWhatsAppUrl(message)
  window.open(whatsappUrl, '_blank')
  
  // Show success message
  alert('Application submitted! WhatsApp opened with your details. Please email your required documents to jestercaredeliveries@gmail.com')
  
  isSubmitting.value = false
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="rider-application">
    <div class="application-header">
      <button @click="goBack" class="back-btn">← Back</button>
      <h1>Join Jester as a Rider</h1>
      <p>Become part of Nairobi's fastest delivery team. Flexible hours, competitive pay, and great benefits.</p>
    </div>

    <div class="application-content">
      <div class="form-section">
        <h2>Rider Application Form</h2>
        <form @submit.prevent="submitApplication">
          <div class="form-group">
            <label for="fullName">Full Name *</label>
            <input
              id="fullName"
              v-model="formData.fullName"
              type="text"
              required
              placeholder="Your full legal name"
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
            <label for="age">Age *</label>
            <input
              id="age"
              v-model="formData.age"
              type="number"
              required
              min="18"
              max="65"
              placeholder="Your age"
            />
          </div>

          <div class="form-group">
            <label for="location">Your Location in Nairobi *</label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              required
              placeholder="Your residential area/estate"
            />
          </div>

          <div class="form-group">
            <label for="experience">Delivery Experience *</label>
            <select id="experience" v-model="formData.experience" required>
              <option value="">Select experience level</option>
              <option v-for="level in experienceLevels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="vehicleType">Vehicle Type *</label>
            <select id="vehicleType" v-model="formData.vehicleType" required>
              <option value="">Select vehicle type</option>
              <option v-for="type in vehicleTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="availability">Availability *</label>
            <select id="availability" v-model="formData.availability" required>
              <option value="">Select availability</option>
              <option v-for="option in availabilityOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="whyJoin">Why do you want to join Jester? *</label>
            <textarea
              id="whyJoin"
              v-model="formData.whyJoin"
              rows="4"
              required
              placeholder="Tell us why you'd be a great fit for our delivery team"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="message">Additional Information</label>
            <textarea
              id="message"
              v-model="formData.message"
              rows="3"
              placeholder="Any other information you'd like to share"
            ></textarea>
          </div>

          <div class="submit-section">
            <div class="important-note">
              <h3>📋 Required Documents</h3>
              <p>After submitting this form, please email these documents to:</p>
              <p class="email-highlight">jestercaredeliveries@gmail.com</p>
              <ul>
                <li>• National ID/Passport copy</li>
                <li>• Driver's license (if applicable)</li>
                <li>• Vehicle registration documents</li>
                <li>• Certificate of Good Conduct</li>
                <li>• Recent passport-sized photo</li>
              </ul>
            </div>

            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Submitting...' : 'Submit Application via WhatsApp' }}
            </button>
          </div>
        </form>
      </div>

      <div class="info-section">
        <div class="requirements-card">
          <h3>Rider Requirements</h3>
          <ul>
            <li>✅ Must be 18+ years old</li>
            <li>✅ Valid National ID/Passport</li>
            <li>✅ Smartphone with data</li>
            <li>✅ Know Nairobi roads well</li>
            <li>✅ Good communication skills</li>
            <li>✅ Professional attitude</li>
            <li>✅ Certificate of Good Conduct</li>
          </ul>
        </div>

        <div class="benefits-card">
          <h3>Why Ride with Jester?</h3>
          <ul>
            <li>Competitive per-delivery pay</li>
            <li>Flexible working hours</li>
            <li>Supportive team environment</li>
          </ul>
        </div>

        <div class="contact-card">
          <h3>Questions?</h3>
          <p>Reach out to our recruitment team:</p>
          <p><strong>Email:</strong> jestercaredeliveries@gmail.com</p>
          <p><strong>WhatsApp:</strong> Fastest response time</p>
          <p><strong>Phone:</strong> Available during business hours</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rider-application {
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
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.important-note h3 {
  margin: 0 0 0.75rem;
  color: #92400e;
  font-size: 1.1rem;
}

.important-note p {
  margin: 0.5rem 0;
  color: #92400e;
  line-height: 1.5;
}

.important-note ul {
  margin: 1rem 0 0;
  padding-left: 1.5rem;
  color: #92400e;
}

.important-note li {
  margin: 0.25rem 0;
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

.requirements-card,
.benefits-card,
.contact-card {
  background: #fff;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.requirements-card h3,
.benefits-card h3,
.contact-card h3 {
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-ink);
}

.requirements-card ul,
.benefits-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-card li,
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
