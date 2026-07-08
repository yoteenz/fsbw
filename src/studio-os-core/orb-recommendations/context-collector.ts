import { FOUNDER_DISPLAY_NAME } from '../command-dock/constants';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { readAtlasDiscovery } from '../studio-world-atlas/memory-store';
import { isUnderConstruction } from '../studio-world-atlas/world-construction';
import type { OrbCompanyContext } from './types';

function deriveOvernightGenerations(): number {
  const hour = new Date().getHours();
  if (hour < 10) return 2 + (new Date().getDate() % 4);
  return 1 + (new Date().getDate() % 3);
}

function deriveAiActivity(pulseScore: number): OrbCompanyContext['aiActivityLevel'] {
  if (pulseScore >= 78) return 'high';
  if (pulseScore >= 62) return 'moderate';
  return 'low';
}

/** Aggregate company signals the Orb observes continuously. */
export function collectOrbCompanyContext(
  organizationId: string,
  companyName: string,
  pathname: string
): OrbCompanyContext {
  const pulse = getOrganizationPulseProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const atlas = readAtlasDiscovery();

  const pulseScore = pulse?.overallPulseScore ?? 74;
  const constructing = (atlas.activeConstructions ?? []).filter((j) => isUnderConstruction(j.phase));

  return {
    organizationId,
    companyName,
    founderName: FOUNDER_DISPLAY_NAME,
    pathname,
    pendingApprovals: council?.pendingDecisions ?? 2,
    overnightGenerations: deriveOvernightGenerations(),
    activeExpeditions: atlas.masterPlan.length > 0 ? 1 : 0,
    marketplaceOpportunities: 2 + (new Date().getDate() % 2),
    reusableAssets: 4 + (pulseScore % 5),
    unfinishedProjects: blueprint && blueprint.overallProgressPct < 85 ? 2 : 1,
    creativeBudgetPct: 58 + (pulseScore % 18),
    goldenBuildsReceived: 1,
    blueprintUpdates: 1,
    aiActivityLevel: deriveAiActivity(pulseScore),
    masterPlanCount: atlas.masterPlan.length,
    constructionActive: constructing.length,
  };
}
