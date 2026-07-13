import { useEffect } from 'react';
import { BootDiagnosticsPanel } from '../../../../studio-os-core/runtime-diagnostics/boot-diagnostics-panel';
import { RuntimeDiagnostics } from '../../../../studio-os-core/runtime-diagnostics';
import { RuntimeFailSafe } from '../../../../studio-os-core/runtime-diagnostics';
import { isDynamicImportChunkFailure } from '../../../../utils/chunkLoadRecovery';
import { useStudioBoot } from '../../../../hooks/useStudioBoot';

/** Gates Studio routes on StudioBootstrap — live diagnostics while booting; children when ready. */
export function StudioBootGate({
  children,
  through = 'experience-runtime',
  diagnosticsWhenReady = false,
  autoSafeModeAfterMs,
}: {
  children?: React.ReactNode;
  through?: 'experience-runtime' | 'ui-render';
  diagnosticsWhenReady?: boolean;
  /** Auto-continue in safe mode when boot exceeds budget (mobile slow networks). */
  autoSafeModeAfterMs?: number;
}) {
  const { live, readiness, fatalError, retry, continueSafeMode, skipCurrentModule } =
    useStudioBoot(through);

  useEffect(() => {
    if (!autoSafeModeAfterMs || live.complete) return;
    const timer = window.setTimeout(() => {
      if (!live.complete) void continueSafeMode();
    }, autoSafeModeAfterMs);
    return () => window.clearTimeout(timer);
  }, [autoSafeModeAfterMs, live.complete, continueSafeMode]);

  if (fatalError && isDynamicImportChunkFailure(new Error(fatalError))) {
    return (
      <>
        <BootDiagnosticsPanel
          live={live}
          onRetry={retry}
          onSafeMode={continueSafeMode}
          onSkipCurrent={skipCurrentModule}
        />
        <RuntimeFailSafe message={fatalError} detail={readiness?.errors.join('\n')} />
      </>
    );
  }

  if (!live.complete) {
    return (
      <BootDiagnosticsPanel
        live={live}
        onRetry={retry}
        onSafeMode={continueSafeMode}
        onSkipCurrent={skipCurrentModule}
      />
    );
  }

  if (!readiness) {
    return (
      <BootDiagnosticsPanel
        live={live}
        onRetry={retry}
        onSafeMode={continueSafeMode}
        onSkipCurrent={skipCurrentModule}
      />
    );
  }

  if (!readiness.bootReady) {
    return (
      <>
        <BootDiagnosticsPanel
          live={live}
          onRetry={retry}
          onSafeMode={continueSafeMode}
          onSkipCurrent={skipCurrentModule}
        />
        <RuntimeDiagnostics snapshot={readiness} onRetry={retry} />
      </>
    );
  }

  if (diagnosticsWhenReady) {
    return (
      <>
        <BootDiagnosticsPanel
          live={live}
          onRetry={retry}
          onSafeMode={continueSafeMode}
          onSkipCurrent={skipCurrentModule}
        />
        <RuntimeDiagnostics snapshot={readiness} onRetry={retry} />
      </>
    );
  }

  return <>{children}</>;
}
