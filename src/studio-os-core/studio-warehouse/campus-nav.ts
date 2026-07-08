import type { WarehouseCameraZoneId } from './camera-zones';

/** Left ArchitecturalRail™ — department / wing / district destinations only (never scene tabs). */
export type ArchitecturalRailItem =
  | {
      kind: 'zone';
      zoneId: WarehouseCameraZoneId;
      label: string;
      shortLabel: string;
    }
  | {
      kind: 'link';
      href: string;
      label: string;
      shortLabel: string;
    };

/** Canonical left rail — Atlas™ first; wings answer “where am I in the world?” */
export const ARCHITECTURAL_RAIL_ITEMS: ArchitecturalRailItem[] = [
  { kind: 'link', href: '/admin/studio/world-atlas', label: 'Atlas™', shortLabel: 'Atlas' },
  { kind: 'zone', zoneId: 'central-atrium', label: 'Studio Archives™', shortLabel: 'Archives' },
  { kind: 'zone', zoneId: 'warehouse-wing', label: 'Warehouse Wing™', shortLabel: 'Warehouse' },
  { kind: 'zone', zoneId: 'materials-library', label: 'Material Library™', shortLabel: 'Materials' },
  { kind: 'zone', zoneId: 'museum-wing', label: 'Museum Wing™', shortLabel: 'Museum' },
  { kind: 'zone', zoneId: 'hall-of-innovation', label: 'Innovation Hall™', shortLabel: 'Innovation' },
  { kind: 'zone', zoneId: 'company-genome-vault', label: 'Genome Vault™', shortLabel: 'Genome' },
  { kind: 'zone', zoneId: 'blueprint-archive', label: 'Blueprint Hall™', shortLabel: 'Blueprints' },
  { kind: 'zone', zoneId: 'marketplace-imports', label: 'Marketplace Pavilion™', shortLabel: 'Marketplace' },
  { kind: 'zone', zoneId: 'future-expansion-wings', label: 'Future Observatory™', shortLabel: 'Future' },
];

/** Maps any camera zone to its parent architectural destination (rail selection). */
const ZONE_TO_ARCHITECTURAL_DESTINATION: Record<WarehouseCameraZoneId, WarehouseCameraZoneId> = {
  threshold: 'central-atrium',
  'central-atrium': 'central-atrium',
  'warehouse-wing': 'warehouse-wing',
  'environment-gallery': 'warehouse-wing',
  'lighting-gallery': 'warehouse-wing',
  'furniture-hall': 'warehouse-wing',
  'atmosphere-lab': 'warehouse-wing',
  'hero-object-vault': 'warehouse-wing',
  'particle-lab': 'warehouse-wing',
  'animation-archive': 'warehouse-wing',
  'audio-vault': 'warehouse-wing',
  'materials-library': 'materials-library',
  'generation-bay': 'future-expansion-wings',
  'asset-restoration': 'future-expansion-wings',
  'museum-wing': 'museum-wing',
  'hall-of-innovation': 'hall-of-innovation',
  'company-genome-vault': 'company-genome-vault',
  'blueprint-archive': 'blueprint-archive',
  'marketplace-imports': 'marketplace-imports',
  'future-expansion-wings': 'future-expansion-wings',
};

/** Bottom SceneTray™ — scenes / workspaces / exhibits within the active destination only. */
const SCENE_TRAY_ZONES_BY_DESTINATION: Partial<Record<WarehouseCameraZoneId, WarehouseCameraZoneId[]>> = {
  'central-atrium': ['threshold', 'central-atrium'],
  'warehouse-wing': [
    'warehouse-wing',
    'environment-gallery',
    'lighting-gallery',
    'furniture-hall',
    'atmosphere-lab',
    'hero-object-vault',
    'particle-lab',
    'animation-archive',
    'audio-vault',
  ],
  'materials-library': ['materials-library'],
  'museum-wing': ['museum-wing'],
  'hall-of-innovation': ['hall-of-innovation'],
  'company-genome-vault': ['company-genome-vault'],
  'blueprint-archive': ['blueprint-archive'],
  'marketplace-imports': ['marketplace-imports'],
  'future-expansion-wings': ['future-expansion-wings', 'generation-bay', 'asset-restoration'],
};

export function resolveArchitecturalDestination(zoneId: WarehouseCameraZoneId): WarehouseCameraZoneId {
  return ZONE_TO_ARCHITECTURAL_DESTINATION[zoneId] ?? zoneId;
}

export function getSceneTrayZoneIds(destinationId: WarehouseCameraZoneId): WarehouseCameraZoneId[] {
  return SCENE_TRAY_ZONES_BY_DESTINATION[destinationId] ?? [destinationId];
}

export function isArchitecturalDestinationZone(zoneId: WarehouseCameraZoneId): boolean {
  return ARCHITECTURAL_RAIL_ITEMS.some((item) => item.kind === 'zone' && item.zoneId === zoneId);
}

export type ArchivesCampusEntry = {
  id: WarehouseCameraZoneId;
  label: string;
  shortLabel: string;
};

export type ArchivesCampusSection = {
  sectionId: string;
  sectionLabel: string;
  wingKind: WarehouseWingKind;
  zones: ArchivesCampusEntry[];
};

/** Canonical linear campus — founder walks deeper through one monumental headquarters. */
export const ARCHIVES_CAMPUS_SECTIONS: ArchivesCampusSection[] = [
  {
    sectionId: 'entrance',
    sectionLabel: 'Grand Entrance™',
    wingKind: 'threshold',
    zones: [{ id: 'threshold', label: 'Grand Entrance™', shortLabel: 'Entrance' }],
  },
  {
    sectionId: 'atrium',
    sectionLabel: 'Orientation Atrium™',
    wingKind: 'atrium',
    zones: [{ id: 'central-atrium', label: 'Orientation Atrium™', shortLabel: 'Atrium' }],
  },
  {
    sectionId: 'warehouse-wing',
    sectionLabel: 'Warehouse Wing™',
    wingKind: 'warehouse',
    zones: [
      { id: 'warehouse-wing', label: 'Warehouse Wing™', shortLabel: 'Warehouse' },
      { id: 'environment-gallery', label: 'Environment Gallery™', shortLabel: 'Environment' },
      { id: 'lighting-gallery', label: 'Lighting Gallery™', shortLabel: 'Lighting' },
      { id: 'furniture-hall', label: 'Furniture Hall™', shortLabel: 'Furniture' },
      { id: 'materials-library', label: 'Materials Library™', shortLabel: 'Materials' },
      { id: 'atmosphere-lab', label: 'Atmosphere Lab™', shortLabel: 'Atmosphere' },
      { id: 'hero-object-vault', label: 'Hero Object Vault™', shortLabel: 'Hero Vault' },
      { id: 'particle-lab', label: 'Particle Lab™', shortLabel: 'Particles' },
      { id: 'animation-archive', label: 'Animation Archive™', shortLabel: 'Animation' },
      { id: 'audio-vault', label: 'Audio Vault™', shortLabel: 'Audio' },
      { id: 'generation-bay', label: 'Generation Bay™', shortLabel: 'Generation' },
      { id: 'asset-restoration', label: 'Asset Restoration™', shortLabel: 'Restore' },
    ],
  },
  {
    sectionId: 'museum-wing',
    sectionLabel: 'Museum Wing™',
    wingKind: 'legacy',
    zones: [{ id: 'museum-wing', label: 'Museum Wing™', shortLabel: 'Museum' }],
  },
  {
    sectionId: 'innovation',
    sectionLabel: 'Hall of Innovation™',
    wingKind: 'innovation',
    zones: [{ id: 'hall-of-innovation', label: 'Hall of Innovation™', shortLabel: 'Innovation' }],
  },
  {
    sectionId: 'genome-vault',
    sectionLabel: 'Company Genome Vault™',
    wingKind: 'genome',
    zones: [{ id: 'company-genome-vault', label: 'Company Genome Vault™', shortLabel: 'Genome' }],
  },
  {
    sectionId: 'blueprint-archive',
    sectionLabel: 'Blueprint Archive™',
    wingKind: 'blueprint',
    zones: [{ id: 'blueprint-archive', label: 'Blueprint Archive™', shortLabel: 'Blueprints' }],
  },
  {
    sectionId: 'marketplace',
    sectionLabel: 'Marketplace Pavilion™',
    wingKind: 'marketplace',
    zones: [{ id: 'marketplace-imports', label: 'Marketplace Pavilion™', shortLabel: 'Marketplace' }],
  },
  {
    sectionId: 'expansion',
    sectionLabel: 'Future Expansion Wings™',
    wingKind: 'expansion',
    zones: [{ id: 'future-expansion-wings', label: 'Future Expansion Wings™', shortLabel: 'Future' }],
  },
];

/** Flat directory for deep links and legacy callers */
export const WAREHOUSE_CAMPUS_DIRECTORY: ArchivesCampusEntry[] = ARCHIVES_CAMPUS_SECTIONS.flatMap(
  (s) => s.zones
);

export function isWarehouseCameraZoneId(value: string): value is WarehouseCameraZoneId {
  return WAREHOUSE_CAMPUS_DIRECTORY.some((z) => z.id === value);
}

export type WarehouseWingKind =
  | 'threshold'
  | 'atrium'
  | 'warehouse'
  | 'legacy'
  | 'innovation'
  | 'genome'
  | 'blueprint'
  | 'marketplace'
  | 'expansion';

export function warehouseWingKind(zoneId: WarehouseCameraZoneId): WarehouseWingKind {
  if (zoneId === 'threshold') return 'threshold';
  if (zoneId === 'central-atrium') return 'atrium';
  if (zoneId === 'museum-wing') return 'legacy';
  if (zoneId === 'hall-of-innovation') return 'innovation';
  if (zoneId === 'company-genome-vault') return 'genome';
  if (zoneId === 'blueprint-archive') return 'blueprint';
  if (zoneId === 'marketplace-imports') return 'marketplace';
  if (zoneId === 'future-expansion-wings') return 'expansion';
  return 'warehouse';
}
