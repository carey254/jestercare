import { ref } from 'vue'
import { CORE_ZONES, getCoreZoneById } from '../data/nairobiPlaces'

interface DeliveryCalculation {
  distance: number
  deliveryTime: number
  deliveryCharge: number
  serviceFee: number
  riderPayment: number
  pickupLocation?: string
  dropoffLocation?: string
}

const deliveryCalculation = ref<DeliveryCalculation>({
  distance: 0,
  deliveryTime: 0,
  deliveryCharge: 0,
  serviceFee: 0,
  riderPayment: 100
})

const isCalculating = ref(false)

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

// Calculate delivery between two specific locations (for package delivery)
export const calculatePackageDelivery = async (
  pickupLocation: string, 
  dropoffLocation: string
): Promise<DeliveryCalculation> => {
  isCalculating.value = true
  
  try {
    const distance = await calculateDistanceBetweenLocations(pickupLocation, dropoffLocation)
    const deliveryTime = distance <= 1 ? 20 : Math.ceil(distance * 15) // Faster for direct packages
    const deliveryCharge = Math.ceil(distance * 40) // KSH 40 per kilometer
    
    deliveryCalculation.value = {
      distance,
      deliveryTime,
      deliveryCharge,
      serviceFee: 0,
      riderPayment: 100,
      pickupLocation,
      dropoffLocation
    }
    
    return deliveryCalculation.value
  } catch (error) {
    console.error('Error calculating package delivery:', error)
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

// Calculate distance between two Nairobi locations
const calculateDistanceBetweenLocations = async (pickup: string, dropoff: string): Promise<number> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Try to get zones by ID first
  const pickupZone = getCoreZoneById(pickup.toLowerCase())
  const dropoffZone = getCoreZoneById(dropoff.toLowerCase())
  
  if (pickupZone && dropoffZone) {
    // Calculate actual distance between zones using Haversine formula
    return calculateHaversineDistance(
      pickupZone.lat, pickupZone.lon,
      dropoffZone.lat, dropoffZone.lon
    )
  }
  
  // Fallback to simulated distance for other addresses
  const baseDistance = Math.random() * 8 + 1 // 1-9km range
  return Math.round(baseDistance * 10) / 10 // Round to 1 decimal place
}

// Calculate distance between two coordinates using Haversine formula
const calculateHaversineDistance = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
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

// Calculate complete order breakdown
export const calculateOrderBreakdown = (subtotal: number, deliveryCharge: number = 40) => {
  const vat = calculateServiceFee(subtotal)
  const serviceCharge = deliveryCharge
  const total = calculateOrderTotal(subtotal, serviceCharge, vat)
  
  return {
    subtotal,
    vat,
    serviceCharge,
    total
  }
}

// Get available Nairobi locations for package delivery
export const getNairobiLocations = () => {
  return CORE_ZONES.map(zone => ({
    id: zone.id,
    name: zone.label,
    description: `${zone.label} area`
  }))
}

// Calculate package delivery cost between two zones
export const calculatePackageCost = (pickupZone: string, dropoffZone: string): number => {
  const pickup = getCoreZoneById(pickupZone.toLowerCase())
  const dropoff = getCoreZoneById(dropoffZone.toLowerCase())
  
  if (!pickup || !dropoff) {
    return 160 // Default 4km * 40 KSH
  }
  
  const distance = calculateHaversineDistance(
    pickup.lat, pickup.lon,
    dropoff.lat, dropoff.lon
  )
  
  return Math.ceil(distance * 40)
}

// Geocode address to get coordinates and formatted address
export const geocodeAddress = async (address: string): Promise<{
  formattedAddress: string
  latitude: number
  longitude: number
  googleMapsUrl: string
}> => {
  try {
    // Check if address is a known Nairobi zone
    const zone = getCoreZoneById(address.toLowerCase())
    if (zone) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zone.label + ', Nairobi, Kenya')}`
      return {
        formattedAddress: `${zone.label}, Nairobi, Kenya`,
        latitude: zone.lat,
        longitude: zone.lon,
        googleMapsUrl
      }
    }
    
    // For other addresses, simulate geocoding (in production, use Google Maps Geocoding API)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generate mock coordinates for Nairobi area
    const mockLat = -1.2921 + (Math.random() - 0.5) * 0.2
    const mockLon = 36.8219 + (Math.random() - 0.5) * 0.2
    
    const formattedAddress = `${address}, Nairobi, Kenya`
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress)}`
    
    return {
      formattedAddress,
      latitude: mockLat,
      longitude: mockLon,
      googleMapsUrl
    }
  } catch (error) {
    console.error('Geocoding failed:', error)
    throw new Error('Unable to process location')
  }
}

// Get current user location with geocoding
export const getCurrentLocationWithGeocoding = async (): Promise<{
  formattedAddress: string
  latitude: number
  longitude: number
  googleMapsUrl: string
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Reverse geocode to get address (mock implementation)
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Find nearest zone or create a general address
          let nearestZone = null
          let minDistance = Infinity
          
          for (const zone of CORE_ZONES) {
            const distance = calculateHaversineDistance(
              latitude, longitude,
              zone.lat, zone.lon
            )
            if (distance < minDistance) {
              minDistance = distance
              nearestZone = zone
            }
          }
          
          const formattedAddress = nearestZone 
            ? `Near ${nearestZone.label}, Nairobi, Kenya`
            : `Current Location, Nairobi, Kenya`
          
          const googleMapsUrl = `https://www.google.com/maps/@${latitude},${longitude},15z`
          
          resolve({
            formattedAddress,
            latitude,
            longitude,
            googleMapsUrl
          })
        } catch (error) {
          reject(error)
        }
      },
      (error) => {
        reject(new Error('Unable to get your location. Please enter address manually.'))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Generate location sharing link
export const generateLocationLink = (address: string, latitude?: number, longitude?: number): string => {
  if (latitude && longitude) {
    return `https://www.google.com/maps/@${latitude},${longitude},15z`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', Nairobi, Kenya')}`
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

export interface LocationData {
  formattedAddress: string
  latitude: number
  longitude: number
  googleMapsUrl: string
}
