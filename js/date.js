import { DATE_IDEAS, DATE_TIPS, PRICE_BUCKETS, inBucket } from './dates.js'
import { fmt } from './planner.js'
import { renderSources } from './footer.js'

const list = document.getElementById('ideas')
const empty = document.getElementById('empty')
const bar = document.getElementById('filters')
let active = 'all'

function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) k === 'class' ? (node.className = v) : node.setAttribute(k, v)
  node.append(...kids)
  return node
}

const range = (a, b) => `${fmt(a)} – ${fmt(b)}`

function card(idea, index) {
  const eg = idea.examples.map((e) => `${e.name} (${e.city})`).join(', ')
  return el('li', { class: 'card', id: idea.id },
    el('div', { class: 'head2' },
      el('span', { class: 'no' }, `GỢI Ý ${String(index + 1).padStart(2, '0')}`),
      el('h2', {}, idea.name),
      el('span', { class: 'meta' }, el('span', {}, el('b', {}, range(idea.min, idea.max)), ' / người'), el('span', {}, `2 người khoảng ${range(idea.min * 2, idea.max * 2)}`)),
    ),
    el('div', { class: 'more' },
      el('h3', {}, 'Lời khuyên'),
      el('p', { class: 'advice' }, idea.advice),
      el('p', { class: 'eg' }, el('b', {}, 'Ví dụ trong nguồn tham khảo: '), `${eg}. Giá và giờ mở cửa có thể đã đổi, hãy kiểm tra lại trước khi đi.`),
    ),
  )
}

// Số thứ tự cố định theo thứ tự giá tăng dần, không đổi khi lọc.
const sorted = [...DATE_IDEAS].sort((a, b) => a.min - b.min || a.max - b.max)
const cards = sorted.map((idea, i) => ({ idea, node: card(idea, i) }))

function show() {
  const bucket = PRICE_BUCKETS.find((b) => b.id === active)
  const visible = cards.filter(({ idea }) => inBucket(idea, bucket))
  list.replaceChildren(...visible.map(({ node }) => node))
  empty.hidden = visible.length > 0
  for (const b of bar.children) b.setAttribute('aria-pressed', String(b.dataset.id === active))
}

for (const b of PRICE_BUCKETS) {
  const btn = el('button', { class: 'chip', type: 'button', 'data-id': b.id }, b.label)
  btn.addEventListener('click', () => {
    active = b.id
    show()
  })
  bar.append(btn)
}

document.getElementById('tips').append(...DATE_TIPS.map((t) => el('li', {}, t)))
show()
renderSources()
