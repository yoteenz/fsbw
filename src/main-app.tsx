/**
 * Main application entry — not loaded for /__studio-os-* diagnostic routes.
 */
import './studio-os/diagnostics/global-boot';
import { isShellV2Path } from './shell-v2/shellV2Matrix';
import { appendBootTrace, recordDiagnosticBootEvent } from './diagnostic-entry/boot-events';

function dispatchMainApp(): void {
  if (typeof window === 'undefined') return;

  recordDiagnosticBootEvent('MAIN_ENTRY_SELECTED');
  appendBootTrace('MAIN_ENTRY_SELECTED', { route: window.location.pathname });

  if (isShellV2Path(window.location.pathname)) {
    void import('./shell-v2/mount').then((m) => m.mountShellV2());
    return;
  }

  void import('./main-legacy').then((m) => m.mountLegacyApp());
}

dispatchMainApp();
