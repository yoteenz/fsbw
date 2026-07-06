import type { OrganizationVisualDiffEngineProfile } from './types';

export function queryVisualDiffEngine(
  query: string,
  profile: OrganizationVisualDiffEngineProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const f of profile.findings) {
    const hay = `${f.description} ${f.issueLabel} ${f.screenLabel} ${f.visualDelta}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'finding' as const,
        id: f.id,
        label: f.issueLabel,
        score: f.severity === 'critical' ? 95 : f.severity === 'warning' ? 80 : 65,
        matchReason: `${f.screenLabel} · vs ${f.compareBaseLabel}`,
      });
    }
  }

  for (const r of profile.visualReports) {
    const hay = `${r.screenLabel} ${r.visualIdentityVerdict}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'report' as const,
        id: r.id,
        label: r.screenLabel,
        score: r.visualConsistencyScore,
        matchReason: `Consistency ${r.visualConsistencyScore}% · Luxury ${r.luxuryScore}%`,
      });
    }
  }

  for (const g of profile.goldenReferences) {
    const hay = `${g.screenLabel} ${g.description} golden`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'golden' as const,
        id: g.id,
        label: g.screenLabel,
        score: 100 - g.pixelDiffPct,
        matchReason: `${g.status} · ${g.referenceVersion}`,
      });
    }
  }

  for (const r of profile.visualReports) {
    for (const c of r.screenshotComparisons) {
      const hay = `${c.summary} ${c.baselineLabel}`.toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          type: 'comparison' as const,
          id: c.id,
          label: c.screenLabel,
          score: 100 - c.pixelDiffPct,
          matchReason: `${c.pixelDiffPct}% pixel diff`,
        });
      }
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainFindingById(findingId: string, profile: OrganizationVisualDiffEngineProfile): string | null {
  const f = profile.findings.find((x) => x.id === findingId);
  if (!f) return null;
  return `${f.description} Delta: ${f.visualDelta}`;
}
