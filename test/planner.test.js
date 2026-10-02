import test from 'node:test'
import assert from 'node:assert/strict'
import { DISHES } from '../js/data.js'
import { RECIPES, recipeCost } from '../js/recipes.js'
import { decodeState, encodeState, makePlan, mulberry32, parseMoney, surviveDays, validate } from '../js/planner.js'

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

test('too little money: only plans days it can pay for, never exceeds budget', () => {
  // ca người dùng báo lỗi: 200k, 15 ngày, 3 bữa
  const r = makePlan(DISHES, { money: 200000, days: 15, meals: 3, veg: false, cook: true }, 1)
  assert.ok(r.coveredDays < 15 && r.coveredDays > 0)
  assert.equal(r.plan.length, r.coveredDays)
  assert.ok(r.total <= 200000)
  assert.equal(r.total + r.leftover, 200000)
  assert.equal(r.coveredDays, surviveDays(DISHES, { money: 200000, meals: 3, veg: false, cook: true }))
  assert.equal(r.shortfall, r.needed - 200000)
  assert.ok(r.shortfall > 0)
  assert.equal(r.tier.title, 'Báo động đỏ')
  const none = makePlan(DISHES, { money: 1000, days: 5, meals: 3, veg: false, cook: true }, 1)
  assert.equal(none.coveredDays, 0)
  assert.equal(none.plan.length, 0)
})

test('property: total never exceeds money for any input/seed', () => {
  const rnd = mulberry32(42)
  for (let i = 0; i < 3000; i++) {
    const input = {
      money: 1000 + Math.floor(rnd() * 3_000_000),
      days: 1 + Math.floor(rnd() * 31),
      meals: 1 + Math.floor(rnd() * 3),
      cook: rnd() < 0.7,
      eatOut: rnd() < 0.7,
      veg: rnd() < 0.3,
    }
    if (!input.cook && !input.eatOut) input.eatOut = true
    let r
    try { r = makePlan(DISHES, input, Math.floor(rnd() * 4294967295)) } catch (e) { assert.ok(e instanceof RangeError); continue }
    assert.ok(r.total <= input.money, JSON.stringify(input))
    assert.equal(r.total + r.leftover, input.money)
    assert.ok(r.coveredDays <= input.days)
    if (r.coveredDays < input.days) assert.ok(r.leftover < r.needed / input.days)
  }
})

test('state round-trips through URL hash and rejects tampering', () => {
  const h = encodeState(base, 123)
  assert.deepEqual(decodeState('#' + h), { input: { ...base, eatOut: true }, seed: 123 })
  for (const bad of ['', '#t=1&d=1', '#t=abc&d=1&n=1&s=1', '#t=500000&d=99&n=2&s=1', '#t=500000&d=10&n=2&s=99999999999', '#t=<script>&d=1&n=1&s=1']) assert.equal(decodeState(bad), null, bad)
})

test('cook / eatOut options: each restricts the pool, both off is rejected', () => {
  const dishesOf = (flags) => makePlan(DISHES, { ...base, money: 600000, meals: 3, ...flags }, 4).plan.flatMap((d) => d.meals.map((m) => m.dish))
  assert.ok(dishesOf({ cook: true, eatOut: false }).every((d) => d.cook))
  assert.ok(dishesOf({ cook: false, eatOut: true }).every((d) => !d.cook))
  const both = new Set()
  for (let seed = 1; seed <= 30; seed++) for (const d of makePlan(DISHES, { ...base, money: 600000, meals: 3 }, seed).plan.flatMap((x) => x.meals)) both.add(Boolean(d.dish.cook))
  assert.deepEqual([...both].sort(), [false, true], 'with both on, plans mix home-cooked and eating out')
  assert.ok(validate({ ...base, cook: false, eatOut: false }))
  assert.throws(() => makePlan(DISHES, { ...base, cook: false, eatOut: false }, 1), RangeError)
  // chay + chỉ tự nấu: không có món sáng chay tự nấu -> báo lỗi rõ ràng, không bị treo
  assert.throws(() => makePlan(DISHES, { ...base, meals: 3, veg: true, eatOut: false }, 1), RangeError)
})

test('old share links still decode (cook/eatOut defaults); eatOut=false round-trips', () => {
  assert.deepEqual(decodeState('#t=500000&d=10&n=2&c=1&v=0&s=5'), { input: { ...base, eatOut: true }, seed: 5 })
  assert.deepEqual(decodeState('#t=500000&d=10&n=2&c=0&v=0&s=5').input, { ...base, cook: false, eatOut: true })
  assert.equal(decodeState('#t=500000&d=10&n=2&c=0&v=0&o=0&s=5'), null, 'both off is invalid')
  const input = { ...base, cook: true, eatOut: false }
  assert.deepEqual(decodeState('#' + encodeState(input, 7)), { input, seed: 7 })
})

test('recipes: consistent, simple and cheap; planner dishes derive from them', () => {
  const ids = new Set()
  for (const r of RECIPES) {
    assert.ok(!ids.has(r.id), `duplicate ${r.id}`)
    ids.add(r.id)
    assert.match(r.id, /^[a-z0-9-]+$/)
    assert.ok(r.ingredients.length >= 2 && r.steps.length >= 3 && r.steps.length <= 6, r.id)
    assert.ok(recipeCost(r) > 0 && recipeCost(r) <= 30000, `${r.id} cost`)
    assert.ok(r.minutes <= 60, r.id)
    if (r.veg) assert.ok(!/trứng|thịt|cá|tôm|nước mắm/i.test(r.ingredients.map((i) => i.name).join(' ')), `${r.id} veg flag`)
    if (r.dish) {
      const d = DISHES.find((x) => x.id === r.id)
      assert.equal(d.price, recipeCost(r))
      assert.equal(d.veg, r.veg)
      assert.equal(d.recipe, r.id)
    }
  }
  for (const d of DISHES.filter((x) => x.cook)) assert.ok(ids.has(d.recipe), d.id)
  assert.ok(RECIPES.length >= 15, 'enough recipes')
  for (const slot of ['sang', 'trua', 'toi']) assert.ok(DISHES.filter((d) => d.cook && d.meals.includes(slot)).length >= 2, `cook dishes for ${slot}`)
})

test('spends close to the money: leftover stays within 10.000đ..100.000đ when the dish list can absorb the budget', () => {
  const flagSets = [{}, { cook: false }]
  const cases = [[400000, 5, 3], [500000, 10, 2], [300000, 10, 3], [1000000, 15, 2], [250000, 7, 2], [100000, 10, 1], [600000, 30, 1], [700000, 10, 3]]
  for (const flags of flagSets) for (const [money, days, meals] of cases) for (let seed = 1; seed <= 40; seed++) {
    const input = { money, days, meals, veg: false, cook: true, ...flags }
    const r = makePlan(DISHES, input, seed)
    const tag = `${JSON.stringify(flags)} ${money}/${days}/${meals} seed ${seed} leftover ${r.leftover}`
    if (money - 10000 < r.needed) continue // vừa đủ hoặc thiếu tiền: không có chỗ giữ khoản dự phòng, xét ở test khác
    assert.ok(r.leftover >= 10000 && r.leftover <= 100000, tag)
  }
})

test('cook-only keeps leftover in range at budgets its dishes can absorb', () => {
  for (const [money, days, meals] of [[250000, 10, 2], [300000, 10, 3], [150000, 10, 2], [200000, 10, 1]]) for (let seed = 1; seed <= 30; seed++) {
    const r = makePlan(DISHES, { money, days, meals, cook: true, eatOut: false }, seed)
    if (money - 10000 < r.needed) continue
    assert.ok(r.leftover >= 10000 && r.leftover <= 100000, `${money}/${days}/${meals} seed ${seed} leftover ${r.leftover}`)
  }
})

test('user report: 400k, 5 days, 3 meals no longer leaves most of the money unspent', () => {
  for (const flags of [{}, { cook: false }]) {
    const r = makePlan(DISHES, { money: 400000, days: 5, meals: 3, veg: false, cook: true, ...flags }, 1)
    assert.ok(r.total >= 300000 && r.leftover <= 100000, JSON.stringify({ flags, total: r.total }))
  }
})

test('daily spend is even: no day is far above or below the others (400k, 5 days, 3 meals)', () => {
  for (let seed = 1; seed <= 60; seed++) {
    const r = makePlan(DISHES, { money: 400000, days: 5, meals: 3, veg: false, cook: true, cook: seed % 2 === 0 }, seed)
    const daily = r.plan.map((d) => d.meals.reduce((a, m) => a + m.dish.price, 0))
    assert.ok(Math.max(...daily) / Math.min(...daily) <= 1.5, `seed ${seed}: ${daily}`)
  }
})

test('very generous budget: spends what the list allows and flags it as roomy', () => {
  const r = makePlan(DISHES, { money: 2000000, days: 5, meals: 3, veg: false, cook: true }, 1)
  assert.ok(r.total <= 2000000 && r.roomy)
})
