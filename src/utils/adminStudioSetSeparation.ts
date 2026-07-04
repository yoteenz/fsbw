/**
 * Studio / Set separation — reusable master environment vs layered production elements.
 * Applies globally to all studio os sets (Milestone: Studio Set Separation).
 */

export type StudioSetLayerId =
  | 'master-studio'
  | 'reference-scene'
  | 'set-dressing'
  | 'talent-layer'
  | 'episode-graphics';

export const STUDIO_SET_SEPARATION_RULE =
  'Studios are reusable empty filming environments. Talent and episode-specific content are layered during production.';

export const STUDIO_SET_LAYER_ORDER: StudioSetLayerId[] = [
  'master-studio',
  'reference-scene',
  'set-dressing',
  'talent-layer',
  'episode-graphics',
];

export const STUDIO_SET_LAYER_LABELS: Record<StudioSetLayerId, string> = {
  'master-studio': 'MASTER STUDIO',
  'reference-scene': 'REFERENCE SCENE',
  'set-dressing': 'SET DRESSING',
  'talent-layer': 'TALENT LAYER',
  'episode-graphics': 'EPISODE GRAPHIC',
};

export const STUDIO_SET_LAYER_DESCRIPTIONS: Record<StudioSetLayerId, string> = {
  'master-studio': 'Reusable empty filming environment.',
  'reference-scene': 'Example only. Not used as the reusable base environment.',
  'set-dressing': 'Reusable prop or environment add-on.',
  'talent-layer': 'Managed through Talent Agency.',
  'episode-graphics': 'Used per Content Pack.',
};

export const STUDIO_SET_LAYER_SECTION_SUBTITLES: Record<StudioSetLayerId, string> = {
  'master-studio': 'CLEAN REUSABLE SET · NO TALENT · NO EPISODE GRAPHICS',
  'reference-scene': 'STAGED EXAMPLE · PSA · GRAPHICS · PRODUCTS ALLOWED',
  'set-dressing': 'DESK · SCREENS · MICROPHONE · SEASONAL DECOR',
  'talent-layer': 'LINKED FROM TALENT AGENCY · NEVER BAKED INTO MASTER',
  'episode-graphics': 'TITLES · LOWER THIRDS · CTAs · FORECAST OVERLAYS',
};

/** Asset Factory generation order for studio blueprints. */
export const STUDIO_FACTORY_GENERATION_ORDER = [
  'MASTER STUDIO',
  'REFERENCE SCENE',
  'SET DRESSING',
  'CAMERA PRESETS',
  'LIGHTING PRESETS',
  'VIDEO LOOPS',
  'EPISODE GRAPHIC TEMPLATES',
  'METADATA',
  'QA',
  'ASSET DIRECTOR POPULATION',
] as const;

export const MASTER_STUDIO_QA_LABELS = [
  'MASTER STUDIO EMPTY',
  'MASTER STUDIO REUSABLE',
  'NO TALENT',
  'NO MANNEQUINS',
  'NO PRODUCTS',
  'NO CAMPAIGN GRAPHICS',
  'NO LOWER THIRDS',
  'NO TEMPORARY TITLES',
  'NO SALES TEXT',
  'NO EPISODE-SPECIFIC TEXT',
] as const;

export const MASTER_STUDIO_QA_FAIL_LABEL = 'FAILED QA — MASTER STUDIO CONTAINS NON-REUSABLE ELEMENTS';

export type StudioBlueprintLayerSpec = {
  layerId: StudioSetLayerId;
  label: string;
  items: string[];
  rules: string[];
};

/** Production Builder / Director Mode layer stack (bottom → top). */
export const PRODUCTION_SCENE_LAYER_STACK: Array<{ key: string; label: string }> = [
  { key: 'masterStudio', label: 'MASTER STUDIO' },
  { key: 'setDressing', label: 'SET DRESSING' },
  { key: 'talent', label: 'TALENT LAYER' },
  { key: 'wardrobe', label: 'WARDROBE' },
  { key: 'pose', label: 'POSE' },
  { key: 'lighting', label: 'LIGHTING' },
  { key: 'camera', label: 'CAMERA' },
  { key: 'episodeGraphics', label: 'EPISODE GRAPHICS' },
  { key: 'cta', label: 'CTA' },
];

export const DIRECTOR_LAYER_TOGGLE_SLOTS: Array<{ key: string; label: string }> = [
  { key: 'baseStudio', label: 'BASE STUDIO' },
  { key: 'setDressing', label: 'SET DRESSING' },
  { key: 'talent', label: 'TALENT' },
  { key: 'wardrobe', label: 'WARDROBE' },
  { key: 'camera', label: 'CAMERA' },
  { key: 'lighting', label: 'LIGHTING' },
  { key: 'graphics', label: 'GRAPHICS' },
  { key: 'cta', label: 'CTA' },
];

export type DirectorLayerToggles = Record<string, boolean>;

export const DEFAULT_DIRECTOR_LAYER_TOGGLES: DirectorLayerToggles = {
  baseStudio: true,
  setDressing: true,
  talent: true,
  wardrobe: true,
  camera: true,
  lighting: true,
  graphics: true,
  cta: true,
};

/** Weather Studio — canonical layer specs for blueprints and Knowledge Hub. */
export const WEATHER_STUDIO_LAYER_SPECS: StudioBlueprintLayerSpec[] = [
  {
    layerId: 'master-studio',
    label: 'MASTER STUDIO',
    items: [
      'EMPTY LUXURY BROADCAST ROOM',
      'WHITE MARBLE ANCHOR DESK',
      'DIGITAL FORECAST WALL',
      'SKYLINE WINDOWS',
      'RED LED ACCENTS',
      'GLASS ARCHITECTURE',
      'CLEAN FLOOR',
      'BUILT-IN SCREENS',
    ],
    rules: [
      'NO TALENT · NO MANNEQUINS · NO PRODUCTS',
      'NO EPISODE TEXT · NO CAMPAIGN GRAPHICS',
      'OPTIONAL MICROPHONE/TABLET ONLY IF PERMANENT SET DRESSING',
    ],
  },
  {
    layerId: 'reference-scene',
    label: 'REFERENCE SCENE',
    items: [
      'PSA AT DESK',
      'FORECAST GRAPHICS',
      'TREND MAP',
      'LOWER THIRD',
      'PRODUCT SPOTLIGHT',
      'FINISHED BROADCAST LOOK',
    ],
    rules: ['VISUAL GUIDANCE ONLY · NEVER REPLACES MASTER STUDIO'],
  },
  {
    layerId: 'set-dressing',
    label: 'SET DRESSING',
    items: [
      'FORECAST DESK',
      'MICROPHONE',
      'FORECAST SCREEN',
      'GLASS PANELS',
      'LUXURY TABLET',
      'DIGITAL PANELS',
      'SEASONAL DECOR',
    ],
    rules: ['REUSABLE PROPS · ATTACH IN PRODUCTION BUILDER'],
  },
  {
    layerId: 'talent-layer',
    label: 'TALENT LAYERS',
    items: ['PSA', 'GUEST STYLIST', 'FOUNDER', 'GUEST HOST'],
    rules: ['FROM TALENT AGENCY / CASTING · NEVER IN MASTER STUDIO'],
  },
  {
    layerId: 'episode-graphics',
    label: 'EPISODE GRAPHICS',
    items: [
      'FORECAST TITLES',
      'TREND MAPS',
      'LOWER THIRDS',
      'COUNTDOWNS',
      'CTAs',
      'PRODUCT CALLOUTS',
      'CAPTIONS',
    ],
    rules: ['PER CONTENT PACK · TOGGLED IN DIRECTOR MODE'],
  },
];

/** Generic studio blueprint layers — all studio os sets. */
export const GENERIC_STUDIO_LAYER_SPECS: StudioBlueprintLayerSpec[] = WEATHER_STUDIO_LAYER_SPECS.map((layer) => ({
  ...layer,
  items: layer.items.slice(0, 4),
}));

/** Variant names that belong to master studio environment (empty set). */
export const MASTER_STUDIO_VARIANT_NAMES = new Set([
  'MASTER BASE',
  'MASTER ENVIRONMENT',
  'MASTER STUDIO',
  'DAY',
  'NIGHT',
  'HOLIDAY',
  'SPRING',
  'SUMMER',
  'LUXURY',
  'LAUNCH',
  'EDITORIAL',
]);

/** Names that indicate a staged reference (may include talent/graphics). */
export const REFERENCE_SCENE_VARIANT_NAMES = new Set([
  'STAGED REFERENCE',
  'REFERENCE SCENE',
  'DAY · STAGED REFERENCE',
  'FINISHED BROADCAST',
  'EXAMPLE PRODUCTION',
]);

export function inferSetLayerFromAssetName(name: string): StudioSetLayerId {
  const upper = name.toUpperCase();
  if (REFERENCE_SCENE_VARIANT_NAMES.has(upper) || upper.includes('STAGED') || upper.includes('REFERENCE')) {
    return 'reference-scene';
  }
  if (upper.includes('LOWER THIRD') || upper.includes('FORECAST MAP') || upper.includes('TITLE') || upper.includes('CTA') || upper.includes('GRAPHIC')) {
    return 'episode-graphics';
  }
  if (
    upper.includes('DESK') ||
    upper.includes('MICROPHONE') ||
    upper.includes('SCREEN') ||
    upper.includes('PANEL') ||
    upper.includes('PROP') ||
    upper.includes('PEDESTAL') ||
    upper.includes('DISPLAY')
  ) {
    return 'set-dressing';
  }
  if (MASTER_STUDIO_VARIANT_NAMES.has(upper) || upper.includes('MASTER')) {
    return 'master-studio';
  }
  return 'master-studio';
}

export function isMasterStudioVariantName(name: string): boolean {
  return inferSetLayerFromAssetName(name) === 'master-studio';
}

/** Demo QA: prior live generates on DAY are treated as reference scenes (may contain staged elements). */
export function shouldReclassifyGeneratedAsReferenceScene(variantName: string, hasGeneratedOutput: boolean): boolean {
  if (!hasGeneratedOutput) return false;
  const upper = variantName.toUpperCase();
  return upper === 'DAY' || upper.includes('STAGED') || REFERENCE_SCENE_VARIANT_NAMES.has(upper);
}

export function runMasterStudioSeparationQa(variantName: string, setLayer: StudioSetLayerId): { passed: boolean; label: string }[] {
  if (setLayer !== 'master-studio') {
    return MASTER_STUDIO_QA_LABELS.map((label) => ({ label, passed: true }));
  }
  const contaminated = shouldReclassifyGeneratedAsReferenceScene(variantName, true);
  return MASTER_STUDIO_QA_LABELS.map((label) => ({
    label,
    passed: !contaminated,
  }));
}

export function masterStudioQaFailed(contaminated: boolean): boolean {
  return contaminated;
}
