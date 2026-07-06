import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationDigitalTwinProfile } from '../organization-digital-twin/store';
import type { OrganizationSimulationLabProfile } from './types';

export function computeLabReadinessScore(organizationId: string): number {
  let score = 45;
  if (getOrganizationProfessionBrainProfile(organizationId)) score += 12;
  if (getOrganizationHealthIndexProfile(organizationId)) score += 10;
  if (getOrganizationPulseProfile(organizationId)) score += 8;
  const memory = getOrganizationMemoryProfile(organizationId);
  if (memory && memory.records.length > 5) score += 8;
  if (getOrganizationDigitalTwinProfile(organizationId)) score += 10;
  return Math.min(96, score);
}

export function buildOrganizationSimulationLabProfile(
  organizationId: string,
  existing?: OrganizationSimulationLabProfile | null
): OrganizationSimulationLabProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const reports = existing?.reports ?? [];
  const scenarioLibrary = existing?.scenarioLibrary ?? [];

  return {
    organizationId,
    companyName: brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    labReadinessScore: computeLabReadinessScore(organizationId),
    totalSimulationsRun: reports.length,
    scenariosPendingDecision: scenarioLibrary.filter((s) => s.decision === 'pending').length,
    reports,
    scenarioLibrary,
    syncedSources: [
      'profession-brain',
      'memory-engine',
      'wisdom-capture',
      'company-health-index',
      'organization-pulse',
      'executive-council',
      'organization-digital-twin',
      'simulation-engine',
      'strategy-engine',
    ],
  };
}
