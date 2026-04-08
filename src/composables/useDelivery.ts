import { ref } from 'vue'

interface DeliveryCalculation {
  distance: number
  deliveryTime: number
  deliveryCharge: number
  serviceFee: number
  riderPayment: number
}

export type ServiceArea =
  | 'Kilimani'
  | 'Westlands'
  | 'Lavington'
  | "Lang'ata"
  | 'Kileleshwa'

export interface StoreLocation {
  id: string
  brand: string
  displayName: string
  area: ServiceArea
  pickupAddress: string
  lat: number
  lng: number
}

export const SERVICE_AREAS: readonly ServiceArea[] = [
  'Kilimani',
  'Westlands',
  'Lavington',
  "Lang'ata",
  'Kileleshwa',
] as const

const deliveryCalculation = ref<DeliveryCalculation>({
  distance: 0,
  deliveryTime: 0,
  deliveryCharge: 0,
  serviceFee: 0,
  riderPayment: 100
})

const isCalculating = ref(false)

const STORE_LOCATIONS: StoreLocation[] = [
  // Quickmart
  {
    id: 'quickmart-kilimani-yaya',
    brand: 'Quickmart',
    displayName: 'Quickmart - Kilimani (Yaya)',
    area: 'Kilimani',
    pickupAddress: 'Yaya Centre, Argwings Kodhek Rd, Kilimani, Nairobi'
    ,
    lat: -1.2992,
    lng: 36.7843
  },
  {
    id: 'quickmart-westlands-sarit',
    brand: 'Quickmart',
    displayName: 'Quickmart - Westlands (Sarit)',
    area: 'Westlands',
    pickupAddress: 'Sarit Centre, Karuna Rd, Westlands, Nairobi'
    ,
    lat: -1.2587,
    lng: 36.8045
  },
  {
    id: 'quickmart-lavington-junction',
    brand: 'Quickmart',
    displayName: 'Quickmart - Lavington (Junction)',
    area: 'Lavington',
    pickupAddress: 'The Junction Mall, Ngong Rd, Nairobi'
    ,
    lat: -1.2990,
    lng: 36.7633
  },
  {
    id: 'quickmart-kileleshwa',
    brand: 'Quickmart',
    displayName: 'Quickmart - Kileleshwa',
    area: 'Kileleshwa',
    pickupAddress: 'Kileleshwa, Nairobi (nearest Quickmart branch)'
    ,
    lat: -1.2829,
    lng: 36.7808
  },
  // Naivas
  {
    id: 'naivas-kilimani-prestige',
    brand: 'Naivas',
    displayName: 'Naivas - Kilimani (Prestige)',
    area: 'Kilimani',
    pickupAddress: 'Prestige Plaza, Ngong Rd, Kilimani, Nairobi'
    ,
    lat: -1.2979,
    lng: 36.7847
  },
  {
    id: 'naivas-westlands',
    brand: 'Naivas',
    displayName: 'Naivas - Westlands',
    area: 'Westlands',
    pickupAddress: 'Westlands, Nairobi (nearest Naivas branch)'
    ,
    lat: -1.2647,
    lng: 36.8035
  },
  {
    id: 'naivas-lavington',
    brand: 'Naivas',
    displayName: 'Naivas - Lavington',
    area: 'Lavington',
    pickupAddress: 'Lavington, Nairobi (nearest Naivas branch)'
    ,
    lat: -1.2897,
    lng: 36.7682
  },
  {
    id: "naivas-langata",
    brand: 'Naivas',
    displayName: "Naivas - Lang'ata",
    area: "Lang'ata",
    pickupAddress: "Lang'ata, Nairobi (nearest Naivas branch)"
    ,
    lat: -1.3426,
    lng: 36.7676
  },
  {
    id: 'naivas-kileleshwa',
    brand: 'Naivas',
    displayName: 'Naivas - Kileleshwa',
    area: 'Kileleshwa',
    pickupAddress: 'Kileleshwa, Nairobi (nearest Naivas branch)'
    ,
    lat: -1.2829,
    lng: 36.7808
  },
  // Carrefour
  {
    id: 'carrefour-westlands-sarit',
    brand: 'Carrefour',
    displayName: 'Carrefour - Westlands (Sarit)',
    area: 'Westlands',
    pickupAddress: 'Sarit Centre, Karuna Rd, Westlands, Nairobi'
    ,
    lat: -1.2587,
    lng: 36.8045
  },
  {
    id: 'carrefour-kilimani-yaya',
    brand: 'Carrefour',
    displayName: 'Carrefour - Kilimani (Yaya)',
    area: 'Kilimani',
    pickupAddress: 'Yaya Centre, Argwings Kodhek Rd, Kilimani, Nairobi'
    ,
    lat: -1.2992,
    lng: 36.7843
  },
  {
    id: 'greens-kileleshwa',
    brand: 'Greens',
    displayName: 'Greens - Kileleshwa',
    area: 'Kileleshwa',
    pickupAddress: 'Kileleshwa, Nairobi (nearest Greens store)'
    ,
    lat: -1.2829,
    lng: 36.7808
  }
]

const normalize = (v: string) => v.trim().toLowerCase()

export const inferAreaFromAddress = (address: string): ServiceArea | null => {
  const a = normalize(address)
  if (!a) return null

  const matchers: Array<[ServiceArea, (s: string) => boolean]> = [
    ['Kilimani', (s) => s.includes('kilimani') || s.includes('yaya') || s.includes('argwings')],
    ['Westlands', (s) => s.includes('westlands') || s.includes('sarit') || s.includes('karuna') || s.includes('parklands')],
    ['Lavington', (s) => s.includes('lavington') || s.includes('junction') || s.includes('gitanga')],
    ["Lang'ata", (s) => s.includes("lang'ata") || s.includes('langata') || s.includes('bomas') || s.includes('galleria')],
    ['Kileleshwa', (s) => s.includes('kileleshwa') || s.includes('arboretum')],
  ]

  for (const [area, fn] of matchers) {
    if (fn(a)) return area
  }
  return null
}

export const searchStoreLocations = (query: string, area: ServiceArea | null): StoreLocation[] => {
  const q = normalize(query)
  if (!q) return []

  const inArea = area ? STORE_LOCATIONS.filter((s) => s.area === area) : STORE_LOCATIONS
  const scored = inArea
    .map((s) => {
      const hay = `${s.brand} ${s.displayName} ${s.pickupAddress} ${s.area}`.toLowerCase()
      const startsBrand = s.brand.toLowerCase().startsWith(q) ? 2 : 0
      const startsName = s.displayName.toLowerCase().startsWith(q) ? 2 : 0
      const includes = hay.includes(q) ? 1 : 0
      return { s, score: startsBrand + startsName + includes }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.s.displayName.localeCompare(b.s.displayName))
    .map((x) => x.s)

  return scored
}

export type LatLng = { lat: number; lng: number }

export const parseGoogleMapsLatLng = (value: string): LatLng | null => {
  const raw = value.trim()
  if (!raw) return null

  // Accept:
  // - https://www.google.com/maps?q=lat,lng
  // - https://maps.google.com/?q=lat,lng
  // - "lat,lng"
  const direct = raw.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
  if (direct) {
    const lat = Number(direct[1])
    const lng = Number(direct[2])
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  try {
    const url = new URL(raw)
    const q = url.searchParams.get('q') || url.searchParams.get('query')
    if (q) {
      const m = q.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
      if (m) {
        const lat = Number(m[1])
        const lng = Number(m[2])
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
      }
    }
  } catch {
    // ignore non-URL inputs
  }

  return null
}

const toRad = (deg: number) => (deg * Math.PI) / 180

export const getDistanceKm = (a: LatLng, b: LatLng): number => {
  const R = 6371 // km
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return R * c
}

export const calculateDeliveryFromPickupToDropoff = (pickup: LatLng, dropoff: LatLng): DeliveryCalculation => {
  const BASE_FEE_PER_KM = 40
  const BASE_MIN_KM = 1

  const distance = getDistanceKm(pickup, dropoff)
  const safeDistance = Number.isFinite(distance) && distance > 0 ? distance : 0
  const roundedUpKm = Math.max(BASE_MIN_KM, Math.ceil(safeDistance))

  // Pricing rule: minimum KSh 40 for <= 1km, then +KSh 40 per extra km
  // (This equals ceil(km) * 40, but we keep it explicit to avoid regressions.)
  const deliveryCharge = Math.max(BASE_FEE_PER_KM, roundedUpKm * BASE_FEE_PER_KM)
  const deliveryTime = roundedUpKm <= 1 ? 20 : roundedUpKm * 20

  return {
    distance: safeDistance,
    deliveryTime,
    deliveryCharge,
    serviceFee: 0,
    riderPayment: 100
  }
}

// Calculate delivery based on distance in kilometers
export const calculateDelivery = async (customerAddress: string): Promise<DeliveryCalculation> => {
  isCalculating.value = true
  
  try {
    // For demonstration, we'll simulate distance calculation
    // In a real app, you would use a geocoding API like Google Maps or similar
    const simulatedDistance = await simulateDistanceCalculation(customerAddress)
    
    const deliveryTime = simulatedDistance <= 1 ? 20 : Math.ceil(simulatedDistance * 20)
    const deliveryCharge = simulatedDistance <= 1 ? 40 : Math.ceil(simulatedDistance * 40)
    
    deliveryCalculation.value = {
      distance: simulatedDistance,
      deliveryTime,
      deliveryCharge,
      serviceFee: 0, // Will be calculated based on order total
      riderPayment: 100
    }
    
    return deliveryCalculation.value
  } catch (error) {
    console.error('Error calculating delivery:', error)
    throw error
  } finally {
    isCalculating.value = false
  }
}

// Simulate distance calculation (replace with real API call)
const simulateDistanceCalculation = async (_address: string): Promise<number> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // For demo purposes, return a random distance between 0.5km and 5km
  // In production, this would use actual geocoding
  return Math.random() * 4.5 + 0.5
}

// Calculate service fee (13% of order total)
export const calculateServiceFee = (orderTotal: number): number => {
  return Math.round(orderTotal * 0.13)
}

// Calculate total with all fees
export const calculateOrderTotal = (
  subtotal: number,
  deliveryCharge: number,
  serviceFee: number
): number => {
  return subtotal + deliveryCharge + serviceFee
}

// Get delivery time estimate message
export const getDeliveryTimeMessage = (distance: number): string => {
  if (distance <= 1) {
    return 'Estimated delivery time: 20 minutes'
  }
  const estimatedMinutes = Math.ceil(distance * 20)
  return `Estimated delivery time: ${estimatedMinutes} minutes`
}


export {
  deliveryCalculation,
  isCalculating
}

export type { DeliveryCalculation }
