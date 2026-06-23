import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isSignedIn } from '../utils/adminAuth';
import { hydrateGlobalCartFromUserKeyIfEmpty } from '../utils/cartWishlistStorage';
import { isCreativePreviewMode } from '../utils/creativePreviewMode';
import { isSupabaseConfigured, getSupabase } from '../utils/supabase';
import { syncCartFromApi, syncWishlistFromApi } from '../utils/syncFromApi';

/** Routes where bag/checkout UI should hydrate cart + wishlist from cloud before render. */
const COMMERCE_SYNC_PATH =
  /^\/(bag|checkout|wishlist|desktop\/(shopping-bag|acquisition)(?:\/|$))/;

async function pullAccountCommerceFromCloud(): Promise<void> {
  if (typeof window === 'undefined' || isCreativePreviewMode()) return;
  if (!isSignedIn() || !isSupabaseConfigured()) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;

  hydrateGlobalCartFromUserKeyIfEmpty();
  await Promise.all([syncCartFromApi(), syncWishlistFromApi()]);
}

/**
 * Keep cart + wishlist aligned for the signed-in account across mobile `/bag`, desktop
 * `/desktop/shopping-bag`, checkout, and other devices (Supabase GET merge).
 */
export default function AccountCommerceSync() {
  const location = useLocation();

  const pull = useCallback(() => {
    void pullAccountCommerceFromCloud();
  }, []);

  useEffect(() => {
    if (!COMMERCE_SYNC_PATH.test(location.pathname)) return;
    pull();
  }, [location.pathname, pull]);

  useEffect(() => {
    pull();
    const onFocus = () => pull();
    const onSignIn = () => pull();
    window.addEventListener('focus', onFocus);
    window.addEventListener('signInStateChanged', onSignIn);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('signInStateChanged', onSignIn);
    };
  }, [pull]);

  return null;
}
