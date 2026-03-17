/**
 * Auth debug panel: visible when auth debug is on (?auth_debug=1 or localStorage baw_auth_debug=true).
 * Shows LIVE storage/cookie state (so you see what Safari left after reopen) and sends diagnostics to the server.
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuthDebugLog, getLastSignInInfo, AUTH_DEBUG_KEY, AUTH_DEBUG_LOG_KEY } from '../utils/adminAuth';
import { captureAuthSnapshot, sendAuthDiagnostic } from '../utils/authDiagnostic';

const LOG_REFRESH_MS = 2000;
const SNAPSHOT_REFRESH_MS = 1500;

function formatTime(t: number): string {
  const d = new Date(t);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function LiveStateRow({ label, value }: { label: string; value: number }) {
  const present = value > 0;
  return (
    <div style={{ marginBottom: '2px', fontSize: '10px' }}>
      <span style={{ color: present ? '#0f0' : '#f66' }}>{present ? '✓' : '✗'}</span> {label}: {present ? `${value} chars` : 'absent'}
    </div>
  );
}

export default function AuthDebugPanel() {
  const location = useLocation();
  const [log, setLog] = useState(getAuthDebugLog());
  const [snapshot, setSnapshot] = useState<Record<string, unknown>>(() => captureAuthSnapshot());
  const [lastSent, setLastSent] = useState<{ event: string; at: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const params = new URLSearchParams(location.search || '');
  const urlHasDebug = params.get('auth_debug') === '1' || params.get('auth_debug') === 'true';
  const enabled = log.enabled || urlHasDebug;

  useEffect(() => {
    const interval = setInterval(() => setLog(getAuthDebugLog()), LOG_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => setSnapshot(captureAuthSnapshot()), SNAPSHOT_REFRESH_MS);
    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const clearLog = () => {
    try {
      window.localStorage.setItem(AUTH_DEBUG_LOG_KEY, '[]');
      setLog(getAuthDebugLog());
    } catch (_) {}
  };

  const turnOff = () => {
    try {
      window.localStorage.removeItem(AUTH_DEBUG_KEY);
      window.localStorage.setItem(AUTH_DEBUG_LOG_KEY, '[]');
      window.location.reload();
    } catch (_) {}
  };

  const sendReport = async (event: 'load' | 'visibility_hidden' | 'manual') => {
    setSending(true);
    try {
      await sendAuthDiagnostic(event);
      setLastSent({ event, at: Date.now() });
    } finally {
      setSending(false);
    }
  };

  const lines = log.lines.slice(-25);
  const lastSignIn = getLastSignInInfo();

  return (
    <div
      data-auth-debug-panel
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2147483647,
        fontFamily: 'monospace',
        fontSize: '11px',
        backgroundColor: '#c2410c',
        color: '#fff',
        maxHeight: collapsed ? '36px' : '320px',
        overflow: 'hidden',
        borderBottom: '3px solid #fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          padding: '6px 10px',
          textAlign: 'left',
          background: 'transparent',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '12px',
        }}
      >
        Auth debug {collapsed ? '▼' : '▲'} — LIVE state + server logs. Tap to expand.
      </button>
      {!collapsed && (
        <>
          {/* Live storage state — this is what you have RIGHT NOW (after reopen this shows what Safari left) */}
          <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>LIVE NOW (refresh ~1.5s) — after reopen, if all ✗ Safari cleared storage:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 12px' }}>
              <div>
                <LiveStateRow label="cookie baw_sb_session" value={(snapshot['cookie_baw_sb_session'] as number) ?? 0} />
                <LiveStateRow label="cookie baw_sb_user" value={(snapshot['cookie_baw_sb_user'] as number) ?? 0} />
                <LiveStateRow label="cookie baw_auth_b" value={(snapshot['cookie_baw_auth_b'] as number) ?? 0} />
              </div>
              <div>
                <LiveStateRow label="ls isSignedIn" value={(snapshot['ls_isSignedIn'] as number) ?? 0} />
                <LiveStateRow label="ls currentUser" value={(snapshot['ls_currentUser'] as number) ?? 0} />
                <LiveStateRow label="ls baw_auth_backup" value={(snapshot['ls_baw_auth_backup'] as number) ?? 0} />
              </div>
            </div>
            {lastSent && (
              <div style={{ fontSize: '10px', color: '#ccc', marginTop: '4px' }}>
                Last report sent: {lastSent.event} at {formatTime(lastSent.at)} (check Vercel → Deployments → Logs)
              </div>
            )}
          </div>
          {lastSignIn && (
            <div style={{ padding: '4px 8px', fontSize: '10px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              Last sign-in: <strong>{lastSignIn.method}</strong> at {formatTime(lastSignIn.at)}
            </div>
          )}
          <div style={{ flex: 1, overflow: 'auto', padding: '6px 8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: 'rgba(0,0,0,0.85)', color: '#0f0', maxHeight: '140px' }}>
            {lines.length === 0 ? '(no log yet — or Safari cleared it. After reopen, check LIVE NOW above to see what survived.)' : lines.map((entry, i) => (
              <div key={`${entry.t}-${i}`} style={{ marginBottom: '2px' }}>
                <span style={{ color: '#888' }}>{formatTime(entry.t)}</span> {entry.m}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', padding: '4px 6px', borderTop: '1px solid rgba(255,255,255,0.3)', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => sendReport('manual')} disabled={sending} style={{ padding: '4px 8px', fontSize: '11px', cursor: sending ? 'not-allowed' : 'pointer', background: '#333', color: '#fff', border: 'none' }}>
              {sending ? 'Sending…' : 'Send report now'}
            </button>
            <button type="button" onClick={clearLog} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none' }}>Clear log</button>
            <button type="button" onClick={turnOff} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none' }}>Turn debug off</button>
          </div>
        </>
      )}
    </div>
  );
}
