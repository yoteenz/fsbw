import type { TutorialStep } from '../types';
import { readTutorialProgressStore, writeTutorialProgressStore } from '../progressStorage';

export function markTutorialNodeCompleted(step: TutorialStep): void {
  const store = readTutorialProgressStore();
  if (step.pageId) {
    const pages = new Set(store.completedPageIds ?? []);
    pages.add(step.pageId);
    store.completedPageIds = [...pages];
  }
  if (step.featureId) {
    const features = new Set(store.completedFeatureIds ?? []);
    features.add(step.featureId);
    store.completedFeatureIds = [...features];
  }
  if (step.widgetId) {
    const widgets = new Set(store.completedWidgetIds ?? []);
    widgets.add(step.widgetId);
    store.completedWidgetIds = [...widgets];
  }
  const recent = [step.id, ...(store.recentlyLearned ?? [])].slice(0, 12);
  store.recentlyLearned = [...new Set(recent)];
  writeTutorialProgressStore(store);
}

export function getTutorialCompletionSummary(): {
  pages: number;
  features: number;
  widgets: number;
  toursCompleted: number;
  percent: number;
} {
  const store = readTutorialProgressStore();
  const tourEntries = Object.values(store.tours);
  const completedTours = tourEntries.filter((t) => t.status === 'completed').length;
  const totalSteps = tourEntries.reduce((sum, t) => sum + t.completedStepIds.length, 0);
  const pages = store.completedPageIds?.length ?? 0;
  const features = store.completedFeatureIds?.length ?? 0;
  const widgets = store.completedWidgetIds?.length ?? 0;
  const denom = Math.max(pages + features + widgets + totalSteps, 1);
  const numer = pages + features + widgets + totalSteps;
  return {
    pages,
    features,
    widgets,
    toursCompleted: completedTours,
    percent: Math.min(100, Math.round((numer / denom) * 100)),
  };
}
