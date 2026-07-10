/** Black Box diagnostic routes — isolated entry (no legacy app tree). */
export const ISOLATED_BLACK_BOX_PATHS = [
  '/__studio-os-flight-recorder',
  '/__studio-os-session-report',
  '/__studio-os-live-runtime',
  '/__studio-os-recovery',
] as const;

export type DiagnosticRoutePath = (typeof ISOLATED_BLACK_BOX_PATHS)[number];

/** Any Studio OS diagnostic route — prefix match for future routes. */
export function isDiagnosticRoute(pathname: string): pathname is DiagnosticRoutePath {
  if (!pathname.startsWith('/__studio-os-')) return false;
  return (ISOLATED_BLACK_BOX_PATHS as readonly string[]).includes(pathname);
}

/** @deprecated use isDiagnosticRoute */
export function isIsolatedBlackBoxPath(pathname: string): pathname is DiagnosticRoutePath {
  return isDiagnosticRoute(pathname);
}
