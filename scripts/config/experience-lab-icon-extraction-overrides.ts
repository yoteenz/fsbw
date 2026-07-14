/**
 * Centralized per-icon extraction overrides for Experience Lab icon pipeline.
 * Consumed at runtime by scripts/experience-lab-icon-extraction-overrides.mjs
 * (Node cannot import .ts directly — keep both files in sync).
 */

export type ExperienceLabIconExtractionOverride = {
  semanticKey?: string;
  sourceLabel?: string;
  sourceRow?: number;
  sourceColumn?: number;
  /** Exclusive upper Y bound for glyph region (0–1 fraction of cell height). */
  labelExclusionY?: number;
  /** Absolute label cutoff row in source cell pixels. */
  labelStart?: number;
  glyphTop?: number;
  glyphBottom?: number;
  glyphLeft?: number;
  glyphRight?: number;
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
  luminanceThreshold?: number;
  alphaFloor?: number;
  alphaCeiling?: number;
  safePadding?: number;
  opticalScale?: number;
  verticalOffset?: number;
  horizontalOffset?: number;
  expectedOccupancyRange?: [number, number];
  notes?: string;
  overrideReason?: string;
};

/** Founder-confirmed failures + related audit icons with surgical bounds. */
export const EXPERIENCE_LAB_ICON_EXTRACTION_OVERRIDES: Record<
  string,
  ExperienceLabIconExtractionOverride
> = {
  zoomIn: {
    sourceLabel: 'ZOOM IN',
    sourceRow: 3,
    sourceColumn: 0,
    labelExclusionY: 0.64,
    glyphTop: 14,
    glyphBottom: 87,
    overrideReason: 'Magnifier handle ends above ZOOM IN label band; prior cutoff included label strokes.',
  },
  materials: {
    sourceLabel: 'MATERIALS',
    sourceRow: 0,
    sourceColumn: 3,
    labelExclusionY: 0.82,
    glyphTop: 57,
    glyphBottom: 86,
    overrideReason: 'Paint-bucket glyph sits above MATERIALS label; auto bounds included label strokes.',
  },
  analytics: {
    sourceLabel: 'ANALYTICS',
    sourceRow: 1,
    sourceColumn: 4,
    labelExclusionY: 0.78,
    glyphTop: 11,
    glyphBottom: 78,
    overrideReason: 'Bar-chart glyph merged with ANALYTICS word band in single bounding box.',
  },
  permissions: {
    sourceLabel: 'PERMISSIONS',
    sourceRow: 7,
    sourceColumn: 5,
    labelExclusionY: 0.68,
    glyphTop: 0,
    glyphBottom: 70,
    overrideReason: 'Permit shield glyph overlapped PERMISSIONS baseline fragments.',
  },
  camera: {
    sourceLabel: 'CAMERA',
    sourceRow: 0,
    sourceColumn: 5,
    labelExclusionY: 0.84,
    glyphTop: 57,
    glyphBottom: 82,
    overrideReason: 'Camera body clipped low; label band false-positive extended bounds.',
  },
  playback: {
    sourceLabel: 'PLAYBACK',
    sourceRow: 2,
    sourceColumn: 0,
    labelExclusionY: 0.58,
    glyphTop: 14,
    glyphBottom: 76,
    overrideReason: 'Animation-studio play glyph contaminated by PLAYBACK label strokes.',
  },
  perspective: {
    sourceLabel: 'PERSPECTIVE',
    sourceRow: 3,
    sourceColumn: 5,
    labelExclusionY: 0.58,
    glyphTop: 13,
    glyphBottom: 68,
    overrideReason: 'Composition cube picked up PERSPECTIVE label characters.',
  },
  terminal: {
    sourceLabel: 'TERMINAL',
    sourceRow: 7,
    sourceColumn: 2,
    labelExclusionY: 0.68,
    glyphTop: 5,
    glyphBottom: 70,
    overrideReason: 'Command-center terminal glyph included TERMINAL word band.',
  },
  dashboard: {
    sourceLabel: 'DASHBOARD',
    sourceRow: 7,
    sourceColumn: 0,
    labelExclusionY: 0.68,
    glyphTop: 0,
    glyphBottom: 70,
    overrideReason: 'Dashboard tiles merged with DASHBOARD label baseline.',
  },
  orbit: {
    sourceLabel: 'ORBIT',
    sourceRow: 3,
    sourceColumn: 4,
    labelExclusionY: 0.58,
    glyphTop: 14,
    glyphBottom: 68,
    overrideReason: 'Studio World orbit ring overlapped ORBIT label strokes.',
  },
  performance: {
    sourceLabel: 'PERFORMANCE',
    sourceRow: 1,
    sourceColumn: 5,
    labelExclusionY: 0.78,
    glyphTop: 11,
    glyphBottom: 76,
    overrideReason: 'Gauge glyph merged with PERFORMANCE label band.',
  },
  diagnostics: {
    sourceLabel: 'DIAGNOSTICS',
    sourceRow: 7,
    sourceColumn: 3,
    labelExclusionY: 0.68,
    glyphTop: 1,
    glyphBottom: 70,
    overrideReason: 'Diagnostics pulse glyph included DIAGNOSTICS baseline.',
  },
  attachments: {
    sourceLabel: 'ATTACHMENTS',
    sourceRow: 6,
    sourceColumn: 3,
    labelExclusionY: 0.72,
    glyphTop: 8,
    glyphBottom: 95,
    overrideReason: 'Asset-reference clip glyph picked up ATTACHMENTS label strip.',
  },
  team: {
    sourceLabel: 'TEAM',
    sourceRow: 5,
    sourceColumn: 7,
    labelExclusionY: 0.72,
    glyphTop: 10,
    glyphBottom: 88,
    overrideReason: 'Workforce center figures overlapped TEAM label.',
  },
  share: {
    sourceLabel: 'SHARE',
    sourceRow: 5,
    sourceColumn: 5,
    labelExclusionY: 0.72,
    glyphTop: 10,
    glyphBottom: 88,
    overrideReason: 'Marketplace share nodes overlapped SHARE label band.',
  },
  construction: {
    sourceLabel: 'CONSTRUCTION',
    sourceRow: 0,
    sourceColumn: 2,
    labelExclusionY: 0.82,
    glyphTop: 57,
    glyphBottom: 95,
    overrideReason: 'Architectural tools hard-hat glyph label-safe cutoff.',
  },
  lighting: {
    sourceLabel: 'LIGHTING',
    sourceRow: 0,
    sourceColumn: 4,
    labelExclusionY: 0.82,
    glyphTop: 50,
    glyphBottom: 90,
    overrideReason: 'Lighting fixture low stroke needed explicit ceiling.',
  },
  blueprint: {
    sourceLabel: 'BLUEPRINT',
    sourceRow: 0,
    sourceColumn: 1,
    labelExclusionY: 0.82,
    glyphTop: 57,
    glyphBottom: 95,
    overrideReason: 'Blueprint roll glyph label-safe cutoff.',
  },
  splitView: {
    sourceLabel: 'SPLIT VIEW',
    sourceRow: 0,
    sourceColumn: 6,
    labelExclusionY: 0.82,
    glyphTop: 45,
    glyphBottom: 95,
    overrideReason: 'Split-view panes label-safe cutoff.',
  },
  founderRender: {
    sourceLabel: 'FOUNDER RENDER',
    sourceRow: 0,
    sourceColumn: 7,
    labelExclusionY: 0.82,
    glyphTop: 45,
    glyphBottom: 95,
    overrideReason: 'Founder render star glyph label-safe cutoff.',
  },
};

export const EXPERIENCE_LAB_ICON_FOUNDER_REPORTED_KEYS = [
  'zoomIn',
  'materials',
  'analytics',
  'permissions',
  'camera',
  'playback',
  'perspective',
  'terminal',
  'dashboard',
] as const;
