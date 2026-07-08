/**
 * Industrial Design Campus™ — five architectural wings.
 * ERA 2 — WORLD™
 */

import type { WarehouseCameraZoneId } from './camera-zones';

export type IndustrialCampusWingId =
  | 'asset-gallery'
  | 'blueprint-hall'
  | 'prototype-vault'
  | 'material-library'
  | 'innovation-gallery';

export type IndustrialCampusWing = {
  id: IndustrialCampusWingId;
  label: string;
  tagline: string;
  era: 'ERA 2 — WORLD™';
  zoneIds: WarehouseCameraZoneId[];
};

export const INDUSTRIAL_CAMPUS_WINGS: IndustrialCampusWing[] = [
  {
    id: 'asset-gallery',
    label: 'Asset Gallery™',
    tagline: 'Reusable production assets — environments, lighting, furniture, hero objects.',
    era: 'ERA 2 — WORLD™',
    zoneIds: [
      'warehouse-wing',
      'environment-gallery',
      'lighting-gallery',
      'furniture-hall',
      'hero-object-vault',
      'atmosphere-lab',
      'particle-lab',
      'animation-archive',
      'audio-vault',
    ],
  },
  {
    id: 'blueprint-hall',
    label: 'Blueprint Hall™',
    tagline: 'Scene Blueprints™, dependency diagrams, construction history.',
    era: 'ERA 2 — WORLD™',
    zoneIds: ['blueprint-archive', 'company-genome-vault'],
  },
  {
    id: 'prototype-vault',
    label: 'Prototype Vault™',
    tagline: 'Parallel Futures™, abandoned concepts, Future Merge™ candidates.',
    era: 'ERA 2 — WORLD™',
    zoneIds: ['future-expansion-wings', 'generation-bay', 'asset-restoration'],
  },
  {
    id: 'material-library',
    label: 'Material Library™',
    tagline: 'Glass, marble, metals, fabrics, HDRIs, textures.',
    era: 'ERA 2 — WORLD™',
    zoneIds: ['materials-library'],
  },
  {
    id: 'innovation-gallery',
    label: 'Innovation Gallery™',
    tagline: 'Historic inventions, milestones, flagship breakthroughs.',
    era: 'ERA 2 — WORLD™',
    zoneIds: ['hall-of-innovation', 'museum-wing'],
  },
];

export function industrialWingForZone(zoneId: WarehouseCameraZoneId): IndustrialCampusWing | null {
  return INDUSTRIAL_CAMPUS_WINGS.find((w) => w.zoneIds.includes(zoneId)) ?? null;
}

export function isGalleryZone(zoneId: WarehouseCameraZoneId): boolean {
  const wing = industrialWingForZone(zoneId);
  return wing?.id === 'asset-gallery' || wing?.id === 'material-library';
}

export const INDUSTRIAL_CAMPUS_PHILOSOPHY =
  'Studio World\'s Industrial Design Campus™ — every reusable asset is a museum exhibit worthy of exhibition.';

export const INDUSTRIAL_CAMPUS_SUBTITLE =
  'The living memory of Studio World™ — walk through Apple\'s design lab, Pixar\'s prop warehouse, and a luxury museum archive under one roof.';
