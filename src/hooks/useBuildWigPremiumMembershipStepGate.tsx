import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import { getBuildAWigFlowBasePath, pathnameIsBuildWigPremiumMembershipStep } from '../utils/buildAWigRoutes';
import { isBawViewSubscriptionsFooterMode } from '../utils/bawClientTestMode';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../utils/premiumMemberAccess';

export { pathnameIsBuildWigPremiumMembershipStep };

/**
 * On lace/texture/color/hairline/styling/addons routes: if the user is not premium, show the upgrade modal
 * (edit/customize flows only). Guests and standard members on premium steps browse freely; footer uses VIEW SUBSCRIPTIONS.
 */
export function useBuildWigPremiumMembershipStepGate(): JSX.Element | null {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const needsPremiumHere = useMemo(
    () => pathnameIsBuildWigPremiumMembershipStep(location.pathname),
    [location.pathname]
  );

  const syncModalToEligibility = useCallback(() => {
    if (!needsPremiumHere) {
      setShowUpgradeModal(false);
      return;
    }
    if (isBawViewSubscriptionsFooterMode(location.pathname)) {
      setShowUpgradeModal(false);
      return;
    }
    setShowUpgradeModal(!isPremiumMemberForGatedFeatures());
  }, [needsPremiumHere, location.pathname]);

  useEffect(() => {
    syncModalToEligibility();
  }, [syncModalToEligibility]);

  useEffect(() => {
    const onFocus = () => syncModalToEligibility();
    const onSignIn = () => syncModalToEligibility();
    window.addEventListener('focus', onFocus);
    window.addEventListener('signInStateChanged', onSignIn as EventListener);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('signInStateChanged', onSignIn as EventListener);
    };
  }, [syncModalToEligibility]);

  const handleUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    prepareMembershipUpgradeNavigation();
    navigate('/account/rewards');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    setShowUpgradeModal(false);
    try {
      const base = getBuildAWigFlowBasePath(location.pathname);
      navigate(base || '/build-a-wig');
    } catch {
      navigate('/build-a-wig');
    }
  }, [navigate, location.pathname]);

  if (!needsPremiumHere) {
    return null;
  }

  return (
    <ConfirmationModal
      isOpen={showUpgradeModal}
      onClose={handleCancel}
      onConfirm={handleUpgrade}
      title="UPGRADE YOUR SUBSCRIPTION"
      message="YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE."
      confirmText="UPGRADE"
      cancelText="CANCEL"
      dataAttribute="upgrade-subscription-modal-build-a-wig-premium-options"
    />
  );
}
