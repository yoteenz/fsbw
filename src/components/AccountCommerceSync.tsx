import { useEffect } from 'react';
import { pullAccountCommerceFromCloud } from '../utils/cartLocalStorage';

/**
 * Merge cart + wishlist from cloud after sign-in so devices stay aligned.
 *
 * Commerce route entry hydration is owned by `CommerceRouteGuard` (`hydrateCommerceCartForRoute`)
 * so we do not pull here on pathname changes — that raced parallel `syncCartFromApi` calls and
 * could wipe local lines before the tablet rendered.
 */
export default function AccountCommerceSync() {
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
