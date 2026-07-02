import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import { isBuildAWigCustomizeOrEditPath, isBuildAWigCustomizePath } from '../../utils/buildAWigRoutes';
import { isBawEditPath } from '../../utils/bawClientTestMode';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../utils/premiumMemberAccess';
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
 * Signed-in non-premium: customize browse freely (premium steps use VIEW SUBSCRIPTIONS footer);
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
    window.addEventListener('focus', onFocus);
    window.addEventListener('signInStateChanged', onSignIn as EventListener);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('signInStateChanged', onSignIn as EventListener);
    };
  }, [syncAccess]);

  const handleUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    prepareMembershipUpgradeNavigation();
    navigate('/account/rewards');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    setShowUpgradeModal(false);
    navigate('/build-a-wig/try', { replace: true });
  }, [navigate]);

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
