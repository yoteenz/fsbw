/** Professional game-art production contracts — conditional by lane and profile. */

export type ProductionLane = 'ENVIRONMENT_ART' | 'CHARACTER_ART' | 'PROP_INTERACTIVE_OBJECT_ART';

export type DeliveryProfileId =
  | 'WEB_3D'
  | 'UNREAL_WORLD'
  | 'CHARACTER_RUNTIME'
  | 'CINEMATIC_MASTER';

export type GeometryRole =
  | 'SOURCE_GEOMETRY'
  | 'HIGH_DETAIL_GEOMETRY'
  | 'RUNTIME_GEOMETRY'
  | 'COLLISION_GEOMETRY'
  | 'OPTIONAL_LOD_GEOMETRY';

export type UvMappingStrategy =
  | 'UNIQUE_UV'
  | 'TILING_UV'
  | 'PROCEDURAL'
  | 'TRIPLANAR'
  | 'UDIM'
  | 'BAKED_ATLAS'
  | 'LIGHTMAP_UV';

export type TextureMapCategory =
  | 'BASE_COLOR'
  | 'NORMAL'
  | 'ROUGHNESS'
  | 'METALLIC'
  | 'AMBIENT_OCCLUSION'
  | 'HEIGHT'
  | 'OPACITY'
  | 'EMISSIVE'
  | 'MASK'
  | 'SPECULAR'
  | 'TRANSMISSION'
  | 'OTHER_CUSTOM';

export type TextureColorSpace = 'SRGB' | 'LINEAR' | 'NON_COLOR_DATA';

export type MaterialFamily =
  | 'MARBLE'
  | 'STONE'
  | 'CONCRETE'
  | 'GLASS'
  | 'FROSTED_GLASS'
  | 'TRANSLUCENT_ACRYLIC'
  | 'METAL'
  | 'WOOD'
  | 'FABRIC'
  | 'LEATHER'
  | 'SKIN'
  | 'HAIR'
  | 'CERAMIC'
  | 'EMISSIVE'
  | 'CUSTOM';

export type MaterialLayerKind =
  | 'MATERIAL_DEFINITION'
  | 'MATERIAL_INSTANCE'
  | 'TEXTURE_SET'
  | 'SOURCE_SHADER'
  | 'RUNTIME_SHADER'
  | 'RENDERER_OVERRIDE';

export type MaterialConversionProfileId =
  | 'BLENDER_MASTER'
  | 'GLTF_PBR'
  | 'UNREAL_MATERIAL'
  | 'OPTIONAL_MAYA_MATERIAL'
  | 'CINEMATIC_RENDER';

export type CollisionPrimitiveType =
  | 'BOX'
  | 'SPHERE'
  | 'CAPSULE'
  | 'CONVEX'
  | 'COMPOUND'
  | 'COMPLEX_MESH'
  | 'TRIGGER_VOLUME'
  | 'NONE';

export type PropClassification =
  | 'STATIC_PROP'
  | 'DECORATIVE_PROP'
  | 'INTERACTIVE_PROP'
  | 'ANIMATED_PROP'
  | 'CONFIGURABLE_PROP';

export type CharacterClassification =
  | 'STATIC_CHARACTER'
  | 'ANIMATED_CHARACTER'
  | 'INTERACTIVE_CHARACTER'
  | 'CINEMATIC_CHARACTER'
  | 'REALTIME_AVATAR';

export type PackageCompletenessCell =
  | 'PRESENT'
  | 'MISSING'
  | 'NOT_REQUIRED'
  | 'NOT_APPLICABLE'
  | 'UNVERIFIED'
  | 'BLOCKED';

export type ValidationSeverity = 'CRITICAL' | 'WARNING' | 'ACCEPTABLE_EXCEPTION' | 'NOT_APPLICABLE';

export type TechnicalArtGate =
  | 'GEOMETRY_READY'
  | 'UV_READY'
  | 'TEXTURES_READY'
  | 'MATERIALS_READY'
  | 'RUNTIME_MESH_READY'
  | 'COLLISION_READY'
  | 'RIG_READY'
  | 'ANIMATION_READY'
  | 'ENGINE_IMPORT_READY'
  | 'SPATIAL_VALIDATION_READY'
  | 'FOUNDER_VISUAL_APPROVAL'
  | 'FOUNDER_EXPERIENCE_APPROVAL';

export type TechnicalArtStatus =
  | 'DRAFT'
  | 'IN_PRODUCTION'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'BLOCKED';

export type CoordinateConvention = {
  unitSystem: 'METERS' | 'CENTIMETERS' | 'CUSTOM';
  modelScale: number;
  worldScale: number;
  upAxis: 'Y_UP' | 'Z_UP';
  forwardAxis: 'NEGATIVE_Z' | 'POSITIVE_Y' | 'CUSTOM';
  sceneOrigin: [number, number, number];
  modularGridSize?: number;
  exportTransformNotes?: string;
};

export type WorldFabricationAssetRecord = {
  assetId: string;
  projectId: string;
  worldId?: string;
  zoneId?: string;
  assetCategory: string;
  productionLane: ProductionLane;
  assetRole: string;
  visualAuthorityId?: string;
  spatialSpecificationId?: string;
  sourceAssetIds: string[];
  targetRuntime: string;
  deliveryProfileId: DeliveryProfileId;
  productionProfileId: string;
  geometryComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  materialComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  animationRequired: boolean;
  riggingRequired: boolean;
  collisionRequired: boolean;
  navigationRequired: boolean;
  interactionRequired: boolean;
  performanceProfile?: string;
  propClassification?: PropClassification;
  characterClassification?: CharacterClassification;
  technicalArtStatus: TechnicalArtStatus;
  approvalStatus: string;
  coordinateConvention?: CoordinateConvention;
};

export type DeliverableSlotId =
  | 'source_blend'
  | 'runtime_glb'
  | 'runtime_fbx'
  | 'high_poly_mesh'
  | 'uv_layout'
  | 'pbr_texture_set'
  | 'material_definitions'
  | 'collision_mesh'
  | 'lod_meshes'
  | 'navigation_metadata'
  | 'skeleton'
  | 'skin_weights'
  | 'animation_clips'
  | 'engine_import_config'
  | 'interaction_anchors'
  | 'validation_report'
  | 'review_renders'
  | 'package_manifest';

export type ProductionProfileDefinition = {
  profileId: string;
  productionLane: ProductionLane;
  deliveryProfileId: DeliveryProfileId;
  description: string;
  requiredDeliverables: DeliverableSlotId[];
  optionalDeliverables: DeliverableSlotId[];
  notApplicableDeliverables: DeliverableSlotId[];
  qualityGates: TechnicalArtGate[];
  supportedTools: Array<'BLENDER' | 'UNREAL' | 'SUBSTANCE_PAINTER' | 'MAYA' | 'CODEX'>;
};
