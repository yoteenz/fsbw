import type { OrganizationPromptQaProfile } from './types';

export function queryPromptQa(query: string, profile: OrganizationPromptQaProfile, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const f of profile.findings) {
    const hay = `${f.description} ${f.issueLabel} ${f.promptName} ${f.conflictReport}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'finding' as const,
        id: f.id,
        label: f.issueLabel,
        score: f.severity === 'critical' ? 95 : f.severity === 'warning' ? 80 : 65,
        matchReason: `${f.promptName} · ${f.severity}`,
      });
    }
  }

  for (const r of profile.auditReports) {
    const hay = `${r.promptName} ${r.qaVerdict} ${r.sourceLabel}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'audit' as const,
        id: r.id,
        label: r.promptName,
        score: r.promptQualityScore,
        matchReason: `Quality ${r.promptQualityScore}% · Confidence ${r.estimatedAiConfidence}%`,
      });
    }
  }

  for (const v of profile.versionHistory) {
    const hay = `${v.promptName} ${v.whatChanged} ${v.whyChanged}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'version' as const,
        id: v.versionId,
        label: `${v.promptName} v${v.version}`,
        score: v.status === 'approved' ? 88 : 70,
        matchReason: `${v.status} · ${v.changedBy}`,
      });
    }
  }

  for (const s of profile.sourceCoverage) {
    const hay = `${s.label} ${s.source}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'source' as const,
        id: s.source,
        label: s.label,
        score: s.avgQuality,
        matchReason: `${s.promptCount} prompts · ${s.avgQuality}% avg`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainFindingById(findingId: string, profile: OrganizationPromptQaProfile): string | null {
  const f = profile.findings.find((x) => x.id === findingId);
  if (!f) return null;
  return `${f.description} Conflict: ${f.conflictReport}`;
}
