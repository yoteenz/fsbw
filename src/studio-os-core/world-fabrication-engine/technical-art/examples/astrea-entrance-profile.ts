import { resolveProductionProfile } from '../production-profiles';
import type { AssetPackageManifest } from '../asset-package';

/** Astréa Entrance Threshold — environment-art production profile (specification; Test 01 not executed). */
export const ASTREA_ENTRANCE_PROFILE_ID = 'ASTREA_ENTRANCE_THRESHOLD';

export function getAstreaEntranceProductionProfile() {
  return resolveProductionProfile(ASTREA_ENTRANCE_PROFILE_ID);
}

export const ASTREA_ENTRANCE_PLACEHOLDER_PACKAGE: AssetPackageManifest = {
  packageId: 'astrea-entrance-threshold-spec',
  assetId: 'astrea_entrance_threshold',
  productionLane: 'ENVIRONMENT_ART',
  productionProfileId: ASTREA_ENTRANCE_PROFILE_ID,
  version: '0.0.0-spec',
  authorityRefs: ['astrea-visual-authority-approved'],
  folderPresence: {},
  deliverableCompleteness: {},
  knownLimitations: ['No fabrication executed — profile defines requirements for Test 01'],
  approvalState: 'PENDING',
};

export const ASTREA_ENTRANCE_REQUIREMENT_NOTES = [
  'Entrance geometry and architectural modules',
  'Structural materials (marble, glass, ground surfaces)',
  'Collision geometry and walkable path',
  'Navigation constraints and entry trigger',
  'Interior/exterior continuity and reverse-view geometry',
  'Runtime optimization for UNREAL_WORLD delivery',
] as const;
