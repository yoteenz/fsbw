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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // In dev, proxy /api to deployed backend when VITE_DEV_PROXY_TARGET or VITE_API_BASE is set
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_PROXY_TARGET || env.VITE_API_BASE || ''
  if (!apiTarget && mode === 'development') {
    console.log('[vite] No API proxy: set VITE_DEV_PROXY_TARGET or VITE_API_BASE in .env.local (project root) and restart.')
  }
  const proxy = apiTarget
    ? {
        '/api': {
          target: apiTarget.replace(/\/$/, ''),
          changeOrigin: true,
        },
      }
    : undefined
  if (proxy) {
    console.log('[vite] API proxy: /api ->', apiTarget)
  }

  return {
  plugins: [liveReloadPolling(), react()],
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


