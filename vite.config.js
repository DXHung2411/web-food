import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Serves /api/places during `npm run dev` / `npm run preview` with the same handler Vercel runs.
function localApi(env) {
  const attach = (server) => {
    server.middlewares.use('/api/places', async (req, res) => {
      try {
        Object.assign(process.env, env)
        const file = pathToFileURL(resolve('api/places.js')).href
        const { default: handler } = await import(`${file}?t=${Date.now()}`)
        await handler(req, res)
      } catch (e) {
        console.error(e)
        res.statusCode = 500
        res.end()
      }
    })
  }
  return { name: 'local-api', configureServer: attach, configurePreviewServer: attach }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // server-only vars; nothing is exposed to the client bundle
  return { plugins: [react(), localApi(env)] }
})
