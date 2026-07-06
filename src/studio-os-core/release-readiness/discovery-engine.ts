import type { OrganizationReleaseReadinessProfile } from './types';

export function queryReleaseReadiness(
  query: string,
  profile: OrganizationReleaseReadinessProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const a of profile.disciplineApprovals) {
    const hay = `${a.disciplineLabel} ${a.summary} ${a.status}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'approval' as const,
        id: a.id,
        label: a.disciplineLabel,
        score: a.score,
        matchReason: `${a.status} · ${a.score}%`,
      });
    }
  }

  for (const r of profile.productionReports) {
    const hay = `${r.releaseLabel} ${r.readinessVerdict} ${r.releaseGate}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'report' as const,
        id: r.id,
        label: r.releaseLabel,
        score: r.overallReadinessScore,
        matchReason: `${r.overallReadinessScore}% · ${r.riskLevel} risk`,
      });
    }
  }

  for (const i of profile.openIssues) {
    const hay = `${i.title} ${i.description} ${i.disciplineLabel}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'issue' as const,
        id: i.id,
        label: i.title,
        score: i.severity === 'critical' ? 95 : i.severity === 'warning' ? 80 : 65,
        matchReason: `${i.disciplineLabel} · ${i.severity}`,
      });
    }
  }

  for (const b of profile.executiveBriefs) {
    const hay = `${b.whatChanged} ${b.executiveVerdict} ${b.studioIntelligenceSummary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'executive' as const,
        id: b.id,
        label: b.releaseId,
        score: 90,
        matchReason: b.executiveVerdict.slice(0, 60),
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
