/**
 * Public boot diagnostics route — /__boot-debug
 */
import { BootDiagnosticsPanel } from '../../../studio-os-core/runtime-diagnostics/boot-diagnostics-panel';
import { useStudioBootLive } from '../../../hooks/useStudioBootLive';

export default function BootDebugPage() {
  const { live, retry, continueSafeMode, skipCurrentModule } = useStudioBootLive({
    through: 'ui-render',
    autoStart: true,
  });

  return (
    <div data-temp-debug-route="__boot-debug">
      <BootDiagnosticsPanel
        live={live}
        title="Boot Debug — StudioBootstrap™"
        onRetry={retry}
        onSafeMode={continueSafeMode}
        onSkipCurrent={skipCurrentModule}
        showBypass
      />
    </div>
  );
}
