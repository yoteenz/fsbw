import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { isSignedIn } from '../utils/adminAuth';
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
    const supabase = getSupabase();
    if (!supabase) {
      setRecoveryDone(true);
      return;
    }
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
        setRecoveryDone(true);
        return;
      }
      const profile = await syncAllFromApi();
      if (cancelled) return;
      if (profile) {
        localStorage.setItem('isSignedIn', 'true');
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      } else {
        const minimal = buildMinimalUserFromSupabaseSession(session.user);
        applyMinimalUserToStorage(minimal);
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
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
