import type { DeliveryProfileId } from './types';

export type EngineDeliveryProfile = {
  profileId: DeliveryProfileId;
  preferredFormats: string[];
  textureRules: string[];
  performanceNotes: string[];
  interactionMappingRequired: boolean;
  navigationGenerationNotes: string[];
};

export const ENGINE_DELIVERY_PROFILES: Record<DeliveryProfileId, EngineDeliveryProfile> = {
  WEB_3D: {
    profileId: 'WEB_3D',
    preferredFormats: ['GLB', 'glTF'],
    textureRules: [
      'Web-compatible PBR (metallic-roughness)',
      'Optimized texture sizes',
      'sRGB base color; non-color data for normal/roughness/metal',
    ],
    performanceNotes: ['Reasonable mesh complexity', 'Stable module names', 'Useful pivots'],
    interactionMappingRequired: true,
    navigationGenerationNotes: ['Web navigation is custom — Unreal navmesh does not auto-transfer'],
  },
  UNREAL_WORLD: {
    profileId: 'UNREAL_WORLD',
    preferredFormats: ['FBX', 'GLB', 'UASSET'],
    textureRules: ['Material conversion from Blender master', 'Lightmap UV when baked lighting used'],
    performanceNotes: ['LOD strategy per zone', 'Collision separate from visible mesh'],
    interactionMappingRequired: true,
    navigationGenerationNotes: ['Unreal navmesh generation expected in-engine'],
  },
  CHARACTER_RUNTIME: {
    profileId: 'CHARACTER_RUNTIME',
    preferredFormats: ['FBX', 'GLB'],
    textureRules: ['Skin/hair/clothing material sets', 'Non-color normal/ORM packs'],
    performanceNotes: ['Character LODs', 'Collision capsule'],
    interactionMappingRequired: false,
    navigationGenerationNotes: ['Character locomotion via animation, not navmesh on mesh'],
  },
  CINEMATIC_MASTER: {
    profileId: 'CINEMATIC_MASTER',
    preferredFormats: ['BLEND', 'FBX', 'EXR'],
    textureRules: ['Premium source materials', 'High-resolution textures'],
    performanceNotes: ['Not optimized for realtime — separate runtime exports required'],
    interactionMappingRequired: false,
    navigationGenerationNotes: ['Not applicable'],
  },
};

export function getEngineDeliveryProfile(id: DeliveryProfileId): EngineDeliveryProfile {
  return ENGINE_DELIVERY_PROFILES[id];
}
