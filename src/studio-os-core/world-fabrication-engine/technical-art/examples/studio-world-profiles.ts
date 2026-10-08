import { resolveProductionProfile } from '../production-profiles';
import { STUDIO_WORLD_SEASON1_RESIDENT_IDS } from '../character-rig-animation';

export const STUDIO_WORLD_ENVIRONMENT_PROFILE_ID = 'STUDIO_WORLD_ENVIRONMENT_UNREAL';
export const STUDIO_WORLD_CHARACTER_PROFILE_ID = 'STUDIO_WORLD_RESIDENT_UNREAL_CHARACTER';

export function getStudioWorldEnvironmentProfile() {
  return resolveProductionProfile(STUDIO_WORLD_ENVIRONMENT_PROFILE_ID);
}

export function getStudioWorldCharacterProfile() {
  return resolveProductionProfile(STUDIO_WORLD_CHARACTER_PROFILE_ID);
}

/** Example resident technical profile binding — no fabrication in this sprint. */
export function exampleResidentProfileBinding(residentId: (typeof STUDIO_WORLD_SEASON1_RESIDENT_IDS)[number]) {
  return {
    residentId,
    productionProfileId: STUDIO_WORLD_CHARACTER_PROFILE_ID,
    deliveryProfileId: 'CHARACTER_RUNTIME' as const,
    fabricationAuthorized: false,
  };
}

export const STUDIO_WORLD_ENVIRONMENT_SCOPE_NOTES = [
  'Production headquarters and white atrium',
  'Spatial departments and circulation',
  'Resident workplaces and review environments',
  'World fabrication facilities',
] as const;
