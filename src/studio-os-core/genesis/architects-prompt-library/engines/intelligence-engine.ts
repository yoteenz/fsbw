import { APL_QUALITY_DIMENSIONS } from '../constants';
import { readArchitectsPromptLibraryStore } from '../persistence';
import type {
  AplAnalyticsSnapshot,
  AplPlatformStats,
  AplQualityScore,
  AplRecommendation,
} from '../types';
import { listPromptTemplates } from '../bootstrap/seed';

export function getArchitectsPromptLibraryPlatformStats(): AplPlatformStats {
  const store = readArchitectsPromptLibraryStore();
  const active = listPromptTemplates();
  const validations = store.validations;
  const passed = validations.filter((v) => v.deliverablesComplete && v.buildPassed).length;

  return {
    promptCount: active.length,
    canonicalCount: active.filter((p) => p.canonical).length,
    collectionCount: store.collections.length,
    executionCount: store.executions.length,
    avgQualityScore:
      store.executions.length > 0
        ? Math.round(
            store.executions.reduce((sum, e) => sum + e.qualityScore, 0) / store.executions.length
          )
        : 0,
    relationshipCount: store.relationships.length,
    validationPassRate: validations.length > 0 ? Math.round((passed / validations.length) * 100) : 0,
    modelRecordCount: store.modelPerformance.length,
  };
}

export function buildAnalyticsSnapshot(): AplAnalyticsSnapshot {
  const store = readArchitectsPromptLibraryStore();
  const active = listPromptTemplates();
  const categoryCoverage: Record<string, number> = {};
  for (const p of active) {
    categoryCoverage[p.category] = (categoryCoverage[p.category] ?? 0) + 1;
  }

  const modelUsage: Record<string, number> = {};
  for (const e of store.executions) {
    modelUsage[e.model] = (modelUsage[e.model] ?? 0) + 1;
  }

  const staleThreshold = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const stalePromptCount = active.filter(
    (p) => new Date(p.lastUpdated).getTime() < staleThreshold && !p.canonical
  ).length;

  const titles = active.map((p) => p.officialName.toLowerCase());
  const duplicateRiskCount = titles.filter(
    (t, i) => titles.indexOf(t) !== i
  ).length;

  const conflictCount = store.relationships.filter(
    (r) => r.relationshipType === 'conflicts-with'
  ).length;

  const allCategories = new Set(active.map((p) => p.category));
  const expectedCategories = ['architecture', 'implementation', 'validation', 'platform-evolution'];
  const gapCount = expectedCategories.filter((c) => !allCategories.has(c as typeof active[0]['category'])).length;

  return {
    totalPrompts: active.length,
    canonicalCount: active.filter((p) => p.canonical).length,
    draftCount: active.filter((p) => p.lifecycleStage === 'draft').length,
    archivedCount: store.archivedPromptIds.length,
    executionCount: store.executions.length,
    avgQualityScore: getArchitectsPromptLibraryPlatformStats().avgQualityScore,
    categoryCoverage,
    modelUsage,
    stalePromptCount,
    duplicateRiskCount,
    conflictCount,
    gapCount,
  };
}

export function buildQualityScores(): AplQualityScore[] {
  const store = readArchitectsPromptLibraryStore();
  const now = new Date().toISOString();
  const avgExecutionQuality =
    store.executions.length > 0
      ? store.executions.reduce((s, e) => s + e.qualityScore, 0) / store.executions.length
      : 85;

  return APL_QUALITY_DIMENSIONS.map((dimension) => {
    const base = avgExecutionQuality;
    const variance = dimension.includes('architectural') ? 4 : dimension.includes('founder') ? -2 : 0;
    const score = Math.min(100, Math.max(60, Math.round(base + variance)));
    return {
      dimension,
      score,
      evidence: [`${store.executions.length} execution records`, `${store.validations.length} validations`],
      evaluatedAt: now,
    };
  });
}

export function buildAplOrbRecommendations(): AplRecommendation[] {
  const store = readArchitectsPromptLibraryStore();
  const active = listPromptTemplates();
  const recs: AplRecommendation[] = [];

  const inProgress = active.find((p) => p.promptId === 'apl-prompt-library-arch');
  if (inProgress) {
    recs.push({
      recommendationId: 'rec-apl-runtime',
      promptId: 'apl-prompt-library-arch',
      category: 'architecture',
      title: 'Complete Prompt Library runtime implementation',
      reason: 'Architecture approved — runtime is the next Launch Stack milestone.',
      confidence: 95,
      kind: 'use-prompt',
      orbCuratorNote:
        'This prompt created the architecture you are now implementing. Follow the Genesis submodule pattern from Evolution Room and Executive Reflection Suite.',
    });
  }

  const stale = active.filter(
    (p) => !p.canonical && p.lifecycleStage === 'draft'
  );
  for (const p of stale.slice(0, 2)) {
    recs.push({
      recommendationId: `rec-review-${p.promptId}`,
      promptId: p.promptId,
      title: `Review draft: ${p.officialName}`,
      reason: 'Draft prompts without execution history reduce institutional memory coverage.',
      confidence: 72,
      kind: 'improve-prompt',
      orbCuratorNote: 'Execute once, validate, then seek founder approval for canonization.',
    });
  }

  const gaps = ['marketing', 'simulation', 'automation'];
  for (const cat of gaps) {
    if (!active.some((p) => p.category === cat)) {
      recs.push({
        recommendationId: `rec-gap-${cat}`,
        category: cat as typeof active[0]['category'],
        title: `Fill ${cat} prompt coverage gap`,
        reason: `No canonical ${cat} prompts in the Library yet.`,
        confidence: 68,
        kind: 'fill-gap',
        orbCuratorNote: 'Institutional memory is incomplete without repeatable operating instructions for this domain.',
      });
    }
  }

  const bestModel = store.modelPerformance.sort(
    (a, b) => b.avgQualityScore - a.avgQualityScore
  )[0];
  if (bestModel) {
    recs.push({
      recommendationId: 'rec-model-arch',
      promptId: bestModel.promptId,
      title: `Use ${bestModel.model} for ${bestModel.category} prompts`,
      reason: `${bestModel.successRate}% success rate across ${bestModel.executionCount} executions.`,
      confidence: 88,
      kind: 'model-switch',
      orbCuratorNote: bestModel.strengths.join(' · '),
    });
  }

  return recs.slice(0, 8);
}

export function buildOrbCuratorBrief(selectedPromptId?: string): string {
  const store = readArchitectsPromptLibraryStore();
  const stats = getArchitectsPromptLibraryPlatformStats();
  const analytics = buildAnalyticsSnapshot();

  if (selectedPromptId) {
    const prompt = store.prompts.find((p) => p.promptId === selectedPromptId);
    if (prompt) {
      const execs = store.executions.filter((e) => e.promptId === selectedPromptId);
      const deps = store.dependencies.filter((d) => d.promptId === selectedPromptId && !d.satisfied);
      return `Orb Curator · ${prompt.officialName} · v${prompt.currentVersion} · ${execs.length} executions · ${deps.length} unsatisfied dependencies · recommended model: ${prompt.recommendedModel}`;
    }
  }

  return `Orb Curator · ${stats.promptCount} active prompts · ${stats.canonicalCount} canonical · ${analytics.gapCount} coverage gaps · avg quality ${stats.avgQualityScore}% · Librarian mode ${store.orbLibrarianMode ? 'on' : 'off'}`;
}
