/**
 * Studio Warehouse™ — continuous architectural destination (camera track, not scroll).
 */
import type { WarehouseCameraZoneId, WarehouseDistrictId, WarehouseWingKind } from '../../../../studio-os-core/studio-warehouse';
import { warehouseWingKind } from '../../../../studio-os-core/studio-warehouse/campus-nav';

export type { WarehouseCameraZoneId };

export type WarehouseCameraZone = {
  id: WarehouseCameraZoneId;
  label: string;
  shortLabel: string;
  index: number;
  requiresArrival: boolean;
  teaching: string;
  wing: WarehouseWingKind;
  /** Asset district for registry objects in this room (undefined = service wing) */
  districtId?: WarehouseDistrictId;
  galleryLayout?: 'diorama' | 'capsules' | 'showroom' | 'swatches' | 'chambers' | 'vault' | 'loops' | 'service' | 'walkway' | 'legacy-hall' | 'innovation' | 'expansion';
};

export const WAREHOUSE_CAMERA_ZONES: WarehouseCameraZone[] = [
  {
    id: 'threshold',
    label: 'Entrance Hall™',
    shortLabel: 'Entrance',
    index: 0,
    requiresArrival: false,
    wing: 'threshold',
    teaching: 'Threshold™ — massive warehouse doors, partial sightlines into the atrium beyond.',
    galleryLayout: 'service',
  },
  {
    id: 'central-atrium',
    label: 'Central Atrium™',
    shortLabel: 'Atrium',
    index: 1,
    requiresArrival: true,
    wing: 'production',
    teaching: 'Orientation™ — primary landmark, gallery wings branch from here.',
    galleryLayout: 'service',
  },
  {
    id: 'environment-gallery',
    label: 'Environment Gallery™',
    shortLabel: 'Environment',
    index: 2,
    requiresArrival: true,
    wing: 'production',
    teaching: 'Miniature headquarters displayed like architectural models.',
    districtId: 'environment-gallery',
    galleryLayout: 'diorama',
  },
  {
    id: 'lighting-gallery',
    label: 'Lighting Gallery™',
    shortLabel: 'Lighting',
    index: 3,
    requiresArrival: true,
    wing: 'production',
    teaching: 'Illuminated capsules suspended in space — compare packs in real time.',
    districtId: 'lighting-gallery',
    galleryLayout: 'capsules',
  },
  {
    id: 'furniture-hall',
    label: 'Furniture Hall™',
    shortLabel: 'Furniture',
    index: 4,
    requiresArrival: true,
    wing: 'production',
    teaching: 'Luxury showroom — walk around, rotate, inspect physical props.',
    districtId: 'furniture-hall',
    galleryLayout: 'showroom',
  },
  {
    id: 'materials-library',
    label: 'Materials Library™',
    shortLabel: 'Materials',
    index: 5,
    requiresArrival: true,
    wing: 'production',
    teaching: 'Massive walls of marble, glass, chrome, fabric, and stone finishes.',
    districtId: 'materials-library',
    galleryLayout: 'swatches',
  },
  {
    id: 'atmosphere-lab',
    label: 'Atmosphere Lab™',
    shortLabel: 'Atmosphere',
    index: 6,
    requiresArrival: true,
    wing: 'production',
    teaching: 'Interactive chambers — fog, bloom, depth, environmental FX.',
    districtId: 'atmosphere-lab',
    galleryLayout: 'chambers',
  },
  {
    id: 'hero-object-vault',
    label: 'Hero Object Vault™',
    shortLabel: 'Hero Vault',
    index: 7,
    requiresArrival: true,
    wing: 'production',
    teaching: 'Floating landmarks under dramatic lighting — Studio Orbs™, monuments.',
    districtId: 'hero-object-vault',
    galleryLayout: 'vault',
  },
  {
    id: 'marketplace-imports',
    label: 'Marketplace Imports™',
    shortLabel: 'Marketplace',
    index: 8,
    requiresArrival: true,
    wing: 'production',
    teaching: 'Purchased assets arrive here — choose what enters production.',
    galleryLayout: 'service',
  },
  {
    id: 'museum-wing',
    label: 'Museum Wing™',
    shortLabel: 'Museum',
    index: 9,
    requiresArrival: true,
    wing: 'legacy',
    teaching: 'Leave active production — enter legacy. Lighting softens. History is preserved here.',
    galleryLayout: 'legacy-hall',
  },
  {
    id: 'hall-of-innovation',
    label: 'Hall of Innovation™',
    shortLabel: 'Innovation',
    index: 10,
    requiresArrival: true,
    wing: 'innovation',
    teaching: 'Storyteller and inventor wing — prototypes, experiments, what comes next.',
    galleryLayout: 'innovation',
  },
  {
    id: 'future-expansion-wings',
    label: 'Future Expansion Wings™',
    shortLabel: 'Future',
    index: 11,
    requiresArrival: true,
    wing: 'expansion',
    teaching: 'The campus grows as your company grows — expansion bays await future districts.',
    galleryLayout: 'expansion',
  },
];

export function getWarehouseZone(id: WarehouseCameraZoneId): WarehouseCameraZone {
  const zone = WAREHOUSE_CAMERA_ZONES.find((z) => z.id === id);
  if (zone) return zone;
  return WAREHOUSE_CAMERA_ZONES[0]!;
}

export function warehouseZonePanVw(zone: WarehouseCameraZone): number {
  return zone.index * 100;
}

export function warehouseZoneWing(zoneId: WarehouseCameraZoneId): WarehouseWingKind {
  return warehouseWingKind(zoneId);
}
