<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getWhatsAppUrl } from '../composables/useWhatsApp'
import { calculatePackageDelivery, getNairobiLocations, isCalculating } from '../composables/useDelivery'

const TIP_OPTIONS = [0, 50, 170, 350] as const
const TIP_STORAGE_KEY = 'jester-package-tip-preference'

const whereFrom = ref('')
const whereTo = ref('')
const selectedPickupZone = ref('')
const selectedDropoffZone = ref('')
const useZoneSelection = ref(false)
const deliveryCalculation = ref(null)
const calculationError = ref('')
const sendingToSomeoneElse = ref(false)
const recipientName = ref('')
const recipientPhone = ref('')
const recipientNotes = ref('')
const customerPhone = ref('')
const deliverySpeed = ref<'standard' | 'asap'>('standard')
const paymentMethod = ref<'mpesa' | 'cash'>('mpesa')
const promoCode = ref('')
const tipKes = ref<number>(0)
const saveTipForNext = ref(false)

onMounted(() => {
  try {
    const raw = localStorage.getItem(TIP_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { tip?: number; save?: boolean }
      if (typeof parsed.tip === 'number' && (TIP_OPTIONS as readonly number[]).includes(parsed.tip)) {
        tipKes.value = parsed.tip
      }
      if (parsed.save === true) saveTipForNext.value = true
    }
  } catch {
    /* ignore */
  }
})

// Calculate delivery when zones change
watch([selectedPickupZone, selectedDropoffZone], async () => {
  if (selectedPickupZone.value && selectedDropoffZone.value) {
    try {
      calculationError.value = ''
      deliveryCalculation.value = await calculatePackageDelivery(
        selectedPickupZone.value,
        selectedDropoffZone.value
      )
    } catch (error) {
      calculationError.value = 'Failed to calculate delivery distance'
      console.error('Delivery calculation error:', error)
    }
  }
})

const availableZones = computed(() => getNairobiLocations())
const calculatedServiceCharge = computed(() => {
  return deliveryCalculation.value?.deliveryCharge || 0
})
const estimatedTime = computed(() => {
  return deliveryCalculation.value?.deliveryTime || 0
})
const calculatedDistance = computed(() => {
  return deliveryCalculation.value?.distance || 0
})

watch([tipKes, saveTipForNext], () => {
  try {
    if (!saveTipForNext.value) {
      localStorage.removeItem(TIP_STORAGE_KEY)
      return
    }
    localStorage.setItem(
      TIP_STORAGE_KEY,
      JSON.stringify({ tip: tipKes.value, save: true }),
    )
  } catch {
    /* ignore */
  }
})

const orderSummary = computed(() => {
  const lines: string[] = [
    '📦 *Package delivery order*',
    '',
    '*Pickup (where from):*',
    useZoneSelection.value && selectedPickupZone.value 
      ? availableZones.value.find(z => z.id === selectedPickupZone.value)?.name || '—'
      : whereFrom.value.trim() || '—',
    '',
    '*Drop-off (where to):*',
    useZoneSelection.value && selectedDropoffZone.value
      ? availableZones.value.find(z => z.id === selectedDropoffZone.value)?.name || '—'
      : whereTo.value.trim() || '—',
    '',
    `*Sending to someone else:* ${sendingToSomeoneElse.value ? 'Yes' : 'No'}`,
  ]
  if (sendingToSomeoneElse.value) {
    lines.push(
      `*Recipient name:* ${recipientName.value.trim() || '—'}`,
      `*Recipient phone:* ${recipientPhone.value.trim() || '—'}`,
    )
    if (recipientNotes.value.trim()) {
      lines.push(`*Notes for courier:* ${recipientNotes.value.trim()}`)
    }
  }
  if (calculatedServiceCharge.value > 0) {
    lines.push(
      '',
      `*Distance:* ${calculatedDistance.value} km`,
      `*Service Charge:* KSH ${calculatedServiceCharge.value.toLocaleString()}`,
      `*Estimated time:* ${estimatedTime.value} minutes`
    )
  }
  
  lines.push(
    '',
    `*My phone:* ${customerPhone.value.trim() || '—'}`,
    '*Delivery option:* ' + (deliverySpeed.value === 'asap' ? 'As soon as possible' : 'Standard'),
    `*Payment method:* ${paymentMethod.value === 'mpesa' ? 'M-Pesa' : 'Cash'}`,
  )
  if (promoCode.value.trim()) {
    lines.push(`*Promo code:* ${promoCode.value.trim()}`)
  }
  lines.push(
    `*Courier tip:* KSh ${tipKes.value.toFixed(2)}`,
    `*Save tip for next order:* ${saveTipForNext.value ? 'Yes' : 'No'}`,
  )
  return lines.join('\n')
})

const whatsappHref = computed(() => getWhatsAppUrl(orderSummary.value))

const canSubmit = computed(() => {
  const hasLocations = useZoneSelection.value
    ? selectedPickupZone.value && selectedDropoffZone.value
    : whereFrom.value.trim().length > 0 && whereTo.value.trim().length > 0
    
  return (
    hasLocations &&
    customerPhone.value.trim().length >= 9
  )
})
</script>

<template>
  <div class="page">
    <div class="page__inner">
      <RouterLink to="/" class="back">← Back to home</RouterLink>

      <header class="hero">
        <h1 class="hero__title">Package delivery</h1>
        <p class="hero__lead">
          Fill in your delivery details, choose M-Pesa or cash, then send everything to us on WhatsApp in one tap.
        </p>
      </header>

      <section class="card" aria-labelledby="details-heading">
        <h2 id="details-heading" class="card__title">Delivery details</h2>

        <div class="map-placeholder" role="img" aria-label="Map preview placeholder">
          <div class="map-placeholder__grid" aria-hidden="true" />
          <p class="map-placeholder__label">Map preview</p>
          <p class="map-placeholder__hint">Route and pin drop will appear here when connected.</p>
        </div>

        <div class="location-toggle">
          <label class="check">
            <input v-model="useZoneSelection" type="checkbox" class="check__input" />
            <span class="check__text">Choose from Nairobi areas</span>
          </label>
        </div>

        <div v-if="!useZoneSelection" class="fields">
          <label class="field">
            <span class="field__label">Where from?</span>
            <input
              v-model="whereFrom"
              type="text"
              class="field__input"
              placeholder="Building, street, area…"
              autocomplete="street-address"
            />
          </label>
          <label class="field">
            <span class="field__label">Where to?</span>
            <input
              v-model="whereTo"
              type="text"
              class="field__input"
              placeholder="Full drop-off address…"
              autocomplete="shipping street-address"
            />
          </label>
        </div>

        <div v-else class="fields">
          <label class="field">
            <span class="field__label">Pickup area</span>
            <select v-model="selectedPickupZone" class="field__input">
              <option value="">Select pickup area</option>
              <option v-for="zone in availableZones" :key="zone.id" :value="zone.id">
                {{ zone.name }}
              </option>
            </select>
          </label>
          <label class="field">
            <span class="field__label">Drop-off area</span>
            <select v-model="selectedDropoffZone" class="field__input">
              <option value="">Select drop-off area</option>
              <option v-for="zone in availableZones" :key="zone.id" :value="zone.id">
                {{ zone.name }}
              </option>
            </select>
          </label>
        </div>

        <div v-if="useZoneSelection && (selectedPickupZone && selectedDropoffZone)" class="calculation-result">
          <div v-if="isCalculating" class="loading-calc">
            <span>Calculating distance...</span>
          </div>
          <div v-else-if="deliveryCalculation" class="result-details">
            <div class="result-item">
              <span class="result-label">Distance:</span>
              <span class="result-value">{{ calculatedDistance }} km</span>
            </div>
            <div class="result-item">
              <span class="result-label">Service Charge:</span>
              <span class="result-value">KSH {{ calculatedServiceCharge.toLocaleString() }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Est. Time:</span>
              <span class="result-value">{{ estimatedTime }} minutes</span>
            </div>
          </div>
          <div v-else-if="calculationError" class="error-message">
            {{ calculationError }}
          </div>
        </div>

        <div class="recipient-block">
          <label class="check">
            <input v-model="sendingToSomeoneElse" type="checkbox" class="check__input" />
            <span class="check__text">Sending to someone else?</span>
          </label>
          <p class="recipient-block__hint">Add their details to help the courier</p>

          <div v-if="sendingToSomeoneElse" class="fields fields--tight">
            <label class="field">
              <span class="field__label">Their name</span>
              <input v-model="recipientName" type="text" class="field__input" placeholder="Recipient name" />
            </label>
            <label class="field">
              <span class="field__label">Their phone</span>
              <input
                v-model="recipientPhone"
                type="tel"
                class="field__input"
                placeholder="07XX XXX XXX"
                inputmode="tel"
              />
            </label>
            <label class="field">
              <span class="field__label">Notes (optional)</span>
              <textarea
                v-model="recipientNotes"
                class="field__input field__input--area"
                rows="2"
                placeholder="Gate code, landmark, fragile…"
              />
            </label>
          </div>
        </div>

        <label class="field">
          <span class="field__label">Add your phone number</span>
          <input
            v-model="customerPhone"
            type="tel"
            class="field__input"
            placeholder="07XX XXX XXX"
            inputmode="tel"
            autocomplete="tel"
          />
          <span class="field__help">We'll send you a message to validate it</span>
        </label>
      </section>

      <section class="card" aria-labelledby="delivery-opt-heading">
        <h2 id="delivery-opt-heading" class="card__title">Delivery options</h2>
        <fieldset class="segmented" role="radiogroup" aria-label="Delivery speed">
          <label class="seg">
            <input v-model="deliverySpeed" type="radio" value="standard" class="seg__input" />
            <span class="seg__face">Standard</span>
          </label>
          <label class="seg">
            <input v-model="deliverySpeed" type="radio" value="asap" class="seg__input" />
            <span class="seg__face">As soon as possible</span>
          </label>
        </fieldset>
      </section>

      <section class="card" aria-labelledby="pay-heading">
        <h2 id="pay-heading" class="card__title">Payment method</h2>
        <fieldset class="segmented segmented--pay" role="radiogroup" aria-label="Payment method">
          <label class="seg">
            <input v-model="paymentMethod" type="radio" value="mpesa" class="seg__input" />
            <span class="seg__face">M-Pesa</span>
          </label>
          <label class="seg">
            <input v-model="paymentMethod" type="radio" value="cash" class="seg__input" />
            <span class="seg__face">Cash</span>
          </label>
        </fieldset>
      </section>

      <section class="card" aria-labelledby="extras-heading">
        <h2 id="extras-heading" class="card__title visually-hidden">Promo and tip</h2>

        <label class="field">
          <span class="field__label">Got a promo code?</span>
          <input
            v-model="promoCode"
            type="text"
            class="field__input"
            placeholder="Enter code"
            autocapitalize="characters"
          />
        </label>

        <div class="tip-section">
          <p class="tip-section__label" id="tip-label">Courier tip</p>
          <div class="tip-chips" role="group" aria-labelledby="tip-label">
            <button
              v-for="n in TIP_OPTIONS"
              :key="n"
              type="button"
              class="tip-chip"
              :class="{ 'tip-chip--on': tipKes === n }"
              @click="tipKes = n"
            >
              KSh{{ n.toFixed(2) }}
            </button>
          </div>
          <label class="check check--margin">
            <input v-model="saveTipForNext" type="checkbox" class="check__input" />
            <span class="check__text">Save tip for next order</span>
          </label>
        </div>
      </section>

      <div class="cta-wrap">
        <a
          :href="canSubmit ? whatsappHref : '#'"
          class="cta"
          target="_blank"
          rel="noopener noreferrer"
          :class="{ 'cta--disabled': !canSubmit }"
          :tabindex="canSubmit ? 0 : -1"
          @click="!canSubmit && $event.preventDefault()"
        >
          Order on WhatsApp
        </a>
        <p v-if="!canSubmit" class="cta-hint">Add pickup, drop-off, and your phone (at least 9 digits) to continue.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem 1.25rem 4rem;
  background: var(--color-bg);
  min-height: 100%;
}

.page__inner {
  max-width: 560px;
  margin: 0 auto;
}

.back {
  display: inline-block;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-mint);
  margin-bottom: 1.25rem;
}

.back:hover {
  text-decoration: underline;
}

.hero {
  margin-bottom: 1.5rem;
}

.hero__title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.75rem, 4vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero__lead {
  margin: 0;
  color: var(--color-ink-muted);
  line-height: 1.55;
  font-size: 0.95rem;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  padding: 1.35rem 1.25rem 1.5rem;
  margin-bottom: 1rem;
}

.card__title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 800;
}

.map-placeholder {
  position: relative;
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
  background: linear-gradient(145deg, #f4f4f6 0%, #ececf0 100%);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  overflow: hidden;
}

.map-placeholder__grid {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.map-placeholder__label {
  position: relative;
  margin: 0 0 0.35rem;
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--color-ink);
}

.map-placeholder__hint {
  position: relative;
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  max-width: 260px;
  line-height: 1.4;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fields--tight {
  margin-top: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field__label {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-ink);
}

.field__input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 1rem;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-ink);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field__input:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px var(--color-orange-soft);
}

.field__input--area {
  resize: vertical;
  min-height: 4rem;
}

.field__help {
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  line-height: 1.35;
}

.recipient-block {
  margin: 1.25rem 0;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.recipient-block__hint {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--color-ink-muted);
}

.check {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}

.check--margin {
  margin-top: 0.85rem;
}

.check__input {
  margin-top: 0.2rem;
  width: 1.05rem;
  height: 1.05rem;
  accent-color: var(--color-orange);
}

.check__text {
  line-height: 1.35;
}

.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  border: 0;
  margin: 0;
  padding: 0;
}

.segmented--pay {
  grid-template-columns: 1fr 1fr;
}

.seg {
  position: relative;
  margin: 0;
  cursor: pointer;
}

.seg__input {
  position: absolute;
  opacity: 0;
  inset: 0;
  cursor: pointer;
}

.seg__face {
  display: block;
  text-align: center;
  padding: 0.85rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border);
  font-weight: 700;
  font-size: 0.88rem;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.seg__input:focus-visible + .seg__face {
  outline: 2px solid var(--color-orange);
  outline-offset: 2px;
}

.seg__input:checked + .seg__face {
  border-color: var(--color-orange);
  background: var(--color-orange-soft);
  color: var(--color-orange-deep);
}

.tip-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.tip-section__label {
  margin: 0 0 0.65rem;
  font-weight: 700;
  font-size: 0.85rem;
}

.tip-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tip-chip {
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--color-ink);
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.tip-chip:hover {
  border-color: var(--color-orange);
}

.tip-chip--on {
  border-color: var(--color-orange);
  background: var(--color-orange-soft);
  color: var(--color-orange-deep);
}

.cta-wrap {
  margin-top: 1.5rem;
  padding-bottom: 1rem;
}

.cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--color-mint);
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  border: none;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.35);
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.cta:hover:not(.cta--disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.cta--disabled {
  pointer-events: none;
  opacity: 0.45;
  box-shadow: none;
  cursor: not-allowed;
}

.cta-hint {
  margin: 0.65rem 0 0;
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  text-align: center;
}

.location-toggle {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.calculation-result {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(145deg, #f0fdf4, #dcfce7);
  border-radius: var(--radius-md);
  border: 1px solid #bbf7d0;
}

.loading-calc {
  text-align: center;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  font-weight: 600;
  color: var(--color-ink);
  font-size: 0.9rem;
}

.result-value {
  font-weight: 700;
  color: #16a34a;
  font-size: 1rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
}

.field__input:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px var(--color-orange-soft);
}

select.field__input {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
