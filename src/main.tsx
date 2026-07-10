/**
 * Entry dispatcher — Shell V2 (/v2/*) never loads the legacy startup tree.
 * Legacy app: everything else (/, /admin/*, debug routes, etc.).
 */
import { isShellV2Path } from './shell-v2/shellV2Matrix'

function dispatchEntry(): void {
  if (typeof window === 'undefined') return

  if (isShellV2Path(window.location.pathname)) {
    void import('./shell-v2/mount').then((m) => m.mountShellV2())
    return
  }

  void import('./main-legacy').then((m) => m.mountLegacyApp())
}

dispatchEntry()
