import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, getSupabase } from '../utils/supabase';
import { syncCartFromApi } from '../utils/syncFromApi';
import { signInHrefWithReturnTo } from '../utils/signInReturnTo';
import { isSignedIn as isAppSignedIn } from '../utils/adminAuth';

/**
 * **Shopping bag (`/bag`):** always allowed — signed-out users can view the local cart (save-for-later / + LIST still gate elsewhere).
 * **Checkout** and other commerce routes: require a live Supabase session when Supabase is configured.
 * Anonymous localStorage checkout is blocked for real-money flows.
 *
 * If **`isSignedIn`** is already true (local app auth) but **`getSession()`** has not
 * hydrated yet (race after refresh / tab restore), still allow the route so **VIEW BAG**
 * does not bounce to sign-in incorrectly.
 */
export default function CommerceRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (location.pathname === '/bag') {
        if (!cancelled) setAllowed(true);
        return;
      }
      if (!isSupabaseConfigured()) {
        if (!cancelled) setAllowed(true);
        return;
      }
      const client = getSupabase();
      if (!client) {
        if (!cancelled) setAllowed(false);
        return;
      }
      const { data } = await client.auth.getSession();
      if (cancelled) return;
      if (!data.session?.access_token) {
        if (isAppSignedIn()) {
          try {
            await client.auth.refreshSession();
          } catch {
            /* ignore */
          }
          if (cancelled) return;
          const { data: d2 } = await client.auth.getSession();
          if (d2.session?.access_token) {
            try {
              await syncCartFromApi();
            } catch {
              /* still allow */
            }
            if (!cancelled) setAllowed(true);
            return;
          }
          /** Signed in per app flags — allow bag/checkout while session catches up. */
          if (!cancelled) setAllowed(true);
          return;
        }
        if (!cancelled) setAllowed(false);
        return;
      }
      try {
        await syncCartFromApi();
      } catch {
        /* still allow — cart stays local until sync works */
      }
      setAllowed(true);
    })();

    const supabase = getSupabase();
    if (!supabase) return () => { cancelled = true; };
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (cancelled) return;
      void (async () => {
        if (location.pathname === '/bag') {
          setAllowed(true);
          return;
        }
        const { data: d } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!d.session?.access_token) {
          if (isAppSignedIn()) setAllowed(true);
          else setAllowed(false);
        } else {
          try {
            await syncCartFromApi();
          } catch {
            /* ignore */
          }
          setAllowed(true);
        }
      })();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [location.pathname]);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', textTransform: 'uppercase' }}>Loading...</p>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to={signInHrefWithReturnTo(location)} replace />;
  }

  return <>{children}</>;
}
