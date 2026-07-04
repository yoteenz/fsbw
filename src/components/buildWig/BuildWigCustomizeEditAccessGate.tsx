import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import { isBuildAWigCustomizeOrEditPath, isBuildAWigCustomizePath, getBuildAWigFlowBasePath } from '../../utils/buildAWigRoutes';
import { isBawEditPath } from '../../utils/bawClientTestMode';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../utils/premiumMemberAccess';
import { TUTORIAL_OS_CONCIERGE_CHANGED, isTutorialOsConciergeBypassActive } from '../../tutorial-os/conciergeBypass';
import { signInHrefWithReturnTo } from '../../utils/signInReturnTo';

function isSignedInFromStorage(): boolean {
  try {
    return localStorage.getItem('isSignedIn') === 'true';
  } catch {
    return false;
  }
}

/**
 * Guests may browse customize sub-pages (try flow) without sign-in.
 * Signed-in non-premium: customize browse freely (premium steps show upgrade modal);
 * edit flows still require premium.
 */
export function BuildWigCustomizeEditAccessGate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const needsMemberAccess = useMemo(
    () => isBuildAWigCustomizeOrEditPath(location.pathname),
    [location.pathname]
  );

  const syncAccess = useCallback(() => {
    if (isTutorialOsConciergeBypassActive()) {
      setShowUpgradeModal(false);
      return;
    }
    if (!needsMemberAccess) {
      setShowUpgradeModal(false);
      return;
    }
    if (!isSignedInFromStorage()) {
      setShowUpgradeModal(false);
      if (isBuildAWigCustomizePath(location.pathname)) {
        return;
      }
      navigate(signInHrefWithReturnTo(location), { replace: true });
      return;
    }
    if (isBawEditPath(location.pathname) && !isPremiumMemberForGatedFeatures()) {
      setShowUpgradeModal(true);
      return;
    }
    setShowUpgradeModal(false);
  }, [location, navigate, needsMemberAccess]);

  useEffect(() => {
    syncAccess();
  }, [syncAccess]);

  useEffect(() => {
    const onFocus = () => syncAccess();
    const onSignIn = () => syncAccess();
    const onConcierge = () => syncAccess();
    window.addEventListener('focus', onFocus);
    window.addEventListener('signInStateChanged', onSignIn as EventListener);
    window.addEventListener(TUTORIAL_OS_CONCIERGE_CHANGED, onConcierge);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('signInStateChanged', onSignIn as EventListener);
      window.removeEventListener(TUTORIAL_OS_CONCIERGE_CHANGED, onConcierge);
    };
  }, [syncAccess]);

  const handleUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    prepareMembershipUpgradeNavigation();
    navigate('/account/rewards');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    setShowUpgradeModal(false);
    navigate(getBuildAWigFlowBasePath(location.pathname), { replace: true });
  }, [navigate, location.pathname]);

  if (!needsMemberAccess) {
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
      dataAttribute="upgrade-subscription-modal-build-a-wig-customize-edit"
    />
  );
}
