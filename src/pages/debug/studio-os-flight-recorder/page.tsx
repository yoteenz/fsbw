/**
 * Studio OS Flight Recorder — global operational console.
 * Path: /__studio-os-flight-recorder
 */
import { FlightRecorderConsole } from '../../../studio-os/diagnostics/flight-recorder-console/FlightRecorderConsole';

export default function StudioOsFlightRecorderPage() {
  return (
    <div data-temp-debug-route="__studio-os-flight-recorder">
      <FlightRecorderConsole title="Studio OS Black Box Flight Recorder™" showReportPanel />
      <p style={{ padding: '0 16px 16px', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
        <a href="/__studio-os-live-runtime" style={{ color: '#7dd3fc' }}>
          /__studio-os-live-runtime
        </a>
        {' · '}
        <a href="/__studio-os-session-report" style={{ color: '#7dd3fc' }}>
          /__studio-os-session-report
        </a>
      </p>
    </div>
  );
}
