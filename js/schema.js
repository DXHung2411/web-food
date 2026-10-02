// Luật kiểm tra dữ liệu nội dung (món ăn, công thức, gợi ý hẹn hò).
// Dùng chung cho trang admin (báo lỗi ngay trên form), server admin (kiểm tra lại trước khi ghi file) và test.
// Mỗi hàm trả về mảng chuỗi lỗi (rỗng = hợp lệ).

export const MEALS = ['sang', 'trua', 'toi']
export const MEAL_NAME = { sang: 'Sáng', trua: 'Trưa', toi: 'Tối' }

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const CONTROL = /[\u0000-\u001f\u007f]/
const NOT_VEG = /trứng|thịt|cá|tôm|nước mắm/i // công thức chay không được chứa các từ này trong tên nguyên liệu

export function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 60).replace(/-+$/g, '')
}

const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max
const isText = (v, min, max) => typeof v === 'string' && v.length >= min && v.length <= max && v === v.trim() && !CONTROL.test(v)

function keys(obj, allowed, required, label, errs) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return errs.push(`${label}: dữ liệu không hợp lệ`), false
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) errs.push(`${label}: không cho phép trường "${k}"`)
  for (const k of required) if (!(k in obj)) errs.push(`${label}: thiếu trường "${k}"`)
  return true
}

function checkMeals(meals, label, errs) {
  if (!Array.isArray(meals) || !meals.length || new Set(meals).size !== meals.length || !meals.every((m) => MEALS.includes(m))) {
    errs.push(`${label}: chọn ít nhất một bữa (sáng, trưa, tối)`)
  }
}

function checkId(id, label, errs) {
  if (!isText(id, 1, 60) || !SLUG.test(id)) errs.push(`${label}: mã chỉ gồm chữ thường không dấu, số và dấu gạch ngang`)
}

export function validateDish(d) {
  const errs = []
  const label = `Món "${d?.name ?? d?.id ?? '?'}"`
  if (!keys(d, ['id', 'name', 'price', 'meals', 'veg'], ['id', 'name', 'price', 'meals'], label, errs)) return errs
  checkId(d.id, label, errs)
  if (!isText(d.name, 2, 40)) errs.push(`${label}: tên dài 2 đến 40 ký tự`)
  if (!isInt(d.price, 5000, 80000)) errs.push(`${label}: giá phải là số nguyên từ 5.000 đến 80.000`)
  checkMeals(d.meals, label, errs)
  if ('veg' in d && typeof d.veg !== 'boolean') errs.push(`${label}: "chay" phải là đúng/sai`)
  return errs
}

export const recipeCostOf = (r) => r.ingredients.reduce((sum, i) => sum + i.cost, 0)

export function validateRecipe(r) {
  const errs = []
  const label = `Công thức "${r?.title ?? r?.id ?? '?'}"`
  const all = ['id', 'title', 'minutes', 'stove', 'veg', 'gear', 'dish', 'ingredients', 'steps', 'tip']
  if (!keys(r, all, ['id', 'title', 'minutes', 'stove', 'veg', 'gear', 'ingredients', 'steps'], label, errs)) return errs
  checkId(r.id, label, errs)
  if (!isText(r.title, 2, 60)) errs.push(`${label}: tên dài 2 đến 60 ký tự`)
  if (!isInt(r.minutes, 1, 60)) errs.push(`${label}: thời gian từ 1 đến 60 phút (sách chỉ có món đơn giản)`)
  if (typeof r.stove !== 'boolean' || typeof r.veg !== 'boolean') errs.push(`${label}: "cần bếp" và "chay" phải là đúng/sai`)
  if (!isText(r.gear, 2, 60)) errs.push(`${label}: dụng cụ dài 2 đến 60 ký tự`)
  if ('tip' in r && !isText(r.tip, 1, 300)) errs.push(`${label}: mẹo dài tối đa 300 ký tự`)
  if ('dish' in r) {
    if (keys(r.dish, ['name', 'meals'], ['name', 'meals'], `${label} (món trong thực đơn)`, errs)) {
      if (!isText(r.dish.name, 2, 40)) errs.push(`${label}: tên món trong thực đơn dài 2 đến 40 ký tự`)
      checkMeals(r.dish.meals, `${label} (món trong thực đơn)`, errs)
    }
  }
  if (!Array.isArray(r.ingredients) || r.ingredients.length < 2 || r.ingredients.length > 12) {
    errs.push(`${label}: cần 2 đến 12 nguyên liệu`)
  } else {
    r.ingredients.forEach((i, n) => {
      const l = `${label}, nguyên liệu ${n + 1}`
      if (!keys(i, ['name', 'qty', 'cost'], ['name', 'qty', 'cost'], l, errs)) return
      if (!isText(i.name, 2, 80)) errs.push(`${l}: tên dài 2 đến 80 ký tự`)
      if (!isText(i.qty, 1, 30)) errs.push(`${l}: lượng dài tối đa 30 ký tự`)
      if (!isInt(i.cost, 0, 50000)) errs.push(`${l}: giá là số nguyên từ 0 đến 50.000`)
    })
    if (r.ingredients.every((i) => isInt(i.cost, 0, 50000))) {
      const total = recipeCostOf(r)
      if (total <= 0 || total > 30000) errs.push(`${label}: tổng giá nguyên liệu phải từ 1đ đến 30.000đ (hiện ${total.toLocaleString('vi-VN')}đ), sách chỉ có món rẻ`)
    }
    if (r.veg === true && r.ingredients.some((i) => typeof i.name === 'string' && NOT_VEG.test(i.name))) {
      errs.push(`${label}: đã đánh dấu chay nhưng nguyên liệu có thịt, cá, tôm, trứng hoặc nước mắm`)
    }
  }
  if (!Array.isArray(r.steps) || r.steps.length < 3 || r.steps.length > 6) errs.push(`${label}: cần 3 đến 6 bước`)
  else r.steps.forEach((s, n) => { if (!isText(s, 5, 400)) errs.push(`${label}, bước ${n + 1}: dài 5 đến 400 ký tự`) })
  return errs
}

export function validateIdea(i) {
  const errs = []
  const label = `Gợi ý "${i?.name ?? i?.id ?? '?'}"`
  if (!keys(i, ['id', 'name', 'min', 'max', 'examples', 'advice'], ['id', 'name', 'min', 'max', 'examples', 'advice'], label, errs)) return errs
  checkId(i.id, label, errs)
  if (!isText(i.name, 3, 80)) errs.push(`${label}: tên dài 3 đến 80 ký tự`)
  if (!isInt(i.min, 0, 50_000_000) || !isInt(i.max, 0, 50_000_000)) errs.push(`${label}: giá là số nguyên từ 0 đến 50 triệu`)
  else if (i.min > i.max) errs.push(`${label}: giá thấp nhất không được lớn hơn giá cao nhất`)
  if (!isText(i.advice, 80, 600)) errs.push(`${label}: lời khuyên dài 80 đến 600 ký tự`)
  if (!Array.isArray(i.examples) || i.examples.length < 1 || i.examples.length > 6) errs.push(`${label}: cần 1 đến 6 quán ví dụ`)
  else i.examples.forEach((e, n) => {
    const l = `${label}, ví dụ ${n + 1}`
    if (keys(e, ['name', 'city'], ['name', 'city'], l, errs)) {
      if (!isText(e.name, 2, 60) || !isText(e.city, 2, 40)) errs.push(`${l}: tên quán và thành phố không được trống`)
    }
  })
  return errs
}

export function validateTips(tips) {
  const errs = []
  if (!Array.isArray(tips) || tips.length < 3 || tips.length > 8) return ['Cần 3 đến 8 điều nên nhớ']
  tips.forEach((t, n) => { if (!isText(t, 10, 200)) errs.push(`Điều nên nhớ ${n + 1}: dài 10 đến 200 ký tự`) })
  return errs
}

const dupes = (items, what, errs) => {
  const seen = new Set()
  for (const x of items) {
    if (seen.has(x.id)) errs.push(`${what}: mã "${x.id}" bị trùng`)
    seen.add(x.id)
  }
}

/** Kiểm tra toàn bộ nội dung, gồm cả ràng buộc chéo (mã công thức không được trùng mã món ăn ngoài). */
export function validateAll({ dishes, recipes, dates }) {
  const errs = []
  if (!Array.isArray(dishes)) errs.push('Danh sách món ăn ngoài không hợp lệ')
  else { dishes.forEach((d) => errs.push(...validateDish(d))); dupes(dishes.filter((d) => d && typeof d === 'object'), 'Món ăn ngoài', errs) }
  if (!Array.isArray(recipes)) errs.push('Danh sách công thức không hợp lệ')
  else { recipes.forEach((r) => errs.push(...validateRecipe(r))); dupes(recipes.filter((r) => r && typeof r === 'object'), 'Công thức', errs) }
  if (dates === null || typeof dates !== 'object' || Array.isArray(dates)) errs.push('Dữ liệu hẹn hò không hợp lệ')
  else {
    errs.push(...validateTips(dates.tips))
    if (!Array.isArray(dates.ideas)) errs.push('Danh sách gợi ý hẹn hò không hợp lệ')
    else { dates.ideas.forEach((i) => errs.push(...validateIdea(i))); dupes(dates.ideas.filter((i) => i && typeof i === 'object'), 'Gợi ý hẹn hò', errs) }
  }
  if (Array.isArray(dishes) && Array.isArray(recipes)) {
    const ids = new Set(dishes.map((d) => d?.id))
    for (const r of recipes) if (ids.has(r?.id)) errs.push(`Mã "${r.id}" bị trùng giữa món ăn ngoài và công thức`)
  }
  return errs
}
