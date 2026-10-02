import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { slugify, validateAll, validateDish, validateIdea, validateRecipe, validateTips } from '../js/schema.js'
import { load, loadAll, save, serialize } from '../admin/store.js'
import dishes from '../js/content/dishes.js'
import recipes from '../js/content/recipes.js'
import dates from '../js/content/dates.js'

const dish = { id: 'bun-moc', name: 'Bún mọc', price: 40000, meals: ['sang', 'trua'], veg: false }
const recipe = () => structuredClone(recipes[0])
const idea = () => structuredClone(dates.ideas[0])

test('all shipped content passes the schema (so admin never opens a broken file)', () => {
  assert.deepEqual(validateAll({ dishes, recipes, dates }), [])
})

test('slugify strips Vietnamese diacritics', () => {
  assert.equal(slugify('Bún bò Huế'), 'bun-bo-hue')
  assert.equal(slugify('  Đậu hũ — sốt cà!  '), 'dau-hu-sot-ca')
  assert.equal(slugify('!!!'), '')
})

test('dish: accepts valid, rejects bad price / meals / id / unknown keys', () => {
  assert.deepEqual(validateDish(dish), [])
  assert.ok(validateDish({ ...dish, price: 1000 }).length)
  assert.ok(validateDish({ ...dish, price: 40000.5 }).length)
  assert.ok(validateDish({ ...dish, price: '40000' }).length)
  assert.ok(validateDish({ ...dish, meals: [] }).length)
  assert.ok(validateDish({ ...dish, meals: ['sang', 'sang'] }).length)
  assert.ok(validateDish({ ...dish, meals: ['dem'] }).length)
  assert.ok(validateDish({ ...dish, id: 'Bún Mọc' }).length)
  assert.ok(validateDish({ ...dish, id: '../x' }).length)
  assert.ok(validateDish({ ...dish, cook: true }).length, 'cook is derived, not allowed here')
  assert.ok(validateDish({ ...dish, name: ' x' }).length)
  assert.ok(validateDish(null).length)
})

test('recipe: rules from the book (cheap, simple) and veg consistency', () => {
  assert.deepEqual(validateRecipe(recipe()), [])
  const r1 = recipe(); r1.steps = ['một', 'hai']; assert.ok(validateRecipe(r1).length)
  const r2 = recipe(); r2.minutes = 120; assert.ok(validateRecipe(r2).length)
  const r3 = recipe(); r3.ingredients[0].cost = 49000; r3.ingredients[1].cost = 49000; assert.ok(validateRecipe(r3).some((e) => /30\.000/.test(e)))
  const r4 = recipe(); r4.veg = true; assert.ok(validateRecipe(r4).some((e) => /chay/.test(e)), 'veg recipe containing egg')
  const r5 = recipe(); r5.ingredients = [r5.ingredients[0]]; assert.ok(validateRecipe(r5).length)
  const r6 = recipe(); r6.dish = { name: 'x', meals: [] }; assert.ok(validateRecipe(r6).length)
  const r7 = recipe(); r7.evil = 1; assert.ok(validateRecipe(r7).length)
})

test('date idea + tips', () => {
  assert.deepEqual(validateIdea(idea()), [])
  assert.ok(validateIdea({ ...idea(), min: 500000, max: 100000 }).length)
  assert.ok(validateIdea({ ...idea(), advice: 'quá ngắn' }).length)
  assert.ok(validateIdea({ ...idea(), examples: [] }).length)
  assert.ok(validateIdea({ ...idea(), examples: [{ name: 'A quán', city: '' }] }).length)
  assert.deepEqual(validateTips(dates.tips), [])
  assert.ok(validateTips(['a', 'b']).length)
})

test('cross-collection: duplicate ids and id clash between dishes and recipes are rejected', () => {
  assert.ok(validateAll({ dishes: [dish, dish], recipes, dates }).some((e) => /trùng/.test(e)))
  assert.ok(validateAll({ dishes: [{ ...dish, id: recipes[0].id }], recipes, dates }).some((e) => /trùng/.test(e)))
  assert.ok(validateAll({ dishes: 'x', recipes, dates }).length)
})

test('serialize -> import round-trips exactly, for real data and for hostile strings', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'content-'))
  const hostile = [{ ...dish, id: 'a-b', name: '"; process.exit(1); //' }, { ...dish, id: 'c', name: '</script><img src=x>' }]
  for (const [name, data] of [['dishes', dishes], ['recipes', recipes], ['dates', dates], ['dishes', hostile]]) {
    await save(dir, name, data)
    assert.deepEqual((await load(dir, name)).data, data, name)
  }
  assert.match(serialize('dishes', dishes), /^\/\/ .*\n[\s\S]*\nexport default \[/)
})

test('load returns a new rev when the file changes on disk', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'content-'))
  for (const n of ['dishes', 'recipes', 'dates']) await save(dir, n, n === 'dishes' ? dishes : n === 'recipes' ? recipes : dates)
  const before = (await loadAll(dir)).dishes
  await writeFile(join(dir, 'dishes.js'), (await readFile(join(dir, 'dishes.js'), 'utf8')) + '\n// sửa tay\n')
  const after = (await load(dir, 'dishes'))
  assert.notEqual(before.rev, after.rev)
  assert.deepEqual(after.data, before.data)
})
