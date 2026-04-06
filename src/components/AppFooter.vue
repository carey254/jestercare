<script setup lang="ts">
import { PHONE_DISPLAY, PHONE_E164 } from '../data/contact'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const year = new Date().getFullYear()
const showPrivacyPolicy = ref(false)
const showTermsOfUse = ref(false)

function goToPartnerApplication() {
  router.push('/partner-application')
}

function goToRiderApplication() {
  router.push('/rider-application')
}

function goToVendorDirectory() {
  router.push('/vendor-directory')
}

function goToVendorRegistration() {
  router.push('/vendor-registration')
}

function openPrivacyPolicy() {
  showPrivacyPolicy.value = true
}

function openTermsOfUse() {
  showTermsOfUse.value = true
}

function closePrivacyPolicy() {
  showPrivacyPolicy.value = false
}

function closeTermsOfUse() {
  showTermsOfUse.value = false
}
</script>

<template>
  <footer id="partner" class="footer">
    <div class="footer__cta">
      <div class="footer__cta-inner">
        <div>
          <h2 class="footer__title">Grow with Jester</h2>
          <p class="footer__sub">
            List your store, pharmacy, or cleaning crew. We handle riders and Nairobi-wide reach — you focus on great
            service.
          </p>
        </div>
        <div class="footer__actions">
          <button type="button" class="btn btn--dark" @click="goToPartnerApplication">Become a partner</button>
          <button type="button" class="btn btn--outline" @click="goToRiderApplication">Rider signup</button>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="footer__grid">
        <div>
          <p class="footer__brand">Jester Speed Delivery</p>
          <p class="footer__muted">Nairobi metro delivery. Choose your area in-app — we confirm coverage at checkout.</p>
          <p class="footer__phone">
            <a :href="`tel:+${PHONE_E164}`">{{ PHONE_DISPLAY }}</a>
          </p>
        </div>
        <div>
          <p class="footer__label">Services</p>
          <ul class="footer__list">
            <li><a href="#categories">Groceries &amp; supermarket</a></li>
            <li><a href="#categories">Alcohol &amp; pharmacy</a></li>
            <li><a href="#categories">Cleaning &amp; packages</a></li>
            <li><a href="#" @click.prevent="goToVendorDirectory">Shop local stores</a></li>
          </ul>
        </div>
        <div id="careers">
          <p class="footer__label">Company</p>
          <ul class="footer__list">
            <li><a href="#together">How we work</a></li>
            <li><a href="mailto:careers@jesterspeed.co.ke">Careers</a></li>
            <li><a href="#">Help centre</a></li>
            <li><a href="#" @click.prevent="goToVendorRegistration">Sell on Jester</a></li>
          </ul>
        </div>
        <div>
          <p class="footer__label">Legal</p>
          <ul class="footer__list">
            <li><a href="#" @click.prevent="openPrivacyPolicy">Privacy Policy</a></li>
            <li><a href="#" @click.prevent="openTermsOfUse">Terms of Use</a></li>
          </ul>
        </div>
      </div>
      <p class="footer__copy">&copy; {{ year }} Jester Speed Delivery. Nairobi, Kenya.</p>
    </div>

    <!-- Privacy Policy Modal -->
    <div v-if="showPrivacyPolicy" class="modal-overlay" @click="closePrivacyPolicy">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Privacy Policy</h2>
          <button class="modal-close" @click="closePrivacyPolicy">&times;</button>
        </div>
        <div class="modal-body">
          <div class="policy-content">
            <h3>Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This may include your name, email address, phone number, delivery address, and payment information.</p>
            
            <h3>How We Use Your Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers.</p>
            
            <h3>Information Sharing</h3>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with delivery partners who need access to fulfill your orders.</p>
            
            <h3>Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            
            <h3>Your Rights</h3>
            <p>You have the right to access, update, or delete your personal information. You may also opt out of receiving promotional communications from us at any time.</p>
            
            <h3>Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@jesterspeed.co.ke or call us at {{ PHONE_DISPLAY }}.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms of Use Modal -->
    <div v-if="showTermsOfUse" class="modal-overlay" @click="closeTermsOfUse">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Terms of Use</h2>
          <button class="modal-close" @click="closeTermsOfUse">&times;</button>
        </div>
        <div class="modal-body">
          <div class="policy-content">
            <h3>Acceptance of Terms</h3>
            <p>By accessing and using Jester Speed Delivery's services, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h3>Service Description</h3>
            <p>Jester Speed Delivery provides on-demand delivery services within Nairobi metro area. We connect customers with local stores, pharmacies, and other service providers through our platform.</p>
            
            <h3>User Responsibilities</h3>
            <p>You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
            
            <h3>Payment and Pricing</h3>
            <p>All prices are displayed in Kenyan Shillings. You agree to pay all charges incurred under your account at the prices in effect when such charges are incurred. Delivery fees may vary based on distance and demand.</p>
            
            <h3>Prohibited Uses</h3>
            <p>You may not use our service for any illegal or unauthorized purpose. You may not use our service to order prohibited items, including illegal substances, weapons, or any items that violate applicable laws.</p>
            
            <h3>Limitation of Liability</h3>
            <p>Jester Speed Delivery shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of our services.</p>
            
            <h3>Service Availability</h3>
            <p>We strive to provide reliable service but do not guarantee uninterrupted access. Service availability may be affected by weather, traffic conditions, or other factors beyond our control.</p>
            
            <h3>Changes to Terms</h3>
            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of any changes.</p>
            
            <h3>Contact Information</h3>
            <p>For questions about these Terms of Use, please contact us at legal@jesterspeed.co.ke or call {{ PHONE_DISPLAY }}.</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;
  display: block;
}

.footer__cta {
  background: linear-gradient(135deg, var(--color-ink) 0%, #2d2d44 100%);
  color: #fff;
  padding: 3rem 1.25rem;
  position: relative;
  overflow: hidden;
}

.footer__cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.03)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="10" cy="90" r="0.5" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
  pointer-events: none;
}

.footer__cta-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
}

.footer__title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.footer__sub {
  margin: 0;
  max-width: 520px;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.55;
  font-size: 0.95rem;
}

.footer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.35rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn--dark {
  background: var(--color-yellow);
  color: var(--color-ink);
}

.btn--dark:hover {
  opacity: 0.92;
}

.btn--outline {
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.35);
}

.btn--outline:hover {
  border-color: #fff;
}

.footer__bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 2rem;
}

.footer__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.footer__brand {
  font-weight: 800;
  margin: 0 0 0.5rem;
}

.footer__muted {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
  line-height: 1.5;
  max-width: 280px;
}

.footer__phone {
  margin: 0.75rem 0 0;
}

.footer__phone a {
  font-weight: 800;
  font-size: 1rem;
  color: var(--color-orange);
}

.footer__phone a:hover {
  text-decoration: underline;
}

.footer__label {
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
  margin: 0 0 0.75rem;
}

.footer__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer__list a {
  color: var(--color-ink);
  font-weight: 600;
  font-size: 0.9rem;
}

.footer__list a:hover {
  color: var(--color-mint);
}

.footer__copy {
  margin: 2rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  width: 100%;
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
  overflow: hidden;
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
  background: linear-gradient(135deg, var(--color-ink) 0%, #2d2d44 100%);
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
  padding: 0;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

.policy-content {
  padding: 2rem;
  line-height: 1.6;
  color: var(--color-ink);
}

.policy-content h3 {
  color: var(--color-ink);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-yellow);
}

.policy-content h3:first-child {
  margin-top: 0;
}

.policy-content p {
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
  color: #555;
}

.policy-content p:last-child {
  margin-bottom: 0;
}


.footer__bottom {
  width: 100%;
  padding: 3rem 1.25rem 2rem;
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  border-top: 1px solid var(--color-border);
}

.footer__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2.5rem;
  margin-bottom: 2rem;
  width: 100%;
}

.footer__brand {
  font-weight: 800;
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  background: linear-gradient(135deg, var(--color-ink), var(--color-orange));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer__list a {
  color: var(--color-ink);
  font-weight: 600;
  font-size: 0.9rem;
  position: relative;
  transition: all 0.2s ease;
  padding-left: 0;
}

.footer__list a::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: var(--color-yellow);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.2s ease;
}

.footer__list a:hover {
  color: var(--color-mint);
  padding-left: 8px;
}

.footer__list a:hover::before {
  opacity: 1;
  left: 0;
}
</style>
