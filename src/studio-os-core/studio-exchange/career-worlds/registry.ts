import { CAREER_WORLD_BLUEPRINTS } from '../../career-worlds/catalog';
import type { CareerWorldId } from '../../career-worlds/types';
import type { ExchangeCareerWorldListing } from './schema';
import {
  careerWorldBlueprint,
  professionBrainRef,
  professionIdForCareerWorld,
  simulationEngineRef,
} from './mapping';
import { listExpansionIdsForWorld } from '../expansions/registry';
import { listCertificationIdsForWorld } from '../certifications/registry';

function buildListing(worldId: CareerWorldId): ExchangeCareerWorldListing {
  const blueprint = careerWorldBlueprint(worldId);
  const profession = professionIdForCareerWorld(worldId);

  return {
    careerWorldId: worldId,
    profession,
    displayName: blueprint.name,
    professionBrainRef: professionBrainRef(profession),
    simulationEngineRef: simulationEngineRef(profession),
    expansionRegistryIds: listExpansionIdsForWorld(worldId),
    certificationRegistryIds: listCertificationIdsForWorld(worldId),
    economyModelId: `${worldId}-economy`,
    industryEventPackIds: [`${worldId}-events`],
    mentorNetworkId: `${worldId}-mentor-network`,
    licenseProductId: `license:${worldId}`,
    summary: blueprint.oneLine,
    districts: blueprint.canonicalDistricts,
  };
}

const LISTING_CACHE = CAREER_WORLD_BLUEPRINTS.map((bp) => buildListing(bp.id));

export function listExchangeCareerWorldListings(): ExchangeCareerWorldListing[] {
  return LISTING_CACHE;
}

export function getExchangeCareerWorldListing(worldId: CareerWorldId): ExchangeCareerWorldListing | null {
  return LISTING_CACHE.find((listing) => listing.careerWorldId === worldId) ?? null;
}
