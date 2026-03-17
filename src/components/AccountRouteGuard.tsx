import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { isSignedIn, persistAuthBackup, ensureAuthRestoredFromBackup, onSignInSuccess } from '../utils/adminAuth';
import { getSupabase, isSupabaseConfigured } from '../utils/supabase';
import { syncAllFromApi, buildMinimalUserFromSupabaseSession, applyMinimalUserToStorage, buildProfilePayloadForBackend } from '../utils/syncFromApi';

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
        // Restore from backup before we decide to redirect (guard may run after Supabase cleared session)
        ensureAuthRestoredFromBackup();
        persistAuthBackup();
        setRecoveryDone(true);
        return;
      }
      const profile = await syncAllFromApi();
      if (cancelled) return;
      if (profile) {
        localStorage.setItem('isSignedIn', 'true');
        onSignInSuccess('session_restore'); // Face ID / Supabase when opening account route directly
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      } else {
        const minimal = buildMinimalUserFromSupabaseSession(session.user);
        applyMinimalUserToStorage(minimal);
        onSignInSuccess('session_restore');
        const { patchProfile } = await import('../utils/api');
        await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
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
    return <Navigate to={{ pathname: '/sign-in', search: location.search || '' }} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
