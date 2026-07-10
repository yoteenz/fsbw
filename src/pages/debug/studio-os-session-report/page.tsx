/**
 * Studio OS Session Forensic Report — global recorder view + evidence panel.
 * Path: /__studio-os-session-report
 */
import { FlightRecorderConsole } from '../../../studio-os/diagnostics/flight-recorder-console/FlightRecorderConsole';

export default function StudioOsSessionReportPage() {
  return (
    <div data-temp-debug-route="__studio-os-session-report">
      <FlightRecorderConsole title="Studio OS Session Forensic Report" showReportPanel />
      <p style={{ padding: '0 16px 16px', fontFamily: 'ui-monospace, monospace', fontSize: 11, color: '#c4b5fd' }}>
        Evidence only — recorder persists across navigation. Copy Report for ChatGPT analysis.
        {' '}
        <a href="/__studio-os-flight-recorder" style={{ color: '#7dd3fc' }}>
          /__studio-os-flight-recorder
        </a>
      </p>
    </div>
  );
}
