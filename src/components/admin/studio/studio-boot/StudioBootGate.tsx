import { BootDiagnosticsPanel } from '../../../../studio-os-core/runtime-diagnostics/boot-diagnostics-panel';
import { RuntimeDiagnostics } from '../../../../studio-os-core/runtime-diagnostics';
import { RuntimeFailSafe } from '../../../../studio-os-core/runtime-diagnostics';
import { isDynamicImportChunkFailure } from '../../../../utils/chunkLoadRecovery';
import { useStudioBoot } from '../../../../hooks/useStudioBoot';

/** Gates Studio routes on StudioBootstrap — live diagnostics, never silent hang. */
export function StudioBootGate({
  children,
  through = 'experience-runtime',
  diagnosticsWhenReady = true,
}: {
  children?: React.ReactNode;
  through?: 'experience-runtime' | 'ui-render';
  diagnosticsWhenReady?: boolean;
}) {
  const { live, readiness, fatalError, retry, continueSafeMode, skipCurrentModule } =
    useStudioBoot(through);

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

  if (!live.complete || (diagnosticsWhenReady && live.complete)) {
    if (live.complete && readiness && !readiness.bootReady) {
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

    if (live.complete && readiness?.bootReady && children && !diagnosticsWhenReady) {
      return <>{children}</>;
    }

    if (live.complete && readiness?.bootReady) {
      return (
        <>
          <BootDiagnosticsPanel
            live={live}
            onRetry={retry}
            onSafeMode={continueSafeMode}
            onSkipCurrent={skipCurrentModule}
          />
          {readiness ? <RuntimeDiagnostics snapshot={readiness} onRetry={retry} /> : null}
        </>
      );
    }

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

  return (
    <BootDiagnosticsPanel
      live={live}
      onRetry={retry}
      onSafeMode={continueSafeMode}
      onSkipCurrent={skipCurrentModule}
    />
  );
}
