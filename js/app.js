import { DISHES } from './data.js'
import { MEAL_LABEL, decodeState, encodeState, fmt, makePlan, parseMoney, planToText, validate } from './planner.js'

const $ = (id) => document.getElementById(id)
const form = $('form')
const errorEl = $('error')
const resultEl = $('result')

const DECLINE_LINES = [
  'Tuần này mình đang siết chi tiêu nên xin phép skip nha, lần sau mình khao bù! 🙏',
  'Mình ra ngồi tám với mọi người thôi nha, ăn mình ăn rồi. Gọi cho mình cốc trà đá là đủ 😎',
  'Cuối tháng ví mình đang nằm ICU rồi 😭 Hẹn mọi người đầu tháng nha!',
  'Mình đi được nhưng gọi món nhỏ thôi nhé, mọi người đừng cười nha 😂',
  'Hay mình nấu ở nhà ai đó rồi chia đều nhỉ? Rẻ mà còn vui hơn 🍳',
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
  }
}

function fillForm({ money, days, meals, cook, veg }) {
  $('money').value = String(money)
  $('days').value = String(days)
  form.elements.meals.value = String(meals)
  $('cook').checked = cook
  $('veg').checked = veg
}

function showError(msg) {
  errorEl.textContent = msg ?? ''
  errorEl.hidden = !msg
}

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

  const bad = r.shortfall > 0
  const stats = el('div', { class: 'stats' },
    stat(`${fmt(r.perDay)}`, 'mỗi ngày'),
    stat(`${fmt(r.perMeal)}`, 'mỗi bữa'),
    stat(bad ? fmt(r.shortfall) : fmt(r.leftover), bad ? 'còn thiếu' : 'còn dư'),
  )
  const status = el('div', { class: bad ? 'status status--bad' : 'status' },
    el('div', { class: 'status__emoji', 'aria-hidden': 'true' }, r.tier.emoji),
    el('h2', { class: 'status__title' }, r.tier.title),
    el('p', { class: 'status__note' }, r.tier.note),
    stats,
  )
  if (bad) {
    const days = r.survive
    status.append(el('p', { class: 'warn' },
      days > 0
        ? `Với ${input.meals} bữa/ngày, số tiền này chỉ đủ khoảng ${days} ngày dù chọn món rẻ nhất. Thử giảm số bữa hoặc bật "Tự nấu được".`
        : 'Số tiền này chưa đủ cho một ngày đầy đủ theo lựa chọn hiện tại. Thử giảm số bữa hoặc bật "Tự nấu được".'))
  }

  const reroll = el('button', { class: 'btn', type: 'button' }, '🔀 Xáo lại')
  reroll.addEventListener('click', () => render(input, newSeed()))
  const link = el('button', { class: 'btn btn--alt', type: 'button' }, '🔗 Copy link')
  link.addEventListener('click', () => copy(location.href, link))
  const text = el('button', { class: 'btn btn--alt', type: 'button' }, '📋 Copy thực đơn')
  text.addEventListener('click', () => copy(planToText(input, r), text))

  const list = el('ol', { class: 'days' })
  for (const d of r.plan) {
    const day = el('li', { class: 'day' }, el('h3', {}, `Ngày ${d.day}`))
    for (const m of d.meals) {
      day.append(el('div', { class: 'meal' },
        el('span', { class: 'meal__slot' }, MEAL_LABEL[m.slot]),
        el('span', { class: 'meal__name' }, `${m.dish.emoji} ${m.dish.name}`),
        el('span', { class: 'meal__price' }, fmt(m.dish.price)),
      ))
    }
    list.append(day)
  }

  resultEl.replaceChildren(status, el('div', { class: 'actions' }, reroll, link, text), list)
  resultEl.hidden = false
}

const stat = (value, label) => el('div', { class: 'stat' }, el('b', {}, value), label)
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

const shared = decodeState(location.hash)
if (shared) {
  fillForm(shared.input)
  render(shared.input, shared.seed)
}
