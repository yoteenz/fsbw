import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import {
  isPsaHiddenPath,
  PSA_WELCOME_MESSAGE,
} from '../../constants/psaConfig';
import { isSignedIn } from '../../utils/adminAuth';
import {
  isPremiumMemberForGatedFeatures,
  prepareMembershipUpgradeNavigation,
} from '../../utils/premiumMemberAccess';
import PsaAvatarTrigger from './PsaAvatarTrigger';
import PsaChatPanel from './PsaChatPanel';
import { usePsaChat } from './usePsaChat';
import './psaAssistant.css';

export default function PsaAssistantWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(() => isSignedIn());
  const [isPremium, setIsPremium] = useState(() => isPremiumMemberForGatedFeatures());
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { messages, isSending, sendMessage } = usePsaChat(PSA_WELCOME_MESSAGE);

  useEffect(() => {
    const sync = () => {
      setSignedIn(isSignedIn());
      setIsPremium(isPremiumMemberForGatedFeatures());
    };
    sync();
    window.addEventListener('signInStateChanged', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('signInStateChanged', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (!signedIn) return;
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setIsOpen((open) => !open);
  }, [signedIn, isPremium]);

  const handleSend = useCallback(
    async (text: string) => {
      const result = await sendMessage(text);
      if (result?.premiumRequired) {
        setIsOpen(false);
        setShowUpgradeModal(true);
      }
    },
    [sendMessage]
  );

  const handleUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    prepareMembershipUpgradeNavigation();
    navigate('/account/rewards');
  }, [navigate]);

  if (!signedIn || isPsaHiddenPath(location.pathname)) {
    return null;
  }

  const widget = (
    <>
      <div className="psa-widget-root" data-attribute="psa-assistant-widget">
        {isOpen && isPremium ? (
          <PsaChatPanel
            messages={messages}
            isSending={isSending}
            onClose={() => setIsOpen(false)}
            onSend={handleSend}
          />
        ) : null}
        <PsaAvatarTrigger
          onClick={handleToggle}
          isOpen={isOpen}
          isThinking={isSending}
        />
      </div>

      <ConfirmationModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onConfirm={handleUpgrade}
        title="UPGRADE YOUR SUBSCRIPTION"
        message="PSA — PERSONAL SLAY ASSISTANT — IS AVAILABLE TO PREMIUM MEMBERS ONLY."
        confirmText="UPGRADE"
        cancelText="CANCEL"
        dataAttribute="psa-upgrade-modal"
      />
    </>
  );

  if (typeof document === 'undefined') return widget;
  return createPortal(widget, document.body);
}
