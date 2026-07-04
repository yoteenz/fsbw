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
  GUIDED_TOUR_SLOW_DWELL_MS,
  GUIDED_TOUR_DEFAULT_DWELL_MS,
} from './constants';
import {
  isCreativePartnerTourMode,
  isGuidedTourLuxuryAudioEnabled,
  isGuidedTourPresentationActive,
  isGuidedTourRecordMode,
  isGuidedTourSessionActive,
  setCreativePartnerTourMode,
  setGuidedTourLuxuryAudioEnabled,
  setGuidedTourRecordMode,
  setGuidedTourSessionActive,
  activateRecordWalkthrough,
} from './mode';
import { GUIDED_TOUR_STOPS } from './tourScript';
import type { GuidedTourPhase, GuidedTourStop, GuidedTourTransitionKind } from './types';

type GuidedTourContextValue = {
  phase: GuidedTourPhase;
  stopIndex: number;
  currentStop: GuidedTourStop;
  progress: number;
  transitionKind: GuidedTourTransitionKind;
  presentationActive: boolean;
  creativePartnerMode: boolean;
  recordMode: boolean;
  luxuryAudioEnabled: boolean;
  autoTourRunning: boolean;
  showOpening: boolean;
  showEnding: boolean;
  startGuidedTour: (options?: { creativePartner?: boolean; record?: boolean }) => void;
  exitGuidedTour: () => void;
  startAutoTour: () => void;
  pauseAutoTour: () => void;
  resumeAutoTour: () => void;
  nextStop: () => void;
  prevStop: () => void;
  restartTour: () => void;
  toggleCreativePartner: () => void;
  toggleLuxuryAudio: () => void;
  startRecordWalkthrough: () => void;
  goToStop: (index: number) => void;
};

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

function dwellMs(stop: GuidedTourStop, record: boolean): number {
  if (record) return Math.max(stop.durationMs, GUIDED_TOUR_SLOW_DWELL_MS);
  return stop.durationMs || GUIDED_TOUR_DEFAULT_DWELL_MS;
}

export function GuidedTourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const tower = useDesktopTowerTravelOptional();

  const [stopIndex, setStopIndex] = useState(0);
  const [phase, setPhase] = useState<GuidedTourPhase>(() =>
    isGuidedTourSessionActive() ? 'opening' : 'idle'
  );
  const [autoTourRunning, setAutoTourRunning] = useState(false);
  const [transitionKind, setTransitionKind] = useState<GuidedTourTransitionKind>('fade');
  const [presentationActive, setPresentationActive] = useState(isGuidedTourPresentationActive());
  const [creativePartnerMode, setCreativePartner] = useState(isCreativePartnerTourMode());
  const [recordMode, setRecordMode] = useState(isGuidedTourRecordMode());
  const [luxuryAudioEnabled, setLuxuryAudio] = useState(isGuidedTourLuxuryAudioEnabled());

  const timerRef = useRef<number | null>(null);
  const navigatingRef = useRef(false);

  const currentStop = GUIDED_TOUR_STOPS[stopIndex] ?? GUIDED_TOUR_STOPS[0];
  const progress = ((stopIndex + 1) / GUIDED_TOUR_STOPS.length) * 100;
  const showOpening = phase === 'opening';
  const showEnding = phase === 'ending';

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const syncFlagsFromStorage = useCallback(() => {
    setPresentationActive(isGuidedTourPresentationActive());
    setCreativePartner(isCreativePartnerTourMode());
    setRecordMode(isGuidedTourRecordMode());
    setLuxuryAudio(isGuidedTourLuxuryAudioEnabled());
  }, []);

  useEffect(() => {
    const onChange = () => syncFlagsFromStorage();
    window.addEventListener('fsGuidedTourChanged', onChange);
    return () => window.removeEventListener('fsGuidedTourChanged', onChange);
  }, [syncFlagsFromStorage]);

  const navigateToStop = useCallback(
    (stop: GuidedTourStop) => {
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
      const stop = GUIDED_TOUR_STOPS[index];
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
        navigatingRef.current = true;
        navigateToStop(stop);
        window.setTimeout(() => {
          navigatingRef.current = false;
        }, stop.useElevator ? 2200 : 800);
      }
    },
    [clearTimer, navigateToStop]
  );

  const scheduleAutoAdvance = useCallback(
    (index: number) => {
      clearTimer();
      if (!autoTourRunning) return;
      const stop = GUIDED_TOUR_STOPS[index];
      if (!stop || stop.id === 'ending') return;

      const ms = dwellMs(stop, recordMode);
      timerRef.current = window.setTimeout(() => {
        const next = index + 1;
        if (next >= GUIDED_TOUR_STOPS.length) return;
        setStopIndex(next);
        applyStop(next);
      }, ms);
    },
    [applyStop, autoTourRunning, clearTimer, recordMode]
  );

  useEffect(() => {
    if (isGuidedTourSessionActive()) {
      syncFlagsFromStorage();
      setAutoTourRunning(true);
    }
  }, [syncFlagsFromStorage]);

  useEffect(() => {
    if (phase === 'running' || phase === 'mobile' || phase === 'paused') {
      scheduleAutoAdvance(stopIndex);
    }
    return clearTimer;
  }, [stopIndex, phase, autoTourRunning, scheduleAutoAdvance, clearTimer]);

  const startGuidedTour = useCallback(
    (options?: { creativePartner?: boolean; record?: boolean }) => {
      try {
        seedCreativePreviewDemoSession();
      } catch {
        /* optional premium demo session for presentation */
      }
      setGuidedTourSessionActive(true);
      if (options?.creativePartner) setCreativePartnerTourMode(true);
      if (options?.record) setGuidedTourRecordMode(true);
      syncFlagsFromStorage();
      setStopIndex(0);
      setPhase('opening');
      setAutoTourRunning(true);
    },
    [syncFlagsFromStorage]
  );

  const exitGuidedTour = useCallback(() => {
    clearTimer();
    setAutoTourRunning(false);
    setGuidedTourSessionActive(false);
    setPhase('complete');
    syncFlagsFromStorage();
    window.setTimeout(() => setPhase('idle'), 400);
  }, [clearTimer, syncFlagsFromStorage]);

  const startAutoTour = useCallback(() => {
    setAutoTourRunning(true);
    if (phase === 'idle' || phase === 'complete') {
      startGuidedTour({ creativePartner: creativePartnerMode, record: recordMode });
    } else {
      scheduleAutoAdvance(stopIndex);
    }
  }, [creativePartnerMode, phase, recordMode, scheduleAutoAdvance, startGuidedTour, stopIndex]);

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
      const clamped = Math.max(0, Math.min(GUIDED_TOUR_STOPS.length - 1, index));
      setStopIndex(clamped);
      applyStop(clamped);
    },
    [applyStop]
  );

  const nextStop = useCallback(() => {
    clearTimer();
    const next = Math.min(GUIDED_TOUR_STOPS.length - 1, stopIndex + 1);
    setStopIndex(next);
    applyStop(next);
    if (autoTourRunning) scheduleAutoAdvance(next);
  }, [applyStop, autoTourRunning, clearTimer, scheduleAutoAdvance, stopIndex]);

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

  const toggleCreativePartner = useCallback(() => {
    const next = !creativePartnerMode;
    setCreativePartnerTourMode(next);
    syncFlagsFromStorage();
  }, [creativePartnerMode, syncFlagsFromStorage]);

  const toggleLuxuryAudio = useCallback(() => {
    const next = !luxuryAudioEnabled;
    setGuidedTourLuxuryAudioEnabled(next);
    syncFlagsFromStorage();
  }, [luxuryAudioEnabled, syncFlagsFromStorage]);

  const startRecordWalkthrough = useCallback(() => {
    activateRecordWalkthrough();
    syncFlagsFromStorage();
    startGuidedTour({ creativePartner: true, record: true });
  }, [startGuidedTour, syncFlagsFromStorage]);

  const onOpeningComplete = useCallback(() => {
    setStopIndex(1);
    applyStop(1);
    if (autoTourRunning) scheduleAutoAdvance(1);
  }, [applyStop, autoTourRunning, scheduleAutoAdvance]);

  const onEndingComplete = useCallback(() => {
    exitGuidedTour();
  }, [exitGuidedTour]);

  const value = useMemo<GuidedTourContextValue>(
    () => ({
      phase,
      stopIndex,
      currentStop,
      progress,
      transitionKind,
      presentationActive,
      creativePartnerMode,
      recordMode,
      luxuryAudioEnabled,
      autoTourRunning,
      showOpening,
      showEnding,
      startGuidedTour,
      exitGuidedTour,
      startAutoTour,
      pauseAutoTour,
      resumeAutoTour,
      nextStop,
      prevStop,
      restartTour,
      toggleCreativePartner,
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
      creativePartnerMode,
      recordMode,
      luxuryAudioEnabled,
      autoTourRunning,
      showOpening,
      showEnding,
      startGuidedTour,
      exitGuidedTour,
      startAutoTour,
      pauseAutoTour,
      resumeAutoTour,
      nextStop,
      prevStop,
      restartTour,
      toggleCreativePartner,
      toggleLuxuryAudio,
      startRecordWalkthrough,
      goToStop,
    ]
  );

  return (
    <GuidedTourContext.Provider value={value}>
      {children}
      <GuidedTourEffects
        showOpening={showOpening}
        showEnding={showEnding}
        onOpeningComplete={onOpeningComplete}
        onEndingComplete={onEndingComplete}
        transitionKind={transitionKind}
        phase={phase}
        currentStop={currentStop}
        presentationActive={presentationActive}
        creativePartnerMode={creativePartnerMode}
        luxuryAudioEnabled={luxuryAudioEnabled}
        autoTourRunning={autoTourRunning}
        recordMode={recordMode}
        onToggleCreativePartner={toggleCreativePartner}
        onToggleLuxuryAudio={toggleLuxuryAudio}
        onStartRecord={startRecordWalkthrough}
      />
    </GuidedTourContext.Provider>
  );
}

type EffectsProps = {
  showOpening: boolean;
  showEnding: boolean;
  onOpeningComplete: () => void;
  onEndingComplete: () => void;
  transitionKind: GuidedTourTransitionKind;
  phase: GuidedTourPhase;
  currentStop: GuidedTourStop;
  presentationActive: boolean;
  creativePartnerMode: boolean;
  luxuryAudioEnabled: boolean;
  autoTourRunning: boolean;
  recordMode: boolean;
  onToggleCreativePartner: () => void;
  onToggleLuxuryAudio: () => void;
  onStartRecord: () => void;
};

function GuidedTourEffects(props: EffectsProps) {
  return (
    <>
      {props.presentationActive ? (
        <>
          <GuidedTourChromeLazy {...props} />
        </>
      ) : (
        <GuidedTourLauncherLazy onStartRecord={props.onStartRecord} />
      )}
    </>
  );
}

function GuidedTourChromeLazy(props: EffectsProps) {
  const [Chrome, setChrome] = useState<typeof import('./GuidedTourChrome').GuidedTourChrome | null>(null);
  useEffect(() => {
    void import('./GuidedTourChrome').then((m) => setChrome(() => m.GuidedTourChrome));
  }, []);
  if (!Chrome) return null;
  return <Chrome {...props} />;
}

function GuidedTourLauncherLazy({ onStartRecord }: { onStartRecord: () => void }) {
  const [Launcher, setLauncher] = useState<typeof import('./GuidedTourLauncher').GuidedTourLauncher | null>(null);
  useEffect(() => {
    void import('./GuidedTourLauncher').then((m) => setLauncher(() => m.GuidedTourLauncher));
  }, []);
  if (!Launcher) return null;
  return <Launcher onStartRecord={onStartRecord} />;
}

export function useGuidedTour(): GuidedTourContextValue {
  const ctx = useContext(GuidedTourContext);
  if (!ctx) {
    throw new Error('useGuidedTour must be used within GuidedTourProvider');
  }
  return ctx;
}

export function useGuidedTourOptional(): GuidedTourContextValue | null {
  return useContext(GuidedTourContext);
}
