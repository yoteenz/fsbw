/**
 * Benchmark Engine — track and update platform records from experiments.
 */

import type { BenchmarkRecord, Experiment } from './types';

function benchId(): string {
  return `bench-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

type BenchmarkCandidate = {
  category: BenchmarkRecord['category'];
  label: string;
  value: number;
  unit: string;
  experimentId: string;
};

function candidatesFromExperiment(e: Experiment): BenchmarkCandidate[] {
  const m = e.metrics;
  const out: BenchmarkCandidate[] = [];
  if (m.completionRate > 0) {
    out.push({
      category: 'retention',
      label: 'Highest retention',
      value: m.completionRate,
      unit: '%',
      experimentId: e.id,
    });
  }
  if (e.thumbnailIntel?.ctr) {
    out.push({
      category: 'ctr',
      label: 'Highest CTR',
      value: e.thumbnailIntel.ctr,
      unit: '%',
      experimentId: e.id,
    });
  }
  if (m.revenue > 0) {
    out.push({
      category: 'revenue',
      label: 'Highest revenue',
      value: m.revenue,
      unit: 'USD',
      experimentId: e.id,
    });
  }
  if (m.conversionRate > 0) {
    out.push({
      category: 'affiliate-conversion',
      label: 'Highest affiliate conversion',
      value: m.conversionRate,
      unit: '%',
      experimentId: e.id,
    });
  }
  if (m.engagementRate > 0) {
    out.push({
      category: 'engagement',
      label: 'Highest engagement',
      value: m.engagementRate,
      unit: '%',
      experimentId: e.id,
    });
  }
  if (m.averageViewDurationSec > 0) {
    out.push({
      category: 'watch-time',
      label: 'Highest watch time',
      value: m.averageViewDurationSec,
      unit: 'sec',
      experimentId: e.id,
    });
  }
  if (m.platformRpm > 0) {
    out.push({
      category: 'rpm',
      label: 'Highest RPM',
      value: m.platformRpm,
      unit: 'USD',
      experimentId: e.id,
    });
  }
  return out;
}

export function refreshBenchmarks(
  workspaceId: string,
  experiments: Experiment[],
  existing: BenchmarkRecord[]
): BenchmarkRecord[] {
  const wsExps = experiments.filter((e) => e.workspaceId === workspaceId);
  const byCategory = new Map<string, BenchmarkRecord>();
  for (const b of existing.filter((x) => x.workspaceId === workspaceId)) {
    byCategory.set(b.category, b);
  }

  for (const e of wsExps) {
    for (const c of candidatesFromExperiment(e)) {
      const prev = byCategory.get(c.category);
      if (!prev || c.value > prev.value) {
        byCategory.set(c.category, {
          id: prev?.id ?? benchId(),
          workspaceId,
          category: c.category,
          label: c.label,
          value: c.value,
          unit: c.unit,
          experimentId: c.experimentId,
          setAt: new Date().toISOString(),
        });
      }
    }
  }

  const other = existing.filter((b) => b.workspaceId !== workspaceId);
  return [...other, ...byCategory.values()];
}

export function formatBenchmarkValue(b: BenchmarkRecord): string {
  if (b.unit === '%') return `${Math.round(b.value * (b.value <= 1 ? 100 : 1))}%`;
  if (b.unit === 'USD') return `$${b.value.toFixed(2)}`;
  return `${Math.round(b.value)} ${b.unit}`;
}
