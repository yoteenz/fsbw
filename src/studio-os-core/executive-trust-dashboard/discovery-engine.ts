import type { OrganizationExecutiveTrustDashboardProfile, TrustDashboardSearchHit } from './types';

export function queryExecutiveTrustDashboard(
  query: string,
  profile: OrganizationExecutiveTrustDashboardProfile,
  limit = 8
): TrustDashboardSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: TrustDashboardSearchHit[] = [];

  for (const ind of profile.systemIndicators) {
    const hay = `${ind.label} ${ind.recommendedAction} ${ind.systemId}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'system',
        id: ind.systemId,
        label: ind.label,
        score: ind.trustScore,
        matchReason: `${ind.trustScore}% trust · ${ind.riskLevel} risk · ${ind.recentIssues} issues`,
      });
    }
  }

  for (const risk of profile.executiveSummary.highestOperationalRisks) {
    if (risk.toLowerCase().includes(q)) {
      hits.push({
        type: 'risk',
        id: risk.slice(0, 20),
        label: risk.slice(0, 50),
        score: 70,
        matchReason: 'Operational risk',
      });
    }
  }

  return hits.slice(0, limit);
}

export function explainSystemTrust(
  systemId: string,
  profile: OrganizationExecutiveTrustDashboardProfile
): string | null {
  const ind = profile.systemIndicators.find((i) => i.systemId === systemId);
  if (!ind) return null;
  return `${ind.label}: ${ind.trustScore}% trust · ${ind.healthScore}% health · ${ind.confidence}% confidence (${ind.trend}) — ${ind.recommendedAction}`;
}
