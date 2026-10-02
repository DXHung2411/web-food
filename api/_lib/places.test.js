import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { handle, resetState } from './places.js'

const mockEnv = { MOCK_PLACES: '1' }
const get = (qs, extra = {}) => handle({ method: 'GET', url: `/api/places?${qs}`, headers: {}, ip: '1.1.1.1', ...extra }, mockEnv)

beforeEach(resetState)

test('valid dish + city returns cleaned places', async () => {
  const r = await get('dish=pho&city=ha-noi')
  assert.equal(r.status, 200)
  assert.ok(r.body.places.length > 0)
  assert.deepEqual(Object.keys(r.body.places[0]).sort(), ['address', 'id', 'lat', 'lng', 'name', 'price', 'rating', 'ratingCount'])
})

test('rejects unknown dish, unknown city, missing area', async () => {
  assert.equal((await get('dish=<script>&city=ha-noi')).status, 400)
  assert.equal((await get('dish=pho&city=narnia')).status, 400)
  assert.equal((await get('dish=pho')).status, 400)
})

test('rejects coordinates outside Vietnam or malformed', async () => {
  assert.equal((await get('dish=pho&lat=48.85&lng=2.35')).status, 400)
  assert.equal((await get('dish=pho&lat=abc&lng=106')).status, 400)
  assert.equal((await get('dish=pho&lat=1e1&lng=106')).status, 400)
  assert.equal((await get('dish=pho&lat=10.77&lng=106.70')).status, 200)
})

test('only GET, no cross-site, bounded URL length', async () => {
  assert.equal((await handle({ method: 'POST', url: '/api/places?dish=pho&city=ha-noi', headers: {}, ip: 'x' }, mockEnv)).status, 405)
  assert.equal((await get('dish=pho&city=ha-noi', { headers: { 'sec-fetch-site': 'cross-site' } })).status, 403)
  assert.equal((await get(`dish=pho&city=ha-noi&x=${'a'.repeat(400)}`)).status, 414)
})

test('rate limits uncached requests per IP', async () => {
  const dishes = ['pho', 'bun-cha', 'bun-bo', 'banh-mi', 'com-tam', 'lau', 'nuong', 'hai-san', 'an-vat', 'tra-sua', 'ca-phe']
  const cities = ['ha-noi', 'da-nang']
  const statuses = []
  for (const c of cities) for (const d of dishes) statuses.push((await get(`dish=${d}&city=${c}`)).status)
  assert.equal(statuses.slice(0, 20).every((s) => s === 200), true)
  assert.equal(statuses[20], 429)
  assert.equal((await get('dish=pho&city=ha-noi')).status, 200, 'cached result still served')
})

test('fails closed without API key and hides upstream errors', async () => {
  const noKey = await handle({ method: 'GET', url: '/api/places?dish=pho&city=ha-noi', headers: {}, ip: 'a' }, {})
  assert.equal(noKey.status, 500)
  const realFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('secret upstream detail', { status: 403 })
  const r = await handle({ method: 'GET', url: '/api/places?dish=pho&city=ha-noi', headers: {}, ip: 'b' }, { GOOGLE_MAPS_API_KEY: 'k' })
  globalThis.fetch = realFetch
  assert.equal(r.status, 502)
  assert.doesNotMatch(JSON.stringify(r.body), /secret|403/)
})

test('sends fixed field mask and key only to Google', async () => {
  let seen
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    seen = { url, init }
    return Response.json({ places: [{ id: 'abc', displayName: { text: 'X' }, location: { latitude: 10, longitude: 106 }, rating: 4.5, userRatingCount: 3, priceLevel: 'PRICE_LEVEL_MODERATE' }, { id: '../bad', location: { latitude: 1, longitude: 1 } }] })
  }
  const r = await handle({ method: 'GET', url: '/api/places?dish=pho&city=ha-noi', headers: {}, ip: 'c' }, { GOOGLE_MAPS_API_KEY: 'k' })
  globalThis.fetch = realFetch
  assert.equal(seen.url, 'https://places.googleapis.com/v1/places:searchText')
  assert.equal(seen.init.headers['X-Goog-Api-Key'], 'k')
  assert.match(seen.init.headers['X-Goog-FieldMask'], /places\.rating/)
  assert.equal(r.body.places.length, 1, 'malformed place id dropped')
  assert.equal(r.body.places[0].price, 2)
  assert.doesNotMatch(JSON.stringify(r.body), /"k"/)
})
