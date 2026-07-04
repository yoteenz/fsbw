/**
 * Recommendation Engine — suggestions backed by experiment history.
 */

import type { Experiment, HookRecord, LabsRecommendation } from './types';

function recId(): string {
  return `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildRecommendations(
  workspaceId: string,
  experiments: Experiment[],
  hooks: HookRecord[]
): LabsRecommendation[] {
  const wsExps = experiments.filter((e) => e.workspaceId === workspaceId && e.metrics.views > 0);
  if (wsExps.length === 0) return [];

  const now = new Date().toISOString();
  const recs: LabsRecommendation[] = [];

  const topHook = [...hooks]
    .filter((h) => h.workspaceId === workspaceId)
    .sort((a, b) => b.successScore - a.successScore)[0];
  if (topHook) {
    recs.push({
      id: recId(),
      workspaceId,
      category: 'hook',
      recommendation: `Use hook template "${topHook.template.slice(0, 60)}…" — success score ${topHook.successScore} from ${topHook.timesUsed} experiments.`,
      basedOnExperimentIds: topHook.experimentIds.slice(0, 5),
      confidence: 0.88,
      generatedAt: now,
    });
  }

  const byPlatform = new Map<string, { rev: number; count: number; ids: string[] }>();
  for (const e of wsExps) {
    const p = e.variables.publishingPlatform;
    const cur = byPlatform.get(p) ?? { rev: 0, count: 0, ids: [] };
    cur.rev += e.metrics.revenue;
    cur.count += 1;
    cur.ids.push(e.id);
    byPlatform.set(p, cur);
  }
  const bestPlatform = [...byPlatform.entries()].sort((a, b) => b[1].rev - a[1].rev)[0];
  if (bestPlatform) {
    recs.push({
      id: recId(),
      workspaceId,
      category: 'platform',
      recommendation: `Prioritize ${bestPlatform[0].replace(/-/g, ' ').toUpperCase()} — highest revenue across ${bestPlatform[1].count} experiments.`,
      basedOnExperimentIds: bestPlatform[1].ids.slice(0, 5),
      confidence: 0.8,
      generatedAt: now,
    });
  }

  const byTime = new Map<string, number>();
  for (const e of wsExps) {
    const hour = e.variables.publishTime.slice(0, 2);
    byTime.set(hour, (byTime.get(hour) ?? 0) + e.metrics.engagementRate);
  }
  const bestHour = [...byTime.entries()].sort((a, b) => b[1] - a[1])[0];
  if (bestHour) {
    recs.push({
      id: recId(),
      workspaceId,
      category: 'posting-time',
      recommendation: `Best posting window: ${bestHour[0]}:00 local — highest cumulative engagement rate.`,
      basedOnExperimentIds: wsExps.filter((e) => e.variables.publishTime.startsWith(bestHour[0])).map((e) => e.id).slice(0, 5),
      confidence: 0.72,
      generatedAt: now,
    });
  }

  const bestLength = [...wsExps].sort((a, b) => b.metrics.completionRate - a.metrics.completionRate)[0];
  if (bestLength) {
    recs.push({
      id: recId(),
      workspaceId,
      category: 'length',
      recommendation: `Target ${bestLength.variables.videoDurationSec}s duration — top completion rate (${Math.round(bestLength.metrics.completionRate * 100)}%).`,
      basedOnExperimentIds: [bestLength.id],
      confidence: 0.76,
      generatedAt: now,
    });
  }

  const pillarCounts = new Map<string, number>();
  for (const e of wsExps) {
    pillarCounts.set(e.variables.pillar, (pillarCounts.get(e.variables.pillar) ?? 0) + 1);
  }
  const underused = [...pillarCounts.entries()].sort((a, b) => a[1] - b[1])[0];
  if (underused) {
    recs.push({
      id: recId(),
      workspaceId,
      category: 'topic',
      recommendation: `Expand ${underused[0].toUpperCase()} pillar — under-tested relative to other pillars (${underused[1]} experiments).`,
      basedOnExperimentIds: wsExps.filter((e) => e.variables.pillar === underused[0]).map((e) => e.id),
      confidence: 0.65,
      generatedAt: now,
    });
  }

  return recs;
}
