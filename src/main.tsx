import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import StudioDebugRoutes, { isStudioDebugPath } from './routes/StudioDebugRoutes'
import './index.css'
import { registerGlobalChunkLoadRecovery } from './utils/chunkLoadRecovery'
import { bootstrapStudioOsBrowserStorage } from './utils/studioOsBrowserStorage'

/** TEMPORARY: skip heavy app boot on public debug routes (/__studio-health, etc.). */
const onStudioDebugRoute =
  typeof window !== 'undefined' && isStudioDebugPath(window.location.pathname)

// Studio OS storage guard — lightweight; safe on debug routes too.
bootstrapStudioOsBrowserStorage()
registerGlobalChunkLoadRecovery()

if (!onStudioDebugRoute) {
  void import('./main-app-boot').then((m) => m.runMainAppBoot())
}

const rootEl = document.getElementById('root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <StudioDebugRoutes />
      </BrowserRouter>
    </React.StrictMode>
  )

  // Bootstrap after React is mounted — avoids production chunk init order failures.
  void import('./studio-os-core/bootstrap/studio-bootstrap-init').then(({ ensureStudioBootstrapStarted }) => {
    ensureStudioBootstrapStarted({ through: 'ui-render' })
  })
}
