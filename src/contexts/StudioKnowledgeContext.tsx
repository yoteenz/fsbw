import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  getPageKnowledgeForPath,
  type KnowledgePageGuide,
} from '../utils/adminStudioKnowledgeHubDemo';
import { useAdminStudioKnowledgeHub } from '../hooks/useAdminStudioKnowledgeHubState';

type StudioKnowledgeContextValue = {
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  pageGuide: KnowledgePageGuide | undefined;
  tourStepIndex: number;
  startTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;
  markCurrentPageRead: () => void;
  showContextualHint: boolean;
  dismissContextualHint: () => void;
};

const StudioKnowledgeContext = createContext<StudioKnowledgeContextValue | null>(null);

export function StudioKnowledgeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(-1);
  const { markGuideRead, completeTour, dismissContextualHint, isHintDismissed } =
    useAdminStudioKnowledgeHub();

  const pageGuide = useMemo(() => getPageKnowledgeForPath(pathname), [pathname]);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setTourStepIndex(-1);
  }, []);
  const togglePanel = useCallback(() => setPanelOpen((v) => !v), []);

  const startTour = useCallback(() => {
    if (!pageGuide) return;
    setTourStepIndex(0);
    setPanelOpen(true);
  }, [pageGuide]);

  const nextTourStep = useCallback(() => {
    if (!pageGuide) return;
    setTourStepIndex((i) => {
      const next = i + 1;
      if (next >= pageGuide.tourSteps.length) {
        completeTour(pageGuide.moduleId);
        return -1;
      }
      return next;
    });
  }, [pageGuide, completeTour]);

  const endTour = useCallback(() => setTourStepIndex(-1), []);

  const markCurrentPageRead = useCallback(() => {
    if (pageGuide) markGuideRead(pageGuide.moduleId);
  }, [pageGuide, markGuideRead]);

  const showContextualHint =
    Boolean(pageGuide?.contextualHint) &&
    Boolean(pageGuide) &&
    !isHintDismissed(pageGuide!.moduleId) &&
    !panelOpen;

  const dismissHint = useCallback(() => {
    if (pageGuide) dismissContextualHint(pageGuide.moduleId);
  }, [pageGuide, dismissContextualHint]);

  const value: StudioKnowledgeContextValue = {
    panelOpen,
    openPanel,
    closePanel,
    togglePanel,
    pageGuide,
    tourStepIndex,
    startTour,
    nextTourStep,
    endTour,
    markCurrentPageRead,
    showContextualHint,
    dismissContextualHint: dismissHint,
  };

  return <StudioKnowledgeContext.Provider value={value}>{children}</StudioKnowledgeContext.Provider>;
}

export function useStudioKnowledge(): StudioKnowledgeContextValue {
  const ctx = useContext(StudioKnowledgeContext);
  if (!ctx) {
    throw new Error('useStudioKnowledge requires StudioKnowledgeProvider');
  }
  return ctx;
}

/** Safe hook when provider may be absent (non-studio pages). */
export function useStudioKnowledgeOptional(): StudioKnowledgeContextValue | null {
  return useContext(StudioKnowledgeContext);
}
