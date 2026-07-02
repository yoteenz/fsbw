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
      <div style={{ marginBottom: '32px' }}>
        <div
          className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200"
          style={{ marginBottom: '12px' }}
        >
          <h2
            style={{
              fontFamily: '"Futura PT Medium"',
              color: '#EB1C24',
              fontSize: '12px',
              fontWeight: '500',
              margin: '0',
              textTransform: 'uppercase',
            }}
          >
            PREMIUM MEMBERSHIP
          </h2>
          <button
            type="button"
            onClick={premium.closePremiumChart}
            aria-label="Close premium membership chart"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginTop: '-2px',
              flexShrink: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EB1C24',
              lineHeight: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ display: 'block' }}
            >
              <path
                d="M6.40038 18.3074L5.69238 17.5994L11.2924 11.9994L5.69238 6.39941L6.40038 5.69141L12.0004 11.2914L17.6004 5.69141L18.3084 6.39941L12.7084 11.9994L18.3084 17.5994L17.6004 18.3074L12.0004 12.7074L6.40038 18.3074Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.1"
              />
            </svg>
          </button>
        </div>

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
    </div>
  );
}
