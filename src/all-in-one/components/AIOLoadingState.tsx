export function AIOLoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="aio-loading-state" role="status" aria-live="polite">
      <div className="aio-loading-state__spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function AIOSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="aio-skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="aio-skeleton__row" />
      ))}
    </div>
  );
}
