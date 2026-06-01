/**
 * Geoapify Geocoding API client.
 * Free tier: 3,000 credits/day (no credit card required).
 * Get your key at: https://www.geoapify.com/
 *
 * Can be swapped for Google Places / Mapbox later by replacing
 * the fetch calls below.
 */

const API_KEY = ((import.meta as any).env?.VITE_GEOAPIFY_API_KEY as string) || ''
const BASE_URL = 'https://api.geoapify.com/v1/geocode'

export interface GeoapifyAddress {
  formatted: string
  street: string
  housenumber?: string
  postcode: string
  city: string
  country: string
  lat: number
  lon: number
}

export interface RouteResult {
  distanceMeters: number
  durationSeconds: number
}

/**
 * Autocomplete addresses as the user types.
 * Filters to Austria + Germany by default.
 */
export async function autocompleteAddresses(query: string): Promise<GeoapifyAddress[]> {
  if (!API_KEY) {
    console.warn('[Geoapify] No API key configured. Set VITE_GEOAPIFY_API_KEY in your .env')
    return []
  }
  if (!query || query.length < 2) return []

  const url = new URL(`${BASE_URL}/autocomplete`)
  url.searchParams.set('text', query)
  url.searchParams.set('apiKey', API_KEY)
  url.searchParams.set('lang', 'de')
  url.searchParams.set('limit', '6')
  url.searchParams.set('filter', 'countrycode:at,de')
  url.searchParams.set('bias', 'countrycode:at,de')

  const res = await fetch(url.toString())
  if (!res.ok) {
    console.error('[Geoapify] autocomplete error', res.status)
    return []
  }
  const data = await res.json()

  return (data.features || []).map((f: any) => ({
    formatted: f.properties.formatted,
    street: f.properties.street || '',
    housenumber: f.properties.housenumber,
    postcode: f.properties.postcode || '',
    city: f.properties.city || f.properties.municipality || '',
    country: f.properties.country || '',
    lat: f.properties.lat,
    lon: f.properties.lon,
  }))
}

/**
 * Calculate driving distance between two coordinates.
 */
export async function calculateRoute(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): Promise<RouteResult | null> {
  if (!API_KEY) return null

  const url = new URL('https://api.geoapify.com/v1/routing')
  url.searchParams.set('waypoints', `${from.lat},${from.lon}|${to.lat},${to.lon}`)
  url.searchParams.set('mode', 'drive')
  url.searchParams.set('apiKey', API_KEY)

  const res = await fetch(url.toString())
  if (!res.ok) {
    console.error('[Geoapify] routing error', res.status)
    return null
  }
  const data = await res.json()
  const leg = data.features?.[0]?.properties?.legs?.[0]
  if (!leg) return null

  return {
    distanceMeters: leg.distance,
    durationSeconds: leg.time,
  }
}
