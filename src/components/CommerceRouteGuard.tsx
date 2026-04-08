import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, getSupabase } from '../utils/supabase';
import { syncCartFromApi } from '../utils/syncFromApi';
import { signInHrefWithReturnTo } from '../utils/signInReturnTo';

/**
 * Bag + product checkout require a live Supabase session when Supabase is configured.
 * Anonymous localStorage checkout is blocked for real-money flows.
 */
export default function CommerceRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
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
        setAllowed(false);
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
        const { data: d } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!d.session?.access_token) setAllowed(false);
        else {
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
