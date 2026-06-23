import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pullAccountCommerceFromCloud } from '../utils/cartLocalStorage';

/** Routes where bag/checkout UI should hydrate cart + wishlist from cloud before render. */
const COMMERCE_SYNC_PATH =
  /^\/(bag|checkout|wishlist|desktop\/(shopping-bag|acquisition)(?:\/|$))/;

/**
 * Keep cart + wishlist aligned for the signed-in account across mobile `/bag`, desktop
 * `/desktop/shopping-bag`, checkout, and other devices (Supabase GET merge).
 *
 * Does not pull on window focus — focus during panel debug / Save clicks was racing
 * cloud cart over local lines. Sign-in and commerce route entry still hydrate.
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
    const onSignIn = () => {
      void pullAccountCommerceFromCloud({ force: true });
    };
    window.addEventListener('signInStateChanged', onSignIn);
    return () => {
      window.removeEventListener('signInStateChanged', onSignIn);
    };
  }, []);

  return null;
}
