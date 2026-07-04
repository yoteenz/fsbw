import type { TutorialTour } from '../tutorial-os/types';
import { getAllTours } from '../tutorial-os/registry';
import { readMissingTargetLogs, readTutorialProgressStore } from '../tutorial-os/progressStorage';
import { TUTORIAL_ACHIEVEMENTS } from '../tutorial-os/achievements';
import { TUTORIAL_ADMIN_STORAGE_KEY } from '../tutorial-os/constants';

export const TUTORIAL_OS_SUBTITLE =
  'Interactive concierge walkthroughs — guided panels, hotspots, and mansion tours for every Frontal Slayer feature.';

export type TutorialOsAdminStore = {
  disabledTourIds?: string[];
  /** Copy overrides keyed by `${tourId}:${stepId}` */
  copyOverrides?: Record<string, { title?: string; body?: string; benefit?: string }>;
};

export type TutorialOsAnalyticsRow = {
  tourId: string;
  tourName: string;
  started: number;
  completed: number;
  skipped: number;
  dismissed: number;
  avgCompletionPct: number;
};

function readAdminStore(): TutorialOsAdminStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TUTORIAL_ADMIN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TutorialOsAdminStore) : {};
  } catch {
    return {};
  }
}

export function writeTutorialOsAdminStore(store: TutorialOsAdminStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TUTORIAL_ADMIN_STORAGE_KEY, JSON.stringify(store));
}

export function getAdminToursWithOverrides(): TutorialTour[] {
  const admin = readAdminStore();
  const disabled = new Set(admin.disabledTourIds ?? []);
  return getAllTours().map((t) => ({
    ...t,
    status: disabled.has(t.id) ? 'disabled' : t.status,
    steps: t.steps.map((s) => {
      const key = `${t.id}:${s.id}`;
      const o = admin.copyOverrides?.[key];
      if (!o) return s;
      return {
        ...s,
        title: o.title ?? s.title,
        body: o.body ?? s.body,
        benefit: o.benefit ?? s.benefit,
      };
    }),
  }));
}

export function setTourEnabledInAdmin(tourId: string, enabled: boolean): void {
  const admin = readAdminStore();
  const ids = new Set(admin.disabledTourIds ?? []);
  if (enabled) ids.delete(tourId);
  else ids.add(tourId);
  writeTutorialOsAdminStore({ ...admin, disabledTourIds: [...ids] });
}

export function buildTutorialOsAnalytics(): TutorialOsAnalyticsRow[] {
  const store = readTutorialProgressStore();
  return getAllTours().map((t) => {
    const progress = store.tours[t.id];
    const status = progress?.status ?? 'not_started';
    return {
      tourId: t.id,
      tourName: t.customerName,
      started: status === 'started' || status === 'in_progress' || status === 'completed' ? 1 : 0,
      completed: status === 'completed' ? 1 : 0,
      skipped: status === 'skipped' ? 1 : 0,
      dismissed: status === 'dismissed' ? 1 : 0,
      avgCompletionPct: progress?.completionPercentage ?? 0,
    };
  });
}

export function getTutorialOsMissingTargets() {
  return readMissingTargetLogs();
}

export function getTutorialOsAchievementsPreview() {
  const earned = new Set(readTutorialProgressStore().earnedAchievementIds);
  return TUTORIAL_ACHIEVEMENTS.map((a) => ({
    ...a,
    earned: earned.has(a.id),
  }));
}

export function adminPreviewTourUrl(tourId: string): string {
  return `/home/shop?tutorialPreview=${encodeURIComponent(tourId)}`;
}

export const TUTORIAL_OS_SECTIONS = [
  'Tours',
  'Steps',
  'Hotspots',
  'Completion Analytics',
  'Missing Targets',
  'Preview Tour',
] as const;

export type TutorialOsSection = (typeof TUTORIAL_OS_SECTIONS)[number];
