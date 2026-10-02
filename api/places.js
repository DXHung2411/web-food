import { handle } from './_lib/places.js'

export default async function handler(req, res) {
  const ip = req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  const { status, body, cache } = await handle({ method: req.method, url: req.url, headers: req.headers, ip })

  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  // Let Vercel's CDN absorb repeated identical searches (also shields our Google quota).
  res.setHeader('Cache-Control', cache ? 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' : 'no-store')
  if (status === 405) res.setHeader('Allow', 'GET')
  res.end(JSON.stringify(body))
}
