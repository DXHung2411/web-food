import test from 'node:test'
import assert from 'node:assert/strict'
import { DISHES } from '../js/data.js'
import { decodeState, encodeState, makePlan, parseMoney, surviveDays, validate } from '../js/planner.js'

const base = { money: 500000, days: 10, meals: 2, veg: false, cook: true }

test('parseMoney understands common ways young people type money', () => {
  const cases = { '500000': 500000, '500.000': 500000, '1.500.000': 1500000, '500k': 500000, '500K': 500000, '1tr': 1000000, '1,5tr': 1500000, '1.5tr': 1500000, '500.000đ': 500000, '2 triệu': 2000000, '1tr2': 1200000, '2tr05': 2050000 }
  for (const [raw, want] of Object.entries(cases)) assert.equal(parseMoney(raw), want, raw)
  for (const bad of ['', 'abc', '-5', '1e9', '12.34.56', '5 k k', null, undefined, 42]) assert.equal(parseMoney(bad), null, String(bad))
})

test('validate rejects out-of-range input', () => {
  assert.equal(validate(base), null)
  assert.ok(validate({ ...base, money: 0 }))
  assert.ok(validate({ ...base, money: 1e12 }))
  assert.ok(validate({ ...base, days: 0 }))
  assert.ok(validate({ ...base, days: 32 }))
  assert.ok(validate({ ...base, meals: 4 }))
  assert.ok(validate({ ...base, money: 1.5 }))
})

test('plan never exceeds the budget when affordable, and has days*meals slots', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const r = makePlan(DISHES, base, seed)
    assert.equal(r.plan.length, 10)
    assert.ok(r.plan.every((d) => d.meals.length === 2))
    assert.ok(r.total <= base.money, `seed ${seed}`)
    assert.equal(r.shortfall, 0)
    assert.equal(r.total + r.leftover, base.money)
  }
})

test('same seed gives same plan, different seeds vary', () => {
  const ids = (s) => makePlan(DISHES, base, s).plan.flatMap((d) => d.meals.map((m) => m.dish.id)).join()
  assert.equal(ids(7), ids(7))
  assert.notEqual(ids(7), ids(8))
})

test('slot rules: breakfast dishes only at breakfast, no cook dish when cook=false, veg only veg', () => {
  const r = makePlan(DISHES, { ...base, meals: 3, cook: false, veg: false }, 3)
  for (const d of r.plan) for (const m of d.meals) {
    assert.ok(m.dish.meals.includes(m.slot))
    assert.ok(!m.dish.cook)
  }
  const v = makePlan(DISHES, { ...base, meals: 3, veg: true }, 3)
  assert.ok(v.plan.every((d) => d.meals.every((m) => m.dish.veg)))
})

test('variety: no dish repeated back-to-back when budget is generous', () => {
  const r = makePlan(DISHES, { ...base, money: 3000000 }, 5)
  const seq = r.plan.flatMap((d) => d.meals.map((m) => m.dish.id))
  for (let i = 1; i < seq.length; i++) assert.notEqual(seq[i], seq[i - 1])
})

test('too little money: reports shortfall, survival days, never crashes', () => {
  const r = makePlan(DISHES, { money: 50000, days: 10, meals: 3, veg: false, cook: true }, 1)
  assert.ok(r.shortfall > 0)
  assert.equal(r.total - r.shortfall, 50000)
  assert.ok(r.survive >= 0 && r.survive < 10)
  assert.equal(r.tier.title, 'Báo động đỏ')
  assert.equal(surviveDays(DISHES, { money: 1000, meals: 3, veg: false, cook: true }), 0)
})

test('state round-trips through URL hash and rejects tampering', () => {
  const h = encodeState(base, 123)
  assert.deepEqual(decodeState('#' + h), { input: base, seed: 123 })
  for (const bad of ['', '#t=1&d=1', '#t=abc&d=1&n=1&s=1', '#t=500000&d=99&n=2&s=1', '#t=500000&d=10&n=2&s=99999999999', '#t=<script>&d=1&n=1&s=1']) assert.equal(decodeState(bad), null, bad)
})
