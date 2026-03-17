/**
 * Auth diagnostic: capture client storage/cookie state and send to the server so we can see
 * what Safari (or any browser) leaves after close/reopen. Use ?auth_debug=1 and check Vercel logs.
 */

const COOKIE_NAMES = ['baw_sb_session', 'baw_sb_user', 'baw_auth_b'] as const;
const LS_KEYS = ['isSignedIn', 'currentUser', 'baw_auth_backup', 'baw_last_sign_in_method', 'baw_last_sign_in_at'] as const;

const API_BASE = (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

function getCookieLength(name: string): number {
  if (typeof document === 'undefined') return -1;
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]).length : 0;
  } catch {
    return -1;
  }
}

function getLsInfo(): Record<string, boolean | number> {
  const out: Record<string, boolean | number> = {};
  if (typeof window === 'undefined' || !window.localStorage) return out;
  try {
    for (const k of LS_KEYS) {
      const v = window.localStorage.getItem(k);
      out['ls_' + k] = v === null ? 0 : v.length;
    }
    return out;
  } catch {
    return out;
  }
}

/** Capture a snapshot of auth-related storage (no PII, just presence/lengths). */
export function captureAuthSnapshot(): Record<string, unknown> {
  const cookies: Record<string, number> = {};
  for (const name of COOKIE_NAMES) {
    cookies['cookie_' + name] = getCookieLength(name);
  }
  return {
    ...cookies,
    ...getLsInfo(),
    protocol: typeof location !== 'undefined' ? location.protocol : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
}

/** Send diagnostic to the server. Call on load and on visibility hidden when debug is on. event can be 'manual' for button-triggered. */
export async function sendAuthDiagnostic(event: 'load' | 'visibility_hidden' | 'manual'): Promise<void> {
  const snapshot = captureAuthSnapshot();
  const payload = { event, ...snapshot };
  const url = `${API_BASE.replace(/\/$/, '')}/api/auth-diagnostic`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_) {
    // ignore network errors
  }
}
