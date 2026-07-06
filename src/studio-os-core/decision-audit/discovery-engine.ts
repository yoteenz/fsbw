import type { OrganizationDecisionAuditProfile } from './types';

export function queryDecisionAudit(
  query: string,
  profile: OrganizationDecisionAuditProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const d of profile.decisions) {
    const hay = `${d.decision} ${d.decisionTypeLabel} ${d.decisionMaker} ${d.whyItHappened} ${d.department} ${d.workflow}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'decision' as const,
        id: d.id,
        label: d.decisionTypeLabel,
        score: d.confidencePct,
        matchReason: `${d.auditSourceLabel} · ${d.approvalStatus} · ${new Date(d.timestamp).toLocaleDateString()}`,
      });
    }
  }

  for (const t of profile.timeline) {
    const hay = `${t.label} ${t.summary} ${t.decisionMaker}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'timeline' as const,
        id: t.id,
        label: t.label,
        score: 75,
        matchReason: `${t.approvalStatus} · ${new Date(t.timestamp).toLocaleString()}`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainDecisionRecord(decisionId: string, profile: OrganizationDecisionAuditProfile): string | null {
  const d = profile.decisions.find((x) => x.id === decisionId);
  if (!d) return null;
  return `${d.decision} Why: ${d.whyItHappened} Evidence: ${d.supportingEvidence[0] ?? 'N/A'}`;
}
