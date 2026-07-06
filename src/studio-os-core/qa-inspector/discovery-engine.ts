import type { OrganizationQaInspectorProfile } from './types';

export function queryQaInspector(
  query: string,
  profile: OrganizationQaInspectorProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const f of profile.findings) {
    const hay = `${f.issueLabel} ${f.rootCause} ${f.recommendedSolution} ${f.domainLabel}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'finding' as const,
        id: f.id,
        label: f.issueLabel,
        score: f.confidencePct,
        matchReason: `${f.severity} · ${f.confidencePct}% confidence`,
      });
    }
  }

  return hits.slice(0, limit);
}

export function explainFinding(findingId: string, profile: OrganizationQaInspectorProfile): string | null {
  const f = profile.findings.find((x) => x.id === findingId);
  if (!f) return null;
  return `${f.issueLabel} (${f.severity}, ${f.confidencePct}% confidence): ${f.rootCause} → ${f.recommendedSolution}`;
}
