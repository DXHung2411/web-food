import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { request } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createAdminServer } from '../admin/server.js'

const TOKEN = 'test-token-0123456789abcdef'
let server, base, port, dir

before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'admin-'))
  await cp(new URL('../js/content', import.meta.url), dir, { recursive: true })
  server = createAdminServer({ token: TOKEN, contentDir: dir })
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
  port = server.address().port
  base = `http://127.0.0.1:${port}`
})
after(() => server.close())

const api = (path, { method = 'GET', body, headers = {} } = {}) =>
  fetch(base + path, { method, body: body === undefined ? undefined : JSON.stringify(body), headers: { 'X-Admin-Token': TOKEN, 'Content-Type': 'application/json', ...headers } })

// fetch không cho đặt Host, nên dùng http thô để thử Host giả (DNS rebinding).
const raw = (path, headers) => new Promise((ok, fail) => {
  const req = request({ host: '127.0.0.1', port, path, headers }, (res) => { res.resume(); ok(res.statusCode) })
  req.on('error', fail); req.end()
})

test('API needs the token', async () => {
  assert.equal((await fetch(`${base}/api/content`)).status, 401)
  assert.equal((await fetch(`${base}/api/content`, { headers: { 'X-Admin-Token': 'x'.repeat(27) } })).status, 401)
  assert.equal((await api('/api/content')).status, 200)
})

test('rejects foreign Host (DNS rebinding) and foreign Origin (other websites)', async () => {
  assert.equal(await raw('/api/content', { Host: `evil.example:${port}`, 'X-Admin-Token': TOKEN }), 403)
  assert.equal(await raw('/api/content', { Host: `127.0.0.1:${port}`, Origin: 'https://evil.example', 'X-Admin-Token': TOKEN }), 403)
  assert.equal(await raw('/api/content', { Host: `localhost:${port}`, 'X-Admin-Token': TOKEN }), 200)
})

test('static files: UI served, anything else (server code, .git, traversal) is not', async () => {
  assert.equal((await fetch(`${base}/admin/index.html`)).status, 200)
  assert.equal((await fetch(`${base}/js/schema.js`)).status, 200)
  for (const p of ['/admin/server.js', '/admin/store.js', '/package.json', '/.git/config', '/js/../package.json', '/js/%2e%2e/package.json', '/test/admin.test.js']) {
    assert.equal(await raw(p, { Host: `127.0.0.1:${port}` }), 404, p)
  }
  const csp = (await fetch(`${base}/admin/index.html`)).headers.get('content-security-policy')
  assert.match(csp, /script-src 'self'/)
})

test('static paths: backslashes never reach the file system; every UI file the page needs is served', async () => {
  // Windows regression: URL paths must be matched with "/" whatever the OS separator is.
  for (const p of ['/admin/index.html%5c..%5cserver.js', '/js%5c..%5c..%5cpackage.json', '/js/..%5cpackage.json']) assert.equal(await raw(p, { Host: `127.0.0.1:${port}` }), 404, p)
  for (const p of ['/admin/index.html', '/admin/admin.js', '/admin/admin.css', '/css/style.css', '/js/schema.js', '/js/content/dishes.js', '/fonts/be-vietnam-pro-latin-400-normal.woff2', '/favicon.svg']) {
    assert.equal(await raw(p, { Host: `127.0.0.1:${port}` }), 200, p)
  }
  assert.equal((await fetch(base, { redirect: 'manual' })).status, 302)
})

test('GET returns the three collections with revs', async () => {
  const c = await (await api('/api/content')).json()
  assert.deepEqual(Object.keys(c).sort(), ['dates', 'dishes', 'recipes'])
  assert.ok(c.dishes.rev && Array.isArray(c.dishes.data) && c.dates.data.ideas)
})

test('PUT valid data writes the file and returns a new rev; stale rev gets 409', async () => {
  const c = await (await api('/api/content')).json()
  const added = [...c.dishes.data, { id: 'bun-moc', name: 'Bún mọc', price: 40000, meals: ['sang', 'trua'] }]
  const ok = await api('/api/content/dishes', { method: 'PUT', body: { rev: c.dishes.rev, data: added } })
  assert.equal(ok.status, 200)
  const { rev } = await ok.json()
  assert.notEqual(rev, c.dishes.rev)
  assert.match(await readFile(join(dir, 'dishes.js'), 'utf8'), /"id":"bun-moc"/)
  const stale = await api('/api/content/dishes', { method: 'PUT', body: { rev: c.dishes.rev, data: added } })
  assert.equal(stale.status, 409)
})

test('PUT invalid data is rejected with messages and nothing is written', async () => {
  const c = await (await api('/api/content')).json()
  const before = await readFile(join(dir, 'dishes.js'), 'utf8')
  const bad = await api('/api/content/dishes', { method: 'PUT', body: { rev: c.dishes.rev, data: [...c.dishes.data, { id: 'x', name: 'x', price: -5, meals: [] }] } })
  assert.equal(bad.status, 400)
  assert.ok((await bad.json()).errors.length)
  const clash = await api('/api/content/dishes', { method: 'PUT', body: { rev: c.dishes.rev, data: [...c.dishes.data, { id: c.recipes.data[0].id, name: 'Trùng mã', price: 30000, meals: ['trua'] }] } })
  assert.equal(clash.status, 400)
  assert.equal(await readFile(join(dir, 'dishes.js'), 'utf8'), before)
})

test('PUT: only the 3 known collections, only PUT, only JSON, bounded size', async () => {
  const c = await (await api('/api/content')).json()
  assert.equal((await api('/api/content/passwd', { method: 'PUT', body: { rev: 'x', data: [] } })).status, 404)
  assert.equal((await api('/api/content/..%2Fpackage', { method: 'PUT', body: { rev: 'x', data: [] } })).status, 404)
  assert.equal((await api('/api/content/dishes', { method: 'POST', body: {} })).status, 405)
  assert.equal((await api('/api/content/dishes', { method: 'PUT', body: { rev: c.dishes.rev, data: [] }, headers: { 'Content-Type': 'text/plain' } })).status, 415)
  const big = await fetch(`${base}/api/content/dishes`, { method: 'PUT', headers: { 'X-Admin-Token': TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify({ rev: c.dishes.rev, data: 'x'.repeat(1_100_000) }) })
  assert.equal(big.status, 413)
  assert.equal((await fetch(`${base}/api/content/dishes`, { method: 'PUT', headers: { 'X-Admin-Token': TOKEN, 'Content-Type': 'application/json' }, body: '{not json' })).status, 400)
})

test('refuses to start with a weak token', () => {
  assert.throws(() => createAdminServer({ token: 'short' }))
})
