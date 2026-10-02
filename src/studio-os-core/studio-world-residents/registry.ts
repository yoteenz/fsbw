import {
  buildDefaultFabricationSheets,
  buildDefaultReferenceAngleChecklist,
} from './fabrication';
import { buildRelationshipGraph } from './relationship-graph';
import { SEASON1_DOCUMENTARY_PROFILES } from './season1-documentary';
import { SEASON1_RELATIONSHIPS } from './season1-relationships';
import { SEASON1_RESIDENTS, getEttaVale as getEttaValeFromSeason1 } from './season1-residents';

export function getEttaVale() {
  return getEttaValeFromSeason1();
}
import { createSocialStoryOutline } from './social-story';
import type {
  ResidentCanonicalIdentity,
  ResidentFabricationRequirements,
  ResidentId,
  Season1ResidentRegistry,
} from './types';
import { STUDIO_WORLD_RESIDENT_SYSTEM_VERSION as REGISTRY_VERSION } from './types';

function buildFabricationRequirements(residents: ResidentCanonicalIdentity[]): ResidentFabricationRequirements[] {
  const ts = '2026-10-02T00:00:00.000Z';
  return residents.map((r) => {
    const sheets = buildDefaultFabricationSheets();
    sheets.CANON_CHARACTER_SHEET = 'approved';
    sheets.DOCUMENTARY_PERFORMANCE_PROFILE = 'approved';
    return {
      residentId: r.residentId,
      sheets,
      referenceAngles: buildDefaultReferenceAngleChecklist(),
      updatedAt: ts,
    };
  });
}

const EXAMPLE_STORY = createSocialStoryOutline({
  id: 'story-schema-example-001',
  domainType: 'OFFICE_TODAY',
  title: 'Schema example — not a published post',
  logline: 'Demonstrates four parallel story layers without generating content.',
  layers: {
    episodicStoryId: 'ep-s1-e001',
    characterArcId: 'arc-etta-s1',
    relationshipArcId: 'arc-etta-caspian',
    studioWorldEventId: 'event-resident-foundation',
  },
  residentIds: ['SW-RESIDENT-001', 'SW-RESIDENT-005'],
});

export const STUDIO_WORLD_SEASON1_REGISTRY: Season1ResidentRegistry = {
  version: REGISTRY_VERSION,
  residents: SEASON1_RESIDENTS,
  relationships: SEASON1_RELATIONSHIPS,
  documentaryProfiles: SEASON1_DOCUMENTARY_PROFILES,
  fabricationRequirements: buildFabricationRequirements(SEASON1_RESIDENTS),
  castRoleContracts: [],
  accessGrants: [],
  socialStoryOutlines: [EXAMPLE_STORY],
};

export function getSeason1ResidentRegistry(): Season1ResidentRegistry {
  return STUDIO_WORLD_SEASON1_REGISTRY;
}

export function getResidentById(id: ResidentId): ResidentCanonicalIdentity | undefined {
  return STUDIO_WORLD_SEASON1_REGISTRY.residents.find((r) => r.residentId === id);
}

export function listSeason1Residents(): ResidentCanonicalIdentity[] {
  return [...STUDIO_WORLD_SEASON1_REGISTRY.residents];
}

export function getRelationshipGraph() {
  return buildRelationshipGraph(STUDIO_WORLD_SEASON1_REGISTRY.relationships);
}

export function assertSeason1RegistryInvariants(): string[] {
  const errors: string[] = [];
  const ids = STUDIO_WORLD_SEASON1_REGISTRY.residents.map((r) => r.residentId);
  const names = STUDIO_WORLD_SEASON1_REGISTRY.residents.map((r) => r.displayName);

  if (ids.length !== 8) errors.push(`Expected 8 residents, got ${ids.length}`);
  if (new Set(ids).size !== ids.length) errors.push('Duplicate resident IDs');
  if (new Set(names).size !== names.length) errors.push('Duplicate resident names');

  const etta = getEttaValeFromSeason1();
  if (etta.residentId !== 'SW-RESIDENT-001') errors.push('Etta must be SW-RESIDENT-001');

  if (STUDIO_WORLD_SEASON1_REGISTRY.documentaryProfiles.length !== 8) {
    errors.push('Expected documentary profile per resident');
  }
  if (STUDIO_WORLD_SEASON1_REGISTRY.fabricationRequirements.length !== 8) {
    errors.push('Expected fabrication checklist per resident');
  }

  for (const profile of STUDIO_WORLD_SEASON1_REGISTRY.documentaryProfiles) {
    if (!ids.includes(profile.residentId)) {
      errors.push(`Orphan documentary profile ${profile.residentId}`);
    }
  }

  return errors;
}
