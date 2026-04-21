/**
 * Single source of truth for Vite. Do not add `vite.config.js` in this repo: Vite resolves
 * `vite.config.js` before `vite.config.ts`, so a stale .js would ignore this file (no /api proxy).
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import http from 'node:http'

const LIVE_RELOAD_PORT = 3002

/** Separate server for reload token so it works from mobile (no Vite middleware order issues). */
function liveReloadPolling() {
  let reloadToken = 0
  return {
    name: 'live-reload-polling',
    configureServer(server: any) {
      console.log('[vite] live-reload plugin: starting...')
      server.watcher.on('change', () => { reloadToken++ })
      const reloadServer = http.createServer((_req, res) => {
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(String(reloadToken))
      })
      reloadServer.on('error', (err: NodeJS.ErrnoException) => {
        console.error('[vite] live-reload port', LIVE_RELOAD_PORT, 'failed:', err.message)
        if (err.code === 'EADDRINUSE') console.error('[vite] Try closing whatever is using port', LIVE_RELOAD_PORT)
      })
      reloadServer.listen(LIVE_RELOAD_PORT, '0.0.0.0', () => {
        console.log(`[vite] live-reload: http://localhost:${LIVE_RELOAD_PORT} (or http://<your-ip>:${LIVE_RELOAD_PORT}) — page auto-reloads when you save a file`)
      })
    },
  }
}

/** Default deployed API origin when env is missing — matches `npm run dev:proxy` so /api/session-* works locally. */
const DEFAULT_DEV_API_TARGET = 'https://fsbw.vercel.app'

/** Log after dev server hooks run (same phase as live-reload) so the line is not lost to screen clear / config-load quirks. */
function logDevApiProxyPlugin(apiTarget: string) {
  return {
    name: 'log-dev-api-proxy',
    configureServer() {
      const line = apiTarget
        ? `[vite] Session API proxy: /api -> ${apiTarget}`
        : '[vite] Session API proxy: OFF — /api/session-cookie and /api/session-restore will fail until VITE_DEV_PROXY_TARGET or VITE_API_BASE is set'
      console.log(line)
    },
  }
}

function apiDevNoProxyGuard(apiTarget: string) {
  return {
    name: 'api-dev-no-proxy-guard',
    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      if (apiTarget) return
      server.middlewares.use((req: { url?: string }, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (s: string) => void }, next: () => void) => {
        const path = req.url?.split('?')[0] ?? ''
        if (!path.startsWith('/api')) return next()
        res.statusCode = 503
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(
          JSON.stringify({
            error: 'API proxy not configured',
            hint: 'Set VITE_DEV_PROXY_TARGET or VITE_API_BASE in .env.local, or run npm run dev:proxy. Session routes need /api proxied to your Vercel deployment.',
          }),
        )
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // In dev, proxy /api to deployed backend when VITE_DEV_PROXY_TARGET or VITE_API_BASE is set.
  // loadEnv() only reads .env files; process.env is used so shell-set vars (e.g. start-dev.ps1) work.
  const env = loadEnv(mode, process.cwd(), '')
  let apiTarget = (env.VITE_DEV_PROXY_TARGET || env.VITE_API_BASE
    || process.env.VITE_DEV_PROXY_TARGET || process.env.VITE_API_BASE || '').trim()
  if (!apiTarget && mode === 'development') {
    apiTarget = DEFAULT_DEV_API_TARGET
  }
  const proxy = apiTarget
    ? {
        '/api': {
          target: apiTarget.replace(/\/$/, ''),
          changeOrigin: true,
        },
      }
    : undefined

  return {
  plugins: [
    ...(command === 'serve' ? [logDevApiProxyPlugin(apiTarget)] : []),
    apiDevNoProxyGuard(apiTarget),
    liveReloadPolling(),
    react(),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Use content-based hashing for better cache invalidation
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Split vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Three.js / globe.gl are very large; keep out of the default vendor chunk so the main
            // bundle stays loadable on slow networks and deploy chunk-cache invalidation is less brittle.
            if (
              id.includes('/three/') ||
              id.includes('node_modules/three') ||
              id.includes('globe.gl') ||
              id.includes('three-globe') ||
              id.includes('three-render-objects')
            ) {
              return 'vendor-globe';
            }
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3001,
    host: '0.0.0.0', // Explicitly bind to all interfaces for mobile access
    open: false,
    strictPort: true, // Force port 3001, don't fall back to other ports
    hmr: true,
    proxy,
    watch: {
      // Polling: server reliably sees file changes (helps on Windows / paths with spaces)
      usePolling: true,
      interval: 300,
    },
    // Ensure SPA routing works - all routes serve index.html
    middlewareMode: false,
  },
  logLevel: 'info',
  clearScreen: false,
  }
})


