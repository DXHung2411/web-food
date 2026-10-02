import { RECIPES, recipeCost } from './recipes.js'
import { fmt } from './planner.js'

const FILTERS = [
  { id: 'all', label: 'Tất cả', test: () => true },
  { id: 'nostove', label: 'Không cần bếp', test: (r) => !r.stove },
  { id: 'veg', label: 'Chay', test: (r) => r.veg },
  { id: 'cheap', label: 'Dưới 12.000đ', test: (r) => recipeCost(r) < 12000 },
]

const list = document.getElementById('recipes')
const empty = document.getElementById('empty')
const bar = document.getElementById('filters')
let active = 'all'

function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) k === 'class' ? (node.className = v) : node.setAttribute(k, v)
  node.append(...kids)
  return node
}

function card(r, index) {
  const cost = recipeCost(r)
  const ing = el('div', { class: 'ing' })
  for (const i of r.ingredients) {
    ing.append(el('div', { class: 'rrow' },
      el('span', { class: 'name' }, `${i.name} · ${i.qty}`),
      el('span', { class: 'fill', 'aria-hidden': 'true' }),
      el('span', { class: 'price' }, fmt(i.cost)),
    ))
  }
  ing.append(el('div', { class: 'sum big' }, el('span', {}, 'Tổng 1 suất'), el('span', {}, fmt(cost))))

  const steps = el('ol', {}, ...r.steps.map((t) => el('li', {}, t)))
  const more = el('div', { class: 'more' },
    el('h3', {}, 'Nguyên liệu'), ing,
    el('h3', {}, 'Cách làm'), steps,
  )
  if (r.tip) more.append(el('p', { class: 'tip' }, `Mẹo: ${r.tip}`))

  const tags = [r.stove ? 'Cần bếp' : 'Không cần bếp', r.veg ? 'Chay' : null].filter(Boolean)
  const summary = el('summary', {},
    el('span', { class: 'no' }, `CÔNG THỨC ${String(index + 1).padStart(2, '0')}`),
    el('h2', {}, r.title),
    el('span', { class: 'meta' }, el('span', {}, el('b', {}, `${r.minutes} phút`)), el('span', {}, el('b', {}, `${fmt(cost)}/suất`)), el('span', {}, r.gear)),
    el('span', { class: 'meta' }, ...tags.map((t) => el('span', { class: 'tag' }, t))),
  )
  const details = el('details', {}, summary, more)
  return el('li', { class: 'card', id: r.id }, details)
}

// Số thứ tự cố định theo thứ tự trong sách, không đổi khi lọc.
const cards = RECIPES.map((r, i) => ({ r, node: card(r, i) }))

function show() {
  const test = FILTERS.find((f) => f.id === active).test
  const visible = cards.filter(({ r }) => test(r))
  list.replaceChildren(...visible.map(({ node }) => node))
  empty.hidden = visible.length > 0
  for (const b of bar.children) b.setAttribute('aria-pressed', String(b.dataset.id === active))
}

for (const f of FILTERS) {
  const b = el('button', { class: 'chip', type: 'button', 'data-id': f.id }, f.label)
  b.addEventListener('click', () => {
    active = f.id
    show()
  })
  bar.append(b)
}

function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1))
  const hit = cards.find(({ r }) => r.id === id) // chỉ nhận id có trong sách
  if (!hit) return
  active = 'all'
  show()
  hit.node.querySelector('details').open = true
  hit.node.scrollIntoView({ block: 'start' })
}

show()
openFromHash()
window.addEventListener('hashchange', openFromHash)
