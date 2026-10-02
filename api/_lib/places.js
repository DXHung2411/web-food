import { CITIES, CITY_RADIUS_M, DISHES, NEAR_RADIUS_M, VN_BOUNDS } from '../../shared/catalog.js'
import { mockPlaces } from './mock.js'

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText'
// Only ask Google for what the UI shows (also keeps billing predictable).
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
].join(',')

const MAX_URL_LENGTH = 300
const RATE_LIMIT = { max: 20, windowMs: 60_000 }
const CACHE = { ttlMs: 6 * 60 * 60 * 1000, maxEntries: 300 }
const PRICE = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

const hits = new Map() // ip -> { count, resetAt }  (per warm instance: a soft limit, see README)
const cache = new Map() // key -> { at, body }

export function resetState() {
  hits.clear()
  cache.clear()
}

function rateLimited(ip, now) {
  if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
  const h = hits.get(ip)
  if (!h || h.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
    return false
  }
  h.count += 1
  return h.count > RATE_LIMIT.max
}

function num(raw, min, max) {
  if (typeof raw !== 'string' || !/^-?\d{1,3}(\.\d{1,6})?$/.test(raw)) return null
  const n = Number(raw)
  return n >= min && n <= max ? n : null
}

function parseQuery(url) {
  const sp = new URL(url, 'http://x').searchParams
  const dish = DISHES.find((d) => d.id === sp.get('dish'))
  if (!dish) return { error: 'Món ăn không hợp lệ' }

  const cityParam = sp.get('city')
  if (cityParam) {
    const city = CITIES.find((c) => c.id === cityParam)
    if (!city) return { error: 'Địa điểm không hợp lệ' }
    return { dish, center: { lat: city.lat, lng: city.lng }, radius: CITY_RADIUS_M, area: city.name }
  }

  const lat = num(sp.get('lat'), VN_BOUNDS.minLat, VN_BOUNDS.maxLat)
  const lng = num(sp.get('lng'), VN_BOUNDS.minLng, VN_BOUNDS.maxLng)
  if (lat === null || lng === null) return { error: 'Thiếu địa điểm hoặc toạ độ không hợp lệ' }
  // ~110 m precision: enough for "near me", better cache hit rate, less personal data.
  const round = (n) => Math.round(n * 1000) / 1000
  return { dish, center: { lat: round(lat), lng: round(lng) }, radius: NEAR_RADIUS_M, area: null }
}

function clean(p) {
  const lat = p?.location?.latitude
  const lng = p?.location?.longitude
  if (typeof p?.id !== 'string' || !/^[\w-]{1,200}$/.test(p.id)) return null
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  return {
    id: p.id,
    name: String(p.displayName?.text ?? '').slice(0, 120),
    address: String(p.formattedAddress ?? '').slice(0, 250),
    lat,
    lng,
    rating: typeof p.rating === 'number' ? p.rating : null,
    ratingCount: Number.isInteger(p.userRatingCount) ? p.userRatingCount : 0,
    price: PRICE[p.priceLevel] ?? null,
  }
}

async function fetchPlaces({ dish, center, radius, area }, env) {
  if (env.MOCK_PLACES === '1') return mockPlaces(dish, center)

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: area ? `${dish.query} ở ${area}` : dish.query,
      languageCode: 'vi',
      regionCode: 'VN',
      pageSize: 20,
      locationBias: {
        circle: { center: { latitude: center.lat, longitude: center.lng }, radius },
      },
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) {
    // Log for the owner, never forward upstream details to the client.
    console.error('places upstream error', res.status)
    throw new Error('upstream')
  }
  const data = await res.json()
  return (data.places ?? []).map(clean).filter(Boolean)
}

/** Framework-free handler: ({ method, url, headers, ip }, env) -> { status, body, cache } */
export async function handle(req, env = process.env, now = Date.now()) {
  if (req.method !== 'GET') return { status: 405, body: { error: 'Method not allowed' } }
  if (req.url.length > MAX_URL_LENGTH) return { status: 414, body: { error: 'Yêu cầu quá dài' } }
  // Browsers always send this; a request coming from another site is not ours.
  if (req.headers['sec-fetch-site'] === 'cross-site') return { status: 403, body: { error: 'Forbidden' } }
  if (env.MOCK_PLACES !== '1' && !env.GOOGLE_MAPS_API_KEY) {
    console.error('GOOGLE_MAPS_API_KEY is not set')
    return { status: 500, body: { error: 'Server chưa được cấu hình' } }
  }

  const q = parseQuery(req.url)
  if (q.error) return { status: 400, body: { error: q.error } }

  const key = `${q.dish.id}|${q.area ?? ''}|${q.center.lat},${q.center.lng}`
  const hit = cache.get(key)
  if (hit && now - hit.at < CACHE.ttlMs) return { status: 200, body: hit.body, cache: true }

  if (rateLimited(req.ip, now)) return { status: 429, body: { error: 'Bạn thao tác nhanh quá, thử lại sau ít phút nhé' } }

  try {
    const places = await fetchPlaces(q, env)
    const body = { center: q.center, places }
    if (cache.size >= CACHE.maxEntries) cache.delete(cache.keys().next().value)
    cache.set(key, { at: now, body })
    return { status: 200, body, cache: true }
  } catch {
    return { status: 502, body: { error: 'Không lấy được dữ liệu quán ăn, thử lại sau nhé' } }
  }
}
