import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import {
  isPsaHiddenPath,
  PSA_WAVING_MS,
  PSA_TALKING_AFTER_REPLY_MS,
  PSA_WELCOME_MESSAGE,
  PSA_IDLE_WAVE_INTERVAL_MS,
} from '../../constants/psaConfig';
import { formatPsaUsageRemaining } from '../../constants/psaMembershipCopy';
import { isSignedIn, MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT } from '../../utils/adminAuth';
import { fetchPsaUsage } from '../../utils/psaApi';
import {
  isPremiumMemberForGatedFeatures,
  prepareMembershipUpgradeNavigation,
} from '../../utils/premiumMemberAccess';
import {
  isLoungeTvTheaterModeActive,
  LOUNGE_TV_THEATER_MODE_CHANGED_EVENT,
} from '../../utils/loungeTvTheaterMode';
import PsaAvatarTrigger from './PsaAvatarTrigger';
import PsaChatPanel from './PsaChatPanel';
import { resolvePsaAvatarExpression } from './resolvePsaAvatarExpression';
import { usePsaIdleExpressionCycle } from './usePsaIdleExpressionCycle';
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
  const [showIdleWave, setShowIdleWave] = useState(false);
  const [loungeTvTheater, setLoungeTvTheater] = useState(() => isLoungeTvTheaterModeActive());
  const idleExpressionCycle = usePsaIdleExpressionCycle(!isOpen && !showIdleWave);
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { messages, isSending, sendMessage, usage, setUsage } = usePsaChat(PSA_WELCOME_MESSAGE);

  useEffect(() => {
    const syncTheater = () => setLoungeTvTheater(isLoungeTvTheaterModeActive());
    syncTheater();
    window.addEventListener(LOUNGE_TV_THEATER_MODE_CHANGED_EVENT, syncTheater);
    return () => window.removeEventListener(LOUNGE_TV_THEATER_MODE_CHANGED_EVENT, syncTheater);
  }, []);

  useEffect(() => {
    if (loungeTvTheater) setIsOpen(false);
  }, [loungeTvTheater]);

  useEffect(() => {
    if (!isOpen || !isPremium) return;
    let cancelled = false;
    void fetchPsaUsage().then((result) => {
      if (cancelled || !result.ok) return;
      setUsage(result.usage);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, isPremium, setUsage]);

  const usageLabel = useMemo(() => {
    if (!usage || usage.unlimited) return null;
    return formatPsaUsageRemaining(
      usage.monthCount,
      usage.monthLimit,
      usage.dayCount,
      usage.dayLimit
    );
  }, [usage]);

  const triggerIdleWave = useCallback(() => {
    if (idleWaveTimerRef.current) clearTimeout(idleWaveTimerRef.current);
    setShowIdleWave(true);
    idleWaveTimerRef.current = setTimeout(() => {
      setShowIdleWave(false);
      idleExpressionCycle.resetToSoftLanding();
      idleWaveTimerRef.current = null;
    }, PSA_WAVING_MS);
  }, [idleExpressionCycle.resetToSoftLanding]);

  /** Closed FAB: brief wave every ~30s so the avatar feels alive, not static. */
  useEffect(() => {
    if (isOpen) {
      setShowIdleWave(false);
      if (idleWaveIntervalRef.current) {
        clearInterval(idleWaveIntervalRef.current);
        idleWaveIntervalRef.current = null;
      }
      return;
    }

    const startInterval = () => {
      triggerIdleWave();
      idleWaveIntervalRef.current = setInterval(triggerIdleWave, PSA_IDLE_WAVE_INTERVAL_MS);
    };

    const initialDelay = setTimeout(startInterval, PSA_IDLE_WAVE_INTERVAL_MS);

    return () => {
      clearTimeout(initialDelay);
      if (idleWaveIntervalRef.current) {
        clearInterval(idleWaveIntervalRef.current);
        idleWaveIntervalRef.current = null;
      }
      if (idleWaveTimerRef.current) {
        clearTimeout(idleWaveTimerRef.current);
        idleWaveTimerRef.current = null;
      }
    };
  }, [isOpen, triggerIdleWave]);

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
    if (!isOpen && !showWelcomeWave && !showIdleWave && lastReplyAt == null) return;
    const id = window.setInterval(() => setExpressionTick((t) => t + 1), 350);
    return () => window.clearInterval(id);
  }, [isOpen, showWelcomeWave, showIdleWave, lastReplyAt]);

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
    window.addEventListener(MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener('signInStateChanged', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener(MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!isPremium) setIsOpen(false);
  }, [isPremium]);

  useEffect(() => {
    return () => {
      if (welcomeTimerRef.current) clearTimeout(welcomeTimerRef.current);
      if (idleWaveTimerRef.current) clearTimeout(idleWaveTimerRef.current);
      if (idleWaveIntervalRef.current) clearInterval(idleWaveIntervalRef.current);
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
    setIsOpen((open) => {
      if (!open) startWelcomeWave();
      return !open;
    });
  }, [startWelcomeWave]);

  const handleSend = useCallback(
    async (text: string) => {
      const result = await sendMessage(text);
      if (result?.premiumRequired) {
        setIsOpen(false);
        setShowUpgradeModal(true);
        return;
      }
      if (result?.clientActions?.length) {
        for (const action of result.clientActions) {
          if (action.type === 'sync_cart') {
            try {
              const { syncCartFromApi } = await import('../../utils/syncFromApi');
              await syncCartFromApi();
            } catch {
              /* ignore */
            }
          }
          if (action.type === 'navigate' && action.path) {
            navigate(action.path);
          }
        }
      }
    },
    [sendMessage, navigate]
  );

  const handleUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    prepareMembershipUpgradeNavigation();
    navigate('/account/rewards');
  }, [navigate]);

  const avatarExpression = useMemo(() => {
    const resolved = resolvePsaAvatarExpression({
      isChatOpen: isOpen,
      isSending,
      isInputFocused,
      inputHasText,
      showWelcomeWave,
      lastReplyAt,
      messages,
      now: Date.now() + expressionTick * 0,
    });
    if (!isOpen && showIdleWave) return 'waving';
    if (!isOpen) return idleExpressionCycle.expression;
    return resolved;
  }, [
    isOpen,
    isSending,
    isInputFocused,
    inputHasText,
    showWelcomeWave,
    showIdleWave,
    lastReplyAt,
    messages,
    expressionTick,
    idleExpressionCycle.expression,
  ]);

  // Same gate as /lobby + lounge: premium subscription and/or BLACK tier only (not standard members).
  if (!signedIn || !isPremium || isPsaHiddenPath(location.pathname) || loungeTvTheater) {
    return null;
  }

  const widget = (
    <>
      <div className="psa-widget-root" data-attribute="psa-assistant-widget">
        {isOpen ? (
          <PsaChatPanel
            messages={messages}
            isSending={isSending}
            usageLabel={usageLabel}
            onClose={() => setIsOpen(false)}
            onSend={handleSend}
            onInputFocusChange={setIsInputFocused}
            onInputTextChange={setInputHasText}
          />
        ) : null}
        <PsaAvatarTrigger
          onClick={handleToggle}
          isOpen={isOpen}
          idle={!isOpen}
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
