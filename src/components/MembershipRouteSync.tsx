import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isPremiumMemberForGatedFeatures } from '../utils/premiumMemberAccess';
import {
  isBookingMembershipScopedPath,
  resolveBookingMembershipRedirect
} from '../utils/membershipRoutePolicy';
import { isSupabaseConfigured } from '../utils/supabase';
import { syncAllFromApi } from '../utils/syncFromApi';

/**
 * Keeps booking URLs aligned with membership: premium members on standard consult/appointment
 * paths are moved to `/booking/premium/*`; `/booking/premium/consult` is normalized to
 * `/booking/premium/consultation`. Non-premium users are not redirected away from premium consult
 * (the page shows the area gate). Runs profile sync when signed in so tier matches server before deciding.
 */
export default function MembershipRouteSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const bump = () => setAuthTick((t) => t + 1);
    window.addEventListener('signInStateChanged', bump);
    return () => window.removeEventListener('signInStateChanged', bump);
  }, []);

  useEffect(() => {
    const pathname = location.pathname;
    if (!isBookingMembershipScopedPath(pathname)) {
      return;
    }

    let cancelled = false;
    const run = async () => {
      if (isSupabaseConfigured() && localStorage.getItem('isSignedIn') === 'true') {
        try {
          await syncAllFromApi();
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;

      const premium = isPremiumMemberForGatedFeatures();
      const target = resolveBookingMembershipRedirect(pathname, premium);
      if (target != null && target !== pathname) {
        navigate(target, { replace: true });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, authTick]);

  return null;
}
