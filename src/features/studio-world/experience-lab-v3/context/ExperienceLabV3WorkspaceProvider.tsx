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
import { useExperienceLabLiveWorkspace } from '../../experience-lab-v2/live-workspace';
import { deriveV3ModelFromLiveWorkspace } from '../adapters/liveWorkspaceToV3Model';
import type { V3CoreWorkspaceId } from '../experience-lab-v3.types';
import { resolveV3WorkspaceIndex, V3_CORE_WORKSPACES } from '../registry/v3-workspace-registry';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

export type V3PagerDiagnostics = {
  activeWorkspace: V3CoreWorkspaceId;
  pagerIndex: number;
  pagerOffset: number;
  swipeProgress: number;
  mountedPages: number[];
  preloadedPages: number[];
};

type ExperienceLabV3WorkspaceContextValue = {
  activeWorkspace: V3CoreWorkspaceId;
  activeIndex: number;
  pagerOffset: number;
  swipeProgress: number;
  setWorkspace: (id: V3CoreWorkspaceId) => void;
  swipeWorkspace: (direction: -1 | 1) => void;
  setPagerOffset: (offset: number) => void;
  setSwipeProgress: (progress: number) => void;
  getPagerDiagnostics: () => V3PagerDiagnostics;
  announceWorkspace: string | null;
};

const ExperienceLabV3WorkspaceContext = createContext<ExperienceLabV3WorkspaceContextValue | null>(null);

const PAGE_COUNT = V3_CORE_WORKSPACES.length;

/** Canonical V3 workspace provider — pager state, live data sync, workspace memory. */
export function ExperienceLabV3WorkspaceProvider({ children }: { children: ReactNode }) {
  const { state, dispatch, setWorkspace: setStoreWorkspace, swipeWorkspace: storeSwipeWorkspace } = useExperienceLabV3Store();
  const { liveWorkspace, syncTick, eventSync } = useExperienceLabLiveWorkspace();
  const [pagerOffset, setPagerOffset] = useState(0);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [announceWorkspace, setAnnounceWorkspace] = useState<string | null>(null);
  const prevWorkspace = useRef(state.activeWorkspace);

  useEffect(() => {
    const derived = deriveV3ModelFromLiveWorkspace(liveWorkspace);
    dispatch({
      type: 'SYNC_FROM_LIVE',
      payload: {
        ...derived,
        eventConnected: eventSync.cursor.connectionState === 'connected',
      },
    });
  }, [liveWorkspace, syncTick, eventSync.cursor.connectionState, dispatch]);

  const activeWorkspace = state.activeWorkspace;
  const activeIndex = resolveV3WorkspaceIndex(activeWorkspace);

  const setWorkspace = useCallback(
    (id: V3CoreWorkspaceId) => {
      setStoreWorkspace(id);
      setPagerOffset(0);
      setSwipeProgress(0);
    },
    [setStoreWorkspace]
  );

  const swipeWorkspace = useCallback(
    (direction: -1 | 1) => {
      storeSwipeWorkspace(direction);
      setPagerOffset(0);
      setSwipeProgress(0);
    },
    [storeSwipeWorkspace]
  );

  useEffect(() => {
    if (prevWorkspace.current !== activeWorkspace) {
      setAnnounceWorkspace(V3_CORE_WORKSPACES.find((w) => w.id === activeWorkspace)?.label ?? activeWorkspace);
      prevWorkspace.current = activeWorkspace;
    }
  }, [activeWorkspace]);

  const getPagerDiagnostics = useCallback((): V3PagerDiagnostics => {
    const mounted = V3_CORE_WORKSPACES.map((_, i) => i).filter((i) => Math.abs(i - activeIndex) <= 1);
    return {
      activeWorkspace,
      pagerIndex: activeIndex,
      pagerOffset,
      swipeProgress,
      mountedPages: mounted,
      preloadedPages: mounted,
    };
  }, [activeWorkspace, activeIndex, pagerOffset, swipeProgress]);

  const value = useMemo(
    () => ({
      activeWorkspace,
      activeIndex,
      pagerOffset,
      swipeProgress,
      setWorkspace,
      swipeWorkspace,
      setPagerOffset,
      setSwipeProgress,
      getPagerDiagnostics,
      announceWorkspace,
    }),
    [
      activeWorkspace,
      activeIndex,
      pagerOffset,
      swipeProgress,
      setWorkspace,
      swipeWorkspace,
      getPagerDiagnostics,
      announceWorkspace,
    ]
  );

  return (
    <ExperienceLabV3WorkspaceContext.Provider value={value}>
      <div className="elab-v3-workspace-provider" aria-live="polite" aria-atomic="true">
        {announceWorkspace ? (
          <span className="elab-v3-sr-only">Workspace: {announceWorkspace}</span>
        ) : null}
        {children}
      </div>
    </ExperienceLabV3WorkspaceContext.Provider>
  );
}

export function useV3Workspace(): ExperienceLabV3WorkspaceContextValue {
  const ctx = useContext(ExperienceLabV3WorkspaceContext);
  if (!ctx) throw new Error('useV3Workspace requires ExperienceLabV3WorkspaceProvider');
  return ctx;
}

export const V3_PAGE_WIDTH_PCT = 100 / PAGE_COUNT;
