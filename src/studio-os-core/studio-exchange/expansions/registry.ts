import { CAREER_WORLD_IDS } from '../../career-worlds/types';
import type { CareerWorldId } from '../../career-worlds/types';
import type { CareerExpansionDefinition } from './schema';

const EXPANSION_REGISTRY = new Map<string, CareerExpansionDefinition>();

function expansionSlug(worldId: CareerWorldId, slug: string): string {
  return `${worldId}:${slug}`;
}

function universalExpansions(worldId: CareerWorldId, professionLabel: string): CareerExpansionDefinition[] {
  return [
    {
      id: expansionSlug(worldId, 'advanced-specialization'),
      careerWorldId: worldId,
      slug: 'advanced-specialization',
      displayName: `${professionLabel} Advanced Specialization™`,
      specializationLabel: 'Advanced Specialization',
      summary: `Deepen mastery inside ${professionLabel} through advanced districts, mentors, and simulations.`,
      unlocks: [
        { kind: 'district', targetId: `${worldId}-advanced-lab`, label: 'Advanced Lab District' },
        { kind: 'simulation', targetId: `${worldId}-advanced-scenarios`, label: 'Advanced Scenarios' },
        { kind: 'ai-mentor', targetId: `${worldId}-specialist-mentor`, label: 'Specialist AI Mentor' },
      ],
      optional: true,
      version: '1.0.0',
    },
    {
      id: expansionSlug(worldId, 'business-ownership'),
      careerWorldId: worldId,
      slug: 'business-ownership',
      displayName: `${professionLabel} Business Ownership™`,
      specializationLabel: 'Business Ownership',
      summary: `Launch and operate a legacy business inside ${professionLabel}.`,
      unlocks: [
        { kind: 'business', targetId: `${worldId}-business-founder`, label: 'Business Founder Path' },
        { kind: 'certification', targetId: `${worldId}-business-cert`, label: 'Business Certification Track' },
        { kind: 'district', targetId: `${worldId}-commerce-quarter`, label: 'Commerce Quarter' },
      ],
      optional: true,
      version: '1.0.0',
    },
    {
      id: expansionSlug(worldId, 'industry-leadership'),
      careerWorldId: worldId,
      slug: 'industry-leadership',
      displayName: `${professionLabel} Industry Leadership™`,
      specializationLabel: 'Industry Leadership',
      summary: `Competitions, teaching rights, and industry events for senior ${professionLabel} professionals.`,
      unlocks: [
        { kind: 'competition', targetId: `${worldId}-industry-cup`, label: 'Industry Cup' },
        { kind: 'certification', targetId: `${worldId}-leadership-cert`, label: 'Leadership Certification' },
        { kind: 'hero-object', targetId: `hero-object.${worldId}.leadership`, label: 'Leadership Hero Object' },
      ],
      optional: true,
      version: '1.0.0',
    },
  ];
}

function seedExpansions(): void {
  for (const worldId of CAREER_WORLD_IDS) {
    const professionLabel = worldId.replace(/-world$/, '').replace(/-/g, ' ');
    for (const expansion of universalExpansions(worldId, professionLabel)) {
      EXPANSION_REGISTRY.set(expansion.id, expansion);
    }
  }
}

seedExpansions();

export function registerCareerExpansion(definition: CareerExpansionDefinition): void {
  EXPANSION_REGISTRY.set(definition.id, definition);
}

export function getCareerExpansion(expansionId: string): CareerExpansionDefinition | null {
  return EXPANSION_REGISTRY.get(expansionId) ?? null;
}

export function listExpansionsForWorld(worldId: CareerWorldId): CareerExpansionDefinition[] {
  return [...EXPANSION_REGISTRY.values()].filter((e) => e.careerWorldId === worldId);
}

export function listExpansionIdsForWorld(worldId: CareerWorldId): string[] {
  return listExpansionsForWorld(worldId).map((e) => e.id);
}

export function listAllCareerExpansions(): CareerExpansionDefinition[] {
  return [...EXPANSION_REGISTRY.values()];
}
