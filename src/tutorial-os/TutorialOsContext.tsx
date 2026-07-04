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
import type { TutorialStep, TutorialTour } from './types';
import { MANSION_TOUR_ID } from './constants';
import { getFeaturedTour, getTourById, getTourSteps } from './registry';
import {
  exportProgressForApi,
  getTourProgress,
  grantAchievementPlaceholder,
  markWelcomeDismissed,
  mergeRemoteTutorialProgress,
  readTutorialProgressStore,
  shouldShowWelcomePrompt,
  upsertTourProgress,
} from './progressStorage';
import { getAchievementForTour } from './achievements';
import { waitForTarget, type ResolvedTarget } from './targetResolver';
import { TutorialWelcomePrompt } from './components/TutorialWelcomePrompt';
import { TutorialWizardPanel } from './components/TutorialWizardPanel';
import { TutorialSpotlightOverlay } from './components/TutorialSpotlightOverlay';
import { setTutorialOsConciergeBypassActive } from './conciergeBypass';

export type TutorialOsContextValue = {
  activeTour: TutorialTour | null;
  activeStep: TutorialStep | null;
  activeStepIndex: number;
  isTourActive: boolean;
  startTour: (tourId: string, options?: { preview?: boolean }) => void;
  stopTour: () => void;
  mansionTourCompleted: boolean;
  showWelcome: boolean;
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
      body: JSON.stringify({ tours: exportProgressForApi(), earnedAchievementIds: readTutorialProgressStore().earnedAchievementIds }),
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

export function TutorialOsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [storeVersion, setStoreVersion] = useState(0);
  const bumpStore = useCallback(() => setStoreVersion((v) => v + 1), []);

  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
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

  const startTour = useCallback(
    (tourId: string, options?: { preview?: boolean }) => {
      const tour = getTourById(tourId);
      if (!tour || tour.steps.length === 0 || tour.status !== 'enabled') return;
      setPreviewMode(Boolean(options?.preview));
      setShowWelcome(false);
      setActiveTourId(tourId);
      setStepIndex(0);
      const now = new Date().toISOString();
      upsertTourProgress(tourId, {
        status: 'started',
        lastStepIndex: 0,
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
      bumpStore();
      void syncProgressToServer();
      stopTour();
    },
    [bumpStore, stopTour]
  );

  const skipTour = useCallback(
    (tourId: string) => {
      upsertTourProgress(tourId, {
        status: 'skipped',
        skippedAt: new Date().toISOString(),
      });
      bumpStore();
      void syncProgressToServer();
      stopTour();
    },
    [bumpStore, stopTour]
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

  const value = useMemo<TutorialOsContextValue>(
    () => ({
      activeTour,
      activeStep,
      activeStepIndex: stepIndex,
      isTourActive,
      startTour,
      stopTour,
      mansionTourCompleted,
      showWelcome,
    }),
    [activeTour, activeStep, stepIndex, isTourActive, startTour, stopTour, mansionTourCompleted, showWelcome]
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
                tourLabel={activeTour.optionalLabel ?? activeTour.customerName}
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
