import './platform-stabilization/main-thread-diagnostics-init'
import {
  isStartupStageEnabled,
  markStartupCheckpoint,
} from './platform-stabilization/main-thread-diagnostics'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import StudioDebugRoutes from './routes/StudioDebugRoutes'
import { isIsolatedStudioRoute } from './routes/studio-institute-paths'
import { runBootHygiene } from './platform-stabilization/boot-hygiene'
import './index.css'
import { registerGlobalChunkLoadRecovery } from './utils/chunkLoadRecovery'
import { bootstrapStudioOsBrowserStorage } from './utils/studioOsBrowserStorage'
import { registerPostLoadRenderGuard } from './platform-stabilization/post-load-render-guard'
import { PlatformErrorBoundary } from './platform-stabilization/PlatformErrorBoundary'

/** Legacy application entry — not loaded for /v2/* (see main.tsx dispatcher). */
export function mountLegacyApp(): void {
  const onStudioDebugRoute =
    typeof window !== 'undefined' && isIsolatedStudioRoute(window.location.pathname)

  markStartupCheckpoint('pre', 'main-entry')

  runBootHygiene({ quarantine: true })
  bootstrapStudioOsBrowserStorage()
  registerGlobalChunkLoadRecovery()

  if (isStartupStageEnabled('K') && !onStudioDebugRoute) {
    markStartupCheckpoint('K', 'post-load-render-guard')
    registerPostLoadRenderGuard()
  }

  if (!onStudioDebugRoute && isStartupStageEnabled('E')) {
    markStartupCheckpoint('E', 'auth-session-restore')
    void import('./main-app-boot').then((m) => m.runMainAppBoot())
  }

  const rootEl = document.getElementById('root')
  if (rootEl && isStartupStageEnabled('A')) {
    markStartupCheckpoint('A', 'react-root')

    if (!isStartupStageEnabled('B')) {
      ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
          <div style={{ padding: 24, fontFamily: 'system-ui' }}>
            Startup bisection: stage A only. Use <code>?startupMax=B</code> to enable router.
          </div>
        </React.StrictMode>
      )
    } else if (!isStartupStageEnabled('C')) {
      markStartupCheckpoint('B', 'router-mount')
      ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
          <BrowserRouter>
            <StudioDebugRoutes />
          </BrowserRouter>
        </React.StrictMode>
      )
    } else {
      markStartupCheckpoint('C', 'provider-tree')
      ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
          <PlatformErrorBoundary boundary="main-shell">
            <BrowserRouter>
              <StudioDebugRoutes />
            </BrowserRouter>
          </PlatformErrorBoundary>
        </React.StrictMode>
      )
    }

    if (isStartupStageEnabled('D') && !onStudioDebugRoute) {
      markStartupCheckpoint('D', 'studio-bootstrap-start')
      void import('./studio-os-core/bootstrap/studio-bootstrap-init')
        .then(({ ensureStudioBootstrapStarted }) => ensureStudioBootstrapStarted({ through: 'ui-render' }))
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err)
          console.error('[StudioBootstrap] orchestrator failed to start', err)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('studio-bootstrap-start-failed', { detail: { message: msg } })
            )
          }
        })
    }
  } else if (rootEl) {
    rootEl.textContent =
      'Startup stage A disabled (?startupDisable=A). Heartbeat overlay should still tick.'
  }
}
