/**
 * Isolated Black Box diagnostic mount — no App.tsx, no legacy bootstrap, no auth.
 */
import '../platform-stabilization/main-thread-diagnostics-init';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { markDiagnosticCheckpoint } from './checkpoints';
import { DiagnosticRouteErrorBoundary } from './DiagnosticRouteErrorBoundary';
import { IsolatedDiagnosticShell } from './IsolatedDiagnosticShell';
import { showDiagnosticPlainDomFailed } from './plain-dom';
import type { IsolatedBlackBoxPath } from './paths';

import StudioOsFlightRecorderPage from '../pages/debug/studio-os-flight-recorder/page';
import StudioOsSessionReportPage from '../pages/debug/studio-os-session-report/page';

function resolvePage(pathname: IsolatedBlackBoxPath): React.ComponentType {
  if (pathname === '/__studio-os-flight-recorder') return StudioOsFlightRecorderPage;
  return StudioOsSessionReportPage;
}

export function mountIsolatedBlackBox(pathname: IsolatedBlackBoxPath): void {
  markDiagnosticCheckpoint('diagnostic:path-detected', pathname);

  try {
    markDiagnosticCheckpoint('diagnostic:module-loaded', pathname);

    const rootEl = document.getElementById('root');
    if (!rootEl) {
      throw new Error('Missing #root element');
    }

    const Page = resolvePage(pathname);
    const root = ReactDOM.createRoot(rootEl);
    markDiagnosticCheckpoint('diagnostic:root-created', pathname);

    root.render(
      <DiagnosticRouteErrorBoundary route={pathname}>
        <IsolatedDiagnosticShell route={pathname}>
          <Page />
        </IsolatedDiagnosticShell>
      </DiagnosticRouteErrorBoundary>
    );

    markDiagnosticCheckpoint('diagnostic:render-requested', pathname);
  } catch (err) {
    showDiagnosticPlainDomFailed(pathname, err);
    markDiagnosticCheckpoint('diagnostic:failed', err instanceof Error ? err.message : String(err));
    throw err;
  }
}
