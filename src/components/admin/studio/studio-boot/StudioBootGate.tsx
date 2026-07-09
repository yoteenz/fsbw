import { useStudioBoot } from '../../../../hooks/useStudioBoot';
import { RuntimeDiagnostics } from '../../../../studio-os-core/runtime-diagnostics';
import { RuntimeFailSafe } from '../../../../studio-os-core/runtime-diagnostics';
import { isDynamicImportChunkFailure } from '../../../../utils/chunkLoadRecovery';

/** Gates Studio routes on StudioBootstrap — diagnostics instead of white screen. */
export function StudioBootGate({
  children,
  through = 'experience-runtime',
  diagnosticsWhenReady = true,
}: {
  children?: React.ReactNode;
  through?: 'experience-runtime' | 'ui-render';
  /** When true and boot succeeds, show RuntimeDiagnostics instead of children. */
  diagnosticsWhenReady?: boolean;
}) {
  const { loading, readiness, fatalError, retry } = useStudioBoot(through);

  if (loading && !readiness) {
    return (
      <div
        style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', fontSize: '13px' }}
        data-studio-boot-loading
      >
        StudioBootstrap™ initializing…
      </div>
    );
  }

  if (fatalError && isDynamicImportChunkFailure(new Error(fatalError))) {
    return <RuntimeFailSafe message={fatalError} detail={readiness?.errors.join('\n')} />;
  }

  if (!readiness) {
    return (
      <RuntimeFailSafe
        message={fatalError ?? 'Studio boot failed'}
        detail="No readiness snapshot available"
      />
    );
  }

  if (!readiness.bootReady) {
    return <RuntimeDiagnostics snapshot={readiness} onRetry={retry} />;
  }

  if (children && !diagnosticsWhenReady) {
    return <>{children}</>;
  }

  return <RuntimeDiagnostics snapshot={readiness} onRetry={retry} />;
}
