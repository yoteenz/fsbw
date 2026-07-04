import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDesktopTowerTravelOptional } from '../../../components/desktop-tower/DesktopTowerNavProvider';
import { seedCreativePreviewDemoSession } from '../../../utils/creativePreviewMode';
import {
  getActiveVisionMode,
  isVisionLuxuryAudioEnabled,
  isVisionPresentationActive,
  isVisionPresenterMode,
  isVisionRecordMode,
  isVisionSessionActive,
  setVisionLuxuryAudioEnabled,
  setVisionPresenterMode,
  setVisionRecordMode,
  setVisionSessionActive,
  activateVisionRecordWalkthrough,
  clearActiveVisionMode,
} from '../../../studio-os-core/vision-engine/session';
import {
  VISION_CHANGED_EVENT,
  VISION_DEFAULT_DWELL_MS,
  VISION_SLOW_DWELL_MS,
} from '../../../studio-os-core/vision-engine/constants';
import { getVisionModeById, recordVisionAnalyticsEvent } from '../../../studio-os-core/vision-engine/store';
import { stopVisionPresentation } from '../../../studio-os-core/vision-engine/launch';
import { bootstrapFrontalSlayerVisionEngine } from '../../../workspaces/frontal-slayer/vision-engine';
import type { VisionPhase, VisionStop, VisionTransitionKind, WorkspaceVisionManifest } from '../../../studio-os-core/vision-engine/types';

type VisionEngineContextValue = {
  phase: VisionPhase;
  stopIndex: number;
  currentStop: VisionStop;
  progress: number;
  transitionKind: VisionTransitionKind;
  presentationActive: boolean;
  presenterMode: boolean;
  recordMode: boolean;
  luxuryAudioEnabled: boolean;
  autoTourRunning: boolean;
  showOpening: boolean;
  showEnding: boolean;
  manifest: WorkspaceVisionManifest | null;
  modeLabel: string;
  stopCount: number;
  startVision: (options?: { presenter?: boolean; record?: boolean }) => void;
  exitVision: () => void;
  startAutoTour: () => void;
  pauseAutoTour: () => void;
  resumeAutoTour: () => void;
  nextStop: () => void;
  prevStop: () => void;
  restartTour: () => void;
  togglePresenterMode: () => void;
  toggleLuxuryAudio: () => void;
  startRecordWalkthrough: () => void;
  goToStop: (index: number) => void;
};

const VisionEngineContext = createContext<VisionEngineContextValue | null>(null);

function dwellMs(stop: VisionStop, record: boolean): number {
  if (record) return Math.max(stop.durationMs, VISION_SLOW_DWELL_MS);
  return stop.durationMs || VISION_DEFAULT_DWELL_MS;
}

export function VisionEngineProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tower = useDesktopTowerTravelOptional();

  const [{ mode, manifest }, setModeState] = useState(() => {
    const active = getActiveVisionMode();
    if (!active) return { mode: undefined, manifest: undefined };
    const resolved = getVisionModeById(active.modeId, active.workspaceId);
    const m = resolved
      ? ({
          workspaceId: active.workspaceId,
          brandName: resolved.name,
          logoText: resolved.openingTitle,
          tagline: resolved.tagline,
          primaryColor: '#eb1c24',
          routes: resolved.stops.map((s) => s.route).filter(Boolean) as string[],
          modes: [resolved],
        } satisfies WorkspaceVisionManifest)
      : undefined;
    return { mode: resolved, manifest: m };
  });

  const stops = mode?.stops ?? [];

  const fallbackStop: VisionStop = {
    id: 'idle',
    chapterId: 'idle',
    sectionLabel: 'VISION',
    title: 'Vision Engine',
    durationMs: VISION_DEFAULT_DWELL_MS,
    transition: 'none',
    presenter: {
      voiceover: '',
      whyExists: '',
      problemSolved: '',
      emotionalResponse: '',
      designPhilosophy: '',
      customerJourney: '',
      futureExpansion: '',
    },
  };

  const [stopIndex, setStopIndex] = useState(0);
  const [phase, setPhase] = useState<VisionPhase>(() => (isVisionSessionActive() ? 'opening' : 'idle'));
  const [autoTourRunning, setAutoTourRunning] = useState(false);
  const [transitionKind, setTransitionKind] = useState<VisionTransitionKind>('fade');
  const [presentationActive, setPresentationActive] = useState(isVisionPresentationActive());
  const [presenterMode, setPresenter] = useState(isVisionPresenterMode());
  const [recordMode, setRecordMode] = useState(isVisionRecordMode());
  const [luxuryAudioEnabled, setLuxuryAudio] = useState(isVisionLuxuryAudioEnabled());

  const timerRef = useRef<number | null>(null);

  const currentStop = stops[stopIndex] ?? stops[0] ?? fallbackStop;
  const progress = stops.length ? ((stopIndex + 1) / stops.length) * 100 : 0;
  const showOpening = phase === 'opening';
  const showEnding = phase === 'ending';

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const syncFlagsFromStorage = useCallback(() => {
    setPresentationActive(isVisionPresentationActive());
    setPresenter(isVisionPresenterMode());
    setRecordMode(isVisionRecordMode());
    setLuxuryAudio(isVisionLuxuryAudioEnabled());

    const active = getActiveVisionMode();
    if (active) {
      bootstrapFrontalSlayerVisionEngine();
      const resolved = getVisionModeById(active.modeId, active.workspaceId);
      if (resolved) {
        setModeState({
          mode: resolved,
          manifest: {
            workspaceId: active.workspaceId,
            brandName: resolved.name,
            logoText: resolved.openingTitle,
            tagline: resolved.tagline,
            primaryColor: '#eb1c24',
            routes: resolved.stops.map((s) => s.route).filter(Boolean) as string[],
            modes: [resolved],
          },
        });
      }
    }

    if (isVisionSessionActive()) {
      setPhase((p) => (p === 'idle' || p === 'complete' ? 'opening' : p));
      setAutoTourRunning(true);
    }
  }, []);

  useEffect(() => {
    const onChange = () => syncFlagsFromStorage();
    window.addEventListener(VISION_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(VISION_CHANGED_EVENT, onChange);
  }, [syncFlagsFromStorage]);

  const navigateToStop = useCallback(
    (stop: VisionStop) => {
      if (!stop.route) return;
      const target = stop.route;
      if (stop.useElevator && tower && target.startsWith('/desktop/')) {
        tower.travelTo(target);
        return;
      }
      if (location.pathname + location.search !== target.split('#')[0]) {
        navigate(target);
      }
    },
    [location.pathname, location.search, navigate, tower]
  );

  const applyStop = useCallback(
    (index: number, runTransition = true) => {
      const stop = stops[index];
      if (!stop) return;

      if (stop.id === 'opening') {
        setPhase('opening');
        return;
      }
      if (stop.id === 'ending') {
        setPhase('ending');
        clearTimer();
        return;
      }

      const settlePhase = () => {
        setPhase(stop.route?.startsWith('/mobile') ? 'mobile' : 'running');
      };

      if (runTransition && stop.transition !== 'none') {
        setPhase('transition');
        setTransitionKind(stop.transition);
        window.setTimeout(settlePhase, stop.useElevator ? 2100 : 1500);
      } else {
        settlePhase();
      }

      if (stop.route) {
        navigateToStop(stop);
      }
    },
    [clearTimer, navigateToStop, stops]
  );

  const scheduleAutoAdvance = useCallback(
    (index: number) => {
      clearTimer();
      if (!autoTourRunning) return;
      const stop = stops[index];
      if (!stop || stop.id === 'ending') return;

      const ms = dwellMs(stop, recordMode);
      timerRef.current = window.setTimeout(() => {
        const next = index + 1;
        if (next >= stops.length) return;
        setStopIndex(next);
        applyStop(next);
      }, ms);
    },
    [applyStop, autoTourRunning, clearTimer, recordMode, stops]
  );

  useEffect(() => {
    if (isVisionSessionActive()) {
      document.documentElement.setAttribute('data-vision-engine', 'active');
      syncFlagsFromStorage();
    }
  }, [syncFlagsFromStorage]);

  /** If session is active but mode never resolves, exit so the site is not stuck on a blank screen. */
  useEffect(() => {
    if (!presentationActive || mode) return;
    const t = window.setTimeout(() => {
      bootstrapFrontalSlayerVisionEngine();
      const active = getActiveVisionMode();
      const resolved = active ? getVisionModeById(active.modeId, active.workspaceId) : undefined;
      if (resolved) {
        syncFlagsFromStorage();
        return;
      }
      stopVisionPresentation();
      clearActiveVisionMode();
      setPhase('idle');
      setAutoTourRunning(false);
      document.documentElement.removeAttribute('data-vision-engine');
    }, 2500);
    return () => window.clearTimeout(t);
  }, [presentationActive, mode, syncFlagsFromStorage]);

  useEffect(() => {
    if (phase === 'running' || phase === 'mobile' || phase === 'paused') {
      scheduleAutoAdvance(stopIndex);
    }
    return clearTimer;
  }, [stopIndex, phase, autoTourRunning, scheduleAutoAdvance, clearTimer]);

  const startVision = useCallback(
    (options?: { presenter?: boolean; record?: boolean }) => {
      if (!stops.length) return;
      try {
        seedCreativePreviewDemoSession();
      } catch {
        /* optional premium demo session */
      }
      setVisionSessionActive(true);
      if (options?.presenter) setVisionPresenterMode(true);
      if (options?.record) setVisionRecordMode(true);
      syncFlagsFromStorage();
      setStopIndex(0);
      setPhase('opening');
      setAutoTourRunning(true);
    },
    [stops.length, syncFlagsFromStorage]
  );

  const exitVision = useCallback(() => {
    clearTimer();
    setAutoTourRunning(false);
    stopVisionPresentation();
    clearActiveVisionMode();
    setPhase('complete');
    syncFlagsFromStorage();
    window.setTimeout(() => setPhase('idle'), 400);
  }, [clearTimer, syncFlagsFromStorage]);

  const startAutoTour = useCallback(() => {
    setAutoTourRunning(true);
    if (phase === 'idle' || phase === 'complete') {
      startVision({ presenter: presenterMode, record: recordMode });
    } else {
      scheduleAutoAdvance(stopIndex);
    }
  }, [presenterMode, phase, recordMode, scheduleAutoAdvance, startVision, stopIndex]);

  const pauseAutoTour = useCallback(() => {
    setAutoTourRunning(false);
    setPhase((p) => (p === 'running' || p === 'mobile' ? 'paused' : p));
    clearTimer();
  }, [clearTimer]);

  const resumeAutoTour = useCallback(() => {
    setAutoTourRunning(true);
    setPhase((p) => (p === 'paused' ? 'running' : p));
    scheduleAutoAdvance(stopIndex);
  }, [scheduleAutoAdvance, stopIndex]);

  const goToStop = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(stops.length - 1, index));
      setStopIndex(clamped);
      applyStop(clamped);
    },
    [applyStop, stops.length]
  );

  const nextStop = useCallback(() => {
    clearTimer();
    const next = Math.min(stops.length - 1, stopIndex + 1);
    setStopIndex(next);
    applyStop(next);
    if (autoTourRunning) scheduleAutoAdvance(next);
  }, [applyStop, autoTourRunning, clearTimer, scheduleAutoAdvance, stopIndex, stops.length]);

  const prevStop = useCallback(() => {
    clearTimer();
    const prev = Math.max(0, stopIndex - 1);
    setStopIndex(prev);
    applyStop(prev);
    if (autoTourRunning) scheduleAutoAdvance(prev);
  }, [applyStop, autoTourRunning, clearTimer, scheduleAutoAdvance, stopIndex]);

  const restartTour = useCallback(() => {
    clearTimer();
    setStopIndex(0);
    setPhase('opening');
    setAutoTourRunning(true);
  }, [clearTimer]);

  const togglePresenterMode = useCallback(() => {
    const next = !presenterMode;
    setVisionPresenterMode(next);
    syncFlagsFromStorage();
  }, [presenterMode, syncFlagsFromStorage]);

  const toggleLuxuryAudio = useCallback(() => {
    const next = !luxuryAudioEnabled;
    setVisionLuxuryAudioEnabled(next);
    syncFlagsFromStorage();
  }, [luxuryAudioEnabled, syncFlagsFromStorage]);

  const startRecordWalkthrough = useCallback(() => {
    activateVisionRecordWalkthrough();
    syncFlagsFromStorage();
    startVision({ presenter: true, record: true });
  }, [startVision, syncFlagsFromStorage]);

  const onOpeningComplete = useCallback(() => {
    setStopIndex(1);
    applyStop(1);
    if (autoTourRunning) scheduleAutoAdvance(1);
  }, [applyStop, autoTourRunning, scheduleAutoAdvance]);

  const onEndingComplete = useCallback(() => {
    recordVisionAnalyticsEvent({
      shareId: 'internal',
      modeId: mode?.id ?? 'unknown',
      event: 'complete',
      watchMs: stops.length * VISION_DEFAULT_DWELL_MS,
    });
    exitVision();
  }, [exitVision, mode?.id, stops.length]);

  const value = useMemo<VisionEngineContextValue>(
    () => ({
      phase,
      stopIndex,
      currentStop,
      progress,
      transitionKind,
      presentationActive,
      presenterMode,
      recordMode,
      luxuryAudioEnabled,
      autoTourRunning,
      showOpening,
      showEnding,
      manifest: manifest ?? null,
      modeLabel: mode?.name ?? 'Vision Mode',
      stopCount: stops.length,
      startVision,
      exitVision,
      startAutoTour,
      pauseAutoTour,
      resumeAutoTour,
      nextStop,
      prevStop,
      restartTour,
      togglePresenterMode,
      toggleLuxuryAudio,
      startRecordWalkthrough,
      goToStop,
    }),
    [
      phase,
      stopIndex,
      currentStop,
      progress,
      transitionKind,
      presentationActive,
      presenterMode,
      recordMode,
      luxuryAudioEnabled,
      autoTourRunning,
      showOpening,
      showEnding,
      manifest,
      mode?.name,
      stops.length,
      startVision,
      exitVision,
      startAutoTour,
      pauseAutoTour,
      resumeAutoTour,
      nextStop,
      prevStop,
      restartTour,
      togglePresenterMode,
      toggleLuxuryAudio,
      startRecordWalkthrough,
      goToStop,
    ]
  );

  return (
    <VisionEngineContext.Provider value={value}>
      {children}
      {presentationActive && mode ? (
        <VisionEngineEffects
          showOpening={showOpening}
          showEnding={showEnding}
          onOpeningComplete={onOpeningComplete}
          onEndingComplete={onEndingComplete}
          transitionKind={transitionKind}
          phase={phase}
          currentStop={currentStop}
          presenterMode={presenterMode}
          luxuryAudioEnabled={luxuryAudioEnabled}
          autoTourRunning={autoTourRunning}
          recordMode={recordMode}
          onTogglePresenterMode={togglePresenterMode}
          onToggleLuxuryAudio={toggleLuxuryAudio}
          logoText={mode.openingTitle}
          tagline={mode.tagline}
          endingTagline={mode.endingTagline}
        />
      ) : null}
    </VisionEngineContext.Provider>
  );
}

type EffectsProps = {
  showOpening: boolean;
  showEnding: boolean;
  onOpeningComplete: () => void;
  onEndingComplete: () => void;
  transitionKind: VisionTransitionKind;
  phase: VisionPhase;
  currentStop: VisionStop;
  presenterMode: boolean;
  luxuryAudioEnabled: boolean;
  autoTourRunning: boolean;
  recordMode: boolean;
  onTogglePresenterMode: () => void;
  onToggleLuxuryAudio: () => void;
  logoText: string;
  tagline: string;
  endingTagline: string;
};

function VisionEngineEffects(props: EffectsProps) {
  const [Chrome, setChrome] = useState<typeof import('./VisionEngineChrome').VisionEngineChrome | null>(null);
  useEffect(() => {
    void import('./VisionEngineChrome').then((m) => setChrome(() => m.VisionEngineChrome));
  }, []);
  if (!Chrome) return null;
  return <Chrome {...props} />;
}

export function useVisionEngine(): VisionEngineContextValue {
  const ctx = useContext(VisionEngineContext);
  if (!ctx) {
    throw new Error('useVisionEngine must be used within VisionEngineProvider');
  }
  return ctx;
}

export function useVisionEngineOptional(): VisionEngineContextValue | null {
  return useContext(VisionEngineContext);
}
