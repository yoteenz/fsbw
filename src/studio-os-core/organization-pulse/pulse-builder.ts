import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildRecommendedActions, detectProactivePulseAlerts } from './alert-engine';
import {
  computeOverallPulseScore,
  computePulseIndicatorScores,
  describePulseFeeling,
  pulseStateFromScore,
} from './pulse-scoring';
import type { OrganizationPulseProfile } from './types';

export function buildOrganizationPulseProfile(organizationId: string): OrganizationPulseProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const indicatorScores = computePulseIndicatorScores(organizationId);
  const overallPulseScore = computeOverallPulseScore(indicatorScores);
  const pulseState = pulseStateFromScore(overallPulseScore);
  const proactiveAlerts = detectProactivePulseAlerts(indicatorScores);
  const recommendedActions = buildRecommendedActions(proactiveAlerts, indicatorScores);

  return {
    organizationId,
    companyName: brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    overallPulseScore,
    pulseState,
    pulseFeeling: describePulseFeeling(pulseState, overallPulseScore),
    indicatorScores,
    proactiveAlerts,
    recommendedActions,
    syncedSources: [
      'profession-brain',
      'organization-genome',
      'memory-engine',
      'company-health-index',
      'succession-mode',
      'executive-council',
      'industry-architecture',
      'business-discovery-blueprint',
      'professional-trust-framework',
    ],
  };
}
