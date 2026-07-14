/** Canonical Studio World icon source assets — v6 grid-calibrated unlabeled extraction. */
export const STUDIO_WORLD_ICON_SOURCE_MANIFEST_VERSION =
  'studio-world-icon-sources-v6' as const;

export const STUDIO_WORLD_ICON_SOURCES = {
  labeledCatalog: {
    role: 'semantic-reference' as const,
    path: 'src/assets/studio-world/icons/source/studio-world-icon-catalog-labeled.png',
    storagePath:
      '/storage/v1/object/public/live-preview/Studio%20World/740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png',
    width: 1402,
    height: 1122,
    rows: 8,
    columns: 8,
    checksum: 'd7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d',
    version: 'studio-world-icon-catalog-labeled-v1',
    immutable: true,
  },
  /** Founder unlabeled pack — sole production extraction source (no text removal). */
  unlabeledSource: {
    role: 'runtime-extraction-source' as const,
    path: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
    width: 1402,
    height: 1122,
    rows: 8,
    columns: 8,
    checksum: 'cdc5cd987d42a433a88fb84469cab5c56e5183e2b86a6d14e7c098b91fe2e2f9',
    version: 'studio-world-icon-source-unlabeled-v1',
    note: 'Founder unlabeled icon pack — grid calibration extracts glyphs from cells only',
  },
  /** Retired — label-removal twin; debug/rollback only. */
  unlabeledTwin: {
    role: 'historical-only' as const,
    derivation: 'pixel-preserving-label-removal',
    derivationScript: 'scripts/create-studio-world-unlabeled-source-twin.mjs',
    path: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled-twin.png',
    width: 1402,
    height: 1122,
    rows: 8,
    columns: 8,
    checksum: '96a179e4ac77626f9d59be111486eda69176a5b245749827d8749a4663e0e96b',
    version: 'studio-world-icons-v5-source-twin',
    protectedPixelsChanged: 0,
    parityCertified: false,
    note: 'Retired from production — automatic label removal caused corruption risk',
  },
} as const;

export type StudioWorldIconSourceRole =
  | (typeof STUDIO_WORLD_ICON_SOURCES)['labeledCatalog']['role']
  | (typeof STUDIO_WORLD_ICON_SOURCES)['unlabeledSource']['role']
  | (typeof STUDIO_WORLD_ICON_SOURCES)['unlabeledTwin']['role'];

export const STUDIO_WORLD_ICON_EXTRACTION_SOURCE_ROLE = 'unlabeled-grid-calibrated' as const;

/** Runtime generator must never read the labeled catalog or retired twin. */
export const STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATHS = [
  STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path,
  STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.path,
] as const;

export const STUDIO_WORLD_ICON_V6_OUTPUT_DIR =
  'src/assets/studio-world/experience-lab/icons/generated-v6' as const;

export const STUDIO_WORLD_ICON_V6_VERSION = 'studio-world-icons-v6-grid-calibration' as const;

/** @deprecated v5 twin outputs — rollback only */
export const STUDIO_WORLD_ICON_V5_OUTPUT_DIR =
  'src/assets/studio-world/experience-lab/icons/generated-v5' as const;

export const STUDIO_WORLD_ICON_V5_VERSION = 'studio-world-icons-v5-source-twin' as const;

/** @deprecated v4 provisional outputs — comparison only */
export const STUDIO_WORLD_ICON_V4_OUTPUT_DIR =
  'src/assets/studio-world/experience-lab/icons/generated-v4' as const;

export const STUDIO_WORLD_ICON_V4_VERSION = 'studio-world-icons-v4-unlabeled-source' as const;

export const STUDIO_WORLD_ICON_GRID_CALIBRATION_PATH =
  'src/features/studio-world/icons/grid-calibration/studio-world-icon-grid-calibration-canonical.json' as const;
