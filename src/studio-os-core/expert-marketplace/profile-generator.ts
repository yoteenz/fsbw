import { TRUST_DISCLAIMER_LEVELS, REGULATED_INDUSTRIES } from './constants';
import type { ExpertProfile, ExpertTrustLevel } from './types';
import type { OrganizationProfessionBrain, OrganizationProfessionBrainProfile, PublicKnowledgeSurface } from '../profession-brain/types';
import { resolveFounderName } from '../organization-inauguration/charter-generator';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';

function resolveTrustLevel(industryId: string, brainId: string): ExpertTrustLevel {
  if (REGULATED_INDUSTRIES.includes(industryId as (typeof REGULATED_INDUSTRIES)[number])) {
    if (brainId === 'legal-intake' || brainId === 'fuel-tax' || brainId === 'bookkeeping') {
      return 'licensed';
    }
    return 'consultation';
  }
  if (brainId === 'marketing' || brainId === 'hair-color') return 'preparation';
  return 'educational';
}

function mapCapabilities(
  caps: PublicKnowledgeSurface['capabilities']
): ExpertProfile['capabilities'] {
  const map: Record<string, ExpertProfile['capabilities'][number]> = {
    learn: 'learn',
    ask: 'ask',
    prepare: 'workflow',
    workflow: 'workflow',
    purchase: 'digital-product',
    book: 'schedule',
    upgrade: 'upgrade',
  };
  return caps.map((c) => map[c]).filter(Boolean) as ExpertProfile['capabilities'];
}

export function buildExpertProfileFromBrain(
  brainProfile: OrganizationProfessionBrainProfile,
  surface: PublicKnowledgeSurface,
  brain: OrganizationProfessionBrain
): ExpertProfile | null {
  if (!surface.enabled) return null;

  const blueprint = getOrganizationDiscoveryBlueprint(brainProfile.organizationId);
  const founder = blueprint ? resolveFounderName(blueprint) : 'Founder';
  const services = brain.knowledgeEntries
    .filter((e) => e.kind === 'best-practice' || e.kind === 'business-rule')
    .map((e) => e.title)
    .slice(0, 5);
  const trustLevel = resolveTrustLevel(brainProfile.industryId, brain.id);

  return {
    id: `expert-${brainProfile.organizationId}-${brain.id}`,
    expertName: surface.publicTitle,
    organizationName: brainProfile.companyName,
    organizationId: brainProfile.organizationId,
    creator: founder,
    yearsExperience: Math.max(3, Math.round(brain.maturityPct / 10)),
    industries: [brainProfile.industryId.replace(/-/g, ' ')],
    specialties: [brain.label.replace(' Brain', '')],
    services: services.length > 0 ? services : [surface.publicTitle],
    knowledgeAreas: brain.knowledgeEntries.map((e) => e.title).slice(0, 6),
    certifications: brainProfile.industryId === 'law-firm' ? ['Professional review recommended'] : [],
    languages: ['English'],
    availability: 'Consultation · templates · guided workflows',
    version: `v${brain.knowledgeEntries.length}.0`,
    lastUpdated: brain.lastEvolvedAt,
    rating: 4.5 + brain.maturityPct / 200,
    reviewCount: Math.max(0, brain.knowledgeEntries.length * 3),
    brainId: brain.id,
    published: true,
    approvedAt: new Date().toISOString(),
    trustLevel,
    trustDisclaimer: TRUST_DISCLAIMER_LEVELS[trustLevel],
    capabilities: mapCapabilities(surface.capabilities),
    originNote: `Expertise preserved in ${brainProfile.companyName} Profession Brain™ — published with organizational approval.`,
  };
}

export function buildExpertProfilesFromProfessionBrain(
  brainProfile: OrganizationProfessionBrainProfile
): ExpertProfile[] {
  const profiles: ExpertProfile[] = [];

  for (const surface of brainProfile.publicSurfaces) {
    const brain = brainProfile.brains.find((b) => b.id === surface.brainId);
    if (!brain) continue;
    const expert = buildExpertProfileFromBrain(brainProfile, surface, brain);
    if (expert) profiles.push(expert);
  }

  return profiles;
}
