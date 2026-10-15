import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sends every /admin/... URL to the admin app so page refreshes work
// in `npm run dev` and `npm run preview` (vercel.json does the same in production).
function adminFallback() {
  const rewrite = (req, _res, next) => {
    const url = req.url.split('?')[0]
    const isAdminPage = url === '/admin' || (url.startsWith('/admin/') && !url.includes('.'))
    if (isAdminPage) req.url = '/admin/index.html'
    next()
  }
  return {
    name: 'admin-fallback',
    configureServer(server) { server.middlewares.use(rewrite) },
    configurePreviewServer(server) { server.middlewares.use(rewrite) },
  }
}

export default defineConfig({
  plugins: [react(), adminFallback()],
  build: {
    rollupOptions: {
      input: {
        portal: resolve(__dirname, 'index.html'),       // captive portal at /
        admin: resolve(__dirname, 'admin/index.html'),  // dashboard at /admin
      },
    },
  },
})
