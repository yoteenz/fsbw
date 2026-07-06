import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { resolveDigitalExecutiveRoster } from './digital-executives';
import type { OrganizationExecutiveCouncilProfile } from './org-types';

export function buildOrganizationExecutiveCouncilProfile(
  organizationId: string
): OrganizationExecutiveCouncilProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const digitalExecutives = resolveDigitalExecutiveRoster(organizationId);
  const activeExecutives = digitalExecutives.filter((e) => e.active && e.id !== 'chief-concierge').length;

  return {
    organizationId,
    companyName: brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    councilHealthPct: Math.min(95, 70 + Math.min(activeExecutives * 3, 25)),
    activeExecutives,
    pendingDecisions: 0,
    meetingsHeld: 0,
    digitalExecutives,
    latestBriefing: null,
    decisionHistory: [],
    syncedSources: [
      'profession-brain',
      'organization-genome',
      'memory-engine',
      'company-health-index',
      'succession-mode',
      'industry-architecture',
      'business-discovery-blueprint',
    ],
  };
}

export function mergeCouncilProfileState(
  organizationId: string,
  existing: OrganizationExecutiveCouncilProfile | null
): OrganizationExecutiveCouncilProfile {
  const rebuilt = buildOrganizationExecutiveCouncilProfile(organizationId);
  if (!existing) return rebuilt;

  return {
    ...rebuilt,
    pendingDecisions: existing.pendingDecisions,
    meetingsHeld: existing.meetingsHeld,
    latestBriefing: existing.latestBriefing,
    decisionHistory: existing.decisionHistory,
    councilHealthPct: Math.min(
      98,
      rebuilt.councilHealthPct + Math.min(existing.meetingsHeld * 2, 10)
    ),
  };
}
