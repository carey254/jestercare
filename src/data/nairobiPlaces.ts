/** Approximate zone centres for map focus + GPS checks (not shown as a public list on the site). */
export interface CoreZone {
  id: string
  label: string
  lat: number
  lon: number
  radiusKm: number
}

export const CORE_ZONES: CoreZone[] = [
  { id: 'kilimani', label: 'Kilimani', lat: -1.2924, lon: 36.7878, radiusKm: 3.2 },
  { id: 'westlands', label: 'Westlands', lat: -1.2678, lon: 36.8112, radiusKm: 3.5 },
  { id: 'lavington', label: 'Lavington', lat: -1.2815, lon: 36.768, radiusKm: 3 },
  { id: 'langata', label: 'Langata', lat: -1.334, lon: 36.728, radiusKm: 4 },
  { id: 'kileleshwa', label: 'Kileleshwa', lat: -1.2775, lon: 36.7895, radiusKm: 2.8 },
]

export function getCoreZoneById(id: string): CoreZone | undefined {
  return CORE_ZONES.find((z) => z.id === id)
}

/** City centre — used when the user picks “Other Nairobi” on the map. */
export const NAIROBI_CBD_CENTER = { lat: -1.286389, lon: 36.817223 }

/** Rough bounding box: greater Nairobi (for “are you in town?” checks). */
export const NAIROBI_BOUNDS = {
  minLat: -1.48,
  maxLat: -1.12,
  minLon: 36.62,
  maxLon: 37.12,
}
