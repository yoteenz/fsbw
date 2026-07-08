import type { WarehouseDistrictId } from './types';

/** Camera destination zones inside Studio Archives™ immersive campus */
export const WAREHOUSE_CAMERA_ZONE_IDS = [
  'threshold',
  'central-atrium',
  'warehouse-wing',
  'environment-gallery',
  'lighting-gallery',
  'furniture-hall',
  'materials-library',
  'atmosphere-lab',
  'hero-object-vault',
  'particle-lab',
  'animation-archive',
  'audio-vault',
  'generation-bay',
  'asset-restoration',
  'museum-wing',
  'hall-of-innovation',
  'company-genome-vault',
  'blueprint-archive',
  'marketplace-imports',
  'future-expansion-wings',
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
    'particle-lab': 'motion-sound-wing',
    'animation-archive': 'motion-sound-wing',
    'audio-vault': 'motion-sound-wing',
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
    ['motion', 'animation-archive'],
    ['audio', 'audio-vault'],
    ['sound', 'audio-vault'],
    ['generation', 'generation-bay'],
    ['restoration', 'asset-restoration'],
    ['genome', 'company-genome-vault'],
    ['blueprint', 'blueprint-archive'],
    ['marketplace', 'marketplace-imports'],
    ['museum', 'museum-wing'],
    ['legacy', 'museum-wing'],
    ['innovation', 'hall-of-innovation'],
  ];
  for (const [pattern, zoneId] of rules) {
    if (key.includes(pattern)) return zoneId;
  }
  return 'central-atrium';
}
