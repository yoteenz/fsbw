import { getOrganizationAnticipationProfile } from '../anticipation-engine/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import type { IntelligentConnectionSuggestion } from './types';

export function buildIntelligentConnections(
  organizationId: string,
  companyName: string,
  industryId: string
): IntelligentConnectionSuggestion[] {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const anticipation = getOrganizationAnticipationProfile(organizationId);
  const suggestions: IntelligentConnectionSuggestion[] = [];

  const needsBranding = blueprint && blueprint.overallProgressPct >= 40 && blueprint.overallProgressPct < 75;
  if (needsBranding) {
    suggestions.push({
      id: `conn-${organizationId}-branding`,
      title: 'Branding collaboration opportunity',
      needSummary: `${companyName} needs branding support during discovery phase (${blueprint.overallProgressPct}%).`,
      offerSummary: 'A design agency in your founder network has available creative capacity this month.',
      partnerOrganization: 'Studio Partner · Creative Agency',
      permissionRequired: true,
      confidencePct: 82,
      status: 'suggested',
    });
  }

  const needsBookkeeping = anticipation?.anticipationItems.some((a) =>
    /finance|revenue|payroll/i.test(a.summary)
  );
  if (needsBookkeeping) {
    suggestions.push({
      id: `conn-${organizationId}-bookkeeping`,
      title: 'Bookkeeping expertise match',
      needSummary: `${companyName} shows finance workload signals — bookkeeping support recommended.`,
      offerSummary: 'A bookkeeping organization in your trusted network offers verified expertise.',
      partnerOrganization: 'Studio Partner · Professional Bookkeeping',
      permissionRequired: true,
      confidencePct: 78,
      status: 'suggested',
    });
  }

  if (brain && brain.brains.some((b) => /marketing/i.test(b.label))) {
    suggestions.push({
      id: `conn-${organizationId}-marketing`,
      title: 'Cross-org marketing capacity',
      needSummary: 'Marketing campaign activity increasing — additional creative capacity may help.',
      offerSummary: 'Partner agency with published Profession Brain™ in marketing — permission required to connect.',
      partnerOrganization: 'Studio Partner · Growth Agency',
      permissionRequired: true,
      confidencePct: 74,
      status: 'awaiting-approval',
    });
  }

  if (/trucking|logistics|transport/i.test(industryId) || /trucking|logistics/i.test(companyName)) {
    suggestions.push({
      id: `conn-${organizationId}-logistics`,
      title: 'Operational support network',
      needSummary: 'Operations and compliance workload detected — specialized support available.',
      offerSummary: 'Trusted supplier network member offers bookkeeping and dispatch coordination expertise.',
      partnerOrganization: 'Studio Partner · Operations Collective',
      permissionRequired: true,
      confidencePct: 80,
      status: 'suggested',
    });
  }

  suggestions.push({
    id: `conn-${organizationId}-knowledge`,
    title: 'Knowledge commerce partnership',
    needSummary: 'Published expertise could reach partner organizations in your founder network.',
    offerSummary: 'Share selected Profession Brain™ capabilities — revenue opportunity, full privacy control.',
    partnerOrganization: 'Founder Network · Selected Partners',
    permissionRequired: true,
    confidencePct: 70,
    status: 'suggested',
  });

  return suggestions.slice(0, 5);
}

export function summarizeConnections(connections: IntelligentConnectionSuggestion[]): string {
  if (connections.length === 0) {
    return 'No cross-organization connections suggested — privacy boundaries respected.';
  }
  return `${connections.length} permission-based collaboration opportunity(ies) — private knowledge never shared automatically.`;
}
