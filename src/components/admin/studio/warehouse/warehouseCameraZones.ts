/**
 * Studio Archives™ — continuous architectural destination (camera track, not scroll).
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
  districtId?: WarehouseDistrictId;
  galleryLayout?:
    | 'diorama'
    | 'capsules'
    | 'showroom'
    | 'swatches'
    | 'chambers'
    | 'vault'
    | 'loops'
    | 'service'
    | 'walkway'
    | 'legacy-hall'
    | 'innovation'
    | 'expansion'
    | 'genome'
    | 'blueprint'
    | 'marketplace-hall'
    | 'production-bay';
};

export const WAREHOUSE_CAMERA_ZONES: WarehouseCameraZone[] = [
  {
    id: 'threshold',
    label: 'Grand Entrance™',
    shortLabel: 'Entrance',
    index: 0,
    requiresArrival: false,
    wing: 'threshold',
    teaching: 'Iconic architectural entrance — permanence, creativity, legacy. Studio Orb™ welcomes you.',
    galleryLayout: 'service',
  },
  {
    id: 'central-atrium',
    label: 'Orientation Atrium™',
    shortLabel: 'Atrium',
    index: 1,
    requiresArrival: true,
    wing: 'atrium',
    teaching: 'Monumental heart of Studio Archives™ — every wing branches from here.',
    galleryLayout: 'service',
  },
  {
    id: 'warehouse-wing',
    label: 'Warehouse Wing™',
    shortLabel: 'Warehouse',
    index: 2,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Active reusable production assets — every generated object physically lives here.',
    galleryLayout: 'service',
  },
  {
    id: 'environment-gallery',
    label: 'Environment Gallery™',
    shortLabel: 'Environment',
    index: 3,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Miniature headquarters displayed like architectural models in a design lab.',
    districtId: 'environment-gallery',
    galleryLayout: 'diorama',
  },
  {
    id: 'lighting-gallery',
    label: 'Lighting Gallery™',
    shortLabel: 'Lighting',
    index: 4,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Illuminated capsules suspended in space — compare packs in real time.',
    districtId: 'lighting-gallery',
    galleryLayout: 'capsules',
  },
  {
    id: 'furniture-hall',
    label: 'Furniture Hall™',
    shortLabel: 'Furniture',
    index: 5,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Luxury showroom — walk around, rotate, inspect physical props.',
    districtId: 'furniture-hall',
    galleryLayout: 'showroom',
  },
  {
    id: 'materials-library',
    label: 'Materials Library™',
    shortLabel: 'Materials',
    index: 6,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Massive walls of marble, glass, chrome, fabric, and stone finishes.',
    districtId: 'materials-library',
    galleryLayout: 'swatches',
  },
  {
    id: 'atmosphere-lab',
    label: 'Atmosphere Lab™',
    shortLabel: 'Atmosphere',
    index: 7,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Interactive chambers — fog, bloom, depth, environmental FX.',
    districtId: 'atmosphere-lab',
    galleryLayout: 'chambers',
  },
  {
    id: 'hero-object-vault',
    label: 'Hero Object Vault™',
    shortLabel: 'Hero Vault',
    index: 8,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Floating landmarks under dramatic lighting — Studio Orbs™, monuments.',
    districtId: 'hero-object-vault',
    galleryLayout: 'vault',
  },
  {
    id: 'particle-lab',
    label: 'Particle Lab™',
    shortLabel: 'Particles',
    index: 9,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Particle system demonstration chambers — dust, shimmer, atmospheric fields.',
    districtId: 'motion-sound-wing',
    galleryLayout: 'chambers',
  },
  {
    id: 'animation-archive',
    label: 'Animation Archive™',
    shortLabel: 'Animation',
    index: 10,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Motion archive aisle — looping runtime displays and idle life previews.',
    districtId: 'motion-sound-wing',
    galleryLayout: 'loops',
  },
  {
    id: 'audio-vault',
    label: 'Audio Vault™',
    shortLabel: 'Audio',
    index: 11,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Acoustic vault — ambient beds, sonic identity, listening pods.',
    districtId: 'motion-sound-wing',
    galleryLayout: 'vault',
  },
  {
    id: 'generation-bay',
    label: 'Generation Bay™',
    shortLabel: 'Generation',
    index: 12,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Active asset production floor — Scene Stack™ assembly in progress.',
    galleryLayout: 'production-bay',
  },
  {
    id: 'asset-restoration',
    label: 'Asset Restoration™',
    shortLabel: 'Restore',
    index: 13,
    requiresArrival: true,
    wing: 'warehouse',
    teaching: 'Restoration workshop — repair, refine, and revalidate archived assets.',
    galleryLayout: 'production-bay',
  },
  {
    id: 'museum-wing',
    label: 'Museum Wing™',
    shortLabel: 'Museum',
    index: 14,
    requiresArrival: true,
    wing: 'legacy',
    teaching: 'Company legacy — Golden Builds™, historic launches, founder journey preserved.',
    galleryLayout: 'legacy-hall',
  },
  {
    id: 'hall-of-innovation',
    label: 'Hall of Innovation™',
    shortLabel: 'Innovation',
    index: 15,
    requiresArrival: true,
    wing: 'innovation',
    teaching: 'Breakthroughs and inventions — Innovation Tree™, living history of Studio OS.',
    galleryLayout: 'innovation',
  },
  {
    id: 'company-genome-vault',
    label: 'Company Genome Vault™',
    shortLabel: 'Genome',
    index: 16,
    requiresArrival: true,
    wing: 'genome',
    teaching: 'Permanent DNA of the company — brand, taste, motion, reuse patterns, evolving memory.',
    galleryLayout: 'genome',
  },
  {
    id: 'blueprint-archive',
    label: 'Blueprint Archive™',
    shortLabel: 'Blueprints',
    index: 17,
    requiresArrival: true,
    wing: 'blueprint',
    teaching: 'Reusable company systems — versioned, forkable, marketplace-eligible blueprints.',
    galleryLayout: 'blueprint',
  },
  {
    id: 'marketplace-imports',
    label: 'Marketplace Pavilion™',
    shortLabel: 'Marketplace',
    index: 18,
    requiresArrival: true,
    wing: 'marketplace',
    teaching: 'Architectural exposition hall — preview, compare, purchase, import into production.',
    galleryLayout: 'marketplace-hall',
  },
  {
    id: 'future-expansion-wings',
    label: 'Future Expansion Wings™',
    shortLabel: 'Future',
    index: 19,
    requiresArrival: true,
    wing: 'expansion',
    teaching: 'Expandable campus — Research Institute™, AI Laboratory™, Patent Vault™, and more await.',
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
