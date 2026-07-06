import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationInaugurationProfile } from '../organization-inauguration/store';
import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import {
  buildBrandVoice,
  buildCustomerStandards,
  buildDecisionDna,
  buildIdentityCore,
  buildIdentityLayers,
  computeGenomeCompleteness,
} from './identity-seeds';
import { buildAiConsultationRules } from './ai-consultation';
import type { OrganizationGenomeProfile } from './types';

export function buildOrganizationGenomeProfile(organizationId: string): OrganizationGenomeProfile {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const inauguration = getOrganizationInaugurationProfile(organizationId);
  const charter = inauguration?.charter;
  const now = new Date().toISOString();

  const identityCore = buildIdentityCore(blueprint, charter);
  const brandVoice = buildBrandVoice(organizationId, blueprint);
  const decisionDna = buildDecisionDna(blueprint);
  const customerStandards = buildCustomerStandards(blueprint);
  const identityLayers = buildIdentityLayers(identityCore, brandVoice, decisionDna, customerStandards, now);

  const baseProfile: OrganizationGenomeProfile = {
    organizationId,
    companyName:
      charter?.organizationName ||
      blueprint?.companyName ||
      organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: blueprint?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: now,
    blueprintSyncedAt: blueprint?.updatedAt,
    charterSyncedAt: inauguration?.inauguratedAt,
    identityCore,
    brandVoice,
    decisionDna,
    customerStandards,
    identityLayers,
    aiConsultationRules: [],
    genomeCompletenessPct: 0,
    evolutionNotes: [
      'Genome seeded from Business Discovery Blueprint™ and Organization Charter.',
      'Profession Brain™ preserves expertise — Organization Genome™ preserves identity.',
      'Every AI interaction consults Genome before generating work.',
    ],
  };

  const genomeCompletenessPct = computeGenomeCompleteness(identityCore, brandVoice, decisionDna);
  const aiConsultationRules = buildAiConsultationRules({ ...baseProfile, genomeCompletenessPct });

  return {
    ...baseProfile,
    genomeCompletenessPct,
    aiConsultationRules,
  };
}
