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
import {
  getDesktopFloorByPath,
  DESKTOP_FLOORS,
  type DesktopFloor,
} from '../../constants/desktopFloors';
import {
  computeTowerTravelDurationMs,
  getDesktopFloorFromHref,
  getTowerFloorStops,
  resolveTowerDirection,
  resolveTowerTravelFrame,
  TOWER_ARRIVED_MS,
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
  waitForDesktopTowerElevatorVideoReady,
  warmDesktopTowerElevatorVideo,
} from '../../utils/desktopTowerElevatorVideo';
import './DesktopTowerElevator.css';

type TowerJourney = {
  fromFloor: DesktopFloor;
  toFloor: DesktopFloor;
  direction: TowerTravelDirection;
  destinationHref: string;
  floorStops: number[];
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

export function DesktopTowerNavProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const journeyRunRef = useRef(0);

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
    if (journey) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    return undefined;
  }, [journey]);

  const runTravelAnimation = useCallback(
    (next: Omit<TowerJourney, 'floorStops'> & { floorStops?: number[] }) => {
      clearTimers();
      const runId = journeyRunRef.current + 1;
      journeyRunRef.current = runId;

      const floorStops = next.floorStops ?? getTowerFloorStops(next.fromFloor.id, next.toFloor.id);
      const journeyWithStops: TowerJourney = { ...next, floorStops };
      const travelDurationMs = computeTowerTravelDurationMs(floorStops);

      setJourney(journeyWithStops);
      setPhase('boarding');
      setDisplayLevelId(next.fromFloor.id);
      setCabinFloorId(next.fromFloor.id);

      const startTravel = () => {
        if (journeyRunRef.current !== runId) return;

        setPhase('traveling');
        const start = performance.now();

        const tick = (now: number) => {
          if (journeyRunRef.current !== runId) return;

          const elapsed = now - start;
          const frame = resolveTowerTravelFrame(floorStops, elapsed);
          setDisplayLevelId(frame.displayLevelId);
          setCabinFloorId(frame.cabinFloorId);

          if (elapsed < travelDurationMs) {
            rafRef.current = requestAnimationFrame(tick);
            return;
          }

          rafRef.current = null;
          setDisplayLevelId(next.toFloor.id);
          setCabinFloorId(next.toFloor.id);
          setPhase('arrived');

          const arrivedTimer = window.setTimeout(() => {
            if (journeyRunRef.current !== runId) return;

            markDesktopTowerArrival();
            navigate(next.destinationHref);
            setPhase('exiting');

            const fadeTimer = window.setTimeout(() => {
              if (journeyRunRef.current !== runId) return;
              setJourney(null);
              setPhase('boarding');
            }, TOWER_FADE_MS);
            timersRef.current.push(fadeTimer);
          }, TOWER_ARRIVED_MS);
          timersRef.current.push(arrivedTimer);
        };

        rafRef.current = requestAnimationFrame(tick);
      };

      void (async () => {
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

  return (
    <DesktopTowerNavContext.Provider value={value}>
      {children}
      {journey ? (
        <>
          <DesktopTowerElevatorExperience
            fromFloor={journey.fromFloor}
            toFloor={journey.toFloor}
            direction={journey.direction}
            phase={phase}
            displayLevelId={displayLevelId}
            cabinFloorId={cabinFloorId}
          />
          <div className="desktop-tower-elevator__directory-layer" aria-hidden={false}>
            <FloorNavDrawer isOpen embedded />
          </div>
        </>
      ) : null}
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
