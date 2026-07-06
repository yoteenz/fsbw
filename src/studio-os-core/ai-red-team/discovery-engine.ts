import type { OrganizationAiRedTeamProfile } from './types';

export function queryAiRedTeam(query: string, profile: OrganizationAiRedTeamProfile, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const f of profile.findings) {
    const hay = `${f.issue} ${f.rootCause} ${f.suggestedResolution} ${f.exposureLabel}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'finding' as const,
        id: f.id,
        label: f.issue.slice(0, 60),
        score: f.confidencePct,
        matchReason: `${f.severity} · ${f.confidencePct}% confidence`,
      });
    }
  }

  for (const m of profile.exposureMetrics) {
    if (m.label.toLowerCase().includes(q) || m.target.includes(q)) {
      hits.push({
        type: 'exposure' as const,
        id: m.target,
        label: m.label,
        score: 100 - m.weaknessesFound * 10,
        matchReason: `${m.weaknessesFound} weaknesses · ${m.stressTestsRun} tests`,
      });
    }
  }

  return hits.slice(0, limit);
}

export function explainRedTeamFinding(findingId: string, profile: OrganizationAiRedTeamProfile): string | null {
  const f = profile.findings.find((x) => x.id === findingId);
  if (!f) return null;
  return `${f.issue} (${f.severity}, ${f.confidencePct}%) — Root: ${f.rootCause} → ${f.suggestedResolution}`;
}
