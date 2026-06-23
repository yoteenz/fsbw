import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, getSupabase } from '../utils/supabase';
import { syncCartFromApi } from '../utils/syncFromApi';
import { signInHrefWithReturnTo } from '../utils/signInReturnTo';
import { isSignedIn as isAppSignedIn } from '../utils/adminAuth';
import { isCreativePreviewMode } from '../utils/creativePreviewMode';
import { hydrateGlobalCartFromUserKeyIfEmpty } from '../utils/cartWishlistStorage';

async function hydrateSignedInCommerceCart(): Promise<void> {
  if (!isAppSignedIn()) return;
  hydrateGlobalCartFromUserKeyIfEmpty();
  try {
    await syncCartFromApi();
  } catch {
    /* local cart until sync succeeds */
  }
}

/**
 * **Shopping bag (`/bag`)** and **checkout** (`/checkout`, `/checkout/bookings`, `/checkout/gift-card`, `/checkout/slay-tickets`):
 * always allowed — guests can view the bag and complete purchase without signing in.
 * Other commerce routes wrapped by this guard: require a live Supabase session when Supabase is configured.
 *
 * If **`isSignedIn`** is already true (local app auth) but **`getSession()`** has not
 * hydrated yet (race after refresh / tab restore), still allow the route so **VIEW BAG**
 * does not bounce to sign-in incorrectly.
 */
function isGuestCommerceAllowedPath(pathname: string): boolean {
  if (pathname === '/bag') return true;
  if (pathname === '/checkout') return true;
  if (pathname === '/checkout/bookings') return true;
  if (pathname === '/checkout/gift-card') return true;
  if (pathname === '/checkout/slay-tickets') return true;
  if (pathname === '/desktop/acquisition') return true;
  if (pathname === '/desktop/acquisition/bookings') return true;
  if (pathname === '/desktop/acquisition/gift-card') return true;
  if (pathname === '/desktop/acquisition/slay-tickets') return true;
  return false;
}

export default function CommerceRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(() =>
    isCreativePreviewMode() ? true : null
  );

  useEffect(() => {
    if (isCreativePreviewMode()) {
      setAllowed(true);
      return;
    }
    let cancelled = false;
    (async () => {
      if (isGuestCommerceAllowedPath(location.pathname)) {
        await hydrateSignedInCommerceCart();
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
            await hydrateSignedInCommerceCart();
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
      await hydrateSignedInCommerceCart();
      setAllowed(true);
    })();

    const supabase = getSupabase();
    if (!supabase) return () => { cancelled = true; };
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (cancelled) return;
      void (async () => {
        if (isGuestCommerceAllowedPath(location.pathname)) {
          void hydrateSignedInCommerceCart();
          setAllowed(true);
          return;
        }
        const { data: d } = await supabase.auth.getSession();
        if (cancelled) return;
        if (!d.session?.access_token) {
          if (isAppSignedIn()) setAllowed(true);
          else setAllowed(false);
        } else {
          await hydrateSignedInCommerceCart();
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
