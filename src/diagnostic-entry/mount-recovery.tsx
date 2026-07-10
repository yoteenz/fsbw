/**
 * Mount isolated recovery page — no main application.
 */
import '../platform-stabilization/main-thread-diagnostics-init';
import ReactDOM from 'react-dom/client';
import { markDiagnosticCheckpoint } from './checkpoints';
import { recordDiagnosticBootEvent } from './boot-events';
import { DiagnosticRouteErrorBoundary } from './DiagnosticRouteErrorBoundary';
import { IsolatedDiagnosticShell } from './IsolatedDiagnosticShell';
import { showDiagnosticPlainDomFailed } from './plain-dom';
import StudioOsRecoveryPage from '../pages/debug/studio-os-recovery/page';

export function mountRecoveryPage(pathname: string): void {
  markDiagnosticCheckpoint('diagnostic:recovery-mount', pathname);

  try {
    const rootEl = document.getElementById('root');
    if (!rootEl) throw new Error('Missing #root element');

    const root = ReactDOM.createRoot(rootEl);
    markDiagnosticCheckpoint('diagnostic:root-created', pathname);

    root.render(
      <DiagnosticRouteErrorBoundary route={pathname}>
        <IsolatedDiagnosticShell route={pathname}>
          <StudioOsRecoveryPage />
        </IsolatedDiagnosticShell>
      </DiagnosticRouteErrorBoundary>
    );

    recordDiagnosticBootEvent('DIAGNOSTIC_UI_COMMITTED', { route: pathname });
    markDiagnosticCheckpoint('diagnostic:render-requested', pathname);
  } catch (err) {
    showDiagnosticPlainDomFailed(pathname, err);
    throw err;
  }
}
