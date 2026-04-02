import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { isSignedIn, persistAuthBackup, ensureAuthRestoredFromBackup, onSignInSuccess } from '../utils/adminAuth';
import { getSupabase, isSupabaseConfigured, signOutIfSessionEmailUnconfirmed } from '../utils/supabase';
import {
  syncAllFromApi,
  buildMinimalUserFromSupabaseSession,
  applyMinimalUserToStorage,
  buildProfilePayloadForBackend,
  didLastProfileSyncError,
} from '../utils/syncFromApi';
import { registerServerSessionCookie } from '../utils/sessionRestore';
import { tryServerSessionRestore } from '../utils/sessionRestore';
import { signInHrefWithReturnTo } from '../utils/signInReturnTo';

const SERVER_RESTORE_ATTEMPT_KEY = 'baw_server_restore_attempted_v1';

function shouldAttemptServerRestoreNow(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return true;
  try {
    const seen = window.sessionStorage.getItem(SERVER_RESTORE_ATTEMPT_KEY) === '1';
    if (seen) return false;
    window.sessionStorage.setItem(SERVER_RESTORE_ATTEMPT_KEY, '1');
    return true;
  } catch {
    return true;
  }
}

/**
 * Wraps account routes. Redirects to /sign-in only when not signed in (localStorage isSignedIn/currentUser).
 * Session persists across refresh and browser close; we never clear auth here—only explicit Sign Out does.
 * If Supabase is configured, we try to restore session (getSession then refreshSession) so API calls work;
 * if Supabase has no session but localStorage says signed in, we still allow access (trust localStorage).
 */
export default function AccountRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [recoveryDone, setRecoveryDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setRecoveryDone(true);
      return;
    }
    const client = getSupabase();
    if (!client) {
      setRecoveryDone(true);
      return;
    }
    const supabase = client as NonNullable<typeof client>;
    let cancelled = false;
    async function run() {
      // Final guard: before any fallback render path, give server cookie restore one awaited attempt.
      if (shouldAttemptServerRestoreNow()) {
        const restored = await tryServerSessionRestore().catch(() => false);
        if (cancelled) return;
        if (restored) return; // tryServerSessionRestore reloads on success
      }

      let { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        try {
          const { data } = await supabase.auth.refreshSession();
          if (data?.session) session = data.session;
        } catch (_) {}
        if (cancelled) return;
      }
      if (!session) {
        // Safari hardening: when local storage/session is missing, attempt server cookie restore first.
        const restored = await tryServerSessionRestore().catch(() => false);
        if (restored) return; // tryServerSessionRestore reloads on success
        // Fallback to app backup restore before redirect decision.
        ensureAuthRestoredFromBackup();
        persistAuthBackup();
        setRecoveryDone(true);
        return;
      }
      if (await signOutIfSessionEmailUnconfirmed(supabase, session)) {
        setRecoveryDone(true);
        return;
      }
      const profile = await syncAllFromApi();
      if (cancelled) return;
      if (profile) {
        localStorage.setItem('isSignedIn', 'true');
        onSignInSuccess('session_restore'); // Face ID / Supabase when opening account route directly
        registerServerSessionCookie(session.access_token, session.refresh_token);
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      } else {
        const minimal = buildMinimalUserFromSupabaseSession(session.user);
        applyMinimalUserToStorage(minimal);
        onSignInSuccess('session_restore');
        registerServerSessionCookie(session.access_token, session.refresh_token);
        if (!didLastProfileSyncError()) {
          const { patchProfile } = await import('../utils/api');
          await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
        }
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      }
      setRecoveryDone(true);
    }
    run();
    return () => { cancelled = true; };
  }, []);

  if (!recoveryDone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', textTransform: 'uppercase' }}>Loading...</p>
      </div>
    );
  }

  if (!isSignedIn()) {
    return <Navigate to={signInHrefWithReturnTo(location)} replace />;
  }

  return <>{children}</>;
}
