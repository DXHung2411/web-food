// Logic thuần (không đụng DOM) để chạy được cả trên trình duyệt lẫn trong test.

// Giữ lại một khoản nhỏ phòng khi giá thực tế cao hơn ước lượng (chỉ khi vẫn đủ tiền cho cả kỳ).
const BUFFER = 10000

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

export function validate({ money, days, meals, cook = true, eatOut = true }) {
  if (!Number.isInteger(money) || money < LIMITS.minMoney || money > LIMITS.maxMoney) return 'Số tiền chưa hợp lệ (từ 1.000đ đến 100 triệu).'
  if (!Number.isInteger(days) || days < LIMITS.minDays || days > LIMITS.maxDays) return 'Số ngày phải từ 1 đến 31.'
  if (!LIMITS.meals.includes(meals)) return 'Số bữa mỗi ngày phải là 1, 2 hoặc 3.'
  if (!cook && !eatOut) return 'Chọn ít nhất một cách ăn: tự nấu hoặc ăn ngoài.'
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

// cook: nhận món tự nấu. eatOut: nhận món ăn ngoài. Phải bật ít nhất một.
function pool(dishes, { veg, cook, eatOut }) {
  return dishes.filter((d) => (!veg || d.veg) && (d.cook ? cook : eatOut))
}

/** Số ngày tối đa sống được nếu chỉ ăn món rẻ nhất mỗi bữa (null nếu không có món phù hợp). */
export function surviveDays(dishes, { money, meals, veg, cook, eatOut = true }) {
  const p = pool(dishes, { veg, cook, eatOut })
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
  const { money, days, meals, veg = false, cook = true, eatOut = true } = input
  const p = pool(dishes, { veg, cook, eatOut })
  const slots = SLOTS[meals]
  for (const s of slots) if (!p.some((d) => d.meals.includes(s))) throw new RangeError('Không có món phù hợp với lựa chọn này. Thử bật thêm "Ăn ngoài" hoặc giảm số bữa.')

  const ofSlot = Object.fromEntries(slots.map((s) => [s, p.filter((d) => d.meals.includes(s))]))
  const cheapest = Object.fromEntries(slots.map((s) => [s, Math.min(...ofSlot[s].map((d) => d.price))]))
  const cheapestDay = slots.reduce((sum, s) => sum + cheapest[s], 0)

  const rnd = mulberry32(seed)
  const used = new Map()
  const recent = []
  const plan = []
  const buffer = money - BUFFER >= cheapestDay * days ? BUFFER : 0
  let remaining = money - buffer
  let left = days * meals
  const avgMeal = remaining / left

  for (let day = 1; day <= days; day++) {
    // Không đủ tiền cho một ngày đầy đủ (kể cả chọn rẻ nhất) thì dừng, không bao giờ vượt ngân sách.
    if (remaining < cheapestDay) break
    const row = []
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      const reserve = slots.slice(i + 1).reduce((sum, s) => sum + cheapest[s], 0) // chừa tiền cho các bữa còn lại trong ngày
      // Trần theo mức trung bình để các ngày chi đều nhau, không dồn tiền vào cuối kỳ.
      const allowed = Math.min(Math.floor(remaining / left), Math.floor(avgMeal * 1.25), remaining - reserve)
      let cands = ofSlot[slot].filter((d) => d.price <= allowed)
      if (cands.length === 0) cands = ofSlot[slot].filter((d) => d.price === cheapest[slot])
      else {
        // Chọn món sát mức tiền cho phép để dùng hết ngân sách; vẫn trộn ngẫu nhiên và tránh lặp món.
        const score = (d) =>
          d.price / allowed + rnd() * 0.3
          - 0.4 * (used.get(d.id) ?? 0) - (recent.includes(d.id) ? 1 : 0)
        cands = [cands.reduce((best, d) => (score(d) > score(best) ? d : best))]
      }
      const dish = cands[0]
      used.set(dish.id, (used.get(dish.id) ?? 0) + 1)
      recent.push(dish.id)
      if (recent.length > 3) recent.shift()
      remaining -= dish.price
      left -= 1
      row.push({ slot, dish })
    }
    plan.push({ day, meals: row })
  }

  // Còn dư thì nâng dần các bữa đang rẻ nhất lên món đắt hơn một bậc, cho tiền chi gần bằng tiền có.
  const flat = plan.flatMap((d) => d.meals)
  const near = (i) => [-2, -1, 1, 2].map((k) => flat[i + k]?.dish.id)
  const stuck = new Set()
  for (;;) {
    let target = -1
    for (let i = 0; i < flat.length; i++) {
      if (!stuck.has(i) && (target < 0 || flat[i].dish.price < flat[target].dish.price)) target = i
    }
    if (target < 0) break
    const cur = flat[target]
    const ups = ofSlot[cur.slot].filter((d) => d.price > cur.dish.price && d.price - cur.dish.price <= remaining && !near(target).includes(d.id))
    if (!ups.length) {
      stuck.add(target)
      continue
    }
    const next = Math.min(...ups.map((d) => d.price))
    const close = ups.filter((d) => d.price <= next + 5000)
    const least = Math.min(...close.map((d) => used.get(d.id) ?? 0))
    const opts = close.filter((d) => (used.get(d.id) ?? 0) === least)
    const pick = opts[Math.floor(rnd() * opts.length)]
    used.set(cur.dish.id, used.get(cur.dish.id) - 1)
    used.set(pick.id, (used.get(pick.id) ?? 0) + 1)
    remaining -= pick.price - cur.dish.price
    cur.dish = pick
  }

  const perMeal = Math.floor(money / (days * meals))
  const needed = cheapestDay * days
  return {
    plan,
    coveredDays: plan.length,
    requestedDays: days,
    total: money - buffer - remaining,
    leftover: remaining + buffer,
    needed, // số tiền tối thiểu để đủ toàn bộ số ngày (chọn món rẻ nhất mọi bữa)
    shortfall: Math.max(0, needed - money),
    roomy: remaining + buffer >= 100000, // dư nhiều vì ngân sách vượt mức các món trong danh sách
    perDay: Math.floor(money / days),
    perMeal,
    tier: tierFor(perMeal),
  }
}

export const fmt = (n) => `${new Intl.NumberFormat('vi-VN').format(n)}đ`
const short = (n) => (n % 1000 === 0 ? `${n / 1000}k` : fmt(n))

export function planToText(input, r) {
  const head = `Cuối tháng ăn gì? ${fmt(input.money)} / ${input.days} ngày → ${fmt(r.perDay)}/ngày`
  const partial = r.coveredDays < r.requestedDays ? `Chỉ đủ ${r.coveredDays}/${r.requestedDays} ngày, cần thêm ${fmt(r.shortfall)}` : null
  const lines = r.plan.map((d) => `Ngày ${d.day}: ` + d.meals.map((m) => `${MEAL_LABEL[m.slot]} ${m.dish.name} (${short(m.dish.price)})`).join(' · '))
  return [head, ...lines, partial ?? `Dư ${fmt(r.leftover)}`].join('\n')
}

// --- chia sẻ qua URL hash: chỉ số nguyên đã kiểm tra, không có dữ liệu cá nhân ---
export function encodeState({ money, days, meals, veg, cook, eatOut }, seed) {
  const out = eatOut === false ? '&o=0' : '' // mặc định có ăn ngoài, nên link cũ vẫn hợp lệ
  return `t=${money}&d=${days}&n=${meals}&c=${cook ? 1 : 0}&v=${veg ? 1 : 0}${out}&s=${seed}`
}

export function decodeState(hash) {
  const sp = new URLSearchParams(String(hash).replace(/^#/, ''))
  const int = (k) => (/^\d{1,10}$/.test(sp.get(k) ?? '') ? Number(sp.get(k)) : NaN)
  const input = { money: int('t'), days: int('d'), meals: int('n'), cook: sp.get('c') !== '0', veg: sp.get('v') === '1', eatOut: sp.get('o') !== '0' }
  const seed = int('s')
  if (validate(input) || !Number.isInteger(seed) || seed > 4294967295) return null
  return { input, seed }
}
