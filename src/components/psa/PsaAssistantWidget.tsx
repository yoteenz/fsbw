import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import {
  isPsaHiddenPath,
  PSA_NUDGE_BUBBLE_SRC,
  PSA_WAVING_MS,
  PSA_TALKING_AFTER_REPLY_MS,
  readPsaWelcomeMessageFromStorage,
  PSA_IDLE_WAVE_INTERVAL_MS,
  PSA_WIDGET_CTA,
  PSA_CONTINUE_CTA,
  PSA_HIDE_CHAT_CTA,
  PSA_SHOW_CHAT_CTA,
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
import { usePsaProactiveNudges } from './usePsaProactiveNudges';
import { buildPsaClientSessionContext } from '../../utils/psaSessionContext';
import { applyPsaBawPrefill, type PsaBawPrefillSelections } from '../../utils/psaBawPrefill';
import { savePsaBawDraft } from '../../utils/psaBawDraft';
import { resolvePsaQuickReplyNavigation } from '../../utils/psaQuickReplyNavigation';
import type { PsaClientAction } from '../../utils/psaApi';
import './psaAssistant.css';

function draftSelectionsFromPrefill(
  selections?: PsaBawPrefillSelections
): Record<string, string> | undefined {
  if (!selections) return undefined;
  const out: Record<string, string> = {};
  if (selections.capSize) out.capsize = selections.capSize;
  if (selections.length) out.length = selections.length;
  if (selections.density) out.density = selections.density;
  if (selections.color) out.color = selections.color;
  if (selections.texture) out.texture = selections.texture;
  if (selections.lace) out.lace = selections.lace;
  if (selections.hairline) out.hairline = selections.hairline;
  if (selections.styling) out.styling = selections.styling;
  if (selections.partSelection) out.partselection = selections.partSelection;
  return Object.keys(out).length ? out : undefined;
}

export default function PsaAssistantWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(() => isSignedIn());
  const [isPremium, setIsPremium] = useState(() => isPremiumMemberForGatedFeatures());
  const [isOpen, setIsOpen] = useState(false);
  const [isFabCollapsed, setIsFabCollapsed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWelcomeWave, setShowWelcomeWave] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputHasText, setInputHasText] = useState(false);
  const [lastReplyAt, setLastReplyAt] = useState<number | null>(null);
  const [expressionTick, setExpressionTick] = useState(0);
  const [showIdleWave, setShowIdleWave] = useState(false);
  const [loungeTvTheater, setLoungeTvTheater] = useState(() => isLoungeTvTheaterModeActive());
  const [prefillInput, setPrefillInput] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState(() => readPsaWelcomeMessageFromStorage());
  const idleExpressionCycle = usePsaIdleExpressionCycle(!isOpen && !showIdleWave && !isFabCollapsed);
  const welcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleWaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    messages,
    isSending,
    isLoadingHistory,
    threadId,
    threadList,
    historyOpen,
    historyAvailable,
    sendMessage,
    usage,
    panelQuickReplies,
    continueHint,
    setUsage,
    ensureHistoryLoaded,
    refreshContinueHint,
    startNewThread,
    switchThread,
    openHistory,
    closeHistory,
    archiveThread,
    removeThread,
  } = usePsaChat(welcomeMessage, (pendingMessage) =>
    buildPsaClientSessionContext(location.pathname, pendingMessage)
  );

  const proactiveNudge = usePsaProactiveNudges(!isOpen && !isFabCollapsed);

  const showContinueHint =
    !isFabCollapsed && !isOpen && !proactiveNudge && continueHint && continueHint.messageCount > 0;
  const fabCtaLabel = isFabCollapsed
    ? PSA_SHOW_CHAT_CTA
    : isOpen
      ? PSA_HIDE_CHAT_CTA
      : showContinueHint
        ? PSA_CONTINUE_CTA
        : PSA_WIDGET_CTA;
  const fabCtaSubline = showContinueHint ? continueHint!.title : null;

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
    if (!isPremium) return;
    void refreshContinueHint();
  }, [isPremium, refreshContinueHint]);

  useEffect(() => {
    if (!isOpen || !isPremium) return;
    void ensureHistoryLoaded();
  }, [isOpen, isPremium, ensureHistoryLoaded]);

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
    if (isOpen || isFabCollapsed) {
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
  }, [isOpen, isFabCollapsed, triggerIdleWave]);

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
      setWelcomeMessage(readPsaWelcomeMessageFromStorage());
    };
    sync();
    window.addEventListener('signInStateChanged', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    window.addEventListener(MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener('signInStateChanged', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
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

  const handleFabClick = useCallback(() => {
    if (isFabCollapsed) {
      setIsFabCollapsed(false);
      return;
    }
    if (isOpen) {
      setIsFabCollapsed(true);
      setIsOpen(false);
      closeHistory();
      return;
    }
    setIsOpen(true);
    startWelcomeWave();
  }, [isFabCollapsed, isOpen, startWelcomeWave, closeHistory]);

  const handleCloseChat = useCallback(() => {
    setIsOpen(false);
    closeHistory();
  }, [closeHistory]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleCloseChat();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleCloseChat]);

  const handleNudgeAction = useCallback(() => {
    if (!proactiveNudge) return;
    if (proactiveNudge.prefilledMessage) {
      setPrefillInput(proactiveNudge.prefilledMessage);
      setIsOpen(true);
      startWelcomeWave();
      return;
    }
    navigate(proactiveNudge.actionPath);
  }, [proactiveNudge, navigate, startWelcomeWave]);

  const runClientActions = useCallback(
    async (actions: PsaClientAction[]) => {
      for (const action of actions) {
        if (action.type === 'sync_cart') {
          try {
            const { syncCartFromApi } = await import('../../utils/syncFromApi');
            await syncCartFromApi();
          } catch {
            /* ignore */
          }
        }
        if (action.type === 'prefill_baw') {
          const path = applyPsaBawPrefill({
            unitId: action.unitId,
            path: action.path,
            selections: action.selections,
          });
          navigate(path);
          continue;
        }
        if (action.type === 'save_baw_draft') {
          const selections = draftSelectionsFromPrefill(action.selections);
          savePsaBawDraft({
            unitId: action.unitId,
            buildPath: action.path,
            selections,
            label: action.label,
          });
          if (action.selections && Object.keys(action.selections).length > 0) {
            applyPsaBawPrefill({
              unitId: action.unitId,
              path: action.path,
              selections: action.selections,
            });
          }
          continue;
        }
        if (action.type === 'navigate' && action.path) {
          navigate(action.path);
        }
      }
    },
    [navigate]
  );

  const handleSend = useCallback(
    async (text: string) => {
      setPrefillInput('');
      const navPath = resolvePsaQuickReplyNavigation(text);

      if (navPath) {
        const result = await sendMessage(text, { immediateNavigate: true });
        if (result?.premiumRequired) {
          setIsOpen(false);
          setShowUpgradeModal(true);
          return;
        }
        if (navPath.startsWith('/build-a-wig')) {
          const unitMatch = navPath.match(/\/build-a-wig\/([a-z-]+)/i);
          if (unitMatch?.[1]) {
            applyPsaBawPrefill({ unitId: unitMatch[1], path: navPath });
          }
        }
        setIsOpen(false);
        navigate(navPath);
        return;
      }

      const result = await sendMessage(text);
      if (result?.premiumRequired) {
        setIsOpen(false);
        setShowUpgradeModal(true);
        return;
      }
      if ('clientActions' in result && result.clientActions?.length) {
        await runClientActions(result.clientActions);
      }
    },
    [sendMessage, runClientActions, navigate]
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
          <>
            <button
              type="button"
              className="psa-chat-backdrop"
              aria-label="Close PSA chat"
              onClick={handleCloseChat}
            />
            <PsaChatPanel
              messages={messages}
              isSending={isSending}
              isLoadingHistory={isLoadingHistory}
              usageLabel={usageLabel}
              panelQuickReplies={panelQuickReplies}
              historyOpen={historyOpen}
              historyAvailable={historyAvailable}
              threadList={threadList}
              activeThreadId={threadId}
              onClose={handleCloseChat}
              onSend={handleSend}
              onNewChat={() => void startNewThread()}
              onOpenHistory={() => void openHistory()}
              onCloseHistory={closeHistory}
              onSelectThread={(id) => void switchThread(id)}
              onArchiveThread={(id) => void archiveThread(id)}
              onDeleteThread={(id) => void removeThread(id)}
              onInputFocusChange={setIsInputFocused}
              onInputTextChange={setInputHasText}
              initialInput={prefillInput}
            />
          </>
        ) : null}
        <div className="psa-widget-fab-stack">
          {!isFabCollapsed && !isOpen && proactiveNudge ? (
            <button
              type="button"
              className="psa-nudge-chip"
              onClick={handleNudgeAction}
              aria-label={proactiveNudge.headline}
            >
              <img
                className="psa-nudge-chip-art"
                src={PSA_NUDGE_BUBBLE_SRC}
                alt=""
                aria-hidden
                draggable={false}
              />
              <span className="psa-nudge-chip-content">
                <span className="psa-nudge-chip-headline">{proactiveNudge.headline}</span>
                {proactiveNudge.body ? (
                  <span className="psa-nudge-chip-body">{proactiveNudge.body}</span>
                ) : null}
              </span>
            </button>
          ) : null}
          {isFabCollapsed ? (
            <button
              type="button"
              className="psa-fab-collapsed-trigger"
              onClick={handleFabClick}
              aria-label="Show PSA chat"
            >
              <span className="psa-avatar-cta">{fabCtaLabel}</span>
            </button>
          ) : (
            <PsaAvatarTrigger
              onClick={handleFabClick}
              isOpen={isOpen}
              idle={!isOpen}
              expression={avatarExpression}
              ctaLabel={fabCtaLabel}
              ctaSubline={fabCtaSubline}
              aria-label={isOpen ? 'Hide PSA chat' : 'Open Personal Slay Assistant'}
            />
          )}
        </div>
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
