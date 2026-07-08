/**
 * Studio Warehouse™ — continuous architectural destination (camera track, not scroll).
 */
import type { WarehouseCameraZoneId, WarehouseDistrictId } from '../../../../studio-os-core/studio-warehouse';

export type { WarehouseCameraZoneId };

export type WarehouseCameraZone = {
  id: WarehouseCameraZoneId;
  label: string;
  shortLabel: string;
  index: number;
  requiresArrival: boolean;
  teaching: string;
  /** Asset district for registry objects in this room (undefined = service wing) */
  districtId?: WarehouseDistrictId;
  galleryLayout?: 'diorama' | 'capsules' | 'showroom' | 'swatches' | 'chambers' | 'vault' | 'loops' | 'service' | 'walkway';
};

export const WAREHOUSE_CAMERA_ZONES: WarehouseCameraZone[] = [
  {
    id: 'threshold',
    label: 'Entrance Hall™',
    shortLabel: 'Entrance',
    index: 0,
    requiresArrival: false,
    teaching: 'Threshold™ — massive warehouse doors, partial sightlines into the atrium beyond.',
    galleryLayout: 'service',
  },
  {
    id: 'central-atrium',
    label: 'Central Atrium™',
    shortLabel: 'Atrium',
    index: 1,
    requiresArrival: true,
    teaching: 'Orientation™ — primary landmark, gallery wings branch from here.',
    galleryLayout: 'service',
  },
  {
    id: 'environment-gallery',
    label: 'Environment Gallery™',
    shortLabel: 'Environ',
    index: 2,
    requiresArrival: true,
    teaching: 'Miniature headquarters displayed like architectural models.',
    districtId: 'environment-gallery',
    galleryLayout: 'diorama',
  },
  {
    id: 'lighting-gallery',
    label: 'Lighting Gallery™',
    shortLabel: 'Light',
    index: 3,
    requiresArrival: true,
    teaching: 'Illuminated capsules suspended in space — compare packs in real time.',
    districtId: 'lighting-gallery',
    galleryLayout: 'capsules',
  },
  {
    id: 'furniture-hall',
    label: 'Furniture Hall™',
    shortLabel: 'Furn',
    index: 4,
    requiresArrival: true,
    teaching: 'Luxury showroom — walk around, rotate, inspect physical props.',
    districtId: 'furniture-hall',
    galleryLayout: 'showroom',
  },
  {
    id: 'materials-library',
    label: 'Materials Library™',
    shortLabel: 'Mat',
    index: 5,
    requiresArrival: true,
    teaching: 'Massive walls of marble, glass, chrome, fabric, and stone finishes.',
    districtId: 'materials-library',
    galleryLayout: 'swatches',
  },
  {
    id: 'atmosphere-lab',
    label: 'Atmosphere Lab™',
    shortLabel: 'Atmos',
    index: 6,
    requiresArrival: true,
    teaching: 'Interactive chambers — fog, bloom, depth, environmental FX.',
    districtId: 'atmosphere-lab',
    galleryLayout: 'chambers',
  },
  {
    id: 'hero-object-vault',
    label: 'Hero Object Vault™',
    shortLabel: 'Hero',
    index: 7,
    requiresArrival: true,
    teaching: 'Floating landmarks under dramatic lighting — Studio Orbs™, monuments.',
    districtId: 'hero-object-vault',
    galleryLayout: 'vault',
  },
  {
    id: 'particle-lab',
    label: 'Particle Lab™',
    shortLabel: 'Part',
    index: 8,
    requiresArrival: true,
    teaching: 'Particle systems, dust motes, shimmer fields in isolation.',
    districtId: 'atmosphere-lab',
    galleryLayout: 'chambers',
  },
  {
    id: 'animation-archive',
    label: 'Animation Archive™',
    shortLabel: 'Anim',
    index: 9,
    requiresArrival: true,
    teaching: 'Runtime loops, idle life, motion trails archived physically.',
    districtId: 'motion-sound-wing',
    galleryLayout: 'loops',
  },
  {
    id: 'audio-vault',
    label: 'Audio Vault™',
    shortLabel: 'Audio',
    index: 10,
    requiresArrival: true,
    teaching: 'Ambient beds, ceremony stems, sonic identity capsules.',
    districtId: 'motion-sound-wing',
    galleryLayout: 'loops',
  },
  {
    id: 'marketplace-imports',
    label: 'Marketplace Imports™',
    shortLabel: 'Import',
    index: 11,
    requiresArrival: true,
    teaching: 'Purchased assets arrive here — choose what enters production.',
    galleryLayout: 'service',
  },
  {
    id: 'restoration-lab',
    label: 'Asset Restoration Lab™',
    shortLabel: 'Restore',
    index: 12,
    requiresArrival: true,
    teaching: 'Repair, upscale, and revalidate archived registry objects.',
    galleryLayout: 'service',
  },
  {
    id: 'generation-bay',
    label: 'Generation Bay™',
    shortLabel: 'Gen',
    index: 13,
    requiresArrival: true,
    teaching: 'New assets manifest on the floor when generation completes.',
    districtId: 'texture-archive',
    galleryLayout: 'service',
  },
  {
    id: 'museum-connection',
    label: 'Museum Connection™',
    shortLabel: 'Museum',
    index: 14,
    requiresArrival: true,
    teaching: 'Walk from production into legacy — Studio Museum™ awaits beyond.',
    galleryLayout: 'walkway',
  },
];

export function getWarehouseZone(id: WarehouseCameraZoneId): WarehouseCameraZone {
  return WAREHOUSE_CAMERA_ZONES.find((z) => z.id === id) ?? WAREHOUSE_CAMERA_ZONES[0];
}

export function warehouseZonePanVw(zone: WarehouseCameraZone): number {
  return zone.index * 100;
}
