/**
 * Investigation instrumentation readiness — shared by export and live status UI.
 */
import { isStallEvidenceRecordingEnabled } from './stall-evidence';

/** True when stall-evidence instrumentation is active in this browser context. */
export function isInvestigationInstrumentationReady(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isStallEvidenceRecordingEnabled()) return false;
  const win = window as unknown as {
    __WC_INVESTIGATION_READY__?: boolean;
    __WC_EXPORT_INVESTIGATION__?: unknown;
  };
  return win.__WC_INVESTIGATION_READY__ === true || typeof win.__WC_EXPORT_INVESTIGATION__ === 'function';
}
