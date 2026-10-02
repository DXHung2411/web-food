import test from 'node:test'
import assert from 'node:assert/strict'
import { DATE_IDEAS, DATE_TIPS, PRICE_BUCKETS, inBucket } from '../js/dates.js'
import { SOURCES } from '../js/sources.js'
import { DISHES } from '../js/data.js'

test('date ideas: well-formed, each with advice, wide price range', () => {
  const ids = new Set()
  assert.ok(DATE_IDEAS.length >= 8)
  for (const d of DATE_IDEAS) {
    assert.ok(!ids.has(d.id), `duplicate ${d.id}`)
    ids.add(d.id)
    assert.match(d.id, /^[a-z0-9-]+$/)
    assert.ok(d.name.length > 3)
    assert.ok(Number.isInteger(d.min) && Number.isInteger(d.max) && d.min >= 0 && d.min <= d.max, d.id)
    assert.ok(d.advice.length >= 80, `${d.id} advice too short`)
    assert.ok(d.examples.length >= 1 && d.examples.every((e) => e.name && e.city), d.id)
  }
  assert.ok(DATE_IDEAS.some((d) => d.max <= 200000), 'has an affordable option')
  assert.ok(DATE_IDEAS.some((d) => d.min >= 2000000), 'has a high-end option')
  assert.ok(DATE_TIPS.length >= 3)
})

test('price buckets: every idea falls in at least one bucket, "all" shows everything', () => {
  const all = PRICE_BUCKETS.find((b) => b.id === 'all')
  assert.equal(DATE_IDEAS.filter((d) => inBucket(d, all)).length, DATE_IDEAS.length)
  for (const d of DATE_IDEAS) assert.ok(PRICE_BUCKETS.filter((b) => b.id !== 'all').some((b) => inBucket(d, b)), d.id)
  for (const b of PRICE_BUCKETS.filter((x) => x.id !== 'all')) assert.ok(DATE_IDEAS.some((d) => inBucket(d, b)), `empty bucket ${b.id}`)
})

test('sources: https links only', () => {
  assert.ok(SOURCES.length >= 8)
  for (const s of SOURCES) {
    assert.ok(s.label.length > 5)
    assert.equal(new URL(s.url).protocol, 'https:')
  }
})

test('dish catalogue: unique ids, sane prices, covers every meal slot, plenty of dishes', () => {
  const ids = new Set()
  for (const d of DISHES) {
    assert.ok(!ids.has(d.id), `duplicate ${d.id}`)
    ids.add(d.id)
    assert.ok(Number.isInteger(d.price) && d.price >= 5000 && d.price <= 80000, `${d.id} price ${d.price}`)
    assert.ok(d.meals.length >= 1 && d.meals.every((m) => ['sang', 'trua', 'toi'].includes(m)))
  }
  assert.ok(DISHES.length >= 45)
  for (const slot of ['sang', 'trua', 'toi']) assert.ok(DISHES.filter((d) => d.meals.includes(slot)).length >= 15, slot)
})
