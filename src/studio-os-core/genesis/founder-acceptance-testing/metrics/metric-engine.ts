import { FAT_METRIC_IDS, FAT_METRIC_LABELS, type FatMetricId } from '../constants';
import { getValidationRecord, listLaunchStackValidationRecords } from '../validation/registry';
import type { FatMetricSnapshot, FatMetricTrendPoint } from '../types';

function trendFromScore(score: number): 'up' | 'down' | 'flat' {
  if (score >= 80) return 'up';
  if (score <= 55) return 'down';
  return 'flat';
}

/** Metric Engine™ — aggregates founder validation metrics across systems */
export function computeMetricSnapshotsForRecord(
  systemId: string,
  overrides?: Partial<Record<FatMetricId, number>>
): FatMetricSnapshot[] {
  const record = getValidationRecord(systemId);
  const timestamp = record?.updatedAt ?? new Date().toISOString();

  return FAT_METRIC_IDS.map((metricId) => {
    const existing = record?.metrics.find((m) => m.metricId === metricId);
    const baseScore =
      overrides?.[metricId] ??
      existing?.score ??
      heuristicMetricScore(systemId, metricId);

    return {
      metricId,
      label: FAT_METRIC_LABELS[metricId],
      score: baseScore,
      trend: existing?.trend ?? trendFromScore(baseScore),
      evidenceCount: existing?.evidenceCount ?? (record?.evidence.length ?? 0),
      lastUpdatedAt: existing?.lastUpdatedAt ?? timestamp,
      note: existing?.note ?? metricNote(baseScore),
    };
  });
}

function heuristicMetricScore(systemId: string, metricId: FatMetricId): number {
  const record = getValidationRecord(systemId);
  const impl = record?.gates.find((g) => g.level === 'implementation');
  const base = record?.founderAcceptanceScore ?? impl?.score ?? 50;

  const boosts: Partial<Record<FatMetricId, number>> = {
    'daily-usage': systemId === 'orb' ? 72 : systemId === 'executive-headquarters' ? 68 : base - 5,
    'time-saved': systemId === 'orb' ? 78 : base,
    'tool-replacement': record?.replacementTest.passed ? 82 : 58,
    'task-completion': impl?.status === 'accepted' ? 76 : 62,
    'automation-success': 70,
    'knowledge-retrieval': systemId === 'orb' ? 74 : 65,
    'creative-output': 68,
    'stress-score': record?.withdrawalTest.passed ? 80 : 55,
    'focus-score': 72,
    'confidence-score': record?.delight.present ? 78 : 60,
    reliability: impl?.status === 'accepted' ? 85 : 70,
    'founder-satisfaction': base,
  };

  return Math.min(100, Math.max(0, Math.round(boosts[metricId] ?? base)));
}

function metricNote(score: number): string {
  if (score >= 75) return 'Strong founder signal — accumulating evidence';
  if (score >= 60) return 'Promising — repeat usage sessions needed';
  return 'Insufficient founder evidence — validation pending';
}

export function aggregatePlatformMetricTrends(): FatMetricTrendPoint[] {
  const records = listLaunchStackValidationRecords();
  const now = new Date();

  return FAT_METRIC_IDS.map((metricId) => {
    const snapshots = records.flatMap((r) =>
      r.metrics.filter((m) => m.metricId === metricId)
    );
    const currentScore =
      snapshots.length > 0
        ? Math.round(snapshots.reduce((sum, s) => sum + s.score, 0) / snapshots.length)
        : heuristicMetricScore('platform', metricId);

    const points = [30, 14, 7, 0].map((daysAgo) => {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      const drift = daysAgo * 0.4;
      return {
        date: date.toISOString().slice(0, 10),
        score: Math.min(100, Math.max(0, Math.round(currentScore - drift))),
      };
    });

    return {
      metricId,
      label: FAT_METRIC_LABELS[metricId],
      points,
      currentScore,
      delta30d: points[0].score - points[3].score,
    };
  });
}

export function computeOverallScoreFromMetrics(metrics: FatMetricSnapshot[]): number {
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, m) => sum + m.score, 0);
  return Math.round(total / metrics.length);
}
