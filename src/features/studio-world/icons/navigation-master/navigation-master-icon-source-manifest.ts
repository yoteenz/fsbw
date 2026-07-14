/** Canonical Navigation master sheet source manifest — Sprint 02 Phase 1. */

export const NAVIGATION_MASTER_ICON_SOURCE_MANIFEST_VERSION =
  'studio-world-navigation-master-v1' as const;

export const NAVIGATION_MASTER_SHEET_DIMENSIONS = {
  width: 10240,
  height: 10240,
  rows: 10,
  columns: 10,
  cellSize: 1024,
  minResolution: 8192,
  preferredResolution: 10240,
} as const;

export const NAVIGATION_MASTER_ICON_SOURCES = {
  /** Production master artwork — pure black, no labels, chrome outline icons only. */
  masterSheet: {
    role: 'master-artwork' as const,
    path: 'src/assets/studio-world/navigation/icons/source/studio-world-navigation-master-sheet.png',
    width: NAVIGATION_MASTER_SHEET_DIMENSIONS.width,
    height: NAVIGATION_MASTER_SHEET_DIMENSIONS.height,
    rows: 10,
    columns: 10,
    version: 'studio-world-navigation-master-sheet-v1',
    designFamily: 'studio-world-navigation-chrome-v1',
    background: '#000000',
    note: 'Permanent master artwork — not a runtime sprite. Calibrate then slice.',
  },
  /** Semantic reference map (metadata only — no labeled PNG shipped). */
  semanticCatalog: {
    role: 'semantic-reference' as const,
    registryPath: 'src/features/studio-world/icons/navigation-master/navigation-master-icon-registry.ts',
    version: 'studio-world-navigation-catalog-v1',
    immutable: false,
  },
} as const;

export const NAVIGATION_MASTER_ICON_OUTPUT_DIR =
  'src/assets/studio-world/navigation/icons/generated-v1' as const;

export const NAVIGATION_MASTER_ICON_GRID_CALIBRATION_PATH =
  'src/features/studio-world/icons/navigation-master/grid-calibration/navigation-master-grid-calibration-canonical.json' as const;

export const NAVIGATION_MASTER_ICON_DESIGN_LANGUAGE = {
  strokeWidth: 2.4,
  cornerRadius: 3,
  opticalWeight: 1,
  chromeEdge: 'premium-illuminated-outline',
  glowIntensity: 0.35,
  renderStyle: 'outline-chrome' as const,
} as const;
