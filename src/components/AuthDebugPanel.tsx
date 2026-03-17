/**
 * Auth debug panel: visible when auth debug is on (?auth_debug=1 or localStorage baw_auth_debug=true).
 * Shows when URL has ?auth_debug=1 even if localStorage was cleared (e.g. Safari), so you can see load/restore after reopen.
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuthDebugLog, getLastSignInInfo, AUTH_DEBUG_KEY, AUTH_DEBUG_LOG_KEY } from '../utils/adminAuth';

const LOG_REFRESH_MS = 2000;

function formatTime(t: number): string {
  const d = new Date(t);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AuthDebugPanel() {
  const location = useLocation();
  const [log, setLog] = useState(getAuthDebugLog());
  const [collapsed, setCollapsed] = useState(false);

  const params = new URLSearchParams(location.search || '');
  const urlHasDebug = params.get('auth_debug') === '1' || params.get('auth_debug') === 'true';
  const enabled = log.enabled || urlHasDebug;

  useEffect(() => {
    const interval = setInterval(() => setLog(getAuthDebugLog()), LOG_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

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
        maxHeight: collapsed ? '36px' : '240px',
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
        Auth debug {collapsed ? '▼' : '▲'} ({log.lines.length} lines) — tap to expand/collapse
      </button>
      {!collapsed && (
        <>
          {lastSignIn && (
            <div style={{ padding: '4px 8px', fontSize: '10px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              Last sign-in: <strong>{lastSignIn.method}</strong> {lastSignIn.method === 'session_restore' ? '(Face ID / auto-login)' : '(tapped Sign in)'} at {formatTime(lastSignIn.at)}
            </div>
          )}
          <div style={{ flex: 1, overflow: 'auto', padding: '6px 8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: 'rgba(0,0,0,0.85)', color: '#0f0', maxHeight: '180px' }}>
            {lines.length === 0 ? '(no log yet — or Safari cleared it. This load just wrote the line above; check "load: lsBackup= cookieBackup=" to see why you were signed out.)' : lines.map((entry, i) => (
              <div key={`${entry.t}-${i}`} style={{ marginBottom: '2px' }}>
                <span style={{ color: '#888' }}>{formatTime(entry.t)}</span> {entry.m}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', padding: '4px 6px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
            <button type="button" onClick={clearLog} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none' }}>Clear log</button>
            <button type="button" onClick={turnOff} style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none' }}>Turn debug off</button>
          </div>
        </>
      )}
    </div>
  );
}
