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
import { isSignedIn } from '../utils/adminAuth';
import { getAccessToken } from '../utils/api';
import type { TutorialFeatureCardDef, TutorialStep, TutorialTour } from './types';
import { MANSION_TOUR_ID, ONBOARDING_TUTORIAL_LABEL } from './constants';
import { findStepIndex, getFeaturedTour, getTourById, getTourSteps } from './registry';
import {
  exportProgressForApi,
  getTourProgress,
  grantAchievementPlaceholder,
  markWelcomeDismissed,
  mergeRemoteTutorialProgress,
  readTutorialProgressStore,
  shouldShowWelcomePrompt,
  upsertTourProgress,
  writeTutorialProgressStore,
} from './progressStorage';
import { getAchievementForTour } from './achievements';
import { waitForTarget, type ResolvedTarget } from './targetResolver';
import { TutorialWelcomePrompt } from './components/TutorialWelcomePrompt';
import { TutorialWizardPanel } from './components/TutorialWizardPanel';
import { TutorialSpotlightOverlay } from './components/TutorialSpotlightOverlay';
import { TutorialSearchModal } from './components/TutorialSearchModal';
import { TutorialPageHelpButton } from './components/TutorialPageHelpButton';
import { setTutorialOsConciergeBypassActive } from './conciergeBypass';
import { markTutorialNodeCompleted } from './v2/progressHelpers';
import { resolveTutorialPageForPathname } from './v2/pageRegistry';
import type { TutorialSearchEntry } from './v2/schema';
import { getSuggestedNextTutorial } from './v2/searchIndex';

type TourStackEntry = {
  tourId: string;
  stepIndex: number;
};

export type TutorialOsContextValue = {
  activeTour: TutorialTour | null;
  activeStep: TutorialStep | null;
  activeStepIndex: number;
  isTourActive: boolean;
  startTour: (tourId: string, options?: { preview?: boolean; stepId?: string; nested?: boolean }) => void;
  stopTour: () => void;
  openPageHelp: (pathname: string) => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  searchModalOpen: boolean;
  mansionTourCompleted: boolean;
  showWelcome: boolean;
  tourBreadcrumb: string | null;
};

const TutorialOsContext = createContext<TutorialOsContextValue | null>(null);

const ADMIN_PATH_PREFIX = '/admin';
const PREVIEW_QUERY = 'tutorialPreview';

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ADMIN_PATH_PREFIX);
}

async function syncProgressToServer(): Promise<void> {
  const token = await getAccessToken();
  if (!token) return;
  try {
    const base = import.meta.env.VITE_API_BASE || '';
    await fetch(`${base}/api/tutorial/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tours: exportProgressForApi(),
        earnedAchievementIds: readTutorialProgressStore().earnedAchievementIds,
      }),
    });
  } catch {
    // offline / migration not applied — localStorage remains source of truth
  }
}

async function fetchRemoteProgress(): Promise<void> {
  const token = await getAccessToken();
  if (!token) return;
  try {
    const base = import.meta.env.VITE_API_BASE || '';
    const res = await fetch(`${base}/api/tutorial/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = (await res.json()) as { tours?: Record<string, unknown> };
    if (data.tours) mergeRemoteTutorialProgress(data.tours as Parameters<typeof mergeRemoteTutorialProgress>[0]);
  } catch {
    // ignore
  }
}

function persistSuggestedNextTour(): void {
  const store = readTutorialProgressStore();
  const completedIds = Object.entries(store.tours)
    .filter(([, p]) => p.status === 'completed')
    .map(([id]) => id);
  const next = getSuggestedNextTutorial(completedIds);
  if (next && store.suggestedNextTutorialId !== next) {
    store.suggestedNextTutorialId = next;
    writeTutorialProgressStore(store);
  }
}

export function TutorialOsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [storeVersion, setStoreVersion] = useState(0);
  const bumpStore = useCallback(() => setStoreVersion((v) => v + 1), []);

  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourStack, setTourStack] = useState<TourStackEntry[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [target, setTarget] = useState<ResolvedTarget | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const navigatingRef = useRef(false);

  const activeTour = useMemo(() => (activeTourId ? getTourById(activeTourId) ?? null : null), [activeTourId]);
  const steps = useMemo(() => (activeTour ? getTourSteps(activeTour.id) : []), [activeTour]);
  const activeStep = steps[stepIndex] ?? null;

  const mansionProgress = useMemo(() => {
    void storeVersion;
    return getTourProgress(MANSION_TOUR_ID);
  }, [storeVersion]);

  const mansionTourCompleted = mansionProgress?.status === 'completed';

  const hideChrome =
    isAdminPath(location.pathname) ||
    location.pathname.startsWith('/desktop-preview') ||
    location.pathname.startsWith('/debug-mode');

  const isTourActive = Boolean(activeTour && activeStep && !showWelcome);

  const tourBreadcrumb = useMemo(() => {
    if (tourStack.length === 0) return null;
    const parent = getTourById(tourStack[tourStack.length - 1]?.tourId ?? '');
    return parent?.customerName ?? null;
  }, [tourStack]);

  const conciergeBypassActive = showWelcome || isTourActive;

  useEffect(() => {
    setTutorialOsConciergeBypassActive(conciergeBypassActive);
    return () => setTutorialOsConciergeBypassActive(false);
  }, [conciergeBypassActive]);

  const persistStepProgress = useCallback(
    (tourId: string, index: number, step: TutorialStep, status: 'in_progress' | 'completed') => {
      const prev = getTourProgress(tourId);
      const completed = new Set(prev?.completedStepIds ?? []);
      completed.add(step.id);
      upsertTourProgress(tourId, {
        status,
        lastStepId: step.id,
        lastStepIndex: index,
        completedStepIds: [...completed],
        startedAt: prev?.startedAt ?? new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : prev?.completedAt,
      });
      markTutorialNodeCompleted(step);
      persistSuggestedNextTour();
      bumpStore();
      void syncProgressToServer();
    },
    [bumpStore]
  );

  const resolveStepTarget = useCallback(async (step: TutorialStep) => {
    const route = location.pathname;
    const resolved = await waitForTarget(step, route);
    setTarget(resolved);
  }, [location.pathname]);

  /** Navigate to step route then resolve highlight. */
  useEffect(() => {
    if (!isTourActive || !activeStep || navigatingRef.current) return;

    const run = async () => {
      if (activeStep.requiresLogin && !isSignedIn()) {
        setTarget(null);
        return;
      }
      if (activeStep.route && location.pathname !== activeStep.route && !location.pathname.startsWith(`${activeStep.route}/`)) {
        navigatingRef.current = true;
        navigate(activeStep.route);
        window.setTimeout(() => {
          navigatingRef.current = false;
        }, 400);
        return;
      }
      await resolveStepTarget(activeStep);
    };
    void run();
  }, [isTourActive, activeStep, location.pathname, navigate, resolveStepTarget]);

  /** Admin preview via ?tutorialPreview=mansion-tour */
  useEffect(() => {
    if (hideChrome) return;
    const params = new URLSearchParams(location.search);
    const previewTour = params.get(PREVIEW_QUERY);
    if (previewTour && getTourById(previewTour)) {
      setPreviewMode(true);
      setActiveTourId(previewTour);
      setStepIndex(0);
      setTourStack([]);
      setShowWelcome(false);
    }
  }, [location.search, hideChrome]);

  /** First-visit welcome prompt */
  useEffect(() => {
    if (hideChrome || previewMode || activeTourId) return;
    const timer = window.setTimeout(() => {
      if (shouldShowWelcomePrompt()) setShowWelcome(true);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [hideChrome, previewMode, activeTourId]);

  /** Load remote progress on sign-in */
  useEffect(() => {
    const onSignIn = () => {
      void fetchRemoteProgress().then(() => bumpStore());
    };
    window.addEventListener('signInStateChanged', onSignIn);
    if (isSignedIn()) void fetchRemoteProgress().then(() => bumpStore());
    return () => window.removeEventListener('signInStateChanged', onSignIn);
  }, [bumpStore]);

  const finishOrResumeParent = useCallback(() => {
    setTourStack((stack) => {
      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        setActiveTourId(parent.tourId);
        setStepIndex(parent.stepIndex);
        setTarget(null);
        return stack.slice(0, -1);
      }
      setActiveTourId(null);
      setStepIndex(0);
      setTarget(null);
      setPreviewMode(false);
      return [];
    });
  }, []);

  const startTour = useCallback(
    (tourId: string, options?: { preview?: boolean; stepId?: string; nested?: boolean }) => {
      const tour = getTourById(tourId);
      if (!tour || tour.steps.length === 0 || tour.status !== 'enabled') return;
      const startIndex = options?.stepId ? Math.max(0, findStepIndex(tourId, options.stepId)) : 0;
      setPreviewMode(Boolean(options?.preview));
      setShowWelcome(false);
      setSearchModalOpen(false);
      setActiveTourId(tourId);
      setStepIndex(startIndex);
      if (!options?.nested) setTourStack([]);
      const now = new Date().toISOString();
      upsertTourProgress(tourId, {
        status: 'started',
        lastStepIndex: startIndex,
        startedAt: now,
      });
      bumpStore();
      void syncProgressToServer();
    },
    [bumpStore]
  );

  const stopTour = useCallback(() => {
    setActiveTourId(null);
    setStepIndex(0);
    setTourStack([]);
    setTarget(null);
    setPreviewMode(false);
  }, []);

  const completeTour = useCallback(
    (tourId: string) => {
      const tour = getTourById(tourId);
      const achievement = tour?.achievementId ?? getAchievementForTour(tourId)?.id;
      upsertTourProgress(tourId, {
        status: 'completed',
        completionPercentage: 100,
        completedAt: new Date().toISOString(),
      });
      if (achievement) grantAchievementPlaceholder(achievement);
      persistSuggestedNextTour();
      bumpStore();
      void syncProgressToServer();
      finishOrResumeParent();
    },
    [bumpStore, finishOrResumeParent]
  );

  const skipTour = useCallback(
    (tourId: string) => {
      upsertTourProgress(tourId, {
        status: 'skipped',
        skippedAt: new Date().toISOString(),
      });
      bumpStore();
      void syncProgressToServer();
      finishOrResumeParent();
    },
    [bumpStore, finishOrResumeParent]
  );

  const goNext = useCallback(() => {
    if (!activeTour || !activeStep) return;
    persistStepProgress(activeTour.id, stepIndex, activeStep, 'in_progress');
    if (stepIndex >= steps.length - 1) {
      completeTour(activeTour.id);
      return;
    }
    setStepIndex((i) => i + 1);
    setTarget(null);
  }, [activeTour, activeStep, stepIndex, steps.length, persistStepProgress, completeTour]);

  const goBack = useCallback(() => {
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
    setTarget(null);
  }, [stepIndex]);

  const handleWelcomeStart = useCallback(() => {
    const featured = getFeaturedTour();
    if (featured) startTour(featured.id);
    else setShowWelcome(false);
  }, [startTour]);

  const handleWelcomeMaybeLater = useCallback(() => {
    markWelcomeDismissed('maybe_later');
    setShowWelcome(false);
    bumpStore();
  }, [bumpStore]);

  const handleWelcomeSkip = useCallback(() => {
    markWelcomeDismissed('skip');
    upsertTourProgress(MANSION_TOUR_ID, { status: 'dismissed', dismissedAt: new Date().toISOString() });
    bumpStore();
    setShowWelcome(false);
  }, [bumpStore]);

  const handleAction = useCallback(() => {
    if (!activeStep?.actionRoute) return;
    navigate(activeStep.actionRoute);
  }, [activeStep, navigate]);

  const openPageHelp = useCallback(
    (pathname: string) => {
      const page = resolveTutorialPageForPathname(pathname);
      if (!page?.helpTourId) return;
      startTour(page.helpTourId);
    },
    [startTour]
  );

  const openSearchModal = useCallback(() => setSearchModalOpen(true), []);
  const closeSearchModal = useCallback(() => setSearchModalOpen(false), []);

  const handleSearchSelect = useCallback(
    (entry: TutorialSearchEntry) => {
      if (entry.stepId) startTour(entry.tourId, { stepId: entry.stepId });
      else startTour(entry.tourId);
    },
    [startTour]
  );

  const handleShowMeFeature = useCallback(
    (feature: TutorialFeatureCardDef) => {
      if (activeTour) {
        setTourStack((stack) => [...stack, { tourId: activeTour.id, stepIndex }]);
      }
      if (feature.showMeRoute) navigate(feature.showMeRoute);
      startTour(feature.nestedTourId, { nested: true });
    },
    [activeTour, stepIndex, navigate, startTour]
  );

  const value = useMemo<TutorialOsContextValue>(
    () => ({
      activeTour,
      activeStep,
      activeStepIndex: stepIndex,
      isTourActive,
      startTour,
      stopTour,
      openPageHelp,
      openSearchModal,
      closeSearchModal,
      searchModalOpen,
      mansionTourCompleted,
      showWelcome,
      tourBreadcrumb,
    }),
    [
      activeTour,
      activeStep,
      stepIndex,
      isTourActive,
      startTour,
      stopTour,
      openPageHelp,
      openSearchModal,
      closeSearchModal,
      searchModalOpen,
      mansionTourCompleted,
      showWelcome,
      tourBreadcrumb,
    ]
  );

  const featured = getFeaturedTour();

  const overlay =
    typeof document !== 'undefined'
      ? createPortal(
          <>
            {showWelcome && featured ? (
              <TutorialWelcomePrompt
                estimatedMinutes={featured.estimatedMinutes}
                onStart={handleWelcomeStart}
                onMaybeLater={handleWelcomeMaybeLater}
                onSkip={handleWelcomeSkip}
              />
            ) : null}
            <TutorialSearchModal open={searchModalOpen} onClose={closeSearchModal} onSelect={handleSearchSelect} />
            {!hideChrome ? <TutorialPageHelpButton pathname={location.pathname} /> : null}
            <TutorialSpotlightOverlay step={activeStep} target={target} visible={isTourActive} />
            {isTourActive && activeTour && activeStep ? (
              <TutorialWizardPanel
                previewKey={activeStep.previewKey}
                stepIndex={stepIndex}
                stepCount={steps.length}
                title={activeStep.title}
                body={activeStep.body}
                benefit={activeStep.benefit}
                position={activeStep.position === 'auto' ? 'bottom' : activeStep.position}
                actionLabel={activeStep.actionLabel}
                onAction={activeStep.actionRoute ? handleAction : undefined}
                onBack={goBack}
                onNext={goNext}
                onSkip={() => skipTour(activeTour.id)}
                canBack={stepIndex > 0}
                isLast={stepIndex >= steps.length - 1}
                productLabel={activeTour.optionalLabel ?? ONBOARDING_TUTORIAL_LABEL}
                tourName={activeTour.customerName}
                breadcrumb={tourBreadcrumb}
                featureCards={activeStep.featureCards}
                onShowMeFeature={handleShowMeFeature}
              />
            ) : null}
          </>,
          document.body
        )
      : null;

  return (
    <TutorialOsContext.Provider value={value}>
      {children}
      {overlay}
    </TutorialOsContext.Provider>
  );
}

export function useTutorialOs(): TutorialOsContextValue {
  const ctx = useContext(TutorialOsContext);
  if (!ctx) {
    throw new Error('useTutorialOs requires TutorialOsProvider');
  }
  return ctx;
}
