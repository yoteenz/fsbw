/**
 * Public boot diagnostics route — /__boot-debug
 */
import { useEffect, useState } from 'react';
import { BootDiagnosticsPanel } from '../../../studio-os-core/runtime-diagnostics/boot-diagnostics-panel';
import {
  getInitialStudioBootstrapLiveState,
  getStudioBootstrapLiveState,
  subscribeStudioBoot,
  type StudioBootLiveState,
} from '../../../studio-os-core/bootstrap';
import { useStudioBootLive } from '../../../hooks/useStudioBootLive';

export default function BootDebugPage() {
  const { live, retry, continueSafeMode, skipCurrentModule } = useStudioBootLive({
    through: 'ui-render',
    autoStart: true,
  });
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    void import('../../../studio-os-core/bootstrap/studio-bootstrap-init')
      .then(({ ensureStudioBootstrapStarted }) =>
        ensureStudioBootstrapStarted({ through: 'ui-render' })
      )
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        setBootstrapError(msg);
      });
  }, []);

  if (bootstrapError) {
    return (
      <div data-temp-debug-route="__boot-debug">
        <BootDebugFailurePanel error={bootstrapError} live={live} onRetry={retry} />
      </div>
    );
  }

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

function BootDebugFailurePanel({
  error,
  live,
  onRetry,
}: {
  error: string;
  live: StudioBootLiveState;
  onRetry: () => void;
}) {
  const [snapshot, setSnapshot] = useState<StudioBootLiveState>(() => {
    return getStudioBootstrapLiveState() ?? live ?? getInitialStudioBootstrapLiveState();
  });

  useEffect(() => {
    const unsub = subscribeStudioBoot(setSnapshot);
    return unsub;
  }, []);

  return (
    <>
      <div
        style={{
          padding: '16px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '13px',
          color: '#eb1c24',
          background: '#fff5f5',
          borderBottom: '2px solid #fecaca',
        }}
      >
        <strong>Bootstrap orchestrator error</strong>
        <pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0', fontSize: '12px' }}>{error}</pre>
        <button type="button" onClick={onRetry} style={{ marginTop: '8px', padding: '6px 10px' }}>
          Retry Bootstrap
        </button>
      </div>
      <BootDiagnosticsPanel
        live={snapshot}
        title="Boot Debug — StudioBootstrap™ (error state)"
        onRetry={onRetry}
        showBypass
      />
    </>
  );
}
