/**
 * Single source of truth for Vite. Do not add `vite.config.js` in this repo: Vite resolves
 * `vite.config.js` before `vite.config.ts`, so a stale .js would ignore this file (no /api proxy).
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { site00AsstsLocalApiPlugin } from './scripts/vite-site00-assts-local-api.mjs'
import { studioVpLocalApiPlugin } from './scripts/vite-studio-vp-local-api.mjs'

/** Default deployed API origin when env is missing — matches `npm run dev:proxy` so /api/session-* works locally. */
const DEFAULT_DEV_API_TARGET = 'https://fsbw.vercel.app'

/** Log after dev server hooks run so the line is not lost to screen clear / config-load quirks. */
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

  const globeEmbedBuild =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CF_PAGES_COMMIT_SHA ||
    (mode === 'development' ? 'dev-local' : Date.now().toString(36))

  /** Cloud Agent mobile preview (trycloudflare or named Cloudflare Tunnel): no HMR on mobile. */
  const cloudMobilePreview =
    command === 'serve' &&
    (process.env.FSBW_CLOUD_MOBILE_PREVIEW === '1' || process.env.FSBW_CLOUD_MOBILE_PREVIEW === 'true')

  const tunnelHostname = (process.env.CLOUDFLARE_TUNNEL_HOSTNAME || '').trim()
  let tunnelAllowedHost: string | undefined
  if (tunnelHostname) {
    try {
      tunnelAllowedHost = new URL(
        tunnelHostname.includes('://') ? tunnelHostname : `https://${tunnelHostname}`,
      ).hostname
    } catch {
      tunnelAllowedHost = tunnelHostname.replace(/^https?:\/\//, '').split('/')[0]
    }
  }

  function injectAppBuildIdPlugin() {
    return {
      name: 'inject-app-build-id',
      transformIndexHtml(html: string) {
        return html.replace(/__APP_BUILD_ID__/g, globeEmbedBuild)
      },
    }
  }

  function logCloudMobilePreviewPlugin() {
    return {
      name: 'log-cloud-mobile-preview',
      configureServer() {
        console.log('[vite] Cloud mobile preview: HMR disabled — pull-to-refresh / manual reload only (no auto-reload on tab return).')
      },
    }
  }

  /** Vite still injects /@vite/client when hmr:false; that client reloads on WS reconnect after tab background. */
  function stripViteClientForCloudPreviewPlugin() {
    return {
      name: 'strip-vite-client-cloud-preview',
      transformIndexHtml: {
        order: 'post' as const,
        handler(html: string) {
          return html.replace(/\s*<script type="module" src="\/@vite\/client"><\/script>\s*/g, '\n')
        },
      },
    }
  }

  /** Cloudflare Tunnel caches Vite module responses by default — force revalidation every request. */
  function cloudPreviewNoCachePlugin() {
    return {
      name: 'cloud-preview-no-cache',
      configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
        server.middlewares.use((_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
          next()
        })
      },
    }
  }

  return {
  define: {
    /** Bust admin globe iframe cache on every production deploy (inlined at build time). */
    __GLOBE_EMBED_BUILD__: JSON.stringify(globeEmbedBuild),
    'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(globeEmbedBuild),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(globeEmbedBuild),
  },
  plugins: [
    injectAppBuildIdPlugin(),
    ...(command === 'serve'
      ? [logDevApiProxyPlugin(apiTarget), site00AsstsLocalApiPlugin(), studioVpLocalApiPlugin()]
      : []),
    ...(cloudMobilePreview ? [logCloudMobilePreviewPlugin(), stripViteClientForCloudPreviewPlugin(), cloudPreviewNoCachePlugin()] : []),
    apiDevNoProxyGuard(apiTarget),
    react(cloudMobilePreview ? { fastRefresh: false } : undefined),
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
        manualChunks: (id) => {
          // Single vendor chunk — avoids vendor ↔ vendor-react circular init (blank screen in prod).
          if (id.includes('node_modules')) {
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
    // Cloud Agent mobile preview (Quick Tunnel or Named Tunnel)
    allowedHosts: [
      '.trycloudflare.com',
      ...(tunnelAllowedHost ? [tunnelAllowedHost] : []),
    ],
    open: false,
    strictPort: true, // Force port 3001, don't fall back to other ports
    // Cloud Agent tunnel: HMR off — Vite's dev client calls location.reload() after WS reconnect when the tab
    // returns from background (mobile Safari/Chrome suspend the socket). Founder refreshes manually instead.
    // Local dev / LAN: HMR through HTTPS reverse proxy when tunneled without FSBW_CLOUD_MOBILE_PREVIEW.
    hmr: cloudMobilePreview
      ? false
      : {
          protocol: 'wss',
          clientPort: 443,
        },
    proxy,
    watch: {
      // Polling only on Windows; Linux cloud agents use native fs events (fewer spurious HMR triggers).
      usePolling: process.platform === 'win32',
      interval: 300,
    },
    // Ensure SPA routing works - all routes serve index.html
    middlewareMode: false,
  },
  logLevel: 'info',
  clearScreen: false,
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
  },
  };
})


