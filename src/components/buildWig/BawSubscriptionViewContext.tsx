import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { usePremiumSubscriptionUpgrade } from '../../hooks/usePremiumSubscriptionUpgrade';
import { getEffectiveSubscriptionTier } from '../../utils/adminAuth';

function readHasPremiumSubscription(): boolean {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return false;
    const user = JSON.parse(raw) as { subscriptionTier?: string; membershipType?: string };
    return getEffectiveSubscriptionTier(user) != null;
  } catch {
    return false;
  }
}

type BawSubscriptionViewContextValue = ReturnType<typeof usePremiumSubscriptionUpgrade>;

const BawSubscriptionViewContext = createContext<BawSubscriptionViewContextValue | null>(null);

/** Shared subscription toggle state for BAW hub + sub-pages (rewards-style card swap). */
export function BawSubscriptionViewProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const premium = usePremiumSubscriptionUpgrade({
    hasPremiumSubscription: readHasPremiumSubscription(),
  });

  useEffect(() => {
    try {
      const isReturningFromCheckout = sessionStorage.getItem('returningFromCheckout') === 'true';
      if (isReturningFromCheckout) {
        sessionStorage.removeItem('returningFromCheckout');
        const savedTier = localStorage.getItem('membershipSelectedTier');
        premium.openPremiumChart(savedTier);
        return;
      }
      if (localStorage.getItem('membershipShowPremiumView') === 'true') {
        premium.openPremiumChart(localStorage.getItem('membershipSelectedTier'));
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount
  }, []);

  const pathnameMounted = useRef(false);
  useEffect(() => {
    if (!pathnameMounted.current) {
      pathnameMounted.current = true;
      return;
    }
    premium.closePremiumChart();
  }, [pathname, premium.closePremiumChart]);

  return (
    <BawSubscriptionViewContext.Provider value={premium}>{children}</BawSubscriptionViewContext.Provider>
  );
}

export function useBawSubscriptionView(): BawSubscriptionViewContextValue {
  const ctx = useContext(BawSubscriptionViewContext);
  if (!ctx) {
    throw new Error('useBawSubscriptionView must be used within BawSubscriptionViewProvider');
  }
  return ctx;
}

export function BuildWigSubscriptionPageRoot({ children }: { children: ReactNode }) {
  return <BawSubscriptionViewProvider>{children}</BawSubscriptionViewProvider>;
}
