<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { haversineKm } from '../utils/geo'

const props = defineProps<{
  centerLat: number
  centerLon: number
  gpsLat: number | null
  gpsLon: number | null
}>()

const host = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let zoneCircle: L.Circle | null = null
let gpsDot: L.CircleMarker | null = null

function redrawGps() {
  if (!map) return
  if (gpsDot) {
    map.removeLayer(gpsDot)
    gpsDot = null
  }
  if (props.gpsLat != null && props.gpsLon != null) {
    gpsDot = L.circleMarker([props.gpsLat, props.gpsLon], {
      radius: 9,
      fillColor: '#16a34a',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1,
    }).addTo(map)
    const d = haversineKm(props.centerLat, props.centerLon, props.gpsLat, props.gpsLon)
    if (d < 0.15) {
      map.setView([props.gpsLat, props.gpsLon], 16)
    } else {
      const b = L.latLngBounds(
        [props.centerLat, props.centerLon],
        [props.gpsLat, props.gpsLon],
      )
      map.fitBounds(b.pad(0.25), { maxZoom: 16, animate: true })
    }
  } else {
    map.setView([props.centerLat, props.centerLon], 14)
  }
}

onMounted(() => {
  if (!host.value) return
  map = L.map(host.value, { scrollWheelZoom: false }).setView([props.centerLat, props.centerLon], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)
  zoneCircle = L.circle([props.centerLat, props.centerLon], {
    radius: 950,
    color: '#ff6b35',
    weight: 2,
    fillColor: '#ff6b35',
    fillOpacity: 0.07,
  }).addTo(map)
  redrawGps()
})

watch(
  () => [props.centerLat, props.centerLon],
  () => {
    if (!map || !zoneCircle) return
    map.setView([props.centerLat, props.centerLon], 14)
    zoneCircle.setLatLng([props.centerLat, props.centerLon])
    if (props.gpsLat == null) {
      redrawGps()
    }
  },
)

watch(
  () => [props.gpsLat, props.gpsLon],
  () => redrawGps(),
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
  zoneCircle = null
  gpsDot = null
})
</script>

<template>
  <div ref="host" class="map" role="img" aria-label="Map preview for selected delivery area" />
</template>

<style scoped>
.map {
  width: 100%;
  height: 260px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  z-index: 0;
}

@media (min-width: 640px) {
  .map {
    height: 300px;
  }
}
</style>
