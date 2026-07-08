import { CAREER_WORLD_IDS } from '../../career-worlds/types';
import type { CareerWorldId } from '../../career-worlds/types';
import type { ExchangeCertificationDefinition } from './schema';

const CERTIFICATION_REGISTRY = new Map<string, ExchangeCertificationDefinition>();

function certId(worldId: CareerWorldId, slug: string): string {
  return `${worldId}:cert:${slug}`;
}

function seedCertifications(): void {
  for (const worldId of CAREER_WORLD_IDS) {
    const professionLabel = worldId.replace(/-world$/, '').replace(/-/g, ' ');
    const definitions: ExchangeCertificationDefinition[] = [
      {
        id: certId(worldId, 'journeyman'),
        careerWorldId: worldId,
        displayName: `${professionLabel} Journeyman Certification™`,
        ceremonyTemplateId: 'graduation-standard',
        requiredProgressPercent: 60,
        unlocks: [
          { kind: 'client-tier', targetId: `${worldId}-mid-tier-clients`, label: 'Mid-tier Clients' },
          { kind: 'district', targetId: `${worldId}-practice-hall`, label: 'Practice Hall District' },
        ],
        professionalMemoryTopicIds: [`${worldId}-foundations`],
      },
      {
        id: certId(worldId, 'master'),
        careerWorldId: worldId,
        displayName: `${professionLabel} Master Certification™`,
        ceremonyTemplateId: 'graduation-master',
        requiredProgressPercent: 90,
        unlocks: [
          { kind: 'mentorship', targetId: `${worldId}-mentor-eligibility`, label: 'Mentor Eligibility' },
          { kind: 'teaching-right', targetId: `${worldId}-cohort-host`, label: 'Cohort Hosting Rights' },
          { kind: 'hero-object', targetId: `hero-object.${worldId}.master-credential`, label: 'Master Credential Hero Object' },
          { kind: 'industry-event', targetId: `${worldId}-awards-stage`, label: 'Awards Stage Access' },
        ],
        professionalMemoryTopicIds: [`${worldId}-mastery`, `${worldId}-leadership`],
      },
    ];
    for (const def of definitions) {
      CERTIFICATION_REGISTRY.set(def.id, def);
    }
  }
}

seedCertifications();

export function registerExchangeCertification(definition: ExchangeCertificationDefinition): void {
  CERTIFICATION_REGISTRY.set(definition.id, definition);
}

export function getExchangeCertification(certificationId: string): ExchangeCertificationDefinition | null {
  return CERTIFICATION_REGISTRY.get(certificationId) ?? null;
}

export function listCertificationsForWorld(worldId: CareerWorldId): ExchangeCertificationDefinition[] {
  return [...CERTIFICATION_REGISTRY.values()].filter((c) => c.careerWorldId === worldId);
}

export function listCertificationIdsForWorld(worldId: CareerWorldId): string[] {
  return listCertificationsForWorld(worldId).map((c) => c.id);
}

export function listAllExchangeCertifications(): ExchangeCertificationDefinition[] {
  return [...CERTIFICATION_REGISTRY.values()];
}
