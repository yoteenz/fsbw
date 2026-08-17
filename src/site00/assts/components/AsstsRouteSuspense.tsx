import { Suspense, type ReactNode } from 'react';
import { Site00Loader } from '../../components/loader/Site00Loader';
import { shouldShowAsstsImmersiveLoader } from '../../components/loader/site00LoaderSession';

/** Lightweight suspense fallback — cinematic loader handled by AsstsColdStartGate. */
function AsstsRouteFallback() {
  if (shouldShowAsstsImmersiveLoader()) return null;

  return (
    <div className="assts-contextual-loader" role="status" aria-live="polite">
      <Site00Loader context="assts" size="sm" showDelayMs={120} />
    </div>
  );
}

export function AsstsRouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AsstsRouteFallback />}>{children}</Suspense>;
}
