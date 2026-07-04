import type { TutorialTour } from '../tutorial-os/types';
import { getAllTours } from '../tutorial-os/registry';
import { readMissingTargetLogs, readTutorialProgressStore } from '../tutorial-os/progressStorage';
import { TUTORIAL_ACHIEVEMENTS } from '../tutorial-os/achievements';
import { TUTORIAL_ADMIN_STORAGE_KEY } from '../tutorial-os/constants';
import { TUTORIAL_PAGE_REGISTRY } from '../tutorial-os/v2/pageRegistry';
import { buildTutorialSearchIndex } from '../tutorial-os/v2/searchIndex';
import { getTutorialCompletionSummary } from '../tutorial-os/v2/progressHelpers';

export const TUTORIAL_OS_SUBTITLE =
  'Interactive onboarding tutorials — guided panels, hotspots, and mansion tours for every Frontal Slayer feature.';

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

export type TutorialOsFeatureRow = {
  id: string;
  title: string;
  tourId: string;
  nestedTourId?: string;
  pageId?: string;
};

export type TutorialOsWidgetRow = {
  id: string;
  title: string;
  tourId: string;
  stepId: string;
  targetSelector?: string;
  animationType: string;
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

export function getTutorialOsPages() {
  return [...TUTORIAL_PAGE_REGISTRY];
}

export function getTutorialOsFeatures(): TutorialOsFeatureRow[] {
  const rows: TutorialOsFeatureRow[] = [];
  for (const tour of getAllTours()) {
    for (const step of tour.steps) {
      if (step.featureCards) {
        for (const card of step.featureCards) {
          rows.push({
            id: card.id,
            title: card.title,
            tourId: tour.id,
            nestedTourId: card.nestedTourId,
            pageId: step.pageId,
          });
        }
      }
      if (step.featureId) {
        rows.push({
          id: `${tour.id}:${step.featureId}`,
          title: step.title,
          tourId: tour.id,
          pageId: step.pageId,
        });
      }
    }
  }
  return rows;
}

export function getTutorialOsWidgets(): TutorialOsWidgetRow[] {
  const rows: TutorialOsWidgetRow[] = [];
  for (const tour of getAllTours()) {
    for (const step of tour.steps) {
      if (step.widgetId || step.nodeKind === 'widget') {
        rows.push({
          id: step.widgetId ?? step.id,
          title: step.title,
          tourId: tour.id,
          stepId: step.id,
          targetSelector: step.targetSelector,
          animationType: step.animationType,
        });
      }
    }
  }
  return rows;
}

export function getTutorialOsAnimations(): Array<{ animationType: string; count: number }> {
  const counts = new Map<string, number>();
  for (const tour of getAllTours()) {
    for (const step of tour.steps) {
      counts.set(step.animationType, (counts.get(step.animationType) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([animationType, count]) => ({ animationType, count }));
}

export function getTutorialOsSearchIndexPreview() {
  return buildTutorialSearchIndex();
}

export function getTutorialOsUserProgress() {
  const store = readTutorialProgressStore();
  const summary = getTutorialCompletionSummary();
  return {
    ...summary,
    completedPageIds: store.completedPageIds ?? [],
    completedFeatureIds: store.completedFeatureIds ?? [],
    completedWidgetIds: store.completedWidgetIds ?? [],
    recentlyLearned: store.recentlyLearned ?? [],
    suggestedNextTutorialId: store.suggestedNextTutorialId,
  };
}

export function getTutorialOsRouteValidation(): Array<{ pageId: string; route: string; hasHelpTour: boolean }> {
  return TUTORIAL_PAGE_REGISTRY.map((p) => ({
    pageId: p.id,
    route: p.route,
    hasHelpTour: Boolean(p.helpTourId),
  }));
}

export function getTutorialOsCopyLibrary(): Array<{ key: string; title: string; body: string; benefit: string }> {
  const admin = readAdminStore();
  const rows: Array<{ key: string; title: string; body: string; benefit: string }> = [];
  for (const tour of getAllTours()) {
    for (const step of tour.steps) {
      const key = `${tour.id}:${step.id}`;
      const override = admin.copyOverrides?.[key];
      rows.push({
        key,
        title: override?.title ?? step.title,
        body: override?.body ?? step.body,
        benefit: override?.benefit ?? step.benefit,
      });
    }
  }
  return rows;
}

export const TUTORIAL_OS_SECTIONS = [
  'Tours',
  'Pages',
  'Features',
  'Widgets',
  'Animations',
  'Hotspots',
  'Search Index',
  'Completion Analytics',
  'User Progress',
  'Missing Targets',
  'Route Validation',
  'Copy Library',
  'Preview Tour',
] as const;

export type TutorialOsSection = (typeof TUTORIAL_OS_SECTIONS)[number];
