/**
 * TEMPORARY DEBUG ROUTE — remove when Experience Lab is stable.
 * Public. Path: /__boot-debug — renders diagnostics immediately, never waits silently.
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
      />
      <p style={{ padding: '0 16px 16px', fontSize: '11px', color: '#666' }}>
        TEMPORARY DEBUG ROUTE — no AdminGuard, no workspace guard, no auth required ·{' '}
        <a href="/__studio-health">/__studio-health</a> · <a href="/__chunk-debug">/__chunk-debug</a> ·{' '}
        <a href="/__experience-lab-safe">/__experience-lab-safe</a>
      </p>
    </div>
  );
}
