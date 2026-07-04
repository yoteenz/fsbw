import type { ManualModuleProgress, ManualProgressStore } from './types';
import { STUDIO_MANUAL_PROGRESS_KEY } from './constants';
import { getAllManualModules, getManualSteps } from './registry';

function emptyStore(): ManualProgressStore {
  return {
    version: 2,
    modules: {},
    completedModuleIds: [],
    completedFeatureIds: [],
    completedWidgetIds: [],
    completedWorkflowIds: [],
    recentlyLearned: [],
    visitedGraphNodeIds: [],
    manualChaptersViewed: [],
    workflowsLearned: [],
  };
}

export function readManualProgressStore(): ManualProgressStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STUDIO_MANUAL_PROGRESS_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<ManualProgressStore> & { version?: number };
    return {
      version: 2,
      modules: parsed.modules ?? {},
      completedModuleIds: parsed.completedModuleIds ?? [],
      completedFeatureIds: parsed.completedFeatureIds ?? [],
      completedWidgetIds: parsed.completedWidgetIds ?? [],
      completedWorkflowIds: parsed.completedWorkflowIds ?? [],
      recentlyLearned: parsed.recentlyLearned ?? [],
      resumeModuleId: parsed.resumeModuleId,
      resumeStepIndex: parsed.resumeStepIndex,
      overallKnowledgePct: parsed.overallKnowledgePct,
      visitedGraphNodeIds: parsed.visitedGraphNodeIds ?? [],
      manualChaptersViewed: parsed.manualChaptersViewed ?? [],
      workflowsLearned: parsed.workflowsLearned ?? parsed.completedWorkflowIds ?? [],
    };
  } catch {
    return emptyStore();
  }
}

export function writeManualProgressStore(store: ManualProgressStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STUDIO_MANUAL_PROGRESS_KEY, JSON.stringify(store));
}

export function computeModuleCompletionPct(moduleId: string, completedStepIds: string[]): number {
  const steps = getManualSteps(moduleId);
  if (steps.length === 0) return 0;
  return Math.round((completedStepIds.length / steps.length) * 100);
}

export function upsertModuleProgress(
  moduleId: string,
  patch: Partial<ManualModuleProgress>
): ManualModuleProgress {
  const store = readManualProgressStore();
  const existing = store.modules[moduleId];
  const now = new Date().toISOString();
  const completedStepIds = patch.completedStepIds ?? existing?.completedStepIds ?? [];
  const next: ManualModuleProgress = {
    moduleId,
    status: patch.status ?? existing?.status ?? 'not_started',
    lastStepId: patch.lastStepId ?? existing?.lastStepId,
    lastStepIndex: patch.lastStepIndex ?? existing?.lastStepIndex ?? -1,
    completedStepIds,
    completionPercentage: computeModuleCompletionPct(moduleId, completedStepIds),
    startedAt: patch.startedAt ?? existing?.startedAt,
    completedAt: patch.completedAt ?? existing?.completedAt,
    updatedAt: now,
  };
  store.modules[moduleId] = next;
  recomputeOverallKnowledge(store);
  writeManualProgressStore(store);
  return next;
}

function recomputeOverallKnowledge(store: ManualProgressStore): void {
  const allModules = getAllManualModules();
  if (allModules.length === 0) {
    store.overallKnowledgePct = 0;
    return;
  }
  const completed = store.completedModuleIds.length;
  const partial = Object.values(store.modules).reduce((sum, m) => sum + m.completionPercentage, 0);
  store.overallKnowledgePct = Math.min(
    100,
    Math.round((completed * 100 + partial) / (allModules.length * 100) * 100)
  );
}

export function markManualNodeCompleted(step: {
  moduleId: string;
  id: string;
  sectionId?: string;
  widgetId?: string;
  nodeKind?: string;
}): void {
  const store = readManualProgressStore();
  if (step.sectionId) {
    const set = new Set(store.completedFeatureIds);
    set.add(`${step.moduleId}:${step.sectionId}`);
    store.completedFeatureIds = [...set];
  }
  if (step.widgetId) {
    const set = new Set(store.completedWidgetIds);
    set.add(`${step.moduleId}:${step.widgetId}`);
    store.completedWidgetIds = [...set];
  }
  if (step.nodeKind === 'workflow') {
    const set = new Set(store.completedWorkflowIds);
    set.add(`${step.moduleId}:${step.id}`);
    store.completedWorkflowIds = [...set];
  }
  store.recentlyLearned = [step.id, ...store.recentlyLearned.filter((id) => id !== step.id)].slice(0, 16);
  recomputeOverallKnowledge(store);
  writeManualProgressStore(store);
}

export function markModuleCompleted(moduleId: string): void {
  const store = readManualProgressStore();
  if (!store.completedModuleIds.includes(moduleId)) {
    store.completedModuleIds = [...store.completedModuleIds, moduleId];
  }
  const existing = store.modules[moduleId];
  const now = new Date().toISOString();
  store.modules[moduleId] = {
    moduleId,
    status: 'completed',
    lastStepId: existing?.lastStepId,
    lastStepIndex: existing?.lastStepIndex ?? -1,
    completedStepIds: existing?.completedStepIds ?? [],
    completionPercentage: 100,
    startedAt: existing?.startedAt,
    completedAt: now,
    updatedAt: now,
  };
  recomputeOverallKnowledge(store);
  writeManualProgressStore(store);
}

export function saveManualResume(moduleId: string, stepIndex: number): void {
  const store = readManualProgressStore();
  store.resumeModuleId = moduleId;
  store.resumeStepIndex = stepIndex;
  writeManualProgressStore(store);
}

export function clearManualResume(): void {
  const store = readManualProgressStore();
  store.resumeModuleId = undefined;
  store.resumeStepIndex = undefined;
  writeManualProgressStore(store);
}

export function markGraphNodeVisited(nodeId: string): void {
  const store = readManualProgressStore();
  const ids = new Set(store.visitedGraphNodeIds ?? []);
  ids.add(nodeId);
  store.visitedGraphNodeIds = [...ids];
  recomputeOverallKnowledge(store);
  writeManualProgressStore(store);
}

export function markManualChapterViewed(chapter: string): void {
  const store = readManualProgressStore();
  const ids = new Set(store.manualChaptersViewed ?? []);
  ids.add(chapter);
  store.manualChaptersViewed = [...ids];
  writeManualProgressStore(store);
}

export function markWorkflowLearned(workflowId: string): void {
  const store = readManualProgressStore();
  const ids = new Set(store.workflowsLearned ?? store.completedWorkflowIds ?? []);
  ids.add(workflowId);
  store.workflowsLearned = [...ids];
  store.completedWorkflowIds = [...new Set([...store.completedWorkflowIds, workflowId])];
  writeManualProgressStore(store);
}

export function getManualProgressSummary() {
  const store = readManualProgressStore();
  return {
    modulesLearned: store.completedModuleIds.length,
    featuresLearned: store.completedFeatureIds.length,
    widgetsLearned: store.completedWidgetIds.length,
    workflowsCompleted: store.workflowsLearned?.length ?? store.completedWorkflowIds.length,
    graphNodesVisited: store.visitedGraphNodeIds?.length ?? 0,
    manualChaptersViewed: store.manualChaptersViewed?.length ?? 0,
    overallKnowledgePct: store.overallKnowledgePct ?? 0,
    recentlyLearned: store.recentlyLearned,
    resumeModuleId: store.resumeModuleId,
    resumeStepIndex: store.resumeStepIndex,
  };
}
