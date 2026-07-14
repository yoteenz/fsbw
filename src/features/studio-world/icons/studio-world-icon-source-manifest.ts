/** Canonical Studio World icon source assets — dual-role manifest. */
export const STUDIO_WORLD_ICON_SOURCE_MANIFEST_VERSION =
  'studio-world-icon-sources-v4' as const;

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
  },
  unlabeledSource: {
    role: 'runtime-extraction-source' as const,
    path: 'src/assets/studio-world/icons/source/studio-world-icon-source-unlabeled.png',
    storagePath:
      '/storage/v1/object/public/live-preview/Studio%20World/E0141347-B0F9-4795-B86B-C402E0B3C84E.png',
    width: 1402,
    height: 1122,
    rows: 8,
    columns: 8,
    checksum: 'cdc5cd987d42a433a88fb84469cab5c56e5183e2b86a6d14e7c098b91fe2e2f9',
    version: 'studio-world-icon-source-unlabeled-v1',
  },
} as const;

export type StudioWorldIconSourceRole =
  | (typeof STUDIO_WORLD_ICON_SOURCES)['labeledCatalog']['role']
  | (typeof STUDIO_WORLD_ICON_SOURCES)['unlabeledSource']['role'];

export const STUDIO_WORLD_ICON_EXTRACTION_SOURCE_ROLE = 'unlabeled-production-source' as const;

/** Runtime generator must never read the labeled catalog. */
export const STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATH =
  STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path;

export const STUDIO_WORLD_ICON_V4_OUTPUT_DIR =
  'src/assets/studio-world/experience-lab/icons/generated-v4' as const;

export const STUDIO_WORLD_ICON_V4_VERSION = 'studio-world-icons-v4-unlabeled-source' as const;
