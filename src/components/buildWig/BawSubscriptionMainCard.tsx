import type { ReactNode } from 'react';
import PremiumSubscriptionUpgradeChart from '../membership/PremiumSubscriptionUpgradeChart';
import { getEffectiveSubscriptionTier } from '../../utils/adminAuth';
import { useBawSubscriptionView } from './BawSubscriptionViewContext';

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

type BawSubscriptionMainCardProps = {
  children: ReactNode;
};

/** Replaces builder main card with premium chart when VIEW SUBSCRIPTIONS is toggled (Account → Rewards pattern). */
export function BawSubscriptionMainCard({ children }: BawSubscriptionMainCardProps) {
  const premium = useBawSubscriptionView();

  if (!premium.showPremiumChart) {
    return <>{children}</>;
  }

  return (
    <PremiumSubscriptionUpgradeChart
      onClose={premium.closePremiumChart}
      hasPremiumSubscription={readHasPremiumSubscription()}
      selectedTier={premium.selectedTier}
      setSelectedTier={premium.setSelectedTier}
      showAllBenefits={premium.showAllBenefits}
      setShowAllBenefits={premium.setShowAllBenefits}
      formatPrice={premium.formatPrice}
      subscriptionTiers={premium.subscriptionTiers}
    />
  );
}
