import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import StudioDebugRoutes, { isStudioDebugPath } from './routes/StudioDebugRoutes'
import './index.css'
import { registerGlobalChunkLoadRecovery } from './utils/chunkLoadRecovery'
import { bootstrapStudioOsBrowserStorage } from './utils/studioOsBrowserStorage'
import { registerPostLoadRenderGuard } from './platform-stabilization/post-load-render-guard'
import { PlatformErrorBoundary } from './platform-stabilization/PlatformErrorBoundary'

/** TEMPORARY: skip heavy app boot on public debug routes (/__studio-health, etc.). */
const onStudioDebugRoute =
  typeof window !== 'undefined' && isStudioDebugPath(window.location.pathname)

// Studio OS storage guard — lightweight; safe on debug routes too.
bootstrapStudioOsBrowserStorage()
registerGlobalChunkLoadRecovery()
registerPostLoadRenderGuard()

if (!onStudioDebugRoute) {
  void import('./main-app-boot').then((m) => m.runMainAppBoot())
}

const rootEl = document.getElementById('root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <PlatformErrorBoundary boundary="main-shell">
        <BrowserRouter>
          <StudioDebugRoutes />
        </BrowserRouter>
      </PlatformErrorBoundary>
    </React.StrictMode>
  )

  // Bootstrap after React is mounted — avoids production chunk init order failures.
  void import('./studio-os-core/bootstrap/studio-bootstrap-init')
    .then(({ ensureStudioBootstrapStarted }) => ensureStudioBootstrapStarted({ through: 'ui-render' }))
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[StudioBootstrap] orchestrator failed to start', err);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('studio-bootstrap-start-failed', { detail: { message: msg } })
        );
      }
    });
}
