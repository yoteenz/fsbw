import { LABS_STORAGE_KEY, LABS_VERSION } from './constants';
import { refreshBenchmarks } from './benchmarkEngine';
import {
  aggregateCaptionIntel,
  aggregateHookLibrary,
  aggregatePillarIntel,
  aggregateSeriesIntel,
} from './intelligenceAggregator';
import { extractInstitutionalMemory, generateLearningsFromExperiments } from './learningEngine';
import { buildRecommendations } from './recommendationEngine';
import { suggestPromotions } from './promotionPipeline';
import type { Experiment, LabsStore, PublishAssetInput } from './types';
import { createExperimentFromPublish } from './experimentEngine';

function emptyStore(): LabsStore {
  return {
    experiments: [],
    learnings: [],
    hooks: [],
    captions: [],
    series: [],
    pillars: [],
    benchmarks: [],
    promotions: [],
    recommendations: [],
    institutionalMemory: [],
    version: LABS_VERSION,
  };
}

export function readLabsStore(): LabsStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(LABS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as LabsStore;
    return { ...emptyStore(), ...parsed, version: LABS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeLabsStore(store: LabsStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(store));
}

export function getExperimentsForWorkspace(workspaceId: string): Experiment[] {
  return readLabsStore().experiments.filter((e) => e.workspaceId === workspaceId);
}

export function upsertExperiment(experiment: Experiment): void {
  const store = readLabsStore();
  const idx = store.experiments.findIndex((e) => e.id === experiment.id);
  const experiments =
    idx >= 0
      ? store.experiments.map((e, i) => (i === idx ? experiment : e))
      : [...store.experiments, experiment];
  writeLabsStore({ ...store, experiments });
}

/** Register experiment when asset is published — core Experiment Engine hook. */
export function registerPublishedAsset(input: PublishAssetInput): Experiment {
  const experiment = createExperimentFromPublish(input);
  upsertExperiment(experiment);
  syncLabsIntelligence(input.workspaceId);
  return experiment;
}

export function mergeLabsStorePatch(patch: Partial<LabsStore>): void {
  const store = readLabsStore();
  writeLabsStore({ ...store, ...patch, version: LABS_VERSION });
}

/** Recompute learnings, hooks, benchmarks, recommendations for a workspace. */
export function syncLabsIntelligence(workspaceId: string): void {
  const store = readLabsStore();
  const experiments = store.experiments;

  const learnings = generateLearningsFromExperiments(workspaceId, experiments);
  const existingLearningIds = new Set(store.learnings.map((l) => l.id));
  const mergedLearnings = [
    ...store.learnings.filter((l) => l.workspaceId !== workspaceId),
    ...learnings.filter((l) => !existingLearningIds.has(l.id)),
    ...store.learnings.filter((l) => l.workspaceId === workspaceId && l.promotedToMemory),
  ];

  const hooks = aggregateHookLibrary(workspaceId, experiments);
  const series = aggregateSeriesIntel(workspaceId, experiments);
  const pillars = aggregatePillarIntel(workspaceId, experiments);
  const captions = aggregateCaptionIntel(workspaceId, experiments);
  const benchmarks = refreshBenchmarks(workspaceId, experiments, store.benchmarks);
  const recommendations = buildRecommendations(workspaceId, experiments, hooks);
  const institutionalMemory = extractInstitutionalMemory(mergedLearnings.filter((l) => l.workspaceId === workspaceId));

  const existingPromoIds = new Set(store.promotions.map((p) => p.learningId));
  const newPromos = suggestPromotions(workspaceId, mergedLearnings).filter((p) => !existingPromoIds.has(p.learningId));

  writeLabsStore({
    ...store,
    learnings: mergedLearnings,
    hooks: [...store.hooks.filter((h) => h.workspaceId !== workspaceId), ...hooks],
    series: [...store.series.filter((s) => s.workspaceId !== workspaceId), ...series],
    pillars: [...store.pillars.filter((p) => p.workspaceId !== workspaceId), ...pillars],
    captions: [...store.captions.filter((c) => c.workspaceId !== workspaceId), ...captions],
    benchmarks,
    recommendations: [...store.recommendations.filter((r) => r.workspaceId !== workspaceId), ...recommendations],
    promotions: [...store.promotions, ...newPromos],
    institutionalMemory: [...new Set([...store.institutionalMemory, ...institutionalMemory])],
  });
}

export function bootstrapLabsStore(): LabsStore {
  return readLabsStore();
}
