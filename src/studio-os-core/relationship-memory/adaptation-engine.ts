import type {
  FounderPreferenceMemory,
  IntelligentAdaptationInsight,
  OrganizationalRelationshipMemory,
} from './types';

export function buildIntelligentAdaptationInsights(
  organizationId: string,
  founderPreferences: FounderPreferenceMemory[],
  organizationalRelationships: OrganizationalRelationshipMemory[]
): IntelligentAdaptationInsight[] {
  const insights: IntelligentAdaptationInsight[] = [];
  const now = new Date().toISOString().slice(0, 10);

  const creative = founderPreferences.find((p) => p.type === 'creative-workflow');
  if (creative) {
    insights.push({
      id: `adapt-${organizationId}-visual-review`,
      insight: 'I noticed you usually review designs visually before approving implementation.',
      appliesTo: 'founder',
      dockApplication: 'I prepared visual mockups because I know that\'s your preferred review method.',
      confidencePct: creative.confidencePct,
    });
  }

  const reporting = founderPreferences.find((p) => p.type === 'review-preferences');
  if (reporting) {
    insights.push({
      id: `adapt-${organizationId}-exec-summary`,
      insight: 'You typically prefer executive summaries before reading detailed reports.',
      appliesTo: 'founder',
      dockApplication: 'Executive summary attached — full detail available if you want to drill down.',
      confidencePct: reporting.confidencePct,
    });
  }

  const meetings = founderPreferences.find((p) => p.type === 'meeting-preferences');
  if (meetings) {
    insights.push({
      id: `adapt-${organizationId}-morning-focus`,
      insight: 'You normally reserve mornings for strategic work — meetings scheduled later in the day.',
      appliesTo: 'founder',
      dockApplication: 'I scheduled this meeting later because you typically reserve mornings for strategic work.',
      confidencePct: meetings.confidencePct,
    });
  }

  const decisions = founderPreferences.find((p) => p.type === 'decision-making');
  const financeDept = organizationalRelationships.find((r) => r.entityName === 'Finance');
  if (decisions && financeDept) {
    insights.push({
      id: `adapt-${organizationId}-approval-order`,
      insight: 'You normally approve financial decisions after Marketing and Operations have reviewed them.',
      appliesTo: 'both',
      dockApplication: 'Marketing and Operations reviews complete — ready for your financial approval when convenient.',
      confidencePct: Math.round((decisions.confidencePct + 70) / 2),
    });
  }

  const marketing = organizationalRelationships.find((r) => r.entityName === 'Marketing Director');
  if (marketing) {
    insights.push({
      id: `adapt-${organizationId}-marketing-cadence`,
      insight: `${marketing.entityName} prefers bi-weekly creative reviews with visual previews before launch.`,
      appliesTo: 'organization',
      dockApplication: 'Campaign preview prepared for Marketing review — visual format as they prefer.',
      confidencePct: 76,
    });
  }

  const client = organizationalRelationships.find((r) => r.entityType === 'clients');
  if (client) {
    insights.push({
      id: `adapt-${organizationId}-client-${now}`,
      insight: `${client.entityName} — recurring ${client.recurringRequests[0] ?? 'requests'} tracked from historical interactions.`,
      appliesTo: 'organization',
      dockApplication: `Prepared ${client.recurringRequests[0] ?? 'client update'} in the format ${client.entityName} expects.`,
      confidencePct: 68,
    });
  }

  return insights.slice(0, 6);
}

export function summarizeAdaptationInsights(insights: IntelligentAdaptationInsight[]): string {
  if (!insights.length) return 'Learning how your organization works — familiarity builds through observation, never forms.';
  return insights
    .slice(0, 3)
    .map((i) => i.insight)
    .join(' ');
}
