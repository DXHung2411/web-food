// Logic thuần (không đụng DOM) để chạy được cả trên trình duyệt lẫn trong test.

export const LIMITS = { minMoney: 1000, maxMoney: 100_000_000, minDays: 1, maxDays: 31, meals: [1, 2, 3] }

const SLOTS = { 1: ['trua'], 2: ['trua', 'toi'], 3: ['sang', 'trua', 'toi'] }
export const MEAL_LABEL = { sang: 'Sáng', trua: 'Trưa', toi: 'Tối' }

// Mức độ theo tiền/bữa. Ngưỡng chỉ mang tính vui, không phải khuyến nghị dinh dưỡng.
const TIERS = [
  { min: 80000, emoji: '😎', title: 'Còn sang chán', note: 'Thoải mái chọn món, thỉnh thoảng còn khao được bạn.' },
  { min: 50000, emoji: '🙂', title: 'Ổn áp', note: 'Ăn đàng hoàng, đừng phung phí là qua tháng nhẹ nhàng.' },
  { min: 30000, emoji: '😅', title: 'Hơi căng', note: 'Ưu tiên quán bình dân, hạn chế trà sữa nhé.' },
  { min: 15000, emoji: '🥲', title: 'Chế độ sinh tồn', note: 'Tự nấu sẽ cứu bạn. Bạn rủ thì đi uống nước thôi.' },
  { min: 0, emoji: '🆘', title: 'Báo động đỏ', note: 'Sát đáy rồi. Cân nhắc vay tạm bạn bè hoặc gia đình, đừng ngại.' },
]

export function parseMoney(raw) {
  if (typeof raw !== 'string') return null
  const s = raw.toLowerCase().replace(/đ|vnd|\s/g, '')
  const compact = s.match(/^(\d+)tr(\d{1,3})$/) // 1tr2 = 1,2 triệu
  if (compact) return Math.round(Number(`${compact[1]}.${compact[2]}`) * 1_000_000)
  const unit = s.match(/^(\d+(?:[.,]\d+)?)(k|nghìn|ngàn|tr|triệu|m)$/)
  if (unit) {
    const n = Number(unit[1].replace(',', '.'))
    const mult = unit[2] === 'k' || unit[2] === 'nghìn' || unit[2] === 'ngàn' ? 1000 : 1_000_000
    return Math.round(n * mult)
  }
  if (/^\d+$/.test(s) || /^\d{1,3}([.,]\d{3})+$/.test(s)) return Number(s.replace(/[.,]/g, ''))
  return null
}

export function validate({ money, days, meals }) {
  if (!Number.isInteger(money) || money < LIMITS.minMoney || money > LIMITS.maxMoney) return 'Số tiền chưa hợp lệ (từ 1.000đ đến 100 triệu).'
  if (!Number.isInteger(days) || days < LIMITS.minDays || days > LIMITS.maxDays) return 'Số ngày phải từ 1 đến 31.'
  if (!LIMITS.meals.includes(meals)) return 'Số bữa mỗi ngày phải là 1, 2 hoặc 3.'
  return null
}

export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function tierFor(perMeal) {
  return TIERS.find((t) => perMeal >= t.min)
}

function pool(dishes, { veg, cook }) {
  return dishes.filter((d) => (!veg || d.veg) && (cook || !d.cook))
}

/** Số ngày tối đa sống được nếu chỉ ăn món rẻ nhất mỗi bữa (null nếu không có món phù hợp). */
export function surviveDays(dishes, { money, meals, veg, cook }) {
  const p = pool(dishes, { veg, cook })
  let perDay = 0
  for (const slot of SLOTS[meals]) {
    const prices = p.filter((d) => d.meals.includes(slot)).map((d) => d.price)
    if (!prices.length) return null
    perDay += Math.min(...prices)
  }
  return Math.floor(money / perDay)
}

export function makePlan(dishes, input, seed) {
  const err = validate(input)
  if (err) throw new RangeError(err)
  const { money, days, meals, veg = false, cook = true } = input
  const p = pool(dishes, { veg, cook })
  const slots = SLOTS[meals]
  for (const s of slots) if (!p.some((d) => d.meals.includes(s))) throw new RangeError('Không có món phù hợp với lựa chọn này.')

  const rnd = mulberry32(seed)
  const used = new Map()
  const recent = []
  const plan = []
  let remaining = money
  let left = days * meals

  for (let day = 1; day <= days; day++) {
    const row = []
    for (const slot of slots) {
      const allowed = Math.floor(remaining / left)
      const ofSlot = p.filter((d) => d.meals.includes(slot))
      let cands = ofSlot.filter((d) => d.price <= allowed)
      const over = cands.length === 0
      if (over) cands = [ofSlot.reduce((a, b) => (b.price < a.price ? b : a))]
      else {
        // Ưu tiên món ít lặp: bỏ món vừa ăn gần đây, rồi chọn trong nhóm đã ăn ít nhất.
        const fresh = cands.filter((d) => !recent.includes(d.id))
        if (fresh.length) cands = fresh
        const minUse = Math.min(...cands.map((d) => used.get(d.id) ?? 0))
        cands = cands.filter((d) => (used.get(d.id) ?? 0) === minUse)
      }
      const dish = cands[Math.floor(rnd() * cands.length)]
      used.set(dish.id, (used.get(dish.id) ?? 0) + 1)
      recent.push(dish.id)
      if (recent.length > 3) recent.shift()
      remaining -= dish.price
      left -= 1
      row.push({ slot, dish })
    }
    plan.push({ day, meals: row })
  }

  const total = money - remaining
  const perMeal = Math.floor(money / (days * meals))
  return {
    plan,
    total,
    leftover: Math.max(0, remaining),
    shortfall: Math.max(0, -remaining),
    perDay: Math.floor(money / days),
    perMeal,
    tier: tierFor(perMeal),
    survive: remaining < 0 ? surviveDays(dishes, input) : null,
  }
}

export const fmt = (n) => `${new Intl.NumberFormat('vi-VN').format(n)}đ`
const short = (n) => (n % 1000 === 0 ? `${n / 1000}k` : fmt(n))

export function planToText(input, r) {
  const head = `Cuối tháng ăn gì? ${fmt(input.money)} / ${input.days} ngày → ${fmt(r.perDay)}/ngày`
  const lines = r.plan.map((d) => `Ngày ${d.day}: ` + d.meals.map((m) => `${MEAL_LABEL[m.slot]} ${m.dish.name} (${short(m.dish.price)})`).join(' · '))
  const foot = r.shortfall ? `Thiếu ${fmt(r.shortfall)}` : `Dư ${fmt(r.leftover)}`
  return [head, ...lines, foot].join('\n')
}

// --- chia sẻ qua URL hash: chỉ số nguyên đã kiểm tra, không có dữ liệu cá nhân ---
export function encodeState({ money, days, meals, veg, cook }, seed) {
  return `t=${money}&d=${days}&n=${meals}&c=${cook ? 1 : 0}&v=${veg ? 1 : 0}&s=${seed}`
}

export function decodeState(hash) {
  const sp = new URLSearchParams(String(hash).replace(/^#/, ''))
  const int = (k) => (/^\d{1,10}$/.test(sp.get(k) ?? '') ? Number(sp.get(k)) : NaN)
  const input = { money: int('t'), days: int('d'), meals: int('n'), cook: sp.get('c') !== '0', veg: sp.get('v') === '1' }
  const seed = int('s')
  if (validate(input) || !Number.isInteger(seed) || seed > 4294967295) return null
  return { input, seed }
}
