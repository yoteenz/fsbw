import type { AssetPackageManifest } from '../asset-package';
import { evaluatePackageCompleteness } from '../asset-package';

/**
 * SITE 00 Build Object — technical package audit mapped from known fabrication history.
 * V2 Codex reconstruction status is not verified in-repo; cells marked UNVERIFIED where appropriate.
 */
export const SITE00_BUILD_OBJECT_PACKAGE_AUDIT: AssetPackageManifest = {
  packageId: 'site00-build-object-audit-v1',
  assetId: 'site00_bld_object_poc',
  productionLane: 'PROP_INTERACTIVE_OBJECT_ART',
  productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
  version: 'codex-blender-v1-baseline',
  authorityRefs: ['approved-blueprint-image', 'artlist-rodin-massing'],
  folderPresence: {
    '00_MANIFEST': 'PRESENT',
    '01_REFERENCES': 'PRESENT',
    '02_SOURCE_MODELS': 'PRESENT',
    '04_RUNTIME_MESHES': 'PRESENT',
    '07_MATERIALS': 'PRESENT',
    '11_EXPORTS': 'PRESENT',
    '12_RENDERS_AND_QA': 'PRESENT',
    '05_UV': 'UNVERIFIED',
    '06_TEXTURES': 'NOT_REQUIRED',
    '08_COLLISION_AND_LOD': 'MISSING',
    '09_RIG_AND_ANIMATION': 'NOT_APPLICABLE',
  },
  deliverableCompleteness: {
    source_blend: 'PRESENT',
    runtime_glb: 'PRESENT',
    runtime_fbx: 'PRESENT',
    material_definitions: 'PRESENT',
    validation_report: 'PRESENT',
    review_renders: 'PRESENT',
    package_manifest: 'PRESENT',
    uv_layout: 'UNVERIFIED',
    pbr_texture_set: 'NOT_REQUIRED',
    collision_mesh: 'MISSING',
    interaction_anchors: 'UNVERIFIED',
    skeleton: 'NOT_APPLICABLE',
    skin_weights: 'NOT_APPLICABLE',
    animation_clips: 'NOT_APPLICABLE',
    navigation_metadata: 'NOT_APPLICABLE',
    engine_import_config: 'UNVERIFIED',
  },
  knownLimitations: [
    'Codex Blender V2 reconstruction assigned separately — not verified in this audit',
    'Collision mesh not reported in V1 review bundle',
    'Web runtime integration pending',
  ],
  approvalState: 'FOUNDER_ARCHITECTURAL_REVIEW_RECORDED',
};

export function getSite00BuildObjectAuditRows() {
  return evaluatePackageCompleteness(SITE00_BUILD_OBJECT_PACKAGE_AUDIT);
}
