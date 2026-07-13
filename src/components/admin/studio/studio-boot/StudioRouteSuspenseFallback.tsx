/**
 * Lightweight Suspense fallback for heavy Studio admin routes.
 * Does not register LoadingScreen terminal watchdog — avoids false recovery on slow mobile chunks.
 */
export function StudioRouteSuspenseFallback({ label = 'Studio route' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${label}`}
      data-studio-route-suspense
      style={{
        minHeight: '40vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#64748b',
        background: '#f8fafc',
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Loading {label}…
      </p>
      <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#94a3b8' }}>
        Large Studio modules may take a moment on mobile networks.
      </p>
    </div>
  );
}
