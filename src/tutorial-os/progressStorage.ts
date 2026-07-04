import type { TutorialMissingTargetLog, TutorialProgressStore, TutorialTourProgress } from './types';
import { TUTORIAL_MISSING_TARGETS_KEY, TUTORIAL_PROGRESS_STORAGE_KEY } from './constants';
import { getTourSteps } from './registry';

function emptyStore(): TutorialProgressStore {
  return {
    version: 2,
    tours: {},
    earnedAchievementIds: [],
    completedPageIds: [],
    completedFeatureIds: [],
    completedWidgetIds: [],
    recentlyLearned: [],
  };
}

export function readTutorialProgressStore(): TutorialProgressStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(TUTORIAL_PROGRESS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as { version?: number } & Partial<Omit<TutorialProgressStore, 'version'>>;
    if (parsed.version !== 1 && parsed.version !== 2) return emptyStore();
    return {
      version: 2,
      tours: parsed.tours ?? {},
      welcomeDismissedAt: parsed.welcomeDismissedAt,
      welcomeMaybeLaterAt: parsed.welcomeMaybeLaterAt,
      earnedAchievementIds: parsed.earnedAchievementIds ?? [],
      completedPageIds: parsed.completedPageIds ?? [],
      completedFeatureIds: parsed.completedFeatureIds ?? [],
      completedWidgetIds: parsed.completedWidgetIds ?? [],
      recentlyLearned: parsed.recentlyLearned ?? [],
      suggestedNextTutorialId: parsed.suggestedNextTutorialId,
    };
  } catch {
    return emptyStore();
  }
}

export function writeTutorialProgressStore(store: TutorialProgressStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TUTORIAL_PROGRESS_STORAGE_KEY, JSON.stringify(store));
}

export function computeCompletionPercentage(tourId: string, completedStepIds: string[]): number {
  const steps = getTourSteps(tourId);
  if (steps.length === 0) return 0;
  return Math.round((completedStepIds.length / steps.length) * 100);
}

export function getTourProgress(tourId: string): TutorialTourProgress | undefined {
  return readTutorialProgressStore().tours[tourId];
}

export function upsertTourProgress(tourId: string, patch: Partial<TutorialTourProgress>): TutorialTourProgress {
  const store = readTutorialProgressStore();
  const existing = store.tours[tourId];
  const now = new Date().toISOString();
  const completedStepIds = patch.completedStepIds ?? existing?.completedStepIds ?? [];
  const next: TutorialTourProgress = {
    tourId,
    status: patch.status ?? existing?.status ?? 'not_started',
    lastStepId: patch.lastStepId ?? existing?.lastStepId,
    lastStepIndex: patch.lastStepIndex ?? existing?.lastStepIndex ?? -1,
    completedStepIds,
    completionPercentage: computeCompletionPercentage(tourId, completedStepIds),
    startedAt: patch.startedAt ?? existing?.startedAt,
    completedAt: patch.completedAt ?? existing?.completedAt,
    skippedAt: patch.skippedAt ?? existing?.skippedAt,
    dismissedAt: patch.dismissedAt ?? existing?.dismissedAt,
    updatedAt: now,
  };
  store.tours[tourId] = next;
  writeTutorialProgressStore(store);
  return next;
}

export function markWelcomeDismissed(kind: 'skip' | 'maybe_later'): void {
  const store = readTutorialProgressStore();
  const now = new Date().toISOString();
  if (kind === 'skip') store.welcomeDismissedAt = now;
  else store.welcomeMaybeLaterAt = now;
  writeTutorialProgressStore(store);
}

export function shouldShowWelcomePrompt(): boolean {
  const store = readTutorialProgressStore();
  if (store.welcomeDismissedAt) return false;
  const mansion = store.tours['mansion-tour'];
  if (mansion?.status === 'completed' || mansion?.status === 'skipped') return false;
  return true;
}

export function grantAchievementPlaceholder(achievementId: string): void {
  const store = readTutorialProgressStore();
  if (store.earnedAchievementIds.includes(achievementId)) return;
  store.earnedAchievementIds = [...store.earnedAchievementIds, achievementId];
  writeTutorialProgressStore(store);
}

export function logMissingTarget(entry: Omit<TutorialMissingTargetLog, 'at'>): void {
  if (typeof window === 'undefined') return;
  if (import.meta.env.PROD) return;
  try {
    const raw = sessionStorage.getItem(TUTORIAL_MISSING_TARGETS_KEY);
    const list: TutorialMissingTargetLog[] = raw ? JSON.parse(raw) : [];
    list.push({ ...entry, at: new Date().toISOString() });
    sessionStorage.setItem(TUTORIAL_MISSING_TARGETS_KEY, JSON.stringify(list.slice(-50)));
    console.warn('[Tutorial OS] Missing target:', entry.selector, 'on', entry.route);
  } catch {
    console.warn('[Tutorial OS] Missing target:', entry.selector);
  }
}

export function readMissingTargetLogs(): TutorialMissingTargetLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(TUTORIAL_MISSING_TARGETS_KEY);
    return raw ? (JSON.parse(raw) as TutorialMissingTargetLog[]) : [];
  } catch {
    return [];
  }
}

/** Merge remote progress from API into local store (logged-in users). */
export function mergeRemoteTutorialProgress(remote: Record<string, TutorialTourProgress>): void {
  const store = readTutorialProgressStore();
  for (const [tourId, remoteProgress] of Object.entries(remote)) {
    const local = store.tours[tourId];
    if (!local || new Date(remoteProgress.updatedAt).getTime() >= new Date(local.updatedAt).getTime()) {
      store.tours[tourId] = remoteProgress;
    }
  }
  writeTutorialProgressStore(store);
}

export function exportProgressForApi(): Record<string, TutorialTourProgress> {
  return readTutorialProgressStore().tours;
}
