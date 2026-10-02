import { DISHES } from './data.js'
import { MEAL_LABEL, decodeState, encodeState, fmt, makePlan, parseMoney, planToText, validate } from './planner.js'

const $ = (id) => document.getElementById(id)
const form = $('form')
const errorEl = $('error')
const resultEl = $('result')

const DECLINE_LINES = [
  'Tuần này mình đang siết chi tiêu nên xin phép skip nha, lần sau mình khao bù!',
  'Mình ra ngồi tám với mọi người thôi nha, ăn mình ăn rồi. Gọi cho mình cốc trà đá là đủ.',
  'Cuối tháng ví mình đang nằm ICU rồi. Hẹn mọi người đầu tháng nha!',
  'Mình đi được nhưng gọi món nhỏ thôi nhé, mọi người đừng cười nha.',
  'Hay mình nấu ở nhà ai đó rồi chia đều nhỉ? Rẻ mà còn vui hơn.',
]

function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) k === 'class' ? (node.className = v) : node.setAttribute(k, v)
  node.append(...kids)
  return node
}

async function copy(text, button, doneLabel = 'Đã copy ✓') {
  const original = button.textContent
  try {
    await navigator.clipboard.writeText(text)
    button.textContent = doneLabel
  } catch {
    button.textContent = 'Không copy được, hãy chọn và copy thủ công'
  }
  setTimeout(() => (button.textContent = original), 1800)
}

function readForm() {
  return {
    money: parseMoney($('money').value),
    days: Number($('days').value),
    meals: Number(form.elements.meals.value),
    cook: $('cook').checked,
    veg: $('veg').checked,
    noStove: $('noStove').checked,
    preferCook: $('preferCook').checked,
  }
}

// Hai tuỳ chọn phụ chỉ có nghĩa khi tự nấu được.
function syncCook() {
  const on = $('cook').checked
  for (const id of ['noStove', 'preferCook']) {
    $(id).disabled = !on
    if (!on) $(id).checked = false
  }
}
$('cook').addEventListener('change', syncCook)

function fillForm({ money, days, meals, cook, veg, noStove, preferCook }) {
  $('money').value = String(money)
  $('days').value = String(days)
  form.elements.meals.value = String(meals)
  $('cook').checked = cook
  $('veg').checked = veg
  $('noStove').checked = noStove
  $('preferCook').checked = preferCook
  syncCook()
}

function showError(msg) {
  errorEl.textContent = msg ?? ''
  errorEl.hidden = !msg
}

function row(slot, dish, linked) {
  const name = el('span', { class: 'name' }, dish.name)
  if (dish.recipe && !linked.has(dish.recipe)) { // chỉ gắn link ở lần đầu mỗi món cho đỡ rối
    linked.add(dish.recipe)
    name.append(' ', el('a', { class: 'how', href: `sach.html#${dish.recipe}` }, 'cách nấu'))
  }
  return el('div', { class: 'rrow' },
    el('span', { class: 'slot' }, slot),
    name,
    el('span', { class: 'fill', 'aria-hidden': 'true' }),
    el('span', { class: 'price' }, fmt(dish.price)),
  )
}

const sum = (label, value, cls = '') => el('div', { class: `sum ${cls}`.trim() }, el('span', {}, label), el('span', {}, value))

function render(input, seed) {
  let r
  try {
    r = makePlan(DISHES, input, seed)
  } catch (e) {
    resultEl.hidden = true
    return showError(e.message)
  }
  showError('')
  history.replaceState(null, '', `#${encodeState(input, seed)}`)
  $('placeholder').hidden = true

  const partial = r.coveredDays < r.requestedDays
  const nodes = []

  if (partial) {
    const head = r.coveredDays > 0 ? `Chỉ đủ ${r.coveredDays}/${r.requestedDays} ngày` : 'Chưa đủ cho một ngày'
    nodes.push(el('div', { class: 'alert', role: 'status' },
      el('b', {}, head),
      el('p', {}, `Dù chọn món rẻ nhất mọi bữa, để đủ ${r.requestedDays} ngày bạn cần thêm ít nhất ${fmt(r.shortfall)}. `
        + 'Thử giảm số bữa, bật "Tự nấu được", hoặc rút ngắn số ngày.')))
  }

  const reroll = el('button', { class: 'btn', type: 'button' }, 'Xáo lại')
  reroll.addEventListener('click', () => render(input, newSeed()))
  const link = el('button', { class: 'btn', type: 'button' }, 'Copy link')
  link.addEventListener('click', () => copy(location.href, link))
  const text = el('button', { class: 'btn', type: 'button' }, 'Copy thực đơn')
  text.addEventListener('click', () => copy(planToText(input, r), text))
  nodes.push(el('div', { class: 'actions' }, reroll, link, text))

  const receipt = el('article', { class: 'receipt' },
    el('div', { class: 'stamp' }, r.tier.title),
    el('h2', {}, 'Thực đơn sinh tồn'),
    el('p', { class: 'sub' }, `${fmt(input.money)} · ${input.days} ngày · ${input.meals} bữa/ngày`),
    el('hr'),
  )
  const linked = new Set()
  for (const d of r.plan) {
    const day = el('section', { class: 'rday' }, el('h3', {}, `Ngày ${d.day}`))
    for (const m of d.meals) day.append(row(MEAL_LABEL[m.slot], m.dish, linked))
    receipt.append(day)
  }
  if (!r.plan.length) receipt.append(el('p', { class: 'note' }, 'Chưa có bữa nào trả nổi với số tiền này.'))
  receipt.append(
    el('hr'),
    sum(`Tiền mỗi ngày (${input.days} ngày)`, fmt(r.perDay)),
    sum('Tiền mỗi bữa', fmt(r.perMeal)),
    sum(`Tổng chi (${r.coveredDays} ngày)`, fmt(r.total), 'big'),
    sum('Còn dư', fmt(r.leftover), 'hl'),
  )
  if (partial) receipt.append(sum(`Cần thêm để đủ ${r.requestedDays} ngày`, fmt(r.shortfall), 'neg big'))
  receipt.append(el('p', { class: 'note' }, r.tier.note))
  nodes.push(receipt)

  resultEl.replaceChildren(...nodes)
  resultEl.hidden = false
}

const newSeed = () => crypto.getRandomValues(new Uint32Array(1))[0]

form.addEventListener('submit', (e) => {
  e.preventDefault()
  const input = readForm()
  const err = input.money === null ? 'Chưa hiểu số tiền. Thử gõ như 500k, 1tr2 hoặc 500.000.' : validate(input)
  if (err) {
    resultEl.hidden = true
    return showError(err)
  }
  render(input, newSeed())
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

const lines = $('lines')
for (const line of DECLINE_LINES) {
  const b = el('button', { class: 'line', type: 'button' }, line)
  const hint = el('small', {}, 'Bấm để copy')
  b.append(hint)
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(line)
      hint.textContent = 'Đã copy ✓'
    } catch {
      hint.textContent = 'Không copy được, hãy chọn và copy thủ công'
    }
    setTimeout(() => (hint.textContent = 'Bấm để copy'), 1800)
  })
  lines.append(el('li', {}, b))
}

syncCook()
const shared = decodeState(location.hash)
if (shared) {
  fillForm(shared.input)
  render(shared.input, shared.seed)
}
