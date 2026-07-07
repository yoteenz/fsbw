import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { readCommandDockStore } from '../../../../studio-os-core/command-dock/store';
import { useCommandDockState } from '../../../../hooks/useCommandDockState';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { StudioOrbAwakeningOverlay } from './StudioOrbAwakeningOverlay';
import type { StudioOrbPosition, StudioOrbPresenceState, StudioOrbSurface } from './studioOrbTypes';
import { playStudioOrbSound } from './studioOrbSounds';
import {
  hasSeenStudioOrbAwakening,
  markStudioOrbAwakeningSeen,
} from './studioOrbAwakening';

type StudioOrbContextValue = {
  presenceState: StudioOrbPresenceState;
  radialOpen: boolean;
  activeSurface: StudioOrbSurface;
  conversationMode: boolean;
  awakeningActive: boolean;
  position: StudioOrbPosition;
  ambientInsight: string | null;
  toggleRadial: () => void;
  closeRadial: () => void;
  openCommandDock: () => void;
  openPageGuide: () => void;
  openLifeCulture: () => void;
  closeSurface: () => void;
  completeAwakening: () => void;
};

const StudioOrbContext = createContext<StudioOrbContextValue | null>(null);

const DEFAULT_POSITION: StudioOrbPosition = { bottom: 20, right: 16 };

function resolvePresenceState(store: ReturnType<typeof readCommandDockStore>): StudioOrbPresenceState {
  if (store.processingActive) return 'thinking';
  if (store.proactiveSuggestion) return 'opportunity';
  if (store.lastRoutingSummary && !store.pendingRoute) return 'completed';
  return 'idle';
}

export function StudioOrbProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { workspaceId } = useWorkspace();
  const dock = useCommandDockState();
  const organizationId = workspaceId;

  const [radialOpen, setRadialOpen] = useState(false);
  const [activeSurface, setActiveSurface] = useState<StudioOrbSurface>(null);
  const [position, setPosition] = useState<StudioOrbPosition>(DEFAULT_POSITION);
  const [awakeningActive, setAwakeningActive] = useState(false);

  const store = dock.store;
  const presenceState = useMemo(() => resolvePresenceState(store), [store]);
  const conversationMode = activeSurface === 'command-dock';
  const ambientInsight = store.proactiveSuggestion?.insight ?? null;

  useEffect(() => {
    if (!organizationId) return;
    setAwakeningActive(!hasSeenStudioOrbAwakening(organizationId));
  }, [organizationId]);

  useEffect(() => {
    setRadialOpen(false);
    setActiveSurface(null);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () => {
      const keyboardLikely = window.innerHeight - vv.height > 120;
      setPosition(
        keyboardLikely
          ? { bottom: Math.max(20, window.innerHeight - vv.height + 12), right: 16 }
          : DEFAULT_POSITION
      );
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  const closeRadial = useCallback(() => setRadialOpen(false), []);

  const openCommandDock = useCallback(() => {
    setRadialOpen(false);
    setActiveSurface('command-dock');
    dock.setFocused(true);
    dock.expand('medium');
    playStudioOrbSound('conversation-open');
  }, [dock]);

  const openPageGuide = useCallback(() => {
    setRadialOpen(false);
    setActiveSurface('page-guide');
    playStudioOrbSound('conversation-open');
  }, []);

  const openLifeCulture = useCallback(() => {
    setRadialOpen(false);
    setActiveSurface('life-culture');
    playStudioOrbSound('conversation-open');
  }, []);

  const closeSurface = useCallback(() => {
    if (activeSurface === 'command-dock') {
      dock.dismiss();
      playStudioOrbSound('conversation-close');
    }
    setActiveSurface(null);
    setRadialOpen(false);
  }, [activeSurface, dock]);

  const toggleRadial = useCallback(() => {
    if (activeSurface) {
      closeSurface();
      return;
    }
    setRadialOpen((open) => {
      const next = !open;
      if (next) playStudioOrbSound('radial-open');
      return next;
    });
  }, [activeSurface, closeSurface]);

  const completeAwakening = useCallback(() => {
    if (organizationId) markStudioOrbAwakeningSeen(organizationId);
    setAwakeningActive(false);
    playStudioOrbSound('awakening');
  }, [organizationId]);

  const value = useMemo<StudioOrbContextValue>(
    () => ({
      presenceState,
      radialOpen,
      activeSurface,
      conversationMode,
      awakeningActive,
      position,
      ambientInsight,
      toggleRadial,
      closeRadial,
      openCommandDock,
      openPageGuide,
      openLifeCulture,
      closeSurface,
      completeAwakening,
    }),
    [
      presenceState,
      radialOpen,
      activeSurface,
      conversationMode,
      awakeningActive,
      position,
      ambientInsight,
      toggleRadial,
      closeRadial,
      openCommandDock,
      openPageGuide,
      openLifeCulture,
      closeSurface,
      completeAwakening,
    ]
  );

  return (
    <StudioOrbContext.Provider value={value}>
      <StudioOrbAwakeningOverlay />
      {children}
    </StudioOrbContext.Provider>
  );
}

export function useStudioOrb(): StudioOrbContextValue {
  const ctx = useContext(StudioOrbContext);
  if (!ctx) {
    throw new Error('useStudioOrb must be used within StudioOrbProvider');
  }
  return ctx;
}

export function useStudioOrbOptional(): StudioOrbContextValue | null {
  return useContext(StudioOrbContext);
}

/** True when conversation or guide mode should dim the page environment. */
export function useStudioOrbEnvironmentActive(): boolean {
  const ctx = useStudioOrbOptional();
  return Boolean(ctx?.conversationMode || ctx?.activeSurface === 'page-guide' || ctx?.activeSurface === 'life-culture');
}
