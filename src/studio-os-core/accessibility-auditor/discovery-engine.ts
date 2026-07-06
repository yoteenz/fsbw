import type { OrganizationAccessibilityAuditorProfile } from './types';

export function queryAccessibilityAuditor(
  query: string,
  profile: OrganizationAccessibilityAuditorProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const f of profile.findings) {
    const hay = `${f.description} ${f.issueLabel} ${f.pageLabel} ${f.estimatedUserImpact}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'finding' as const,
        id: f.id,
        label: f.issueLabel,
        score: f.severity === 'critical' ? 95 : f.severity === 'warning' ? 80 : 65,
        matchReason: `${f.pageLabel} · ${f.severity}`,
      });
    }
  }

  for (const r of profile.pageReports) {
    const hay = `${r.pageLabel} ${r.accessibilityVerdict} WCAG`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'report' as const,
        id: r.id,
        label: r.pageLabel,
        score: r.accessibilityScore,
        matchReason: `Score ${r.accessibilityScore}% · WCAG ${r.wcagComplianceStatus}`,
      });
    }
  }

  for (const s of profile.simulations) {
    const hay = `${s.userTypeLabel} ${s.pageLabel} ${s.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'simulation' as const,
        id: s.id,
        label: `${s.userTypeLabel} · ${s.pageLabel}`,
        score: s.accessibilityScore,
        matchReason: s.passed ? 'Inclusive' : `${s.barriersEncountered} barriers`,
      });
    }
  }

  for (const d of profile.dimensionScores) {
    const hay = `${d.label} ${d.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'dimension' as const,
        id: d.dimension,
        label: d.label,
        score: d.score,
        matchReason: `${d.status} · ${d.score}%`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainFindingById(findingId: string, profile: OrganizationAccessibilityAuditorProfile): string | null {
  const f = profile.findings.find((x) => x.id === findingId);
  if (!f) return null;
  return `${f.description} Impact: ${f.estimatedUserImpact}`;
}
