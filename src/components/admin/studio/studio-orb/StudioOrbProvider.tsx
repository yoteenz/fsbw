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
import {
  endConversationSession,
  startConversationSession,
} from '../../../../studio-os-core/conversation-engine';
import { stopVoiceListening } from '../../../../studio-os-core/voice-mode';
import { readCommandDockStore } from '../../../../studio-os-core/command-dock/store';
import { useCommandDockState } from '../../../../hooks/useCommandDockState';
import { useStudioOrbRecommendations } from '../../../../hooks/useStudioOrbRecommendations';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { StudioOrbAwakeningOverlay } from './StudioOrbAwakeningOverlay';
import type { StudioOrbPosition, StudioOrbPresenceState, StudioOrbSurface } from './studioOrbTypes';
import { playStudioOrbSound } from './studioOrbSounds';
import {
  hasSeenStudioOrbAwakening,
  markStudioOrbAwakeningSeen,
} from './studioOrbAwakening';
import { readSafeAreaInsets } from './studioOrbRadialLayout';

type StudioOrbContextValue = {
  presenceState: StudioOrbPresenceState;
  radialOpen: boolean;
  activeSurface: StudioOrbSurface;
  conversationMode: boolean;
  awakeningActive: boolean;
  position: StudioOrbPosition;
  menuAnchor: { x: number; y: number };
  setMenuAnchor: (anchor: { x: number; y: number }) => void;
  ambientInsight: string | null;
  toggleRadial: () => void;
  closeRadial: () => void;
  openCommandDock: () => void;
  openPageGuide: () => void;
  openLifeCulture: () => void;
  openVoiceMode: () => void;
  openRecommendations: () => void;
  closeSurface: () => void;
  completeAwakening: () => void;
};

const StudioOrbContext = createContext<StudioOrbContextValue | null>(null);

const DEFAULT_POSITION: StudioOrbPosition = { bottom: 14, right: 12 };

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
  const orbRecs = useStudioOrbRecommendations();
  const organizationId = workspaceId;

  const [radialOpen, setRadialOpen] = useState(false);
  const [activeSurface, setActiveSurface] = useState<StudioOrbSurface>(null);
  const [position, setPosition] = useState<StudioOrbPosition>(DEFAULT_POSITION);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [awakeningActive, setAwakeningActive] = useState(false);

  const store = dock.store;
  const presenceState = useMemo(() => resolvePresenceState(store), [store]);
  const conversationMode =
    activeSurface === 'command-dock' || activeSurface === 'voice-mode';
  const ambientInsight =
    orbRecs.topAmbientInsight ?? store.proactiveSuggestion?.insight ?? null;

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
      const safe = readSafeAreaInsets();
      const baseBottom = Math.max(DEFAULT_POSITION.bottom, safe.bottom + 10);
      const baseRight = Math.max(DEFAULT_POSITION.right, safe.right + 12);
      const keyboardLikely = window.innerHeight - vv.height > 120;
      setPosition(
        keyboardLikely
          ? { bottom: Math.max(baseBottom, window.innerHeight - vv.height + 12), right: baseRight }
          : { bottom: baseBottom, right: baseRight }
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
    if (organizationId) startConversationSession(organizationId, 'command-dock');
    dock.setFocused(true);
    dock.expand('medium');
    playStudioOrbSound('conversation-open');
  }, [dock, organizationId]);

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

  const openVoiceMode = useCallback(() => {
    setRadialOpen(false);
    setActiveSurface('voice-mode');
    if (organizationId) startConversationSession(organizationId, 'voice-mode');
    playStudioOrbSound('conversation-open');
  }, [organizationId]);

  const openRecommendations = useCallback(() => {
    setRadialOpen(false);
    setActiveSurface('recommendations');
    playStudioOrbSound('conversation-open');
  }, []);

  const closeSurface = useCallback(() => {
    if (activeSurface === 'command-dock') {
      dock.dismiss();
    }
    if (activeSurface === 'voice-mode') {
      stopVoiceListening();
      if (organizationId) endConversationSession(organizationId);
    }
    setActiveSurface(null);
    setRadialOpen(false);
    if (activeSurface) {
      playStudioOrbSound('conversation-close');
    }
  }, [activeSurface, dock, organizationId]);

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
      menuAnchor,
      setMenuAnchor,
      ambientInsight,
      toggleRadial,
      closeRadial,
      openCommandDock,
      openPageGuide,
      openLifeCulture,
      openVoiceMode,
      openRecommendations,
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
      menuAnchor,
      ambientInsight,
      toggleRadial,
      closeRadial,
      openCommandDock,
      openPageGuide,
      openLifeCulture,
      openVoiceMode,
      openRecommendations,
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
  return Boolean(
    ctx?.conversationMode ||
      ctx?.activeSurface === 'page-guide' ||
      ctx?.activeSurface === 'life-culture' ||
      ctx?.activeSurface === 'voice-mode' ||
      ctx?.activeSurface === 'recommendations'
  );
}
