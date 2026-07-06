import type { OrganizationDesignComplianceEngineProfile } from './types';

export function queryDesignComplianceEngine(
  query: string,
  profile: OrganizationDesignComplianceEngineProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const f of profile.findings) {
    const hay = `${f.description} ${f.issueLabel} ${f.categoryLabel} ${f.whyNotStudioOs}`.toLowerCase();
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

  for (const p of profile.pageReports) {
    const hay = `${p.pageLabel} ${p.creativeDirectorVerdict}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'page' as const,
        id: p.id,
        label: p.pageLabel,
        score: p.designScore,
        matchReason: `Design ${p.designScore}% · Luxury ${p.luxuryScore}%`,
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
        matchReason: `${c.status} · ${c.score}%`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainFindingById(findingId: string, profile: OrganizationDesignComplianceEngineProfile): string | null {
  const f = profile.findings.find((x) => x.id === findingId);
  if (!f) return null;
  return `${f.description} Why not Studio OS: ${f.whyNotStudioOs}`;
}
