import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';
import {
  isPsaHiddenPath,
  PSA_WAVING_MS,
  PSA_TALKING_AFTER_REPLY_MS,
  PSA_IDLE_WAVE_INTERVAL_MS,
} from '../../constants/psaConfig';
import {
  getPsaChatUiCopy,
  PSA_CHAT_COPY_UPDATED_EVENT,
  readPsaWelcomeMessageFromCopyStorage,
} from '../../utils/psaChatCopyResolve';
import { appendWelcomeMemoryHint } from '../../utils/psaWelcomeMemory';
import {
  isSaveWhyChip,
  stashOccasionCaptureMeta,
  PSA_SAVE_WHY_CHIP,
} from '../../utils/psaOccasionCapture';
import { formatPsaUsageRemaining } from '../../constants/psaMembershipCopy';
import { isSignedIn, MEMBERSHIP_SUBSCRIPTION_PREVIEW_CHANGED_EVENT } from '../../utils/adminAuth';
import { fetchPsaActiveThread, fetchPsaUsage } from '../../utils/psaApi';
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
import PsaNudgeChip from './PsaNudgeChip';
import {
  resolveActivePsaSessionMode,
  resolvePsaAvatarExpression,
} from './resolvePsaAvatarExpression';
import { buildPsaWelcomeMemorySuffix } from '../../utils/psaWelcomeMemory';
import { resolvePsaMood } from '../../utils/psaMood';
import { usePsaIdleExpressionCycle } from './usePsaIdleExpressionCycle';
import { usePsaChat } from './usePsaChat';
import { usePsaProactiveNudges } from './usePsaProactiveNudges';
import { buildPsaClientSessionContext } from '../../utils/psaSessionContext';
import { setCachedPsaMemberContext } from '../../utils/psaMemberContextCache';
import {
  activateRedCarpetMode,
  isRedCarpetModeActive,
  isRedCarpetTriggerMessage,
} from '../../utils/psaRedCarpetMode';
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
  const [redCarpetMode, setRedCarpetMode] = useState(() => isRedCarpetModeActive());
  const [welcomeMessage, setWelcomeMessage] = useState(() =>
    appendWelcomeMemoryHint(readPsaWelcomeMessageFromCopyStorage())
  );
  const [bonusStarterChips, setBonusStarterChips] = useState<string[]>([]);
  const [uiCopy, setUiCopy] = useState(() => getPsaChatUiCopy());
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
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
    historyArchivedView,
    isLoadingThreadList,
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
    toggleHistoryArchivedView,
    archiveThread,
    renameThread,
    unarchiveThread,
    removeThread,
  } = usePsaChat(welcomeMessage, (pendingMessage) =>
    buildPsaClientSessionContext(location.pathname, pendingMessage)
  );

  const proactiveNudge = usePsaProactiveNudges(
    !isOpen && !isFabCollapsed && !cartDropdownOpen
  );

  const showContinueHint =
    !isFabCollapsed && !isOpen && !proactiveNudge && continueHint && continueHint.messageCount > 0;
  const fabCtaLabel = isFabCollapsed
    ? uiCopy.showChatCta
    : isOpen
      ? uiCopy.hideChatCta
      : showContinueHint
        ? uiCopy.continueCta
        : uiCopy.widgetCta;
  const fabCtaSubline = showContinueHint ? continueHint!.title : null;

  useEffect(() => {
    const syncTheater = () => setLoungeTvTheater(isLoungeTvTheaterModeActive());
    syncTheater();
    window.addEventListener(LOUNGE_TV_THEATER_MODE_CHANGED_EVENT, syncTheater);
    return () => window.removeEventListener(LOUNGE_TV_THEATER_MODE_CHANGED_EVENT, syncTheater);
  }, []);

  useEffect(() => {
    const onCartDropdownOpenChanged = (event: Event) => {
      setCartDropdownOpen(Boolean((event as CustomEvent<boolean>).detail));
    };
    window.addEventListener('cartDropdownOpenChanged', onCartDropdownOpenChanged);
    return () => window.removeEventListener('cartDropdownOpenChanged', onCartDropdownOpenChanged);
  }, []);

  useEffect(() => {
    if (loungeTvTheater) setIsOpen(false);
  }, [loungeTvTheater]);

  useEffect(() => {
    const reloadCopy = () => {
      setUiCopy(getPsaChatUiCopy());
      setWelcomeMessage(appendWelcomeMemoryHint(readPsaWelcomeMessageFromCopyStorage()));
    };
    reloadCopy();
    window.addEventListener(PSA_CHAT_COPY_UPDATED_EVENT, reloadCopy);
    return () => window.removeEventListener(PSA_CHAT_COPY_UPDATED_EVENT, reloadCopy);
  }, []);

  useEffect(() => {
    if (!isPremium) return;
    void refreshContinueHint();
  }, [isPremium, refreshContinueHint]);

  useEffect(() => {
    if (!signedIn || !isPremium) return;
    void fetchPsaActiveThread().then((result) => {
      if (result.ok && result.memberContext) {
        setCachedPsaMemberContext(result.memberContext);
        setWelcomeMessage(appendWelcomeMemoryHint(readPsaWelcomeMessageFromCopyStorage()));
      }
    });
  }, [signedIn, isPremium]);

  useEffect(() => {
    const syncRedCarpet = () => setRedCarpetMode(isRedCarpetModeActive());
    syncRedCarpet();
    window.addEventListener('storage', syncRedCarpet);
    window.addEventListener('focus', syncRedCarpet);
    return () => {
      window.removeEventListener('storage', syncRedCarpet);
      window.removeEventListener('focus', syncRedCarpet);
    };
  }, []);

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
      setWelcomeMessage(appendWelcomeMemoryHint(readPsaWelcomeMessageFromCopyStorage()));
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
    if (proactiveNudge.occasionCaptureMeta) {
      stashOccasionCaptureMeta(proactiveNudge.occasionCaptureMeta);
    }
    if (proactiveNudge.kind === 'order_celebration') {
      setBonusStarterChips([PSA_SAVE_WHY_CHIP]);
    } else if (proactiveNudge.kind === 'consult_occasion') {
      setBonusStarterChips([PSA_SAVE_WHY_CHIP]);
    } else {
      setBonusStarterChips([]);
    }
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
      if (isSaveWhyChip(text) && proactiveNudge?.occasionCaptureMeta) {
        stashOccasionCaptureMeta(proactiveNudge.occasionCaptureMeta);
      }
      setBonusStarterChips([]);
      if (isRedCarpetTriggerMessage(text)) {
        activateRedCarpetMode();
        setRedCarpetMode(true);
      }
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
    [sendMessage, runClientActions, navigate, proactiveNudge]
  );

  const handleUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    prepareMembershipUpgradeNavigation();
    navigate('/account/rewards');
  }, [navigate]);

  const avatarSessionSignals = useMemo(() => {
    const sessionCtx = buildPsaClientSessionContext(location.pathname);
    const sessionMode = resolveActivePsaSessionMode(messages, redCarpetMode) ?? sessionCtx.mode;
    const mood =
      sessionMode && sessionMode !== sessionCtx.mode
        ? resolvePsaMood({
            mode: sessionMode,
            tierLabel: sessionCtx.tierLabel,
            pendingMilestone: sessionCtx.journal?.pendingMilestone ?? null,
          }).mood
        : (sessionCtx.mood ?? 'default');
    return {
      sessionMode,
      mood,
      welcomeHasMemoryHint: Boolean(buildPsaWelcomeMemorySuffix().trim()),
      proactiveNudgeKind: proactiveNudge?.kind ?? null,
    };
  }, [location.pathname, messages, redCarpetMode, proactiveNudge?.kind]);

  const avatarExpression = useMemo(() => {
    const resolved = resolvePsaAvatarExpression({
      isChatOpen: isOpen,
      isSending,
      isInputFocused,
      inputHasText,
      showWelcomeWave,
      redCarpetMode,
      sessionMode: avatarSessionSignals.sessionMode,
      mood: avatarSessionSignals.mood,
      welcomeHasMemoryHint: avatarSessionSignals.welcomeHasMemoryHint,
      proactiveNudgeKind: avatarSessionSignals.proactiveNudgeKind,
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
    redCarpetMode,
    avatarSessionSignals,
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
      <div
        className="psa-widget-root"
        data-attribute="psa-assistant-widget"
        style={{
          position: 'fixed',
          zIndex: 999998,
          right: 'max(12px, env(safe-area-inset-right))',
          bottom: 'max(16px, env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          width: 'auto',
          maxWidth: 'none',
          pointerEvents: 'none',
        }}
      >
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
              redCarpetMode={redCarpetMode}
              bonusStarterChips={bonusStarterChips}
              panelQuickReplies={panelQuickReplies}
              historyOpen={historyOpen}
              historyArchivedView={historyArchivedView}
              isLoadingThreadList={isLoadingThreadList}
              historyAvailable={historyAvailable}
              threadList={threadList}
              activeThreadId={threadId}
              onClose={handleCloseChat}
              onSend={handleSend}
              onNewChat={() => void startNewThread()}
              onOpenHistory={() => void openHistory()}
              onCloseHistory={closeHistory}
              onToggleHistoryArchived={() => void toggleHistoryArchivedView()}
              onSelectThread={(id) => void switchThread(id)}
              onArchiveThread={(id) => void archiveThread(id)}
              onUnarchiveThread={(id) => void unarchiveThread(id)}
              onDeleteThread={(id) => void removeThread(id)}
              onRenameThread={(id, title) => void renameThread(id, title)}
              onInputFocusChange={setIsInputFocused}
              onInputTextChange={setInputHasText}
              initialInput={prefillInput}
            />
          </>
        ) : null}
        <div
          className={`psa-widget-fab-stack${isFabCollapsed ? ' psa-widget-fab-stack--collapsed' : ''}`}
          style={{ position: 'relative', width: 88, maxWidth: 88 }}
        >
          {!isFabCollapsed && !isOpen && proactiveNudge ? (
            <PsaNudgeChip
              headline={proactiveNudge.headline}
              body={proactiveNudge.body}
              onClick={handleNudgeAction}
              ariaLabel={proactiveNudge.headline}
            />
          ) : null}
          {isFabCollapsed ? (
            <PsaNudgeChip
              headline={uiCopy.showChatCta}
              onClick={handleFabClick}
              ariaLabel="Show chat"
              showChat
            />
          ) : (
            <PsaAvatarTrigger
              onClick={handleFabClick}
              isOpen={isOpen}
              idle={!isOpen}
              expression={avatarExpression}
              ctaLabel={fabCtaLabel}
              ctaSubline={fabCtaSubline}
              aria-label={isOpen ? 'Hide chat' : 'Open Personal Slay Assistant'}
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
