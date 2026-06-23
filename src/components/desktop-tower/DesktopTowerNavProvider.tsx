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
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getDesktopFloorByPath,
  DESKTOP_FLOORS,
  DESKTOP_PENTHOUSE_PATH,
  resolveDesktopFloorZoneId,
  type DesktopFloor,
} from '../../constants/desktopFloors';
import { resolveFloorZoneBackground } from '../../constants/desktopFloorZoneBackgrounds';
import { resolvePenthouseRoomBackground } from '../../constants/desktopPenthouseRooms';
import { preloadDesktopRoomBackground } from '../../utils/desktopRoomBackgroundCache';
import {
  getDesktopFloorFromHref,
  getTowerFloorStops,
  resolveTowerDirection,
  resolveTowerTravelFrame,
  TOWER_BOARD_MS,
  TOWER_FADE_MS,
  TOWER_VIDEO_READY_TIMEOUT_MS,
  type TowerTravelDirection,
} from '../../constants/desktopTowerMotion';
import {
  DesktopTowerElevatorExperience,
  type TowerElevatorPhase,
} from './DesktopTowerElevatorExperience';
import { FloorNavDrawer } from '../desktop-lobby/floating-nav/FloorNavDrawer';
import { markDesktopTowerArrival } from './useDesktopTowerPageReveal';
import {
  getElevatorPlaybackPlan,
  logElevatorPlaybackPlanDebug,
  type ElevatorPlaybackPlan,
} from '../../utils/elevatorPlaybackPlan';
import {
  waitForDesktopTowerElevatorVideoReady,
  warmDesktopTowerElevatorVideo,
  resolveDesktopTowerElevatorVideoSrc,
} from '../../utils/desktopTowerElevatorVideo';
import {
  isPhoneDesktopArtboardActive,
  useDesktopArtboardPortalTarget,
} from '../../hooks/useDesktopArtboardPortalTarget';
import './DesktopTowerElevator.css';

type TowerJourney = {
  fromFloor: DesktopFloor;
  toFloor: DesktopFloor;
  direction: TowerTravelDirection;
  destinationHref: string;
  floorStops: number[];
  playbackPlan: ElevatorPlaybackPlan;
};

type DesktopTowerNavContextValue = {
  travelTo: (href: string) => void;
  /** Instant route change — used by navbar quick links; floor directory uses {@link travelTo}. */
  quickTravelTo: (href: string) => void;
  isTraveling: boolean;
  journey: TowerJourney | null;
  travelDisplayLevelId: number;
  travelCabinFloorId: number;
  travelPhase: TowerElevatorPhase;
  /** Floor selected in the directory — drives the bottom zone panel. */
  selectedFloorId: number;
  setSelectedFloorId: (floorId: number) => void;
};

const DesktopTowerNavContext = createContext<DesktopTowerNavContextValue | null>(null);

function isDesktopTowerPath(pathname: string): boolean {
  return pathname === '/desktop' || pathname.startsWith('/desktop/');
}

function prefetchDesktopTowerDestination(href: string): void {
  if (typeof document === 'undefined') return;

  const destFloor = getDesktopFloorFromHref(href, getDesktopFloorByPath);
  if (!destFloor) return;

  const query = href.includes('?') ? href.split('?')[1] : '';
  const params = new URLSearchParams(query);
  const zoneParam =
    destFloor.path === DESKTOP_PENTHOUSE_PATH ? params.get('room') : params.get('zone');
  const zoneId = resolveDesktopFloorZoneId(destFloor, zoneParam);
  const background =
    resolveFloorZoneBackground(zoneId) ??
    (destFloor.path === DESKTOP_PENTHOUSE_PATH ? resolvePenthouseRoomBackground(zoneId) : undefined);
  if (!background) return;

  void preloadDesktopRoomBackground(background);
}

export function DesktopTowerNavProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const artboardPortalTarget = useDesktopArtboardPortalTarget();
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const journeyRunRef = useRef(0);
  const videoPlaybackCompleteRef = useRef<(() => void) | null>(null);
  const doorOpenHandledRef = useRef(false);

  const [journey, setJourney] = useState<TowerJourney | null>(null);
  const [phase, setPhase] = useState<TowerElevatorPhase>('boarding');
  const [displayLevelId, setDisplayLevelId] = useState(1);
  const [cabinFloorId, setCabinFloorId] = useState(1);
  const [selectedFloorId, setSelectedFloorId] = useState(
    () => getDesktopFloorByPath(location.pathname)?.id ?? DESKTOP_FLOORS[0].id,
  );

  const currentFloor = getDesktopFloorByPath(location.pathname);

  useEffect(() => {
    if (journey || !currentFloor) return;
    setSelectedFloorId(currentFloor.id);
  }, [currentFloor?.id, journey, location.pathname]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    warmDesktopTowerElevatorVideo();
  }, []);

  useEffect(() => {
    if (!journey || isPhoneDesktopArtboardActive()) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [journey]);

  const runTravelAnimation = useCallback(
    (next: Omit<TowerJourney, 'floorStops' | 'playbackPlan'> & { floorStops?: number[] }) => {
      clearTimers();
      const runId = journeyRunRef.current + 1;
      journeyRunRef.current = runId;

      const floorStops = next.floorStops ?? getTowerFloorStops(next.fromFloor.id, next.toFloor.id);
      const playbackPlan: ElevatorPlaybackPlan = {
        ...getElevatorPlaybackPlan(next.fromFloor.id, next.toFloor.id),
        videoSrc: resolveDesktopTowerElevatorVideoSrc(
          resolveTowerDirection(next.fromFloor, next.toFloor),
        ),
      };
      logElevatorPlaybackPlanDebug(playbackPlan);

      const journeyWithStops: TowerJourney = { ...next, floorStops, playbackPlan };

      const maxJourneyMs =
        TOWER_VIDEO_READY_TIMEOUT_MS +
        TOWER_BOARD_MS +
        playbackPlan.totalTransitionDurationMs +
        TOWER_FADE_MS +
        3000;

      const forceCompleteJourney = () => {
        if (journeyRunRef.current !== runId) return;
        clearTimers();
        markDesktopTowerArrival();
        navigate(next.destinationHref);
        setDisplayLevelId(next.toFloor.id);
        setCabinFloorId(next.toFloor.id);
        setJourney(null);
        setPhase('boarding');
      };

      const journeyWatchdog = window.setTimeout(forceCompleteJourney, maxJourneyMs);
      timersRef.current.push(journeyWatchdog);

      doorOpenHandledRef.current = false;
      setJourney(journeyWithStops);
      setPhase('boarding');
      setDisplayLevelId(next.fromFloor.id);
      setCabinFloorId(next.fromFloor.id);
      prefetchDesktopTowerDestination(next.destinationHref);

      const startTravel = () => {
        if (journeyRunRef.current !== runId) return;

        setPhase('traveling');
        const start = performance.now();
        let travelFinished = false;
        let travelTimelineComplete = false;
        let videoPlaybackComplete = false;
        const travelMsPerFloor = playbackPlan.travelDurationMs / playbackPlan.floorsTraveled;

        const tryFinishTravel = () => {
          if (travelFinished || journeyRunRef.current !== runId) return;
          if (!travelTimelineComplete || !videoPlaybackComplete) return;

          travelFinished = true;
          videoPlaybackCompleteRef.current = null;

          window.clearTimeout(travelEndTimer);
          window.clearTimeout(journeyWatchdog);

          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }

          setPhase('exiting');

          const fadeTimer = window.setTimeout(() => {
            if (journeyRunRef.current !== runId) return;
            setJourney(null);
            setPhase('boarding');
          }, TOWER_FADE_MS);
          timersRef.current.push(fadeTimer);
        };

        videoPlaybackCompleteRef.current = () => {
          if (journeyRunRef.current !== runId) return;
          videoPlaybackComplete = true;
          tryFinishTravel();
        };

        const travelEndTimer = window.setTimeout(() => {
          if (journeyRunRef.current !== runId) return;
          travelTimelineComplete = true;
          tryFinishTravel();
        }, playbackPlan.totalTransitionDurationMs + 32);
        timersRef.current.push(travelEndTimer);

        const tick = (now: number) => {
          if (journeyRunRef.current !== runId) return;

          const elapsed = now - start;
          const frame = resolveTowerTravelFrame(floorStops, elapsed, {
            travelMsPerFloor,
            floorDwellMs: 0,
          });
          setDisplayLevelId(frame.displayLevelId);
          setCabinFloorId(frame.cabinFloorId);

          if (elapsed < playbackPlan.totalTransitionDurationMs) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          window.clearTimeout(travelEndTimer);
          travelTimelineComplete = true;
          tryFinishTravel();
        };

        rafRef.current = requestAnimationFrame(tick);
      };

      void (async () => {
        try {
          warmDesktopTowerElevatorVideo();
          await Promise.all([
            waitForDesktopTowerElevatorVideoReady(TOWER_VIDEO_READY_TIMEOUT_MS),
            new Promise<void>((resolve) => {
              const boardTimer = window.setTimeout(resolve, TOWER_BOARD_MS);
              timersRef.current.push(boardTimer);
            }),
          ]);

          if (journeyRunRef.current !== runId) return;
          startTravel();
        } catch {
          if (journeyRunRef.current !== runId) return;
          startTravel();
        }
      })();
    },
    [clearTimers, navigate],
  );

  const quickTravelTo = useCallback(
    (href: string) => {
      if (journey) return;
      navigate(href);
    },
    [journey, navigate],
  );

  /** Stable identity — routed through a ref so per-frame re-renders never restart playback. */
  const handleDoorOpenStart = useCallback(() => {
    if (!journey || doorOpenHandledRef.current) return;
    doorOpenHandledRef.current = true;

    markDesktopTowerArrival();
    navigate(journey.destinationHref);
    setDisplayLevelId(journey.toFloor.id);
    setCabinFloorId(journey.toFloor.id);
    setPhase('opening');
  }, [journey, navigate]);

  const handleVideoPlaybackComplete = useCallback(() => {
    videoPlaybackCompleteRef.current?.();
  }, []);

  const travelTo = useCallback(
    (href: string) => {
      if (!isDesktopTowerPath(location.pathname)) {
        navigate(href);
        return;
      }

      const currentFloor = getDesktopFloorByPath(location.pathname);
      const destFloor = getDesktopFloorFromHref(href, getDesktopFloorByPath);

      if (!currentFloor || !destFloor || currentFloor.path === destFloor.path) {
        navigate(href);
        return;
      }

      if (journey) return;

      runTravelAnimation({
        fromFloor: currentFloor,
        toFloor: destFloor,
        direction: resolveTowerDirection(currentFloor, destFloor),
        destinationHref: href,
      });
    },
    [journey, location.pathname, navigate, runTravelAnimation],
  );

  const value = useMemo(
    () => ({
      travelTo,
      quickTravelTo,
      isTraveling: journey !== null,
      journey,
      travelDisplayLevelId: displayLevelId,
      travelCabinFloorId: cabinFloorId,
      travelPhase: phase,
      selectedFloorId,
      setSelectedFloorId,
    }),
    [journey, displayLevelId, cabinFloorId, phase, quickTravelTo, selectedFloorId, travelTo],
  );

  const journeyOverlay =
    journey === null ? null : (
      <>
        <DesktopTowerElevatorExperience
          fromFloor={journey.fromFloor}
          toFloor={journey.toFloor}
          direction={journey.direction}
          phase={phase}
          displayLevelId={displayLevelId}
          cabinFloorId={cabinFloorId}
          playbackPlan={journey.playbackPlan}
          onDoorOpenStart={handleDoorOpenStart}
          onVideoPlaybackComplete={handleVideoPlaybackComplete}
        />
        <div className="desktop-tower-elevator__directory-layer" aria-hidden={false}>
          <FloorNavDrawer isOpen embedded />
        </div>
      </>
    );

  return (
    <DesktopTowerNavContext.Provider value={value}>
      {children}
      {journeyOverlay && artboardPortalTarget
        ? createPortal(journeyOverlay, artboardPortalTarget)
        : journeyOverlay}
    </DesktopTowerNavContext.Provider>
  );
}

export function useDesktopTowerTravel(): DesktopTowerNavContextValue {
  const ctx = useContext(DesktopTowerNavContext);
  if (!ctx) {
    throw new Error('useDesktopTowerTravel must be used within DesktopTowerNavProvider');
  }
  return ctx;
}

/** Safe optional hook for components that may render outside provider. */
export function useDesktopTowerTravelOptional(): DesktopTowerNavContextValue | null {
  return useContext(DesktopTowerNavContext);
}
