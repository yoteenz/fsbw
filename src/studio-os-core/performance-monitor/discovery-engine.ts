import type { OrganizationPerformanceMonitorProfile } from './types';

export function queryPerformanceMonitor(
  query: string,
  profile: OrganizationPerformanceMonitorProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const b of profile.bottlenecks) {
    const hay = `${b.description} ${b.bottleneckLabel} ${b.moduleLabel}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'bottleneck' as const,
        id: b.id,
        label: b.bottleneckLabel,
        score: b.severity === 'critical' ? 95 : b.severity === 'warning' ? 80 : 65,
        matchReason: `${b.moduleLabel} · ${b.measuredValue}`,
      });
    }
  }

  for (const r of profile.moduleReports) {
    const hay = `${r.moduleLabel} ${r.performanceVerdict}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'report' as const,
        id: r.id,
        label: r.moduleLabel,
        score: r.performanceScore,
        matchReason: `${r.performanceScore}% · ${r.speedTrend}`,
      });
    }
  }

  for (const b of profile.performanceBudgets) {
    const hay = `${b.featureLabel} ${b.studioIntelligenceNote} budget`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'budget' as const,
        id: b.id,
        label: b.featureLabel,
        score: 100 - b.utilizationPct,
        matchReason: `${b.status} · ${b.utilizationPct}%`,
      });
    }
  }

  for (const s of profile.simulations) {
    const hay = `${s.scenarioLabel} ${s.moduleLabel} ${s.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'simulation' as const,
        id: s.id,
        label: `${s.scenarioLabel} · ${s.moduleLabel}`,
        score: s.performanceScore,
        matchReason: `${s.latencyMs}ms · ${s.passed ? 'pass' : 'fail'}`,
      });
    }
  }

  for (const m of profile.metricScores) {
    const hay = `${m.label} ${m.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'metric' as const,
        id: m.metric,
        label: m.label,
        score: m.score,
        matchReason: `${m.status} · ${m.score}%`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainBottleneckById(bottleneckId: string, profile: OrganizationPerformanceMonitorProfile): string | null {
  const b = profile.bottlenecks.find((x) => x.id === bottleneckId);
  if (!b) return null;
  return `${b.description} Measured: ${b.measuredValue} vs budget ${b.budgetLimit}`;
}
