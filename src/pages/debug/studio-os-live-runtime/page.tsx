/**
 * Studio OS Live Runtime Console — real-time Mission Control stream.
 * Path: /__studio-os-live-runtime
 */
import { LiveRuntimeConsole } from '../../../studio-os/diagnostics/flight-recorder-console/LiveRuntimeConsole';

export default function StudioOsLiveRuntimePage() {
  return (
    <div data-temp-debug-route="__studio-os-live-runtime">
      <LiveRuntimeConsole />
    </div>
  );
}
