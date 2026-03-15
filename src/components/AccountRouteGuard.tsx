import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { isSignedIn } from '../utils/adminAuth';
import { getSupabase, isSupabaseConfigured } from '../utils/supabase';
import { syncAllFromApi, buildMinimalUserFromSupabaseSession, applyMinimalUserToStorage, buildProfilePayloadForBackend } from '../utils/syncFromApi';

/**
 * Wraps account routes. Redirects to /sign-in when not signed in.
 * If Supabase is configured, tries to recover session from URL (e.g. email confirm link) before redirecting,
 * so the user is signed in automatically when they land on /account from the confirm link.
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (!session) {
        setRecoveryDone(true);
        return;
      }
      syncAllFromApi().then(async (profile) => {
        if (cancelled) return;
        if (profile) {
          localStorage.setItem('isSignedIn', 'true');
          window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
        } else {
          const minimal = buildMinimalUserFromSupabaseSession(session.user);
          applyMinimalUserToStorage(minimal);
          // Ensure backend has a profile row so user appears in admin clients list (await so it exists before navigation)
          const { patchProfile } = await import('../utils/api');
          await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
          window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
        }
        setRecoveryDone(true);
      });
    });
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
