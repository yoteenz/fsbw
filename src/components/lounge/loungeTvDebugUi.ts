/**
 * Lounge TV in-glass debug inspectors (colored dashed panels, TV DEBUG chip).
 * Flip to true locally when re-enabling dev diagnostics inside the TV surface.
 */
export const LOUNGE_TV_DEBUG_UI_ENABLED = false;

export function isLoungeTvDebugUiEnabled(): boolean {
  return LOUNGE_TV_DEBUG_UI_ENABLED && import.meta.env.DEV;
}
