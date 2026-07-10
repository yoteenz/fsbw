/**
 * Lightweight flight recorder for isolated diagnostic routes — no main-app monitors.
 */
import { recordFlightEvent, markFlightRecorderInitialized } from '../studio-os/diagnostics/flight-recorder/recorder';
import { readPreMainProbe, recordDiagnosticBootEvent } from './boot-events';

let installed = false;

export function initDiagnosticFlightRecorder(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  (window as unknown as { __STUDIO_OS_RECORD__?: typeof recordFlightEvent }).__STUDIO_OS_RECORD__ =
    recordFlightEvent;

  recordFlightEvent('RECORDER_ATTACHED', 'diagnostic-entry');
  markFlightRecorderInitialized();

  const probe = readPreMainProbe();
  recordDiagnosticBootEvent('PRE_MAIN_ENTRY', {
    route: probe?.route,
    buildId: probe?.buildId,
    buildMismatch: probe?.buildMismatch,
  });

  recordFlightEvent('RECORDER_READY', 'diagnostic-entry');
  (window as unknown as { __STUDIO_OS_FLIGHT_RECORDER__?: true }).__STUDIO_OS_FLIGHT_RECORDER__ = true;
}
