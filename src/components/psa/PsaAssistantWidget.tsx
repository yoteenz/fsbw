import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import {
  isPsaHiddenPath,
  PSA_WAVING_MS,
  PSA_TALKING_AFTER_REPLY_MS,
  PSA_WELCOME_MESSAGE,
} from '../../constants/psaConfig';
import { isSignedIn } from '../../utils/adminAuth';
import {
  isPremiumMemberForGatedFeatures,
  prepareMembershipUpgradeNavigation,
} from '../../utils/premiumMemberAccess';
import PsaAvatarTrigger from './PsaAvatarTrigger';
import PsaChatPanel from './PsaChatPanel';
import { resolvePsaAvatarExpression } from './resolvePsaAvatarExpression';
import { usePsaChat } from './usePsaChat';
import './psaAssistant.css';

export default function PsaAssistantWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(() => isSignedIn());
  const [isPremium, setIsPremium] = useState(() => isPremiumMemberForGatedFeatures());
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWelcomeWave, setShowWelcomeWave] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputHasText, setInputHasText] = useState(false);
  const [lastReplyAt, setLastReplyAt] = useState<number | null>(null);
  const [expressionTick, setExpressionTick] = useState(0);
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { messages, isSending, sendMessage } = usePsaChat(PSA_WELCOME_MESSAGE);

  const prevMessageCountRef = useRef(messages.length);
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (messages.length > prevMessageCountRef.current && last?.role === 'assistant' && last.id !== 'welcome') {
      setLastReplyAt(Date.now());
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  /** Re-resolve avatar after talking / waving timers elapse. */
  useEffect(() => {
    if (!isOpen && !showWelcomeWave && lastReplyAt == null) return;
    const id = window.setInterval(() => setExpressionTick((t) => t + 1), 350);
    return () => window.clearInterval(id);
  }, [isOpen, showWelcomeWave, lastReplyAt]);

  useEffect(() => {
    if (lastReplyAt == null) return;
    const id = window.setTimeout(
      () => setExpressionTick((t) => t + 1),
      PSA_TALKING_AFTER_REPLY_MS + 50
    );
    return () => window.clearTimeout(id);
  }, [lastReplyAt]);

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

  useEffect(() => {
    return () => {
      if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);
    };
  }, []);

  const startWelcomeWave = useCallback(() => {
    if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);
    setShowWelcomeWave(true);
    welcomeTimerRef.current = setTimeout(() => {
      setShowWelcomeWave(false);
      welcomeTimerRef.current = null;
    }, PSA_WAVING_MS);
  }, []);

  const handleToggle = useCallback(() => {
    if (!signedIn) return;
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setIsOpen((open) => {
      if (!open) startWelcomeWave();
      return !open;
    });
  }, [signedIn, isPremium, startWelcomeWave]);

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

  const avatarExpression = useMemo(
    () =>
      resolvePsaAvatarExpression({
        isChatOpen: isOpen,
        isSending,
        isInputFocused,
        inputHasText,
        showWelcomeWave,
        lastReplyAt,
        messages,
        now: Date.now() + expressionTick * 0,
      }),
    [isOpen, isSending, isInputFocused, inputHasText, showWelcomeWave, lastReplyAt, messages, expressionTick]
  );

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
            onInputFocusChange={setIsInputFocused}
            onInputTextChange={setInputHasText}
          />
        ) : null}
        <PsaAvatarTrigger
          onClick={handleToggle}
          isOpen={isOpen}
          expression={avatarExpression}
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
