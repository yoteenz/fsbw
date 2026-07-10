/**
 * Investigation instrumentation readiness — shared by export and live status UI.
 */
import { isRecorderConnected, loadInvestigationRecorderBootState } from './investigation-recorder-boot';
import { isStallEvidenceRecordingEnabled } from './stall-evidence';

/** True when boot-time recorder registered and self-test passed. */
export function isInvestigationInstrumentationReady(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isStallEvidenceRecordingEnabled()) return false;
  return isRecorderConnected();
}

export function isInvestigationBootComplete(): boolean {
  return loadInvestigationRecorderBootState()?.bootComplete === true;
}
