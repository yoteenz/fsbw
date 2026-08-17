import { Suspense, type ReactNode } from 'react';
import { Site00Loader } from '../../components/loader/Site00Loader';

/** ASSTS route fallback — SITE 00 construction loader with spatial skeleton veil. */
function AsstsRouteFallback() {
  return (
    <div className="assts-route-fallback assts-route-fallback--loader" role="status" aria-live="polite">
      <Site00Loader context="assts" size="md" showDelayMs={180} />
      <div className="assts-route-fallback__veil" aria-hidden="true">
        <div className="assts-route-fallback__hero assts-skeleton" />
        <div className="assts-route-fallback__metrics">
          <div className="assts-skeleton" />
          <div className="assts-skeleton" />
          <div className="assts-skeleton" />
          <div className="assts-skeleton" />
        </div>
      </div>
    </div>
  );
}

export function AsstsRouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AsstsRouteFallback />}>{children}</Suspense>;
}
