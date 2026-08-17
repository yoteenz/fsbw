import { Suspense, type ReactNode } from 'react';

/** Lightweight ASSTS route fallback — avoids global LoadingScreen GIF + terminal watchdog false positives on mobile. */
function AsstsRouteFallback() {
  return (
    <div className="assts-route-fallback" role="status" aria-live="polite" aria-label="Loading Asset Vault">
      <div className="assts-route-fallback__hero assts-skeleton" />
      <div className="assts-route-fallback__metrics">
        <div className="assts-skeleton" />
        <div className="assts-skeleton" />
        <div className="assts-skeleton" />
        <div className="assts-skeleton" />
      </div>
      <div className="assts-route-fallback__card assts-skeleton" />
    </div>
  );
}

export function AsstsRouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AsstsRouteFallback />}>{children}</Suspense>;
}
