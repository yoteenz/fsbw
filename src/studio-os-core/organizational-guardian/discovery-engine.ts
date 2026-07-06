import type { OrganizationGuardianProfile } from './types';

export function queryOrganizationalGuardian(
  query: string,
  profile: OrganizationGuardianProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const a of profile.alerts) {
    const hay = `${a.title} ${a.message} ${a.domainLabel} ${a.recommendation}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'alert' as const,
        id: a.id,
        label: a.title,
        score: a.severity === 'critical' ? 95 : a.severity === 'urgent' ? 85 : 70,
        matchReason: `${a.severity} · ${a.status} · ${a.domainLabel}`,
      });
    }
  }

  for (const d of profile.domainStatuses) {
    const hay = `${d.label} ${d.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'domain' as const,
        id: d.domain,
        label: d.label,
        score: d.score,
        matchReason: `${d.status} · ${d.score}% · ${d.trend}`,
      });
    }
  }

  for (const m of profile.dashboardMetrics) {
    const hay = `${m.label} ${m.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'metric' as const,
        id: m.metric,
        label: m.label,
        score: m.score,
        matchReason: `${m.trend} · ${m.score}%`,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainGuardianAlertById(alertId: string, profile: OrganizationGuardianProfile): string | null {
  const a = profile.alerts.find((x) => x.id === alertId);
  if (!a) return null;
  return `${a.message} Recommendation: ${a.recommendation}`;
}
