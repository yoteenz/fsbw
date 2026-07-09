/**
 * TEMPORARY DEBUG ROUTE — remove when Experience Lab is stable.
 * Public, zero dependencies. Path: /__studio-health
 */
declare const __GLOBE_EMBED_BUILD__: string | undefined;

export default function StudioHealthDebugPage() {
  const timestamp = new Date().toISOString();
  const deploymentId =
    typeof __GLOBE_EMBED_BUILD__ !== 'undefined' ? String(__GLOBE_EMBED_BUILD__) : 'unavailable';
  const browser =
    typeof navigator !== 'undefined'
      ? `${navigator.userAgent}${navigator.platform ? ` · ${navigator.platform}` : ''}`
      : 'unknown';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div
      data-temp-debug-route="__studio-health"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        padding: '24px',
        gap: '10px',
        background: '#fff',
        color: '#111',
      }}
    >
      <strong style={{ fontSize: '18px' }}>Studio Health OK</strong>
      <span style={{ color: '#555', fontSize: '12px' }}>timestamp: {timestamp}</span>
      <span style={{ color: '#555', fontSize: '12px' }}>deployment: {deploymentId}</span>
      <span style={{ color: '#555', fontSize: '11px', maxWidth: '520px', wordBreak: 'break-word', textAlign: 'center' }}>
        browser: {browser}
      </span>
      <span style={{ color: '#555', fontSize: '11px', maxWidth: '520px', wordBreak: 'break-all', textAlign: 'center' }}>
        url: {currentUrl}
      </span>
      <p style={{ marginTop: '16px', fontSize: '11px', color: '#999' }}>
        TEMPORARY DEBUG ROUTE — bypasses AdminGuard, workspace bootstrap, and all studio guards.
      </p>
    </div>
  );
}
