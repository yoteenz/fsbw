import type { DeliverableSlotId, PackageCompletenessCell, ProductionLane } from './types';
import { classifyDeliverableForProfile, resolveProductionProfile } from './production-profiles';

/** Example folder layout — only required folders need exist at delivery time. */
export const ASSET_PACKAGE_FOLDER_SLOTS = [
  '00_MANIFEST',
  '01_REFERENCES',
  '02_SOURCE_MODELS',
  '03_HIGH_POLY',
  '04_RUNTIME_MESHES',
  '05_UV',
  '06_TEXTURES',
  '07_MATERIALS',
  '08_COLLISION_AND_LOD',
  '09_RIG_AND_ANIMATION',
  '10_ENGINE_FILES',
  '11_EXPORTS',
  '12_RENDERS_AND_QA',
] as const;

export type AssetPackageManifest = {
  packageId: string;
  assetId: string;
  productionLane: ProductionLane;
  productionProfileId: string;
  version: string;
  authorityRefs: string[];
  folderPresence: Partial<Record<(typeof ASSET_PACKAGE_FOLDER_SLOTS)[number], PackageCompletenessCell>>;
  deliverableCompleteness: Partial<Record<DeliverableSlotId, PackageCompletenessCell>>;
  checksums?: Record<string, string>;
  knownLimitations: string[];
  approvalState: string;
};

const SLOT_TO_FOLDER: Partial<Record<DeliverableSlotId, (typeof ASSET_PACKAGE_FOLDER_SLOTS)[number]>> = {
  source_blend: '02_SOURCE_MODELS',
  runtime_glb: '11_EXPORTS',
  runtime_fbx: '11_EXPORTS',
  high_poly_mesh: '03_HIGH_POLY',
  uv_layout: '05_UV',
  pbr_texture_set: '06_TEXTURES',
  material_definitions: '07_MATERIALS',
  collision_mesh: '08_COLLISION_AND_LOD',
  lod_meshes: '08_COLLISION_AND_LOD',
  navigation_metadata: '10_ENGINE_FILES',
  skeleton: '09_RIG_AND_ANIMATION',
  skin_weights: '09_RIG_AND_ANIMATION',
  animation_clips: '09_RIG_AND_ANIMATION',
  engine_import_config: '10_ENGINE_FILES',
  interaction_anchors: '10_ENGINE_FILES',
  validation_report: '12_RENDERS_AND_QA',
  review_renders: '12_RENDERS_AND_QA',
  package_manifest: '00_MANIFEST',
};

export function evaluatePackageCompleteness(
  manifest: AssetPackageManifest
): { slot: DeliverableSlotId; expected: PackageCompletenessCell; actual: PackageCompletenessCell; ok: boolean }[] {
  const profile = resolveProductionProfile(manifest.productionProfileId);
  if (!profile) {
    return [];
  }
  const rows: {
    slot: DeliverableSlotId;
    expected: PackageCompletenessCell;
    actual: PackageCompletenessCell;
    ok: boolean;
  }[] = [];

  const allSlots = new Set<DeliverableSlotId>([
    ...profile.requiredDeliverables,
    ...profile.optionalDeliverables,
    ...profile.notApplicableDeliverables,
  ]);

  for (const slot of allSlots) {
    const classification = classifyDeliverableForProfile(profile, slot);
    let expected: PackageCompletenessCell;
    if (classification === 'NOT_APPLICABLE') expected = 'NOT_APPLICABLE';
    else if (classification === 'OPTIONAL') expected = 'NOT_REQUIRED';
    else expected = 'PRESENT';

    const actual = manifest.deliverableCompleteness[slot] ?? 'MISSING';
    let ok = true;
    if (classification === 'REQUIRED') {
      ok = actual === 'PRESENT' || actual === 'UNVERIFIED';
    } else if (classification === 'NOT_APPLICABLE') {
      ok = actual === 'NOT_APPLICABLE' || actual === 'NOT_REQUIRED' || actual === 'MISSING';
    } else {
      ok = true;
    }
    rows.push({ slot, expected, actual, ok });
  }
  return rows;
}

export function packageCompletenessSummary(
  manifest: AssetPackageManifest
): { ready: boolean; blocking: DeliverableSlotId[] } {
  const rows = evaluatePackageCompleteness(manifest);
  const blocking = rows.filter((r) => !r.ok && r.expected === 'PRESENT').map((r) => r.slot);
  return { ready: blocking.length === 0, blocking };
}

export function inferFolderExpectations(profileId: string): (typeof ASSET_PACKAGE_FOLDER_SLOTS)[number][] {
  const profile = resolveProductionProfile(profileId);
  if (!profile) return ['00_MANIFEST'];
  const folders = new Set<(typeof ASSET_PACKAGE_FOLDER_SLOTS)[number]>(['00_MANIFEST', '01_REFERENCES']);
  for (const slot of profile.requiredDeliverables) {
    const folder = SLOT_TO_FOLDER[slot];
    if (folder) folders.add(folder);
  }
  return [...folders];
}
