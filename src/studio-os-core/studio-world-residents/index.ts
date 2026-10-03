/**
 * Studio World Resident System — Season 1 foundation.
 * Product: Studio World (living digital office). Not Studio OS machinery. Not SITE 00.
 */

export * from './types';
export * from './season1-ensemble';
export * from './fabrication';
export * from './casting';
export * from './access';
export * from './social-story';
export * from './canon-versioning';
export * from './relationship-graph';
export {
  SEASON1_RESIDENT_IDS,
  SEASON1_RESIDENTS,
} from './season1-residents';
export * from './season1-relationships';
export * from './season1-documentary';
export {
  STUDIO_WORLD_SEASON1_REGISTRY,
  assertSeason1RegistryInvariants,
  getEttaVale,
  getRelationshipGraph,
  getResidentById,
  getSeason1ResidentRegistry,
  listSeason1Residents,
} from './registry';
export * from './life-os';
