/**
 * Learning Engine — generate insights from experiment data, not raw metrics.
 */

import type { Experiment, LearningInsight } from './types';

function insightId(): string {
  return `learn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function generateLearningsFromExperiments(
  workspaceId: string,
  experiments: Experiment[]
): LearningInsight[] {
  const completed = experiments.filter(
    (e) => e.workspaceId === workspaceId && e.metrics.views > 0 && e.status !== 'archived'
  );
  if (completed.length < 2) return [];

  const insights: LearningInsight[] = [];
  const now = new Date().toISOString();

  const avgDuration =
    completed.reduce((s, e) => s + e.variables.videoDurationSec, 0) / completed.length;
  const bestDuration = completed
    .filter((e) => e.metrics.completionRate > 0.5)
    .sort((a, b) => b.metrics.completionRate - a.metrics.completionRate)[0];
  if (bestDuration && bestDuration.variables.videoDurationSec > 0) {
    const lo = Math.max(0, bestDuration.variables.videoDurationSec - 8);
    const hi = bestDuration.variables.videoDurationSec + 8;
    insights.push({
      id: insightId(),
      workspaceId,
      experimentIds: [bestDuration.id],
      category: 'length',
      insight: `Videos between ${lo}–${hi} seconds performed best for completion rate (${Math.round(bestDuration.metrics.completionRate * 100)}%).`,
      confidence: 0.78,
      deltaPercent: Math.round((bestDuration.metrics.completionRate - 0.5) * 100),
      generatedAt: now,
      promotedToMemory: false,
    });
  }

  const questionHooks = completed.filter((e) => e.variables.hook.includes('?'));
  const statementHooks = completed.filter((e) => !e.variables.hook.includes('?'));
  if (questionHooks.length > 0 && statementHooks.length > 0) {
    const qAvg =
      questionHooks.reduce((s, e) => s + e.metrics.averageViewDurationSec, 0) / questionHooks.length;
    const sAvg =
      statementHooks.reduce((s, e) => s + e.metrics.averageViewDurationSec, 0) / statementHooks.length;
    if (qAvg > sAvg * 1.05) {
      const delta = Math.round(((qAvg - sAvg) / sAvg) * 100);
      insights.push({
        id: insightId(),
        workspaceId,
        experimentIds: [...questionHooks.slice(0, 2), ...statementHooks.slice(0, 2)].map((e) => e.id),
        category: 'hook',
        insight: `Questions outperformed statements by ${delta}% on average watch time.`,
        confidence: 0.82,
        deltaPercent: delta,
        generatedAt: now,
        promotedToMemory: false,
      });
    }
  }

  const byPillar = new Map<string, Experiment[]>();
  for (const e of completed) {
    const p = e.variables.pillar;
    if (!byPillar.has(p)) byPillar.set(p, []);
    byPillar.get(p)!.push(e);
  }
  for (const [pillar, exps] of byPillar) {
    const avgWatch =
      exps.reduce((s, e) => s + e.metrics.averageViewDurationSec, 0) / exps.length;
    const avgRev = exps.reduce((s, e) => s + e.metrics.revenue, 0) / exps.length;
    if (avgWatch > 25) {
      insights.push({
        id: insightId(),
        workspaceId,
        experimentIds: exps.map((e) => e.id),
        category: 'pillar',
        insight: `${pillar.toUpperCase()} content averaged ${Math.round(avgWatch)}s watch time across ${exps.length} experiments.`,
        confidence: 0.75,
        generatedAt: now,
        promotedToMemory: false,
      });
    }
    if (avgRev > 50) {
      insights.push({
        id: insightId(),
        workspaceId,
        experimentIds: exps.map((e) => e.id),
        category: 'revenue',
        insight: `${pillar.toUpperCase()} generated the highest affiliate revenue ($${Math.round(avgRev)} avg per experiment).`,
        confidence: 0.8,
        generatedAt: now,
        promotedToMemory: false,
      });
    }
  }

  const withThumb = completed.filter((e) => e.thumbnailIntel && e.thumbnailIntel.ctr > 0);
  if (withThumb.length >= 2) {
    const best = [...withThumb].sort((a, b) => (b.thumbnailIntel!.ctr - a.thumbnailIntel!.ctr))[0];
    const avgCtr =
      withThumb.reduce((s, e) => s + e.thumbnailIntel!.ctr, 0) / withThumb.length;
    const delta = Math.round(((best.thumbnailIntel!.ctr - avgCtr) / avgCtr) * 100);
    if (delta > 10) {
      insights.push({
        id: insightId(),
        workspaceId,
        experimentIds: [best.id],
        category: 'thumbnail',
        insight: `This thumbnail style (${best.thumbnailIntel!.composition}) increased CTR by ${delta}%.`,
        confidence: 0.85,
        deltaPercent: delta,
        generatedAt: now,
        promotedToMemory: false,
      });
    }
  }

  if (avgDuration > 0 && insights.length === 0) {
    insights.push({
      id: insightId(),
      workspaceId,
      experimentIds: completed.slice(0, 3).map((e) => e.id),
      category: 'general',
      insight: `Collecting baseline across ${completed.length} experiments — more data needed for high-confidence patterns.`,
      confidence: 0.5,
      generatedAt: now,
      promotedToMemory: false,
    });
  }

  return insights;
}

export function extractInstitutionalMemory(learnings: LearningInsight[]): string[] {
  return learnings
    .filter((l) => l.confidence >= 0.75 && !l.promotedToMemory)
    .map((l) => l.insight);
}
