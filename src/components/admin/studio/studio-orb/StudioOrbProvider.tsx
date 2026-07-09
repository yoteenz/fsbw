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
import { useLocation } from 'react-router-dom';
import {
  endConversationSession,
  startConversationSession,
} from '../../../../studio-os-core/conversation-engine';
import { stopVoiceListening } from '../../../../studio-os-core/voice-mode';
import { readCommandDockStore } from '../../../../studio-os-core/command-dock/store';
import { getVoiceModeProfile } from '../../../../studio-os-core/voice-mode/store';
import type { VoiceModeState } from '../../../../studio-os-core/voice-mode/types';
import { useCommandDockState } from '../../../../hooks/useCommandDockState';
import { useStudioOrbRecommendations } from '../../../../hooks/useStudioOrbRecommendations';
import { useOrbState } from '../../../../hooks/useOrbState';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { useCompanyRouteOptional, buildOrbCompanyContext } from '../../../../studio-os-core/company-routes';
import {
  resolveOrbContextFromLocation,
  resolveOrbToolbelt,
  type OrbContextTransitionPhase,
  type ResolvedOrbToolbelt,
} from '../../../../studio-os-core/hero-objects';
import { StudioOrbAwakeningOverlay } from './StudioOrbAwakeningOverlay';
import type {
  StudioOrbPosition,
  StudioOrbPresenceState,
  StudioOrbSurface,
} from './studioOrbTypes';
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
  openExecutiveWorkspace: () => void;
  closeSurface: () => void;
  completeAwakening: () => void;
  orbToolbelt: ResolvedOrbToolbelt;
  orbContextId: string;
  orbContextLabel: string;
  orbContextTransition: OrbContextTransitionPhase;
};

const StudioOrbContext = createContext<StudioOrbContextValue | null>(null);

const DEFAULT_POSITION: StudioOrbPosition = { bottom: 14, right: 12 };

type PresenceInputs = {
  store: ReturnType<typeof readCommandDockStore>;
  radialOpen: boolean;
  activeSurface: StudioOrbSurface;
  voiceState: VoiceModeState;
  ambientInsight: string | null;
  hasLegendarySignal: boolean;
  hasCivilizationSignal: boolean;
};

function classifyAmbientInsight(
  insight: string | null
): 'legendary-discovery' | 'civilization-event' | null {
  if (!insight) return null;
  const lower = insight.toLowerCase();
  if (
    /legendary|legend|myth|lost knowledge|archive of questions|crystalline|cartographer/.test(
      lower
    )
  ) {
    return 'legendary-discovery';
  }
  if (
    /civilization|milestone|world expansion|discovery oracle|unknown signal|living world/.test(
      lower
    )
  ) {
    return 'civilization-event';
  }
  return null;
}

function resolvePresenceState({
  store,
  radialOpen,
  activeSurface,
  voiceState,
  ambientInsight,
  hasLegendarySignal,
  hasCivilizationSignal,
}: PresenceInputs): StudioOrbPresenceState {
  if (radialOpen) return 'discovery';

  if (activeSurface === 'voice-mode') {
    if (voiceState === 'listening') return 'listening';
    if (voiceState === 'processing') return 'thinking';
  }

  if (activeSurface === 'command-dock') {
    if (store.processingActive) return 'thinking';
    if (store.activeMicrointeraction && !store.processingActive) return 'speaking';
  }

  if (hasLegendarySignal || classifyAmbientInsight(ambientInsight) === 'legendary-discovery') {
    return 'legendary-discovery';
  }
  if (hasCivilizationSignal || classifyAmbientInsight(ambientInsight) === 'civilization-event') {
    return 'civilization-event';
  }

  if (store.processingActive) return 'thinking';
  if (store.proactiveSuggestion) return 'opportunity';
  if (store.lastRoutingSummary && !store.pendingRoute) return 'completed';
  return 'idle';
}

export function StudioOrbProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { workspaceId } = useWorkspace();
  const companyRoute = useCompanyRouteOptional();
  const orbCompanyContext = useMemo(
    () => (companyRoute ? buildOrbCompanyContext(companyRoute) : null),
    [companyRoute]
  );
  const dock = useCommandDockState();
  const orbRecs = useStudioOrbRecommendations();
  const orbIntel = useOrbState();
  const organizationId = companyRoute?.companyId ?? workspaceId;

  const [radialOpen, setRadialOpen] = useState(false);
  const [activeSurface, setActiveSurface] = useState<StudioOrbSurface>(null);
  const [position, setPosition] = useState<StudioOrbPosition>(DEFAULT_POSITION);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [awakeningActive, setAwakeningActive] = useState(false);
  const [orbContextTransition, setOrbContextTransition] = useState<OrbContextTransitionPhase>('idle');
  const prevContextIdRef = useRef<string | null>(null);

  const orbContextResolution = useMemo(
    () =>
      resolveOrbContextFromLocation({
        pathname,
        activeDepartment: companyRoute?.activeDepartment,
      }),
    [pathname, companyRoute?.activeDepartment]
  );

  const orbToolbelt = useMemo(
    () =>
      resolveOrbToolbelt({
        contextId: orbContextResolution.contextId,
        limit: 5,
      }),
    [orbContextResolution.contextId]
  );

  useEffect(() => {
    const nextId = orbContextResolution.contextId;
    const prevId = prevContextIdRef.current;
    prevContextIdRef.current = nextId;

    if (prevId && prevId !== nextId) {
      setOrbContextTransition('dissolving');
      const timer = window.setTimeout(() => {
        setOrbContextTransition('materializing');
        window.setTimeout(() => setOrbContextTransition('idle'), 580);
      }, 380);
      return () => window.clearTimeout(timer);
    }

    setOrbContextTransition('idle');
  }, [orbContextResolution.contextId]);

  const store = dock.store;
  const [voiceTick, setVoiceTick] = useState(0);
  const conversationMode =
    activeSurface === 'command-dock' || activeSurface === 'voice-mode';
  const ambientInsight =
    orbIntel.view.briefing.recommendedAction ??
    orbRecs.topAmbientInsight ??
    store.proactiveSuggestion?.insight ??
    null;

  const voiceProfile = useMemo(() => {
    void voiceTick;
    if (!organizationId) return null;
    return getVoiceModeProfile(organizationId);
  }, [organizationId, voiceTick]);

  useEffect(() => {
    if (activeSurface !== 'voice-mode') return;
    const id = window.setInterval(() => setVoiceTick((t) => t + 1), 280);
    return () => window.clearInterval(id);
  }, [activeSurface]);

  const hasLegendarySignal = useMemo(
    () => orbRecs.snapshot.recommendations.some((r) => r.isSurprise),
    [orbRecs.snapshot.recommendations]
  );
  const hasCivilizationSignal = useMemo(
    () =>
      orbRecs.snapshot.recommendations.some((r) =>
        ['celebrate-milestone', 'expand-headquarters', 'start-expedition'].includes(r.category)
      ),
    [orbRecs.snapshot.recommendations]
  );

  const presenceState = useMemo(() => {
    let state = resolvePresenceState({
      store,
      radialOpen,
      activeSurface,
      voiceState: voiceProfile?.state ?? 'idle',
      ambientInsight,
      hasLegendarySignal,
      hasCivilizationSignal,
    });

    if (activeSurface === 'executive-workspace') {
      const runtimePresence = orbIntel.view.session.presenceState;
      if (runtimePresence === 'thinking') state = 'thinking';
      else if (runtimePresence === 'recommending') state = 'opportunity';
      else if (runtimePresence === 'briefing') state = 'speaking';
      else if (runtimePresence === 'focus-guard') state = 'focus';
      else if (runtimePresence === 'listening') state = 'listening';
      else state = 'idle';
    } else if (orbIntel.view.attention.presenceState === 'focus-guard') {
      state = 'focus';
    } else if (orbIntel.view.attention.shouldInterrupt) {
      state = 'opportunity';
    }

    return state;
  }, [
    store,
    radialOpen,
    activeSurface,
    voiceProfile?.state,
    ambientInsight,
    hasLegendarySignal,
    hasCivilizationSignal,
    orbIntel.view.session.presenceState,
    orbIntel.view.attention.presenceState,
    orbIntel.view.attention.shouldInterrupt,
  ]);

  useEffect(() => {
    if (orbCompanyContext) {
      document.body.dataset.studioOrbCompanyContext = orbCompanyContext.narrativeLine;
    } else {
      delete document.body.dataset.studioOrbCompanyContext;
    }
  }, [orbCompanyContext]);

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

  const openExecutiveWorkspace = useCallback(() => {
    setRadialOpen(false);
    setActiveSurface('executive-workspace');
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
      openExecutiveWorkspace,
      closeSurface,
      completeAwakening,
      orbToolbelt,
      orbContextId: orbContextResolution.contextId,
      orbContextLabel: orbContextResolution.contextLabel,
      orbContextTransition,
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
      openExecutiveWorkspace,
      closeSurface,
      completeAwakening,
      orbToolbelt,
      orbContextResolution.contextId,
      orbContextResolution.contextLabel,
      orbContextTransition,
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
