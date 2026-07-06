import { CEREMONIAL_LINES } from './constants';
import { buildOrganizationCharter, resolveFounderName } from './charter-generator';
import { buildFounderWelcomeMessage } from './founder-message';
import { buildActivationSteps } from './headquarters-activation';
import { buildInaugurationRecommendations } from './recommendations';
import { buildFoundingTimeline } from './founding-timeline';
import { DEFAULT_WALKTHROUGH_STOPS } from './walkthrough';
import type { OrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/types';
import { ensureOrganizationArchitectureProfile } from '../industry-architecture/store';
import { buildDigitalPayrollSummary } from '../monetization-architecture/payroll-engine';
import { ensureOrganizationMonetizationProfile } from '../monetization-architecture/store';
import type { FoundingBlueprintSnapshot, OrganizationInaugurationProfile } from './types';

export const INAUGURATION_PHASE_ORDER = [
  'ceremony',
  'activation',
  'charter',
  'founder-message',
  'walkthrough',
  'recommendations',
  'timeline',
  'legacy',
  'final',
] as const;

export function freezeFoundingBlueprint(
  blueprint: OrganizationDiscoveryBlueprint
): FoundingBlueprintSnapshot {
  return {
    snapshotId: `founding-${blueprint.organizationId}-${Date.now()}`,
    preservedAt: new Date().toISOString(),
    blueprint: JSON.parse(JSON.stringify(blueprint)) as OrganizationDiscoveryBlueprint,
  };
}

export function buildInaugurationProfileFromBlueprint(
  blueprint: OrganizationDiscoveryBlueprint
): OrganizationInaugurationProfile {
  const now = new Date().toISOString();
  const arch = ensureOrganizationArchitectureProfile(blueprint.organizationId);
  const monetization = ensureOrganizationMonetizationProfile(blueprint.organizationId);
  const payroll = buildDigitalPayrollSummary(monetization);
  const founderName = resolveFounderName(blueprint);
  const departments = arch.headquartersDepartments.map((d) => d.label);
  const workforceSummary = `${payroll.activeEmployeeCount} active Digital Staff · ${payroll.monthlyDigitalPayroll > 0 ? `$${payroll.monthlyDigitalPayroll.toLocaleString()}/mo Digital Payroll` : 'Core concierges included with Headquarters License'}`;

  const charter = buildOrganizationCharter(blueprint, founderName, departments, workforceSummary);
  const snapshot = freezeFoundingBlueprint(blueprint);

  return {
    organizationId: blueprint.organizationId,
    companyName: charter.organizationName,
    industryId: blueprint.industryId,
    blueprintCompletedAt: now,
    inauguratedAt: now,
    inaugurationComplete: false,
    currentPhase: 'ceremony',
    walkthroughIndex: 0,
    charter,
    founderWelcome: buildFounderWelcomeMessage(blueprint),
    activationSteps: buildActivationSteps(0),
    walkthroughStops: DEFAULT_WALKTHROUGH_STOPS,
    recommendations: buildInaugurationRecommendations(blueprint),
    foundingTimeline: buildFoundingTimeline(now, charter.organizationName),
    foundingBlueprintSnapshot: snapshot,
    ceremonialLines: [...CEREMONIAL_LINES],
  };
}

export function getPhaseIndex(phase: OrganizationInaugurationProfile['currentPhase']): number {
  return INAUGURATION_PHASE_ORDER.indexOf(phase);
}

export function getNextPhase(
  phase: OrganizationInaugurationProfile['currentPhase']
): OrganizationInaugurationProfile['currentPhase'] | null {
  const idx = getPhaseIndex(phase);
  if (idx < 0 || idx >= INAUGURATION_PHASE_ORDER.length - 1) return null;
  return INAUGURATION_PHASE_ORDER[idx + 1];
}

export function advanceActivationSteps(
  profile: OrganizationInaugurationProfile,
  completedCount: number
): OrganizationInaugurationProfile {
  return {
    ...profile,
    activationSteps: buildActivationSteps(completedCount),
  };
}
