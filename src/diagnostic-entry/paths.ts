/** Black Box diagnostic routes — isolated entry (no legacy app tree). */
export const ISOLATED_BLACK_BOX_PATHS = [
  '/__studio-os-flight-recorder',
  '/__studio-os-session-report',
] as const;

export type IsolatedBlackBoxPath = (typeof ISOLATED_BLACK_BOX_PATHS)[number];

export function isIsolatedBlackBoxPath(pathname: string): pathname is IsolatedBlackBoxPath {
  return (ISOLATED_BLACK_BOX_PATHS as readonly string[]).includes(pathname);
}
