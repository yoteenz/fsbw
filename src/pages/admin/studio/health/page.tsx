/** SafeHealthRoute™ — isolated studio health (no workspace / runtime imports). */
export default function AdminStudioHealthPage() {
  const deploymentId =
    typeof __GLOBE_EMBED_BUILD__ !== 'undefined' ? String(__GLOBE_EMBED_BUILD__) : 'unknown';
  const timestamp = new Date().toISOString();
  const browser =
    typeof navigator !== 'undefined'
      ? `${navigator.userAgent} · ${navigator.platform ?? 'unknown'}`
      : 'unknown';

  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        padding: '24px',
        gap: '8px',
      }}
      data-studio-health
    >
      <strong>Studio Health OK</strong>
      <span style={{ color: '#555', fontSize: '12px' }}>deployment: {deploymentId}</span>
      <span style={{ color: '#555', fontSize: '12px' }}>timestamp: {timestamp}</span>
      <span style={{ color: '#555', fontSize: '11px', maxWidth: '480px', textAlign: 'center', wordBreak: 'break-word' }}>
        browser: {browser}
      </span>
    </div>
  );
}

declare const __GLOBE_EMBED_BUILD__: string;
