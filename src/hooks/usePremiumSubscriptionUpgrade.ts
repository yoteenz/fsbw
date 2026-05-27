import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBSCRIPTION_TIERS, type SubscriptionTierId } from '../constants/subscriptionPricing';
import { trackActivity } from '../utils/activity';
import { useSelectedCurrencyDisplay } from './useSelectedCurrencyDisplay';

export type UsePremiumSubscriptionUpgradeOptions = {
  hasPremiumSubscription?: boolean;
  initialTier?: string | null;
};

export function usePremiumSubscriptionUpgrade(options: UsePremiumSubscriptionUpgradeOptions = {}) {
  const { hasPremiumSubscription = false, initialTier = null } = options;
  const navigate = useNavigate();
  const preservePremiumPersistForCheckoutRef = useRef(false);
  const { formatUsd } = useSelectedCurrencyDisplay();

  const [showPremiumChart, setShowPremiumChart] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(initialTier);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const subscriptionTiers = Object.fromEntries(
    (Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTierId[]).map((k) => [
      k,
      { name: SUBSCRIPTION_TIERS[k].name, price: SUBSCRIPTION_TIERS[k].priceUsd },
    ])
  ) as Record<SubscriptionTierId, { name: string; price: number }>;

  const formatPrice = useCallback(
    (price: number) => ({ __html: formatUsd(price) }),
    [formatUsd]
  );

  const closePremiumChart = useCallback(() => {
    setShowPremiumChart(false);
    setSelectedTier(null);
    setShowAllBenefits(false);
    try {
      localStorage.removeItem('membershipShowPremiumView');
      sessionStorage.removeItem('returningFromCheckout');
      localStorage.removeItem('membershipSelectedTier');
    } catch {
      /* ignore */
    }
  }, []);

  const openPremiumChart = useCallback((preselectTier?: string | null) => {
    setShowPremiumChart(true);
    setSelectedTier(preselectTier ?? null);
    try {
      localStorage.setItem('membershipShowPremiumView', 'true');
      if (preselectTier) {
        localStorage.setItem('membershipSelectedTier', preselectTier);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const proceedToCheckout = useCallback(() => {
    if (!selectedTier) {
      setShowValidationModal(true);
      return;
    }

    const tier = subscriptionTiers[selectedTier as SubscriptionTierId];
    const subscriptionItem = {
      id: `subscription-${selectedTier}`,
      name: tier.name,
      price: tier.price,
      quantity: 1,
      type: 'digital',
      subscriptionTier: selectedTier,
    };

    localStorage.setItem('subscriptionUpgrade', JSON.stringify(subscriptionItem));
    localStorage.setItem('isSubscriptionUpgrade', 'true');
    if (hasPremiumSubscription) {
      localStorage.setItem('isSubscriptionChange', 'true');
    }
    localStorage.setItem('membershipSelectedTier', selectedTier);
    localStorage.setItem('membershipShowPremiumView', 'true');
    sessionStorage.setItem('returningFromCheckout', 'true');
    trackActivity('membership_upgrade_checkout', { tier: selectedTier });
    preservePremiumPersistForCheckoutRef.current = true;
    navigate('/checkout/upgrade');
  }, [hasPremiumSubscription, navigate, selectedTier, subscriptionTiers]);

  /** Same behavior as Account → Rewards upgrade / confirm button. */
  const handleUpgradeAction = useCallback(() => {
    if (showPremiumChart) {
      proceedToCheckout();
    } else {
      openPremiumChart(null);
    }
  }, [openPremiumChart, proceedToCheckout, showPremiumChart]);

  return {
    showPremiumChart,
    setShowPremiumChart,
    selectedTier,
    setSelectedTier,
    showAllBenefits,
    setShowAllBenefits,
    showValidationModal,
    setShowValidationModal,
    subscriptionTiers,
    formatPrice,
    openPremiumChart,
    closePremiumChart,
    handleUpgradeAction,
    proceedToCheckout,
    preservePremiumPersistForCheckoutRef,
  };
}
