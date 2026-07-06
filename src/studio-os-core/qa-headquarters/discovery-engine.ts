import type { OrganizationQaHeadquartersProfile, QaHeadquartersSearchHit } from './types';

export function queryQaHeadquarters(
  query: string,
  profile: OrganizationQaHeadquartersProfile,
  limit = 8
): QaHeadquartersSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: QaHeadquartersSearchHit[] = [];

  for (const t of profile.trustScores) {
    const hay = `${t.label} ${t.summary} ${t.systemId}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'trust',
        id: t.systemId,
        label: t.label,
        score: t.scorePct,
        matchReason: `${t.scorePct}% · ${t.status}`,
      });
    }
  }

  for (const r of profile.responsibilities) {
    const hay = `${r.label} ${r.responsibilityId}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'responsibility',
        id: r.responsibilityId,
        label: r.label,
        score: r.coveragePct,
        matchReason: `${r.issueCount} issues · ${r.coveragePct}% coverage`,
      });
    }
  }

  for (const v of profile.recentValidations) {
    const hay = `${v.triggerLabel} ${v.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'validation',
        id: v.id,
        label: v.triggerLabel,
        score: v.findingsCount === 0 ? 95 : 70,
        matchReason: `${v.status} · ${v.findingsCount} findings`,
      });
    }
  }

  return hits.slice(0, limit);
}

export function explainTrustScore(systemId: string, profile: OrganizationQaHeadquartersProfile): string | null {
  const entry = profile.trustScores.find((t) => t.systemId === systemId);
  if (!entry) return null;
  return `${entry.label}: ${entry.scorePct}% (${entry.status}) — ${entry.summary}`;
}
