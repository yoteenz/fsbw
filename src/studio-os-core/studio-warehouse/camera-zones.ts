import type { WarehouseDistrictId } from './types';

/** Camera destination zones inside Studio Warehouse™ immersive campus */
export const WAREHOUSE_CAMERA_ZONE_IDS = [
  'threshold',
  'central-atrium',
  'environment-gallery',
  'lighting-gallery',
  'furniture-hall',
  'materials-library',
  'atmosphere-lab',
  'hero-object-vault',
  'particle-lab',
  'animation-archive',
  'audio-vault',
  'marketplace-imports',
  'restoration-lab',
  'generation-bay',
  'museum-connection',
] as const;

export type WarehouseCameraZoneId = (typeof WAREHOUSE_CAMERA_ZONE_IDS)[number];

export function districtForWarehouseZone(zoneId: WarehouseCameraZoneId): WarehouseDistrictId | null {
  const map: Partial<Record<WarehouseCameraZoneId, WarehouseDistrictId>> = {
    'environment-gallery': 'environment-gallery',
    'lighting-gallery': 'lighting-gallery',
    'furniture-hall': 'furniture-hall',
    'materials-library': 'materials-library',
    'atmosphere-lab': 'atmosphere-lab',
    'hero-object-vault': 'hero-object-vault',
    'particle-lab': 'atmosphere-lab',
    'animation-archive': 'motion-sound-wing',
    'audio-vault': 'motion-sound-wing',
    'generation-bay': 'texture-archive',
  };
  return map[zoneId] ?? null;
}

export function resolveWarehouseZoneForSlot(slotRole: string): WarehouseCameraZoneId {
  const key = slotRole.trim().toLowerCase();
  const rules: Array<[string, WarehouseCameraZoneId]> = [
    ['lighting', 'lighting-gallery'],
    ['furniture', 'furniture-hall'],
    ['environment', 'environment-gallery'],
    ['shell', 'environment-gallery'],
    ['atmosphere', 'atmosphere-lab'],
    ['material', 'materials-library'],
    ['hero', 'hero-object-vault'],
    ['particle', 'particle-lab'],
    ['animation', 'animation-archive'],
    ['audio', 'audio-vault'],
  ];
  for (const [pattern, zoneId] of rules) {
    if (key.includes(pattern)) return zoneId;
  }
  return 'central-atrium';
}
