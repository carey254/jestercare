<template>
  <section id="together" class="together" aria-labelledby="together-title">
    <div class="together__header">
      <h2 id="together-title" class="together__heading">Let's do it together</h2>
      <p class="together__subtitle">Join our growing community and be part of Nairobi's delivery revolution</p>
    </div>
    
    <div class="together__grid">
      <article 
        v-for="(opportunity, index) in opportunities" 
        :key="opportunity.id"
        class="opportunity-card"
        :class="{ 'opportunity-card--hovered': hoveredCard === index }"
        @mouseenter="hoveredCard = index"
        @mouseleave="hoveredCard = null"
        @click="handleCardClick(opportunity)"
        role="button"
        tabindex="0"
        @keydown.enter="handleCardClick(opportunity)"
        @keydown.space.prevent="handleCardClick(opportunity)"
      >
        <div class="opportunity-card__icon">
          <component :is="opportunity.icon" class="icon" />
        </div>
        
        <div class="opportunity-card__content">
          <h3 class="opportunity-card__title">{{ opportunity.title }}</h3>
          <p class="opportunity-card__description">{{ opportunity.description }}</p>
          
          <div class="opportunity-card__features">
            <span 
              v-for="feature in opportunity.features" 
              :key="feature"
              class="feature-tag"
            >
              {{ feature }}
            </span>
          </div>
          
          <button 
            class="opportunity-card__cta"
            @click.stop="handleCTAClick(opportunity)"
          >
            {{ opportunity.cta }}
            <svg class="cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="opportunity-card__glow"></div>
      </article>
    </div>
    
    <!-- Modal for detailed information -->
    <teleport to="body">
      <div 
        v-if="selectedOpportunity" 
        class="modal-overlay"
        @click="closeModal"
        @keydown.esc="closeModal"
      >
        <div class="modal" @click.stop>
          <button class="modal__close" @click="closeModal" aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18m0-12l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          
          <div class="modal__icon">
            <component :is="selectedOpportunity.icon" class="icon" />
          </div>
          
          <h3 class="modal__title">{{ selectedOpportunity.title }}</h3>
          <p class="modal__description">{{ selectedOpportunity.description }}</p>
          
          <div class="modal__benefits">
            <h4>What you'll get:</h4>
            <ul>
              <li v-for="benefit in selectedOpportunity.benefits" :key="benefit">
                {{ benefit }}
              </li>
            </ul>
          </div>
          
          <button 
            class="modal__cta"
            @click="handleModalCTA"
          >
            {{ selectedOpportunity.cta }}
          </button>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Icon components as inline SVGs
const RiderIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="2"/>
      <path d="M12 13c-4 0-7 2-7 6v2h14v-2c0-4-3-6-7-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 3l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
}

const PartnerIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
}

const CareersIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
      <path d="M8 7V4a2 2 0 012-2h4a2 2 0 012 2v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 12v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="11" r="1" fill="currentColor"/>
    </svg>`
}

interface Opportunity {
  id: number
  title: string
  description: string
  features: string[]
  cta: string
  icon: any
  benefits: string[]
  action?: string
}

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: 'Become a rider',
    description: 'Flexible hours, competitive earnings, and Nairobi routes that fit your day.',
    features: ['Flexible hours', 'Competitive earnings', 'Nairobi routes'],
    cta: 'Register interest',
    icon: RiderIcon,
    benefits: [
      'Earn competitive rates on every delivery',
      'Choose when and where you work',
      'Join a community of 1000+ riders',
      'Weekly payments and bonuses',
      'Free training and support'
    ],
    action: '#partner'
  },
  {
    id: 2,
    title: 'Become a partner',
    description: 'Reach more customers with our tech and riders â€” groceries, pharmacy, and more.',
    features: ['Reach more customers', 'Use our tech', 'Grow your business'],
    cta: 'Partner with us',
    icon: PartnerIcon,
    benefits: [
      'Access to 50,000+ active customers',
      'Professional delivery fleet',
      'Real-time order tracking',
      'Analytics and insights dashboard',
      'Marketing and promotional support'
    ],
    action: '#partner'
  },
  {
    id: 3,
    title: 'Careers',
    description: 'Ambitious, humble, and team-oriented? We\'d love to hear from you.',
    features: ['Growth opportunities', 'Team culture', 'Innovation'],
    cta: 'View openings',
    icon: CareersIcon,
    benefits: [
      'Competitive salary and benefits',
      'Remote and hybrid work options',
      'Professional development budget',
      'Health and wellness programs',
      'Be part of Nairobi\'s tech revolution'
    ],
    action: 'mailto:careers@jesterspeed.co.ke'
  }
]

const hoveredCard = ref<number | null>(null)
const selectedOpportunity = ref<Opportunity | null>(null)

const handleCardClick = (opportunity: Opportunity) => {
  selectedOpportunity.value = opportunity
}

const handleCTAClick = (opportunity: Opportunity) => {
  if (opportunity.action?.startsWith('mailto:')) {
    window.location.href = opportunity.action
  } else if (opportunity.action?.startsWith('#')) {
    const element = document.querySelector(opportunity.action)
    element?.scrollIntoView({ behavior: 'smooth' })
  } else {
    selectedOpportunity.value = opportunity
  }
}

const handleModalCTA = () => {
  if (selectedOpportunity.value) {
    handleCTAClick(selectedOpportunity.value)
  }
  closeModal()
}

const closeModal = () => {
  selectedOpportunity.value = null
}

// Handle escape key for modal
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && selectedOpportunity.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.together {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 1.25rem;
  position: relative;
}

.together__header {
  text-align: center;
  margin-bottom: 3rem;
}

.together__heading {
  margin: 0 0 1rem;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--color-ink) 0%, var(--color-orange) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.together__subtitle {
  margin: 0;
  font-size: 1.125rem;
  color: var(--color-ink-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.together__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .together__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.opportunity-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.opportunity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-orange), var(--color-orange-hover));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.opportunity-card:hover::before,
.opportunity-card--hovered::before {
  transform: scaleX(1);
}

.opportunity-card:hover,
.opportunity-card--hovered {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(31, 31, 35, 0.12);
  border-color: var(--color-orange-soft);
}

.opportunity-card__icon {
  width: 48px;
  height: 48px;
  background: var(--color-orange-soft);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.opportunity-card:hover .opportunity-card__icon,
.opportunity-card--hovered .opportunity-card__icon {
  background: var(--color-orange);
  transform: scale(1.05);
}

.opportunity-card:hover .opportunity-card__icon .icon,
.opportunity-card--hovered .opportunity-card__icon .icon {
  color: white;
}

.icon {
  width: 24px;
  height: 24px;
  color: var(--color-orange);
  transition: color 0.3s ease;
}

.opportunity-card__content {
  position: relative;
  z-index: 2;
}

.opportunity-card__title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-ink);
  transition: color 0.3s ease;
}

.opportunity-card:hover .opportunity-card__title,
.opportunity-card--hovered .opportunity-card__title {
  color: var(--color-orange);
}

.opportunity-card__description {
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
}

.opportunity-card__features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.feature-tag {
  background: var(--color-bg);
  color: var(--color-ink-muted);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
}

.opportunity-card:hover .feature-tag,
.opportunity-card--hovered .feature-tag {
  background: var(--color-orange-soft);
  color: var(--color-orange);
}

.opportunity-card__cta {
  width: 100%;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  color: var(--color-orange);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.opportunity-card__cta:hover {
  background: var(--color-orange);
  color: white;
  border-color: var(--color-orange);
  transform: translateX(2px);
}

.cta-arrow {
  transition: transform 0.3s ease;
}

.opportunity-card__cta:hover .cta-arrow {
  transform: translateX(2px);
}

.opportunity-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--color-orange-soft) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.opportunity-card:hover .opportunity-card__glow,
.opportunity-card--hovered .opportunity-card__glow {
  opacity: 0.1;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--color-bg);
  border: none;
  border-radius: var(--radius-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-ink-muted);
  transition: all 0.2s ease;
}

.modal__close:hover {
  background: var(--color-orange-soft);
  color: var(--color-orange);
}

.modal__icon {
  width: 64px;
  height: 64px;
  background: var(--color-orange-soft);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.modal__icon .icon {
  width: 32px;
  height: 32px;
  color: var(--color-orange);
}

.modal__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  color: var(--color-ink);
}

.modal__description {
  margin: 0 0 2rem;
  text-align: center;
  color: var(--color-ink-muted);
  line-height: 1.6;
}

.modal__benefits {
  margin-bottom: 2rem;
}

.modal__benefits h4 {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-ink);
}

.modal__benefits ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.modal__benefits li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  padding-left: 1.5rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
}

.modal__benefits li::before {
  content: 'âœ“';
  position: absolute;
  left: 0;
  color: var(--color-mint);
  font-weight: 700;
}

.modal__benefits li:last-child {
  border-bottom: none;
}

.modal__cta {
  width: 100%;
  background: var(--color-orange);
  color: white;
  border: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal__cta:hover {
  background: var(--color-orange-hover);
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .together {
    padding: 3rem 1rem;
  }
  
  .opportunity-card {
    padding: 1.5rem;
  }
  
  .modal {
    padding: 1.5rem;
  }
}
</style>

