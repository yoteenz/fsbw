/** Diagnostic mode — investigation only. Does not change production compile unless ?compilerDiag=1 */

const SESSION_KEY = 'worldCompilerDiagnosticMode_v1';

export function isWorldCompilerDiagnosticMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('compilerDiag') === '1') {
      sessionStorage.setItem(SESSION_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function isAutomaticRetryDisabled(): boolean {
  return isWorldCompilerDiagnosticMode();
}

export function isAutoRunDisabled(): boolean {
  return isWorldCompilerDiagnosticMode();
}

export function isShellRegenerationAfterRunStartDisabled(): boolean {
  return isWorldCompilerDiagnosticMode();
}

export function shouldFreezeOnFirstFailure(): boolean {
  return isWorldCompilerDiagnosticMode();
}
