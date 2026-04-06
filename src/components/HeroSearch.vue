<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getWhatsAppUrl } from '../composables/useWhatsApp'
import { CORE_ZONES, getCoreZoneById, NAIROBI_CBD_CENTER } from '../data/nairobiPlaces'
import { haversineKm, isRoughlyNairobi } from '../utils/geo'
import LocationPreviewMap from './LocationPreviewMap.vue'

const selectedZoneId = ref('')
const detailLine = ref('')
const gpsLat = ref<number | null>(null)
const gpsLon = ref<number | null>(null)
const locBanner = ref<{ tone: 'ok' | 'info' | 'warn' | 'err'; text: string } | null>(null)
const locLoading = ref(false)

const mapCenter = computed(() => {
  if (selectedZoneId.value === 'other') {
    return { lat: NAIROBI_CBD_CENTER.lat, lon: NAIROBI_CBD_CENTER.lon }
  }
  const z = getCoreZoneById(selectedZoneId.value)
  return z ? { lat: z.lat, lon: z.lon } : { lat: NAIROBI_CBD_CENTER.lat, lon: NAIROBI_CBD_CENTER.lon }
})

const deliverySummary = computed(() => {
  if (!selectedZoneId.value) return ''
  const zone = selectedZoneId.value === 'other' ? 'Nairobi' : getCoreZoneById(selectedZoneId.value)?.label ?? ''
  const extra = detailLine.value.trim()
  return extra ? `${zone} — ${extra}` : zone
})

const whatsappHref = computed(() =>
  getWhatsAppUrl(
    deliverySummary.value
      ? `Hi Jester — Delivery area: ${deliverySummary.value}. I'd like to order.`
      : undefined,
  ),
)

watch(selectedZoneId, () => {
  gpsLat.value = null
  gpsLon.value = null
  locBanner.value = null
})

function requestLiveLocation() {
  if (!selectedZoneId.value) {
    locBanner.value = { tone: 'err', text: 'Choose an area from the list first.' }
    return
  }
  if (!navigator.geolocation) {
    locBanner.value = { tone: 'err', text: 'Location is not available in this browser.' }
    return
  }
  locLoading.value = true
  locBanner.value = { tone: 'info', text: 'Reading your live GPS position…' }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locLoading.value = false
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      gpsLat.value = lat
      gpsLon.value = lon

      if (selectedZoneId.value === 'other') {
        if (!isRoughlyNairobi(lat, lon)) {
          locBanner.value = {
            tone: 'warn',
            text: 'GPS looks outside greater Nairobi. Add details below or contact us to confirm.',
          }
          return
        }
        locBanner.value = {
          tone: 'ok',
          text: 'Live location captured. Add a building or gate name if needed, then continue.',
        }
        return
      }

      const zone = getCoreZoneById(selectedZoneId.value)
      if (!zone) return
      const dist = haversineKm(lat, lon, zone.lat, zone.lon)
      const slack = zone.radiusKm * 1.35
      if (dist <= slack) {
        locBanner.value = {
          tone: 'ok',
          text: 'Live location matches your selected area. Add a gate or landmark if you like.',
        }
      } else {
        locBanner.value = {
          tone: 'warn',
          text: 'GPS is a bit far from the area you picked. Adjust the dropdown or add your exact address below.',
        }
      }
    },
    (err) => {
      locLoading.value = false
      gpsLat.value = null
      gpsLon.value = null
      if (err.code === 1) {
        locBanner.value = {
          tone: 'err',
          text: 'Location permission blocked. Allow location in your browser, or describe your drop-off below.',
        }
      } else {
        locBanner.value = { tone: 'err', text: 'Could not read GPS. Try again or add your address manually.' }
      }
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  )
}

function submit() {
  if (!selectedZoneId.value) {
    locBanner.value = { tone: 'err', text: 'Select your delivery area to continue.' }
    return
  }
  window.dispatchEvent(
    new CustomEvent('jester:search', {
      detail: {
        zoneId: selectedZoneId.value,
        summary: deliverySummary.value,
        detail: detailLine.value.trim(),
        gps:
          gpsLat.value != null && gpsLon.value != null
            ? { lat: gpsLat.value, lon: gpsLon.value }
            : null,
      },
    }),
  )
  locBanner.value = {
    tone: 'info',
    text: 'Area saved for checkout. Next: connect this to your Laravel API.',
  }
}
</script>

<template>
  <section id="delivery-area" class="explore" aria-labelledby="explore-heading">
    <p class="explore__hint">Choose your delivery area, then confirm with live location on the map</p>

    <div class="field">
      <label class="field__label" for="zone-select">Delivery area</label>
      <div class="select-wrap">
        <select id="zone-select" v-model="selectedZoneId" class="select">
          <option value="" disabled>Select an area…</option>
          <option v-for="z in CORE_ZONES" :key="z.id" :value="z.id">{{ z.label }}</option>
          <option value="other">Other Nairobi</option>
        </select>
      </div>
    </div>

    <div v-if="selectedZoneId" class="map-panel">
      <p class="map-panel__hint">
        Map centres on your selection. The shaded circle is approximate coverage — tap below to drop your live GPS pin.
      </p>
      <LocationPreviewMap
        :center-lat="mapCenter.lat"
        :center-lon="mapCenter.lon"
        :gps-lat="gpsLat"
        :gps-lon="gpsLon"
      />
      <button type="button" class="gps-btn" :disabled="locLoading" @click="requestLiveLocation">
        {{ locLoading ? 'Getting location…' : 'Use live location' }}
      </button>
    </div>

    <div v-if="selectedZoneId" class="field field--detail">
      <label class="field__label" for="detail">Building, gate or landmark <span class="optional">optional</span></label>
      <input
        id="detail"
        v-model="detailLine"
        type="text"
        class="detail-input"
        placeholder="e.g. Apartment name, gate colour, shop front"
        autocomplete="address-line2"
      />
    </div>

    <form class="continue-row" @submit.prevent="submit">
      <button type="submit" class="continue-btn" :disabled="!selectedZoneId">Continue</button>
    </form>

    <p
      v-if="locBanner"
      class="loc-banner"
      :class="{
        'loc-banner--ok': locBanner.tone === 'ok',
        'loc-banner--info': locBanner.tone === 'info',
        'loc-banner--warn': locBanner.tone === 'warn',
        'loc-banner--err': locBanner.tone === 'err',
      }"
    >
      {{ locBanner.text }}
    </p>

    <div class="wa-row">
      
    </div>

    <h1 id="explore-heading" class="explore__title">What We Offer</h1>
  </section>
</template>

<style scoped>
.explore {
  max-width: 560px;
  margin: 0 auto;
  padding: 2rem 1.25rem 1rem;
}

.explore__hint {
  margin: 0 0 1.25rem;
  font-size: 0.95rem;
  color: var(--color-ink-muted);
  font-weight: 500;
  text-align: center;
  line-height: 1.45;
}

.field {
  margin-bottom: 1rem;
}

.field__label {
  display: block;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-muted);
  margin-bottom: 0.45rem;
}

.optional {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  color: #9ca3af;
}

.select-wrap {
  position: relative;
}

.select {
  width: 100%;
  appearance: none;
  padding: 0.9rem 2.75rem 0.9rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--color-ink);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%235c5c66' stroke-width='2'%3E%3Cpath d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
}

.select:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.map-panel {
  margin-bottom: 1rem;
}

.map-panel__hint {
  margin: 0 0 0.65rem;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--color-ink-muted);
}

.gps-btn {
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-ink);
  color: #fff;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.gps-btn:hover:not(:disabled) {
  opacity: 0.92;
}

.gps-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.field--detail {
  margin-bottom: 1rem;
}

.detail-input {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 500;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.detail-input:focus {
  outline: none;
  border-color: var(--color-orange);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.12);
}

.detail-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.continue-row {
  margin-bottom: 1rem;
}

.continue-btn {
  width: 100%;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-orange);
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
}

.continue-btn:hover:not(:disabled) {
  background: var(--color-orange-hover);
}

.continue-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.loc-banner {
  margin: 0 0 1rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  line-height: 1.45;
  font-weight: 600;
}

.loc-banner--ok {
  background: var(--color-mint-soft);
  color: #166534;
  border: 1px solid rgba(22, 163, 74, 0.25);
}

.loc-banner--info {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.loc-banner--warn {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.loc-banner--err {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.wa-row {
  margin-bottom: 2rem;
  text-align: center;
}

.wa-row__link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #128c7e;
}

.wa-row__link:hover {
  text-decoration: underline;
}

.wa-row__icon {
  width: 18px;
  height: 18px;
}

.explore__title {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  text-align: center;
}
</style>
