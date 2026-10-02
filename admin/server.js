// Máy chủ admin CHẠY TRÊN MÁY BẠN (chỉ lắng nghe 127.0.0.1). Không deploy lên web.
// Chạy: npm run admin. Nó đọc/ghi 3 file trong js/content/ sau khi kiểm tra dữ liệu.
//
// Vì sao vẫn cần phòng thủ dù chỉ ở localhost: bất kỳ trang web nào bạn mở trong trình duyệt đều có thể thử gọi tới
// http://127.0.0.1:cổng. Nên server: (1) yêu cầu token ngẫu nhiên mỗi lần chạy, (2) kiểm tra Host chống DNS rebinding,
// (3) từ chối Origin lạ, (4) chỉ nhận JSON, (5) chỉ ghi đúng 3 file cố định, (6) kiểm tra dữ liệu bằng js/schema.js.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NAMES, currentRev, loadAll, save } from './store.js'
import { validateAll } from '../js/schema.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MAX_BODY = 1_000_000
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
// Chỉ phục vụ các thư mục cần cho giao diện admin (đọc-only).
const PUBLIC_PREFIXES = ['admin/index.html', 'admin/admin.js', 'admin/admin.css', 'css/', 'fonts/', 'js/', 'favicon.svg']

const sha = (s) => createHash('sha256').update(s).digest()
const sameToken = (a, b) => typeof a === 'string' && timingSafeEqual(sha(a), sha(b))

export function createAdminServer({ token, rootDir = ROOT, contentDir = join(rootDir, 'js', 'content') } = {}) {
  if (!token || token.length < 16) throw new Error('token quá ngắn')

  const send = (res, status, body, headers = {}) => {
    res.writeHead(status, { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': CSP, ...headers })
    res.end(body)
  }
  const json = (res, status, obj) => send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' })

  async function readBody(req) {
    const chunks = []
    let size = 0
    for await (const c of req) {
      size += c.length
      if (size > MAX_BODY) throw Object.assign(new Error('too large'), { status: 413 })
      chunks.push(c)
    }
    return Buffer.concat(chunks).toString('utf8')
  }

  async function serveStatic(res, pathname) {
    const rel = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '')
    if (rel.split(sep).includes('..') || !PUBLIC_PREFIXES.some((p) => rel === p || (p.endsWith('/') && rel.startsWith(p)))) return json(res, 404, { error: 'Không tìm thấy' })
    if (!TYPES[extname(rel)]) return json(res, 404, { error: 'Không tìm thấy' })
    try {
      send(res, 200, await readFile(join(rootDir, rel)), { 'Content-Type': TYPES[extname(rel)] })
    } catch {
      json(res, 404, { error: 'Không tìm thấy' })
    }
  }

  async function api(req, res, pathname) {
    if (!sameToken(req.headers['x-admin-token'], token)) return json(res, 401, { error: 'Thiếu hoặc sai token. Mở lại bằng đường dẫn in ra khi chạy npm run admin.' })

    if (pathname === '/api/content') {
      if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
      return json(res, 200, await loadAll(contentDir))
    }
    const m = pathname.match(/^\/api\/content\/([a-z]+)$/)
    if (!m || !NAMES.includes(m[1])) return json(res, 404, { error: 'Không tìm thấy' })
    if (req.method !== 'PUT') return json(res, 405, { error: 'Method not allowed' })
    if (!/^application\/json(;|$)/i.test(req.headers['content-type'] ?? '')) return json(res, 415, { error: 'Chỉ nhận application/json' })

    let payload
    try {
      payload = JSON.parse(await readBody(req))
    } catch (e) {
      return json(res, e.status ?? 400, { error: e.status === 413 ? 'Dữ liệu quá lớn' : 'JSON không hợp lệ' })
    }
    const name = m[1]
    if (payload === null || typeof payload !== 'object' || typeof payload.rev !== 'string' || !('data' in payload)) return json(res, 400, { error: 'Thiếu rev hoặc data' })

    // File đã bị sửa ngoài trang admin (ví dụ sửa tay) thì không ghi đè mù quáng.
    if ((await currentRev(contentDir, name)) !== payload.rev) return json(res, 409, { error: 'File đã thay đổi ngoài trang admin. Hãy tải lại trang.' })

    const current = await loadAll(contentDir)
    const next = { dishes: current.dishes.data, recipes: current.recipes.data, dates: current.dates.data, [name]: payload.data }
    const errors = validateAll(next)
    if (errors.length) return json(res, 400, { error: 'Dữ liệu chưa hợp lệ', errors })
    return json(res, 200, { rev: await save(contentDir, name, payload.data) })
  }

  return createServer(async (req, res) => {
    try {
      const port = req.socket.localPort
      const host = req.headers.host
      if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return json(res, 403, { error: 'Host không hợp lệ' })
      const origin = req.headers.origin
      if (origin !== undefined && origin !== `http://${host}`) return json(res, 403, { error: 'Origin không hợp lệ' })

      const { pathname } = new URL(req.url, `http://${host}`)
      if (pathname === '/') return send(res, 302, '', { Location: '/admin/index.html' })
      if (pathname === '/admin/' || pathname === '/admin') return send(res, 302, '', { Location: '/admin/index.html' })
      if (pathname.startsWith('/api/')) return await api(req, res, pathname)
      if (req.method !== 'GET') return json(res, 405, { error: 'Method not allowed' })
      return await serveStatic(res, pathname)
    } catch (e) {
      console.error(e)
      json(res, 500, { error: 'Lỗi máy chủ' })
    }
  })
}

// Chạy trực tiếp: node admin/server.js
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.ADMIN_PORT ?? 8787)
  const token = randomBytes(24).toString('base64url')
  createAdminServer({ token }).listen(port, '127.0.0.1', () => {
    console.log(`\nTrang admin: http://127.0.0.1:${port}/admin/index.html#token=${token}`)
    console.log('Chỉ mở được trên máy này. Token đổi mỗi lần chạy. Nhấn Ctrl+C để dừng.\n')
  }).on('error', (e) => {
    console.error(e.code === 'EADDRINUSE' ? `Cổng ${port} đang bận. Thử: ADMIN_PORT=8788 npm run admin` : e)
    process.exit(1)
  })
}
