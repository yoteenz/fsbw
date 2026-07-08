import type { WarehouseCameraZoneId } from './camera-zones';

/** Canonical linear campus — founder walks deeper, never opens another page. */
export const WAREHOUSE_CAMPUS_DIRECTORY: Array<{
  id: WarehouseCameraZoneId;
  label: string;
  shortLabel: string;
}> = [
  { id: 'threshold', label: 'Entrance Hall™', shortLabel: 'Entrance' },
  { id: 'central-atrium', label: 'Central Atrium™', shortLabel: 'Atrium' },
  { id: 'environment-gallery', label: 'Environment Gallery™', shortLabel: 'Environment' },
  { id: 'lighting-gallery', label: 'Lighting Gallery™', shortLabel: 'Lighting' },
  { id: 'furniture-hall', label: 'Furniture Hall™', shortLabel: 'Furniture' },
  { id: 'materials-library', label: 'Materials Library™', shortLabel: 'Materials' },
  { id: 'atmosphere-lab', label: 'Atmosphere Lab™', shortLabel: 'Atmosphere' },
  { id: 'hero-object-vault', label: 'Hero Object Vault™', shortLabel: 'Hero Vault' },
  { id: 'marketplace-imports', label: 'Marketplace Imports™', shortLabel: 'Marketplace' },
  { id: 'museum-wing', label: 'Museum Wing™', shortLabel: 'Museum' },
  { id: 'hall-of-innovation', label: 'Hall of Innovation™', shortLabel: 'Innovation' },
  { id: 'future-expansion-wings', label: 'Future Expansion Wings™', shortLabel: 'Future' },
];

export function isWarehouseCameraZoneId(value: string): value is WarehouseCameraZoneId {
  return WAREHOUSE_CAMPUS_DIRECTORY.some((z) => z.id === value);
}

export type WarehouseWingKind = 'production' | 'legacy' | 'innovation' | 'expansion' | 'threshold';

export function warehouseWingKind(zoneId: WarehouseCameraZoneId): WarehouseWingKind {
  if (zoneId === 'threshold') return 'threshold';
  if (zoneId === 'museum-wing') return 'legacy';
  if (zoneId === 'hall-of-innovation') return 'innovation';
  if (zoneId === 'future-expansion-wings') return 'expansion';
  return 'production';
}
