import type { DeliverableSlotId, ProductionProfileDefinition } from './types';

const ENV_BASE: DeliverableSlotId[] = [
  'source_blend',
  'runtime_glb',
  'runtime_fbx',
  'uv_layout',
  'pbr_texture_set',
  'material_definitions',
  'collision_mesh',
  'navigation_metadata',
  'lod_meshes',
  'interaction_anchors',
  'validation_report',
  'review_renders',
  'package_manifest',
];

/** Registered production profiles — conditional deliverables per lane/runtime. */
export const PRODUCTION_PROFILE_REGISTRY: Record<string, ProductionProfileDefinition> = {
  ASTREA_ENTRANCE_THRESHOLD: {
    profileId: 'ASTREA_ENTRANCE_THRESHOLD',
    productionLane: 'ENVIRONMENT_ART',
    deliveryProfileId: 'UNREAL_WORLD',
    description: 'Astréa entrance threshold — navigable environment-art benchmark (spec only until Test 01 executes)',
    requiredDeliverables: [
      'source_blend',
      'runtime_glb',
      'runtime_fbx',
      'material_definitions',
      'collision_mesh',
      'navigation_metadata',
      'interaction_anchors',
      'validation_report',
      'package_manifest',
    ],
    optionalDeliverables: ['high_poly_mesh', 'lod_meshes', 'pbr_texture_set', 'uv_layout', 'review_renders'],
    notApplicableDeliverables: ['skeleton', 'skin_weights', 'animation_clips'],
    qualityGates: [
      'GEOMETRY_READY',
      'MATERIALS_READY',
      'RUNTIME_MESH_READY',
      'COLLISION_READY',
      'SPATIAL_VALIDATION_READY',
      'ENGINE_IMPORT_READY',
      'FOUNDER_VISUAL_APPROVAL',
      'FOUNDER_EXPERIENCE_APPROVAL',
    ],
    supportedTools: ['BLENDER', 'UNREAL', 'CODEX'],
  },
  SITE00_BUILD_OBJECT_WEB_3D: {
    profileId: 'SITE00_BUILD_OBJECT_WEB_3D',
    productionLane: 'PROP_INTERACTIVE_OBJECT_ART',
    deliveryProfileId: 'WEB_3D',
    description: 'SITE 00 BLDR Build Object — modular prop for web GLB delivery',
    requiredDeliverables: [
      'source_blend',
      'runtime_glb',
      'material_definitions',
      'validation_report',
      'package_manifest',
    ],
    optionalDeliverables: ['uv_layout', 'pbr_texture_set', 'collision_mesh', 'interaction_anchors', 'review_renders'],
    notApplicableDeliverables: [
      'skeleton',
      'skin_weights',
      'animation_clips',
      'navigation_metadata',
      'runtime_fbx',
    ],
    qualityGates: [
      'GEOMETRY_READY',
      'MATERIALS_READY',
      'RUNTIME_MESH_READY',
      'FOUNDER_VISUAL_APPROVAL',
    ],
    supportedTools: ['BLENDER', 'CODEX'],
  },
  STUDIO_WORLD_ENVIRONMENT_UNREAL: {
    profileId: 'STUDIO_WORLD_ENVIRONMENT_UNREAL',
    productionLane: 'ENVIRONMENT_ART',
    deliveryProfileId: 'UNREAL_WORLD',
    description: 'Studio World spatial zones — headquarters/atrium/departments (deferred full build)',
    requiredDeliverables: ENV_BASE.filter((d) => d !== 'high_poly_mesh'),
    optionalDeliverables: ['high_poly_mesh'],
    notApplicableDeliverables: ['skeleton', 'skin_weights', 'animation_clips'],
    qualityGates: [
      'GEOMETRY_READY',
      'UV_READY',
      'TEXTURES_READY',
      'MATERIALS_READY',
      'RUNTIME_MESH_READY',
      'COLLISION_READY',
      'SPATIAL_VALIDATION_READY',
      'FOUNDER_VISUAL_APPROVAL',
    ],
    supportedTools: ['BLENDER', 'UNREAL', 'CODEX'],
  },
  STUDIO_WORLD_RESIDENT_UNREAL_CHARACTER: {
    profileId: 'STUDIO_WORLD_RESIDENT_UNREAL_CHARACTER',
    productionLane: 'CHARACTER_ART',
    deliveryProfileId: 'CHARACTER_RUNTIME',
    description:
      'Studio World Season 1 resident — character technical art (creative canon separate; no fabrication in this sprint)',
    requiredDeliverables: [
      'source_blend',
      'runtime_glb',
      'uv_layout',
      'pbr_texture_set',
      'material_definitions',
      'skeleton',
      'skin_weights',
      'collision_mesh',
      'validation_report',
      'package_manifest',
    ],
    optionalDeliverables: ['high_poly_mesh', 'lod_meshes', 'animation_clips', 'engine_import_config', 'review_renders'],
    notApplicableDeliverables: ['navigation_metadata'],
    qualityGates: [
      'GEOMETRY_READY',
      'UV_READY',
      'TEXTURES_READY',
      'MATERIALS_READY',
      'RUNTIME_MESH_READY',
      'RIG_READY',
      'ENGINE_IMPORT_READY',
      'FOUNDER_VISUAL_APPROVAL',
    ],
    supportedTools: ['BLENDER', 'UNREAL', 'CODEX'],
  },
};

export function resolveProductionProfile(profileId: string): ProductionProfileDefinition | undefined {
  return PRODUCTION_PROFILE_REGISTRY[profileId];
}

export function classifyDeliverableForProfile(
  profile: ProductionProfileDefinition,
  slot: DeliverableSlotId
): 'REQUIRED' | 'OPTIONAL' | 'NOT_APPLICABLE' {
  if (profile.requiredDeliverables.includes(slot)) return 'REQUIRED';
  if (profile.optionalDeliverables.includes(slot)) return 'OPTIONAL';
  if (profile.notApplicableDeliverables.includes(slot)) return 'NOT_APPLICABLE';
  return 'OPTIONAL';
}

export function listProfileIdsByLane(lane: ProductionProfileDefinition['productionLane']): string[] {
  return Object.values(PRODUCTION_PROFILE_REGISTRY)
    .filter((p) => p.productionLane === lane)
    .map((p) => p.profileId);
}
