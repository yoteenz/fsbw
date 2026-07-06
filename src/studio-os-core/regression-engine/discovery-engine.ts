import type { OrganizationRegressionEngineProfile } from './types';

export function queryRegressionEngine(
  query: string,
  profile: OrganizationRegressionEngineProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const f of profile.brokenFeatures) {
    const hay = `${f.description} ${f.featureLabel} ${f.rootCause}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'broken-feature' as const,
        id: f.id,
        label: f.featureLabel,
        score: f.severity === 'critical' ? 95 : f.severity === 'warning' ? 80 : 65,
        matchReason: `${f.categoryLabel} · ${f.severity}`,
      });
    }
  }

  for (const r of profile.buildReports) {
    const hay = `${r.buildLabel} ${r.regressionVerdict} ${r.rootCauseAnalysis}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'report' as const,
        id: r.id,
        label: r.buildLabel,
        score: r.regressionScore,
        matchReason: `${r.regressionScore}% · risk ${r.riskLevel}`,
      });
    }
  }

  for (const replay of profile.replayResults) {
    const hay = `${replay.replayLabel} ${replay.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'replay' as const,
        id: replay.id,
        label: replay.replayLabel,
        score: replay.regressionScore,
        matchReason: `${replay.stepsReplayed} steps · ${replay.passed ? 'pass' : 'fail'}`,
      });
    }
  }

  for (const c of profile.categoryScores) {
    const hay = `${c.label} ${c.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'category' as const,
        id: c.category,
        label: c.label,
        score: c.score,
        matchReason: `${c.status} · ${c.regressionsCount} regression(s)`,
      });
    }
  }

  for (const m of profile.historicalMemory) {
    const hay = `${m.featureLabel} ${m.studioIntelligencePattern} ${m.description}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'memory' as const,
        id: m.id,
        label: m.featureLabel,
        score: m.recurrenceCount * 20,
        matchReason: `${m.recurrenceCount}x · ${m.status}`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainMemoryById(memoryId: string, profile: OrganizationRegressionEngineProfile): string | null {
  const entry = profile.historicalMemory.find((x) => x.id === memoryId);
  if (!entry) return null;
  return `${entry.description} Pattern: ${entry.studioIntelligencePattern} Recurrence: ${entry.recurrenceCount}x.`;
}
