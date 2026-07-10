/**
 * Entry dispatcher — Shell V2 (/v2/*) never loads the legacy startup tree.
 * Black Box diagnostic routes use an isolated entry (no legacy bootstrap).
 */
import { isShellV2Path } from './shell-v2/shellV2Matrix';
import { isIsolatedBlackBoxPath } from './diagnostic-entry/paths';
import { markDiagnosticCheckpoint } from './diagnostic-entry/checkpoints';
import { injectDiagnosticPlainDom, showDiagnosticPlainDomFailed } from './diagnostic-entry/plain-dom';

function dispatchEntry(): void {
  if (typeof window === 'undefined') return;

  markDiagnosticCheckpoint('pre:main-entry');

  const pathname = window.location.pathname;

  if (isIsolatedBlackBoxPath(pathname)) {
    injectDiagnosticPlainDom('loading', pathname);
    void import('./diagnostic-entry/mount-isolated-black-box')
      .then((m) => m.mountIsolatedBlackBox(pathname))
      .catch((err: unknown) => {
        showDiagnosticPlainDomFailed(pathname, err);
      });
    return;
  }

  if (isShellV2Path(pathname)) {
    void import('./shell-v2/mount').then((m) => m.mountShellV2());
    return;
  }

  void import('./main-legacy').then((m) => m.mountLegacyApp());
}

dispatchEntry();
