import type { OrganizationExperienceQaProfile } from './types';

export function queryExperienceQa(query: string, profile: OrganizationExperienceQaProfile, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const f of profile.findings) {
    const hay = `${f.description} ${f.issueLabel} ${f.pageLabel} ${f.emotionalImpact}`.toLowerCase();
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
    const hay = `${r.pageLabel} ${r.experienceVerdict}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'report' as const,
        id: r.id,
        label: r.pageLabel,
        score: r.experienceScore,
        matchReason: `Experience ${r.experienceScore}% · Clarity ${r.clarityScore}%`,
      });
    }
  }

  for (const s of profile.simulations) {
    const hay = `${s.personaLabel} ${s.pageLabel} ${s.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'simulation' as const,
        id: s.id,
        label: `${s.personaLabel} · ${s.pageLabel}`,
        score: s.experienceScore,
        matchReason: s.passed ? 'Passed' : 'Needs work',
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

export function explainFindingById(findingId: string, profile: OrganizationExperienceQaProfile): string | null {
  const f = profile.findings.find((x) => x.id === findingId);
  if (!f) return null;
  return `${f.description} Emotional impact: ${f.emotionalImpact}`;
}
