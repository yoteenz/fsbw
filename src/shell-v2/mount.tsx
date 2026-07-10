import React from 'react';
import ReactDOM from 'react-dom/client';
import { initShellV2Heartbeat } from './shellV2Heartbeat';
import StudioAppShellV2 from './StudioAppShellV2';

/**
 * Mount Shell V2 — no legacy imports (storage guard, bootstrap, auth, loading screen, etc.).
 */
export function mountShellV2(): void {
  if (typeof document === 'undefined') return;

  initShellV2Heartbeat();

  const rootEl = document.getElementById('root');
  if (!rootEl) {
    console.error('[ShellV2] #root missing');
    return;
  }

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <StudioAppShellV2 />
    </React.StrictMode>
  );
}
