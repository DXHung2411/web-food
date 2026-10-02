// Đọc/ghi 3 file nội dung (js/content/*.js). Không phụ thuộc thư viện ngoài.
import { createHash, randomBytes } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const NAMES = ['dishes', 'recipes', 'dates']
const FILE = { dishes: 'dishes.js', recipes: 'recipes.js', dates: 'dates.js' }

const HEADERS = {
  dishes: `// Món ăn NGOÀI + giá ƯỚC LƯỢNG (VND/suất, sinh viên, thành phố), theo mặt bằng giá 2026 tìm được trên báo.
//   Có khoảng giá từ nguồn: phở 40–70k, bún bò ~45k, bún riêu/hủ tiếu 30–60k, cơm tấm 40–45k, cơm sinh viên 25–30k,
//   bánh mì 12–30k, bánh bao 9–13k, xôi mặn 10–15k, bánh cuốn 15–20k.
//   Không có nguồn riêng (ước lượng): bún chả, bún đậu, bún thịt nướng, bánh canh, mì Quảng, bánh xèo, bánh ướt, bún cá,
//   xôi gà, cháo, cơm gà, cơm chiên, mì xào, ngô luộc và các món chay.
// Trường: id, name, price (VND), meals (sang|trua|toi), veg (không thịt/cá/trứng).
// File này do trang admin ghi (npm run admin). Có thể sửa tay nhưng nên giữ đúng dạng JSON; mọi chú thích sẽ bị ghi đè khi lưu.`,
  recipes: `// Công thức cho 1 người, nấu đơn giản, giá rẻ. Giá nguyên liệu là ƯỚC LƯỢNG (VND) theo mặt bằng 2026 tìm được trên báo/siêu thị:
// trứng gà ~23.000–70.000đ/chục, thịt ba rọi ~155.000–165.000đ/kg, gạo ~15.000–20.000đ/kg, cà chua ~35.000–42.000đ/kg,
// mì gói ~4.500–5.000đ/gói. Rau, đậu hũ, bánh mì không và gia vị là ước lượng, chưa có nguồn riêng.
// Giá mỗi suất = tổng giá nguyên liệu. Trường "dish" có mặt thì công thức này cũng là một món tự nấu trong trang lập thực đơn.
// File này do trang admin ghi (npm run admin). Chú thích sẽ bị ghi đè khi lưu.`,
  dates: `// Gợi ý kiểu bữa cho buổi hẹn hò. Giá là khoảng VND/người tổng hợp từ báo và trang đặt bàn năm 2026 (xem js/sources.js),
// chưa đối chiếu từng quán. "examples" là quán xuất hiện trong nguồn đó, giá và giờ mở cửa có thể đã đổi.
// "advice" là lời khuyên do người soạn viết. "tips" là các điều nên nhớ ở đầu trang.
// File này do trang admin ghi (npm run admin). Chú thích sẽ bị ghi đè khi lưu.`,
}

const WIDTH = 100

// Định dạng JSON gọn: đối tượng/mảng ngắn nằm trên một dòng, dài thì xuống dòng. Không dấu phẩy thừa.
function pretty(value, pad = '') {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  const isArr = Array.isArray(value)
  const entries = isArr ? value.map((x) => [null, x]) : Object.entries(value)
  if (!entries.length) return isArr ? '[]' : '{}'
  const inline = JSON.stringify(value)
  const one = isArr
    ? `[${entries.map(([, x]) => JSON.stringify(x)).join(', ')}]`
    : `{ ${entries.map(([k, x]) => `${JSON.stringify(k)}: ${JSON.stringify(x)}`).join(', ')} }`
  if (inline.length <= WIDTH - pad.length) return one
  const inner = `${pad}  `
  const lines = entries.map(([k, x]) => `${inner}${isArr ? '' : `${JSON.stringify(k)}: `}${pretty(x, inner)}`)
  return `${isArr ? '[' : '{'}\n${lines.join(',\n')}\n${pad}${isArr ? ']' : '}'}`
}

/** Sinh nội dung file. Dữ liệu đã qua kiểm tra, và JSON.stringify không thể sinh ra mã thực thi. */
export function serialize(name, data) {
  // Danh sách món ăn ngoài: mỗi món đúng một dòng cho dễ nhìn.
  const body = name === 'dishes' ? `[\n${data.map((d) => `  ${JSON.stringify(d)}`).join(',\n')}\n]` : pretty(data)
  return `${HEADERS[name]}\n\nexport default ${body}\n`
}

const rev = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

export async function load(dir, name) {
  const file = join(dir, FILE[name])
  const text = await readFile(file, 'utf8')
  const r = rev(text)
  const mod = await import(`${pathToFileURL(file).href}?rev=${r}`) // ?rev: tránh cache khi file đổi
  return { rev: r, data: mod.default }
}

export async function loadAll(dir) {
  const out = {}
  for (const n of NAMES) out[n] = await load(dir, n)
  return out
}

/** Ghi nguyên tử: ghi file tạm rồi đổi tên, để không bao giờ để lại file ghi dở. */
export async function save(dir, name, data) {
  const file = join(dir, FILE[name])
  const text = serialize(name, data)
  const tmp = `${file}.${randomBytes(4).toString('hex')}.tmp`
  await writeFile(tmp, text, 'utf8')
  await rename(tmp, file)
  return rev(text)
}

export async function currentRev(dir, name) {
  return rev(await readFile(join(dir, FILE[name]), 'utf8'))
}
