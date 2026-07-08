import type { WarehouseCameraZoneId } from './camera-zones';

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
