// Giao diện admin. Mọi nội dung hiển thị dùng textContent (không innerHTML). Server kiểm tra lại toàn bộ dữ liệu trước khi ghi.
import { MEALS, MEAL_NAME, recipeCostOf, slugify, validateAll, validateDish, validateIdea, validateRecipe, validateTips } from '/js/schema.js'

const token = new URLSearchParams(location.hash.slice(1)).get('token') ?? ''
history.replaceState(null, '', location.pathname) // không để token nằm trên thanh địa chỉ

const $ = (id) => document.getElementById(id)
const fmt = (n) => `${new Intl.NumberFormat('vi-VN').format(n)}đ`

function h(tag, props = {}, ...kids) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v)
    else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : v)
  }
  node.append(...kids.flat().filter((x) => x != null && x !== false))
  return node
}

const TABS = [
  { id: 'dishes', label: 'Món ăn ngoài' },
  { id: 'recipes', label: 'Công thức' },
  { id: 'dates', label: 'Gợi ý hẹn hò' },
]
const FILE = { dishes: 'js/content/dishes.js', recipes: 'js/content/recipes.js', dates: 'js/content/dates.js' }
const state = { tab: 'dishes', data: null, rev: null, editing: null, query: '' }

async function call(path, method = 'GET', body) {
  const res = await fetch(path, { method, headers: { 'X-Admin-Token': token, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

function banner(kind, text, list = []) {
  $('banner').replaceChildren(h('div', { class: `msg ${kind}` }, text, list.length ? h('ul', {}, list.map((e) => h('li', {}, e))) : null))
}

async function reload() {
  const r = await call('/api/content')
  if (!r.ok) {
    banner('err', r.status === 401 ? 'Sai hoặc thiếu token. Hãy mở lại bằng đường dẫn in ra khi chạy npm run admin.' : 'Không tải được dữ liệu.')
    $('app').replaceChildren()
    return false
  }
  state.data = { dishes: r.json.dishes.data, recipes: r.json.recipes.data, dates: r.json.dates.data }
  state.rev = { dishes: r.json.dishes.rev, recipes: r.json.recipes.rev, dates: r.json.dates.rev }
  return true
}

/** Ghi một bộ sưu tập. Trả về true nếu thành công. Lỗi thì giữ nguyên dữ liệu cũ và hiện lý do. */
async function commit(name, next, okMessage) {
  const r = await call(`/api/content/${name}`, 'PUT', { rev: state.rev[name], data: next })
  if (r.ok) {
    state.data[name] = next
    state.rev[name] = r.json.rev
    banner('ok', `${okMessage} Đã ghi vào ${FILE[name]}. Hãy chạy npm test, rồi commit và deploy.`)
    return true
  }
  if (r.status === 409) {
    await reload()
    state.editing = null
    banner('err', 'File đã bị sửa ở ngoài trang admin nên tôi đã tải lại dữ liệu mới. Thay đổi vừa rồi chưa được lưu, hãy làm lại.')
    render()
    return false
  }
  banner('err', r.json.error ?? 'Không lưu được.', r.json.errors ?? [])
  return false
}

// ---- thành phần dùng chung ----
const fld = (label, input, hint) => h('label', { class: 'fld' }, label, input, hint ? h('small', {}, hint) : null)
const text = (value = '', attrs = {}) => h('input', { type: 'text', value, ...attrs })
const num = (value = '', attrs = {}) => h('input', { type: 'number', value, inputmode: 'numeric', step: '1', ...attrs })

function mealChecks(selected = []) {
  const boxes = MEALS.map((m) => ({ m, box: h('input', { type: 'checkbox', ...(selected.includes(m) ? { checked: true } : {}) }) }))
  return {
    node: h('div', { class: 'checks' }, boxes.map(({ m, box }) => h('label', {}, box, MEAL_NAME[m]))),
    read: () => boxes.filter(({ box }) => box.checked).map(({ m }) => m),
  }
}

function checkbox(label, on) {
  const box = h('input', { type: 'checkbox', ...(on ? { checked: true } : {}) })
  return { node: h('label', { class: 'checks' }, box, label), box }
}

/** Danh sách dòng động. makeRow() trả về {node, read}; dòng có nút xoá. */
function dynamicRows(items, makeRow, addLabel, min = 0) {
  const rows = []
  const box = h('div', { class: 'rows' })
  const add = (item) => {
    const row = makeRow(item)
    const del = h('button', { type: 'button', class: 'btn small danger', 'aria-label': 'Xoá dòng này', onclick: () => {
      if (rows.length <= min) return
      rows.splice(rows.indexOf(row), 1)
      row.wrap.remove()
    } }, 'Xoá')
    row.wrap = h('div', { class: row.cls }, ...row.nodes, del)
    rows.push(row)
    box.append(row.wrap)
  }
  items.forEach(add)
  const addBtn = h('button', { type: 'button', class: 'btn small', onclick: () => add() }, addLabel)
  return { node: h('div', { class: 'rows' }, box, addBtn), read: () => rows.map((r) => r.read()) }
}

function formShell(title, fields, onSubmit, onCancel, extra) {
  const form = h('form', { class: 'formbox', novalidate: true }, h('h2', {}, title), ...fields, extra,
    h('div', { class: 'formactions' },
      h('button', { type: 'submit', class: 'btn primary-btn' }, 'Lưu'),
      h('button', { type: 'button', class: 'btn', onclick: onCancel }, 'Huỷ')))
  form.addEventListener('submit', (e) => { e.preventDefault(); onSubmit() })
  return form
}

const toInt = (el) => (el.value.trim() === '' ? NaN : Number(el.value))
const oneLine = (s) => s.replace(/\s+/g, ' ').trim()

function listTable(cols, rows, query, onEdit, onDelete) {
  const q = query.trim().toLowerCase()
  const shown = rows.filter((r) => !q || r.search.toLowerCase().includes(q))
  const table = h('table', { class: 'list' },
    h('thead', {}, h('tr', {}, cols.map((c) => h('th', {}, c)), h('th', {}))),
    h('tbody', {}, shown.map((r) => h('tr', {},
      r.cells.map((c, i) => h('td', { class: i > 0 && r.numeric?.includes(i) ? 'num' : '' }, c)),
      h('td', { class: 'act' },
        h('button', { type: 'button', class: 'btn small', onclick: () => onEdit(r.index) }, 'Sửa'),
        h('button', { type: 'button', class: 'btn small danger', onclick: () => onDelete(r.index) }, 'Xoá'))))))
  return h('div', {}, table, shown.length ? null : h('p', { class: 'muted' }, 'Không có mục nào.'))
}

function toolbar(addLabel, onAdd) {
  const search = h('input', { type: 'search', placeholder: 'Tìm theo tên…', value: state.query, 'aria-label': 'Tìm theo tên' })
  search.addEventListener('input', () => { state.query = search.value; renderBody() })
  return h('div', { class: 'toolbar' }, search, h('button', { type: 'button', class: 'btn primary-btn', onclick: onAdd }, addLabel))
}

async function remove(name, index, label) {
  if (!confirm(`Xoá "${label}"? Thao tác này ghi ngay vào file (khôi phục được bằng git nếu bạn đã commit).`)) return
  const base = name === 'dates' ? state.data.dates.ideas : state.data[name]
  const nextList = base.filter((_, i) => i !== index)
  const next = name === 'dates' ? { ...state.data.dates, ideas: nextList } : nextList
  const everything = { ...state.data, [name]: next }
  const errs = validateAll(everything)
  if (errs.length) return banner('err', 'Xoá xong thì dữ liệu sẽ không hợp lệ:', errs)
  if (await commit(name, next, `Đã xoá "${label}".`)) { state.editing = null; render() }
}

// ---- Món ăn ngoài ----
function dishForm(index) {
  const cur = index == null ? null : state.data.dishes[index]
  const name = text(cur?.name ?? '', { maxlength: '40' })
  const price = num(cur?.price ?? '', { min: '5000', max: '80000' })
  const meals = mealChecks(cur?.meals ?? ['trua', 'toi'])
  const veg = checkbox('Món chay (không thịt, cá, trứng)', cur?.veg === true)
  const id = text(cur?.id ?? '', { maxlength: '60', ...(cur ? { readonly: true } : {}) })
  if (!cur) name.addEventListener('input', () => { if (!id.dataset.touched) id.value = slugify(name.value) })
  id.addEventListener('input', () => { id.dataset.touched = '1' })

  const save = async () => {
    const dish = { id: id.value.trim(), name: name.value.trim(), price: toInt(price), meals: meals.read() }
    if (veg.box.checked) dish.veg = true
    const list = [...state.data.dishes]
    if (index == null) list.push(dish)
    else list[index] = dish
    const errs = [...validateDish(dish), ...validateAll({ ...state.data, dishes: list }).filter((e) => /trùng/.test(e))]
    if (errs.length) return banner('err', 'Chưa lưu được:', [...new Set(errs)])
    if (await commit('dishes', list, index == null ? `Đã thêm "${dish.name}".` : `Đã cập nhật "${dish.name}".`)) { state.editing = null; render() }
  }
  return formShell(cur ? `Sửa món: ${cur.name}` : 'Thêm món ăn ngoài', [
    fld('Tên món', name), fld('Giá một suất (VND)', price, 'Từ 5.000 đến 80.000. Là giá ước lượng cho sinh viên ở thành phố.'),
    fld('Ăn được vào bữa', meals.node), veg.node,
    fld('Mã (tự tạo từ tên)', id, 'Chữ thường không dấu, số và dấu gạch ngang. Không đổi được sau khi tạo.'),
  ], save, () => { state.editing = null; render() })
}

// ---- Công thức ----
function recipeForm(index) {
  const cur = index == null ? null : state.data.recipes[index]
  const title = text(cur?.title ?? '', { maxlength: '60' })
  const minutes = num(cur?.minutes ?? '', { min: '1', max: '60' })
  const gear = text(cur?.gear ?? '', { maxlength: '60', placeholder: 'vd: Bếp + chảo' })
  const stove = checkbox('Cần bếp (bỏ chọn nếu làm được bằng nồi cơm điện / ấm đun nước)', cur?.stove ?? true)
  const veg = checkbox('Món chay (không thịt, cá, trứng, nước mắm)', cur?.veg === true)
  const inMenu = checkbox('Cũng là một món tự nấu trong trang lập thực đơn', Boolean(cur?.dish))
  const dishName = text(cur?.dish?.name ?? '', { maxlength: '40', placeholder: 'vd: Cơm + trứng luộc' })
  const dishMeals = mealChecks(cur?.dish?.meals ?? ['trua', 'toi'])
  const menuBox = h('div', { class: 'rows' }, fld('Tên món trong thực đơn (hệ thống tự thêm "(tự nấu)")', dishName), fld('Ăn được vào bữa', dishMeals.node))
  const syncMenu = () => { menuBox.hidden = !inMenu.box.checked }
  inMenu.box.addEventListener('change', syncMenu); syncMenu()

  const total = h('span', { class: 'total' })
  const ing = dynamicRows(cur?.ingredients ?? [{}, {}], (i = {}) => {
    const n = text(i.name ?? '', { placeholder: 'Tên nguyên liệu', 'aria-label': 'Tên nguyên liệu' })
    const q = text(i.qty ?? '', { placeholder: 'Lượng', 'aria-label': 'Lượng' })
    const c = num(i.cost ?? '', { placeholder: 'Giá (đ)', 'aria-label': 'Giá', min: '0', max: '50000' })
    c.addEventListener('input', updateTotal)
    return { cls: 'row3', nodes: [n, q, c], read: () => ({ name: n.value.trim(), qty: q.value.trim(), cost: toInt(c) }) }
  }, '+ Thêm nguyên liệu', 2)
  function updateTotal() {
    const costs = ing.read().map((x) => x.cost)
    total.textContent = costs.every(Number.isInteger) ? `Tổng: ${fmt(costs.reduce((a, b) => a + b, 0))} / suất` : 'Tổng: nhập đủ giá các nguyên liệu'
  }
  const steps = dynamicRows(cur?.steps ?? ['', '', ''], (s = '') => {
    const t = h('textarea', { 'aria-label': 'Bước làm', maxlength: '400' }); t.value = s
    return { cls: 'row1', nodes: [t], read: () => oneLine(t.value) }
  }, '+ Thêm bước', 3)
  const tip = text(cur?.tip ?? '', { maxlength: '300' })
  const id = text(cur?.id ?? '', { maxlength: '60', ...(cur ? { readonly: true } : {}) })
  if (!cur) title.addEventListener('input', () => { if (!id.dataset.touched) id.value = slugify(title.value) })
  id.addEventListener('input', () => { id.dataset.touched = '1' })
  queueMicrotask(updateTotal)

  const save = async () => {
    const r = { id: id.value.trim(), title: title.value.trim(), minutes: toInt(minutes), stove: stove.box.checked, veg: veg.box.checked, gear: gear.value.trim() }
    if (inMenu.box.checked) r.dish = { name: dishName.value.trim(), meals: dishMeals.read() }
    r.ingredients = ing.read()
    r.steps = steps.read()
    if (tip.value.trim()) r.tip = tip.value.trim()
    const list = [...state.data.recipes]
    if (index == null) list.push(r)
    else list[index] = r
    const errs = [...validateRecipe(r), ...validateAll({ ...state.data, recipes: list }).filter((e) => /trùng/.test(e))]
    if (errs.length) return banner('err', 'Chưa lưu được:', [...new Set(errs)])
    if (await commit('recipes', list, index == null ? `Đã thêm "${r.title}".` : `Đã cập nhật "${r.title}".`)) { state.editing = null; render() }
  }
  return formShell(cur ? `Sửa công thức: ${cur.title}` : 'Thêm công thức', [
    fld('Tên món', title), fld('Thời gian nấu (phút, chưa tính nấu cơm)', minutes), fld('Dụng cụ', gear),
    stove.node, veg.node, inMenu.node, menuBox,
    h('div', { class: 'fld' }, 'Nguyên liệu và giá (ước lượng)', ing.node, total, h('small', {}, 'Tổng giá một suất phải từ 1đ đến 30.000đ.')),
    h('div', { class: 'fld' }, 'Cách làm (3 đến 6 bước)', steps.node),
    fld('Mẹo (không bắt buộc)', tip),
    fld('Mã (tự tạo từ tên)', id, 'Chữ thường không dấu, số và dấu gạch ngang. Không đổi được sau khi tạo. Không được trùng mã món ăn ngoài.'),
  ], save, () => { state.editing = null; render() })
}

// ---- Gợi ý hẹn hò ----
function ideaForm(index) {
  const cur = index == null ? null : state.data.dates.ideas[index]
  const name = text(cur?.name ?? '', { maxlength: '80' })
  const min = num(cur?.min ?? '', { min: '0', step: '1000' })
  const max = num(cur?.max ?? '', { min: '0', step: '1000' })
  const advice = h('textarea', { maxlength: '600' }); advice.value = cur?.advice ?? ''
  const examples = dynamicRows(cur?.examples ?? [{}], (e = {}) => {
    const n = text(e.name ?? '', { placeholder: 'Tên quán', 'aria-label': 'Tên quán' })
    const c = text(e.city ?? '', { placeholder: 'Thành phố', 'aria-label': 'Thành phố' })
    return { cls: 'row2', nodes: [n, c], read: () => ({ name: n.value.trim(), city: c.value.trim() }) }
  }, '+ Thêm quán ví dụ', 1)
  const id = text(cur?.id ?? '', { maxlength: '60', ...(cur ? { readonly: true } : {}) })
  if (!cur) name.addEventListener('input', () => { if (!id.dataset.touched) id.value = slugify(name.value) })
  id.addEventListener('input', () => { id.dataset.touched = '1' })

  const save = async () => {
    const idea = { id: id.value.trim(), name: name.value.trim(), min: toInt(min), max: toInt(max), examples: examples.read(), advice: oneLine(advice.value) }
    const ideas = [...state.data.dates.ideas]
    if (index == null) ideas.push(idea)
    else ideas[index] = idea
    const next = { ...state.data.dates, ideas }
    const errs = [...validateIdea(idea), ...validateAll({ ...state.data, dates: next }).filter((e) => /trùng/.test(e))]
    if (errs.length) return banner('err', 'Chưa lưu được:', [...new Set(errs)])
    if (await commit('dates', next, index == null ? `Đã thêm "${idea.name}".` : `Đã cập nhật "${idea.name}".`)) { state.editing = null; render() }
  }
  return formShell(cur ? `Sửa gợi ý: ${cur.name}` : 'Thêm gợi ý hẹn hò', [
    fld('Tên kiểu bữa', name),
    h('div', { class: 'row2' }, fld('Giá thấp nhất mỗi người (VND)', min), fld('Giá cao nhất mỗi người (VND)', max)),
    fld('Lời khuyên để buổi hẹn tốt hơn', advice, '80 đến 600 ký tự.'),
    h('div', { class: 'fld' }, 'Quán ví dụ (lấy từ nguồn bạn tìm được)', examples.node, h('small', {}, 'Giá và giờ mở cửa của quán có thể đã đổi.')),
    fld('Mã (tự tạo từ tên)', id, 'Chữ thường không dấu, số và dấu gạch ngang. Không đổi được sau khi tạo.'),
  ], save, () => { state.editing = null; render() })
}

function tipsForm() {
  const tips = dynamicRows(state.data.dates.tips, (t = '') => {
    const i = text(t, { 'aria-label': 'Điều nên nhớ', maxlength: '200' })
    return { cls: 'row1', nodes: [i], read: () => i.value.trim() }
  }, '+ Thêm điều nên nhớ', 3)
  const save = async () => {
    const next = { ...state.data.dates, tips: tips.read() }
    const errs = validateTips(next.tips)
    if (errs.length) return banner('err', 'Chưa lưu được:', errs)
    if (await commit('dates', next, 'Đã cập nhật phần "Vài điều nên nhớ".')) { state.editing = null; render() }
  }
  return formShell('Sửa "Vài điều nên nhớ" (đầu trang hẹn hò)', [tips.node], save, () => { state.editing = null; render() })
}

// ---- hiển thị ----
function renderBody() {
  const body = $('app')
  const t = state.tab
  const ed = state.editing
  if (ed) {
    body.replaceChildren(ed.kind === 'tips' ? tipsForm() : t === 'dishes' ? dishForm(ed.index) : t === 'recipes' ? recipeForm(ed.index) : ideaForm(ed.index))
    return
  }
  const edit = (index) => { state.editing = { index }; $('banner').replaceChildren(); render() }
  if (t === 'dishes') {
    const rows = state.data.dishes.map((d, index) => ({ index, search: d.name, numeric: [1], cells: [d.name, fmt(d.price), d.meals.map((m) => MEAL_NAME[m]).join(', '), d.veg ? 'Chay' : ''] }))
    body.replaceChildren(toolbar('+ Thêm món', () => edit(null)), listTable(['Tên', 'Giá', 'Bữa', ''], rows, state.query, edit, (i) => remove('dishes', i, state.data.dishes[i].name)),
      h('p', { class: 'muted' }, `${state.data.dishes.length} món ăn ngoài. Món tự nấu lấy từ tab Công thức.`))
  } else if (t === 'recipes') {
    const rows = state.data.recipes.map((r, index) => ({ index, search: r.title, numeric: [1, 2], cells: [r.title, fmt(recipeCostOf(r)), `${r.minutes} phút`, r.stove ? 'Cần bếp' : 'Không cần bếp', r.dish ? 'Có trong thực đơn' : 'Chỉ trong sách'] }))
    body.replaceChildren(toolbar('+ Thêm công thức', () => edit(null)), listTable(['Tên', 'Giá/suất', 'Thời gian', 'Bếp', 'Thực đơn'], rows, state.query, edit, (i) => remove('recipes', i, state.data.recipes[i].title)))
  } else {
    const rows = state.data.dates.ideas.map((d, index) => ({ index, search: d.name, numeric: [1], cells: [d.name, `${fmt(d.min)} – ${fmt(d.max)}`, `${d.examples.length} quán ví dụ`] }))
    body.replaceChildren(toolbar('+ Thêm gợi ý', () => edit(null)), listTable(['Tên', 'Giá / người', 'Ví dụ'], rows, state.query, edit, (i) => remove('dates', i, state.data.dates.ideas[i].name)),
      h('p', { class: 'toolbar' }, h('button', { type: 'button', class: 'btn', onclick: () => { state.editing = { kind: 'tips' }; render() } }, 'Sửa "Vài điều nên nhớ"')))
  }
}

function render() {
  $('tabs').replaceChildren(...TABS.map((t) => h('button', { type: 'button', 'aria-current': String(t.id === state.tab), onclick: () => { state.tab = t.id; state.editing = null; state.query = ''; $('banner').replaceChildren(); render() } }, t.label)))
  renderBody()
}

if (await reload()) render()
