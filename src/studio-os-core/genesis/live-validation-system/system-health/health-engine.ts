import {
  LVS_HEALTH_DIMENSIONS,
  LVS_TRACKING_METRICS,
  LVS_TRACKING_METRIC_LABELS,
  type LvsHealthDimension,
  type LvsTrackingMetricId,
} from '../constants';
import { listValidationRegistry } from '../../founder-acceptance-testing/validation/registry';
import { readLiveValidationSystemStore } from '../persistence';
import type { LvsSystemHealthScore, LvsTrackingMetricSnapshot } from '../types';

/** System Health Engine™ — per-system health scores */
export function listSystemHealthScores(): LvsSystemHealthScore[] {
  return [...readLiveValidationSystemStore().systemHealth].sort(
    (a, b) => b.overallHealth - a.overallHealth
  );
}

export function getSystemHealthScore(systemId: string): LvsSystemHealthScore | undefined {
  return readLiveValidationSystemStore().systemHealth.find((h) => h.systemId === systemId);
}

export function computeOverallSystemHealthAverage(): number {
  const scores = listSystemHealthScores();
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((s, h) => s + h.overallHealth, 0) / scores.length);
}

function dimensionFromRecord(
  systemId: string,
  dimension: LvsHealthDimension,
  base: number
): number {
  const store = readLiveValidationSystemStore();
  const escapes = store.escapeEvents.filter((e) => e.systemId === systemId).length;
  const adoption = store.adoptionReadings.find((r) => r.systemId === systemId);
  const value = store.valueReadings.find((r) => r.systemId === systemId);
  const confidence = store.confidenceReadings.find((r) => r.systemId === systemId);

  switch (dimension) {
    case 'usage':
      return Math.min(100, base + (adoption?.dailyActiveRate ?? 0) * 0.3);
    case 'adoption':
      return adoption?.habitScore ?? base - 5;
    case 'value':
      return value?.valueScore ?? base;
    case 'reliability':
      return Math.min(100, base + 8);
    case 'confidence':
      return confidence?.confidenceScore ?? base - 3;
    case 'replacement-likelihood':
      return Math.max(0, 100 - escapes * 8);
    case 'founder-dependency':
      return Math.min(100, (adoption?.voluntaryUsageRate ?? 50) + (value?.valueScore ?? 0) * 0.2);
    case 'learning-growth':
      return Math.min(100, base + (store.diaryAnswers.length > 0 ? 5 : 0));
    default:
      return base;
  }
}

export function buildSystemHealthScore(
  systemId: string,
  officialName: string,
  baseScore: number
): LvsSystemHealthScore {
  const dimensions = {} as Record<LvsHealthDimension, number>;
  for (const dim of LVS_HEALTH_DIMENSIONS) {
    dimensions[dim] = Math.round(dimensionFromRecord(systemId, dim, baseScore));
  }
  const overallHealth = Math.round(
    LVS_HEALTH_DIMENSIONS.reduce((sum, d) => sum + dimensions[d], 0) /
      LVS_HEALTH_DIMENSIONS.length
  );

  return {
    systemId,
    officialName,
    overallHealth,
    dimensions,
    trend: overallHealth >= 75 ? 'up' : overallHealth >= 60 ? 'flat' : 'down',
    lastEvaluatedAt: new Date().toISOString(),
    summary: healthSummary(overallHealth, dimensions),
  };
}

function healthSummary(
  overall: number,
  dimensions: Record<LvsHealthDimension, number>
): string {
  if (overall >= 80) return 'Strong founder dependency signal — system is becoming habitual.';
  if (dimensions['replacement-likelihood'] < 60)
    return 'Escape patterns suggest workflow gaps — investigate before graduation.';
  if (dimensions.adoption < 65) return 'Adoption is promising but not yet habit-forming.';
  return 'Health stable — continue accumulating operating evidence.';
}

import { mutateLiveValidationSystemStore } from '../persistence';

export function recomputeAllSystemHealth(): LvsSystemHealthScore[] {
  const fatRecords = listValidationRegistry().filter((r) => r.launchStackMilestone);

  const systemHealth = fatRecords.map((r) =>
    buildSystemHealthScore(r.systemId, r.officialName, r.founderAcceptanceScore || r.overallScore)
  );

  mutateLiveValidationSystemStore((store) => ({ ...store, systemHealth }));
  return systemHealth;
}

/** Live validation signal aggregation */
export function buildTrackingMetricSnapshots(): LvsTrackingMetricSnapshot[] {
  const store = readLiveValidationSystemStore();
  const now = new Date().toISOString();

  const heuristics: Partial<Record<LvsTrackingMetricId, { value: number; unit: LvsTrackingMetricSnapshot['unit'] }>> = {
    'daily-active-workflows': { value: 4, unit: 'count' },
    'tasks-completed': { value: 12, unit: 'count' },
    'mission-completion': { value: 68, unit: 'percent' },
    'tool-switching': { value: store.escapeEvents.length * 2, unit: 'count' },
    'context-switching': { value: 5, unit: 'count' },
    'time-saved': { value: 45, unit: 'minutes' },
    'knowledge-retrieval': { value: 74, unit: 'score' },
    'creative-output': { value: 3, unit: 'count' },
    'automation-usage': { value: 2, unit: 'count' },
    'decision-support': { value: 71, unit: 'score' },
    'founder-confidence': { value: 72, unit: 'score' },
    'founder-satisfaction': { value: 70, unit: 'score' },
    'stress-indicators': { value: 28, unit: 'score' },
    'flow-interruptions': { value: 3, unit: 'count' },
  };

  return LVS_TRACKING_METRICS.map((metricId) => {
    const h = heuristics[metricId] ?? { value: 50, unit: 'score' as const };
    return {
      metricId,
      label: LVS_TRACKING_METRIC_LABELS[metricId],
      value: h.value,
      unit: h.unit,
      trend: h.value >= 70 ? 'up' : h.value <= 40 ? 'down' : 'flat',
      period: 'daily' as const,
      lastUpdatedAt: now,
    };
  });
}

export function listValidationSignals(limit = 100) {
  return [...readLiveValidationSystemStore().signals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
