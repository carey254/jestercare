import { CORE_ZONES, NAIROBI_BOUNDS, type CoreZone } from '../data/nairobiPlaces'

const EARTH_KM = 6371

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rLat = (lat2 - lat1) * (Math.PI / 180)
  const rLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(rLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(rLon / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function isRoughlyNairobi(lat: number, lon: number): boolean {
  return (
    lat >= NAIROBI_BOUNDS.minLat &&
    lat <= NAIROBI_BOUNDS.maxLat &&
    lon >= NAIROBI_BOUNDS.minLon &&
    lon <= NAIROBI_BOUNDS.maxLon
  )
}

export function findNearestCoreZone(lat: number, lon: number): { zone: CoreZone; distKm: number } | null {
  let best: { zone: CoreZone; distKm: number } | null = null
  for (const zone of CORE_ZONES) {
    const distKm = haversineKm(lat, lon, zone.lat, zone.lon)
    if (!best || distKm < best.distKm) {
      best = { zone, distKm }
    }
  }
  return best
}

export function matchCoreServiceArea(lat: number, lon: number): CoreZone | null {
  const nearest = findNearestCoreZone(lat, lon)
  if (!nearest) return null
  if (nearest.distKm <= nearest.zone.radiusKm) return nearest.zone
  return null
}
