import type { CSSProperties, ReactNode } from 'react';
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
  className?: string;
  style?: CSSProperties;
};

/** Replaces builder main card with premium chart when VIEW SUBSCRIPTIONS is toggled (Account → Rewards pattern). */
export function BawSubscriptionMainCard({ children, className, style }: BawSubscriptionMainCardProps) {
  const premium = useBawSubscriptionView();

  if (!premium.showPremiumChart) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`border border-black bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out ${className ?? ''}`}
      style={{
        borderWidth: '1.3px',
        padding: '20px 20px 0 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        ...style,
      }}
      data-attribute="baw-subscription-main-card"
    >
      <PremiumSubscriptionUpgradeChart
        embedded
        onClose={premium.closePremiumChart}
        hasPremiumSubscription={readHasPremiumSubscription()}
        selectedTier={premium.selectedTier}
        setSelectedTier={premium.setSelectedTier}
        showAllBenefits={premium.showAllBenefits}
        setShowAllBenefits={premium.setShowAllBenefits}
        formatPrice={premium.formatPrice}
        subscriptionTiers={premium.subscriptionTiers}
      />
    </div>
  );
}
