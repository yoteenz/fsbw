/**
 * Blueprint Manager — Asset Factory foundation (Milestone 18.5).
 * Specification only — no asset generation.
 */

import type { StudioBlueprintLayerSpec } from './adminStudioSetSeparation';
import { GENERIC_STUDIO_LAYER_SPECS, WEATHER_STUDIO_LAYER_SPECS } from './adminStudioSetSeparation';

export const BLUEPRINT_MANAGER_SUBTITLE = 'DEFINE ONCE. GENERATE FOREVER.';

export const BLUEPRINT_MANAGER_INHERITANCE_CHAIN = [
  'BLUEPRINT MANAGER',
  'ASSET FACTORY',
  'ASSET DIRECTOR',
  'PRODUCTION BUILDER',
  'MISSION CONTROL',
] as const;

export type BlueprintScope = 'global' | 'workspace';

export type BlueprintStatus = 'draft' | 'review' | 'approved' | 'deprecated' | 'archived';

export type BlueprintCategoryId =
  | 'studio'
  | 'talent'
  | 'wardrobe'
  | 'product'
  | 'prop'
  | 'material'
  | 'show'
  | 'campaign'
  | 'scene'
  | 'video'
  | 'thumbnail'
  | 'voice'
  | 'music'
  | 'brand-kit';

export type ChecklistItemStatus = 'waiting' | 'ready' | 'incomplete';

export type BlueprintIdentity = {
  name: string;
  category: BlueprintCategoryId;
  workspace: string;
  description: string;
};

export type BlueprintRelationship = {
  id: string;
  label: string;
  route: string;
};

export type BlueprintPromptStackLayer = {
  id: string;
  label: string;
  content: string;
};

export type BlueprintDependencyNode = {
  id: string;
  label: string;
  requires?: string[];
};

export type BlueprintOutputRule = {
  id: string;
  assetType: string;
  spec: string;
};

export type BlueprintValidationRule = {
  id: string;
  label: string;
  description: string;
};

export type BlueprintVersion = {
  version: number;
  savedAt: string;
  note: string;
  snapshot: string;
};

export type BlueprintChecklistItem = {
  id: string;
  label: string;
  status: ChecklistItemStatus;
  category: string;
};

export type BlueprintDefinition = {
  id: string;
  scope: BlueprintScope;
  status: BlueprintStatus;
  identity: BlueprintIdentity;
  requiredImages: string[];
  requiredVideos: string[];
  requiredCameraPresets: string[];
  requiredLighting: string[];
  requiredProps: string[];
  promptStack: BlueprintPromptStackLayer[];
  outputRules: BlueprintOutputRule[];
  dependencies: BlueprintDependencyNode[];
  validationRules: BlueprintValidationRule[];
  usedBy: BlueprintRelationship[];
  checklist: BlueprintChecklistItem[];
  /** Studio blueprints — five-layer set separation spec. */
  studioSetLayers?: StudioBlueprintLayerSpec[];
  metadata: Record<string, string>;
  versionHistory: BlueprintVersion[];
  templateId?: string;
};

export const BLUEPRINT_CATEGORIES: Array<{ id: BlueprintCategoryId; label: string }> = [
  { id: 'studio', label: 'STUDIOS' },
  { id: 'talent', label: 'TALENT' },
  { id: 'wardrobe', label: 'WARDROBE' },
  { id: 'product', label: 'PRODUCTS' },
  { id: 'prop', label: 'PROPS' },
  { id: 'material', label: 'MATERIALS' },
  { id: 'show', label: 'SHOWS' },
  { id: 'campaign', label: 'CAMPAIGNS' },
  { id: 'scene', label: 'SCENES' },
  { id: 'video', label: 'VIDEOS' },
  { id: 'thumbnail', label: 'THUMBNAILS' },
  { id: 'voice', label: 'VOICE PROFILES' },
  { id: 'music', label: 'MUSIC PACKS' },
  { id: 'brand-kit', label: 'BRAND KITS' },
];

export const BLUEPRINT_TEMPLATES: Array<{
  id: string;
  name: string;
  category: BlueprintCategoryId;
  scope: BlueprintScope;
  description: string;
}> = [
  { id: 'tpl-studio', name: 'STUDIO BLUEPRINT', category: 'studio', scope: 'global', description: 'ENVIRONMENT · LIGHTING · CAMERA · PROPS' },
  { id: 'tpl-talent', name: 'TALENT BLUEPRINT', category: 'talent', scope: 'global', description: 'PORTRAITS · WARDROBE · EXPRESSIONS · VOICE' },
  { id: 'tpl-campaign', name: 'CAMPAIGN BLUEPRINT', category: 'campaign', scope: 'global', description: 'HERO · EMAIL · SOCIAL · LOUNGE TV' },
  { id: 'tpl-product', name: 'PRODUCT BLUEPRINT', category: 'product', scope: 'global', description: 'HERO · GRAPHICS · VARIANTS · METADATA' },
  { id: 'tpl-wardrobe', name: 'WARDROBE BLUEPRINT', category: 'wardrobe', scope: 'global', description: 'LOOKS · ACCESSORIES · SEASONAL VARIANTS' },
];

const WEATHER_STUDIO_CHECKLIST: BlueprintChecklistItem[] = [
  { id: 'ck-master', label: 'MASTER STUDIO · EMPTY SET', status: 'waiting', category: 'MASTER STUDIO' },
  { id: 'ck-reference', label: 'REFERENCE SCENE · STAGED EXAMPLE', status: 'waiting', category: 'REFERENCE SCENE' },
  { id: 'ck-dressing', label: 'SET DRESSING', status: 'waiting', category: 'SET DRESSING' },
  { id: 'ck-talent', label: 'TALENT LAYERS · LINKED', status: 'ready', category: 'TALENT LAYERS' },
  { id: 'ck-graphics', label: 'EPISODE GRAPHICS', status: 'waiting', category: 'EPISODE GRAPHICS' },
  { id: 'ck-day', label: 'DAY VARIANT', status: 'waiting', category: 'VERSIONS' },
  { id: 'ck-night', label: 'NIGHT VARIANT', status: 'waiting', category: 'VERSIONS' },
  { id: 'ck-lighting', label: 'LIGHTING PRESETS', status: 'waiting', category: 'LIGHTING' },
  { id: 'ck-video', label: 'VIDEO LOOPS', status: 'waiting', category: 'VIDEOS' },
  { id: 'ck-prompt', label: 'PROMPT', status: 'ready', category: 'PROMPT' },
  { id: 'ck-meta', label: 'METADATA', status: 'ready', category: 'METADATA' },
];

export const WEATHER_STUDIO_BLUEPRINT: BlueprintDefinition = {
  id: 'bp-weather-studio',
  scope: 'workspace',
  status: 'review',
  templateId: 'tpl-studio',
  identity: {
    name: 'WEATHER STUDIO',
    category: 'studio',
    workspace: 'FRONTAL SLAYER',
    description: 'LUXURY BROADCAST WEATHER-INSPIRED PRODUCTION STUDIO.',
  },
  requiredImages: [
    'MASTER STUDIO · EMPTY BASE',
    'REFERENCE SCENE · STAGED EXAMPLE',
    'DAY',
    'NIGHT',
    'HOLIDAY',
    'SPRING',
    'SUMMER',
    'LUXURY',
    'LAUNCH',
    'EDITORIAL',
  ],
  studioSetLayers: WEATHER_STUDIO_LAYER_SPECS,
  requiredVideos: ['INTRO', 'IDLE', 'LOOP', 'TRANSITION', 'OUTRO'],
  requiredCameraPresets: ['WIDE', 'MEDIUM', 'CLOSE', 'HERO', 'PRODUCT', 'POV', 'TOP DOWN'],
  requiredLighting: ['LUXURY DAY', 'LUXURY NIGHT', 'BROADCAST', 'EDITORIAL', 'GOLDEN HOUR', 'CLOUDY'],
  requiredProps: [
    'FORECAST DESK',
    'GLASS WALL',
    'FORECAST SCREEN',
    'LUXURY FLOOR',
    'CLOUD DISPLAY',
    'DIGITAL PANELS',
    'GLASS DISPLAYS',
  ],
  promptStack: [
    { id: 'ps-ws', label: 'WORKSPACE PROMPT', content: 'FRONTAL SLAYER LUXURY EDITORIAL · WHITE MARBLE · GLASS ACRYLIC' },
    { id: 'ps-brand', label: 'BRAND PROMPT', content: 'CHERRY RED ACCENT · FUTURA LABELS · TRUST OVER SALES' },
    { id: 'ps-studio', label: 'STUDIO PROMPT', content: 'BROADCAST WEATHER SET · LUXURY FORECAST DESK · GLASS WALLS' },
    { id: 'ps-light', label: 'LIGHTING PROMPT', content: 'SOFT BROADCAST KEY · EDITORIAL FILL · GOLDEN HOUR VARIANT' },
    { id: 'ps-cam', label: 'CAMERA PROMPT', content: 'WIDE ESTABLISHING · HERO PRODUCT · POV DESK' },
    { id: 'ps-fmt', label: 'PROVIDER FORMATTING', content: 'FAL GPT IMAGE 2 · 3840×1600 · PNG TRANSPARENT WHERE APPLICABLE' },
  ],
  outputRules: [
    { id: 'out-img', assetType: 'IMAGES', spec: '3840×1600 · PNG · TRANSPARENT ASSETS' },
    { id: 'out-vid', assetType: 'VIDEO', spec: '1920×1080 · 4K READY · LOOP ENABLED' },
    { id: 'out-thumb', assetType: 'THUMBNAIL', spec: 'MULTIPLE ASPECT RATIOS' },
    { id: 'out-meta', assetType: 'METADATA', spec: 'AUTO GENERATED' },
  ],
  dependencies: [
    { id: 'dep-ws', label: 'WEATHER STUDIO', requires: ['dep-light'] },
    { id: 'dep-light', label: 'LIGHTING', requires: ['dep-cam'] },
    { id: 'dep-cam', label: 'CAMERA', requires: ['dep-env'] },
    { id: 'dep-env', label: 'ENVIRONMENT', requires: ['dep-workspace'] },
    { id: 'dep-workspace', label: 'WORKSPACE' },
  ],
  validationRules: [
    { id: 'vr-res', label: 'CORRECT RESOLUTION', description: 'MATCH OUTPUT RULE DIMENSIONS' },
    { id: 'vr-aspect', label: 'CORRECT ASPECT RATIO', description: 'HERO 21:9 · THUMB 16:9 / 9:16' },
    { id: 'vr-color', label: 'WORKSPACE COLORS', description: 'MARBLE · GLASS · #EB1C24 ACCENT' },
    { id: 'vr-style', label: 'LUXURY STYLE', description: 'EDITORIAL SPACING · NO GENERIC STOCK' },
    { id: 'vr-prompt', label: 'PROMPT MATCH', description: 'FULL STACK APPLIED IN ORDER' },
    { id: 'vr-name', label: 'NAMING CONVENTION', description: 'WS_{VARIANT}_{ASSET_TYPE}' },
    { id: 'vr-brand', label: 'BRAND COMPLIANCE', description: 'CONTENT BRAIN RULES PASS' },
  ],
  usedBy: [
    { id: 'ub-slay', label: 'THE SLAY REPORT', route: '/admin/studio/show-bible' },
    { id: 'ub-trend', label: 'TREND FORECAST', route: '/admin/studio/content-packs' },
    { id: 'ub-launch', label: 'LAUNCH CAMPAIGN', route: '/admin/studio/campaign-orchestrator' },
    { id: 'ub-email', label: 'LUXURY EMAILS', route: '/admin/studio/distribution-network' },
    { id: 'ub-lounge', label: 'LOUNGE TV', route: '/admin/studio/content-packs' },
    { id: 'ub-mc', label: 'MISSION CONTROL', route: '/admin/studio/mission-control' },
    { id: 'ub-pack', label: 'CONTENT PACKS', route: '/admin/studio/content-packs' },
  ],
  checklist: WEATHER_STUDIO_CHECKLIST,
  metadata: {
    owner: 'VISUAL DEPARTMENT',
    assetFactoryEligible: 'false',
    lastReviewed: '2026-07-04',
    namingPrefix: 'WS_',
  },
  versionHistory: [
    { version: 1, savedAt: '2026-06-01', note: 'INITIAL STUDIO SPEC', snapshot: 'v1' },
    { version: 2, savedAt: '2026-06-15', note: 'ADDED HOLIDAY + LAUNCH VARIANTS', snapshot: 'v2' },
    { version: 3, savedAt: '2026-07-01', note: 'PROMPT STACK COMPLETE', snapshot: 'v3' },
  ],
};

function cardBlueprint(
  id: string,
  name: string,
  category: BlueprintCategoryId,
  scope: BlueprintScope,
  status: BlueprintStatus,
  description: string,
  readinessHint: number
): BlueprintDefinition {
  return {
    id,
    scope,
    status,
    identity: { name, category, workspace: scope === 'workspace' ? 'FRONTAL SLAYER' : 'STUDIO OS GLOBAL', description },
    requiredImages: category === 'studio' ? ['MASTER STUDIO · EMPTY BASE', 'REFERENCE SCENE · STAGED EXAMPLE', 'DAY', 'NIGHT'] : ['HERO'],
    studioSetLayers: category === 'studio' ? GENERIC_STUDIO_LAYER_SPECS : undefined,
    requiredVideos: ['LOOP'],
    requiredCameraPresets: ['WIDE', 'HERO'],
    requiredLighting: ['EDITORIAL'],
    requiredProps: [],
    promptStack: [
      { id: `${id}-ws`, label: 'WORKSPACE PROMPT', content: 'WORKSPACE RULES' },
      { id: `${id}-brand`, label: 'BRAND PROMPT', content: 'BRAND RULES' },
    ],
    outputRules: [{ id: `${id}-out`, assetType: 'IMAGES', spec: 'PER TEMPLATE' }],
    dependencies: [{ id: `${id}-dep`, label: name.toUpperCase(), requires: ['dep-workspace'] }, { id: 'dep-workspace', label: 'WORKSPACE' }],
    validationRules: WEATHER_STUDIO_BLUEPRINT.validationRules.slice(0, 4),
    usedBy: [],
    checklist: [
      { id: `${id}-ck1`, label: 'SPEC', status: readinessHint > 70 ? 'ready' : 'waiting', category: 'METADATA' },
      { id: `${id}-ck2`, label: 'PROMPT', status: 'waiting', category: 'PROMPT' },
    ],
    metadata: { readinessHint: String(readinessHint) },
    versionHistory: [{ version: 1, savedAt: '2026-07-01', note: 'SEED', snapshot: 'v1' }],
  };
}

export const BLUEPRINT_LIBRARY_SEED: BlueprintDefinition[] = [
  WEATHER_STUDIO_BLUEPRINT,
  cardBlueprint('bp-build-studio', 'BUILD STUDIO', 'studio', 'workspace', 'approved', 'PRODUCT-FOCUSED BUILD ENVIRONMENT', 88),
  cardBlueprint('bp-beauty-reporter', 'BEAUTY REPORTER', 'talent', 'workspace', 'draft', 'ON-CAMERA PERSONALITY SPEC', 42),
  cardBlueprint('bp-luxury-wardrobe', 'LUXURY WHITE WARDROBE', 'wardrobe', 'workspace', 'review', 'EDITORIAL WARDROBE SYSTEM', 65),
  cardBlueprint('bp-noir-product', 'NOIR PRODUCT', 'product', 'workspace', 'approved', 'NOIR UNIT VISUAL SYSTEM', 91),
  cardBlueprint('bp-forecast-desk', 'FORECAST DESK', 'prop', 'workspace', 'draft', 'WEATHER STUDIO PROP KIT', 35),
  cardBlueprint('bp-marble-material', 'WHITE MARBLE', 'material', 'global', 'approved', 'GLOBAL MARBLE TEXTURE SPEC', 100),
  cardBlueprint('bp-slay-report', 'THE SLAY REPORT', 'show', 'workspace', 'approved', 'WEEKLY SHOW DNA', 86),
  cardBlueprint('bp-summer-campaign', 'SUMMER SLAY CAMPAIGN', 'campaign', 'workspace', 'review', 'SEASONAL LAUNCH SPEC', 58),
  cardBlueprint('bp-hero-scene', 'HERO REVEAL SCENE', 'scene', 'workspace', 'draft', 'LAUNCH REVEAL COMPOSITION', 40),
  cardBlueprint('bp-ep13-video', 'EP 13 MAIN VIDEO', 'video', 'workspace', 'draft', 'LOUNGE TV EPISODE SPEC', 48),
  cardBlueprint('bp-ep13-thumb', 'EP 13 THUMBNAIL', 'thumbnail', 'workspace', 'review', 'MULTI-ASPECT THUMB SYSTEM', 72),
  cardBlueprint('bp-founder-voice', 'FOUNDER VOICE', 'voice', 'workspace', 'approved', 'PSA FOUNDER VOICE PROFILE', 94),
  cardBlueprint('bp-lounge-music', 'LOUNGE AMBIENT', 'music', 'workspace', 'draft', 'LOUNGE TV MUSIC PACK', 30),
  cardBlueprint('bp-brand-kit', 'FRONTAL SLAYER BRAND KIT', 'brand-kit', 'workspace', 'approved', 'LOGO · TYPE · COLOR · MARBLE', 97),
  cardBlueprint('bp-studio-template', 'STUDIO BLUEPRINT TEMPLATE', 'studio', 'global', 'approved', 'INHERITABLE STUDIO TEMPLATE', 100),
  cardBlueprint('bp-talent-template', 'TALENT BLUEPRINT TEMPLATE', 'talent', 'global', 'approved', 'INHERITABLE TALENT TEMPLATE', 100),
];

export function getBlueprintById(id: string): BlueprintDefinition | undefined {
  return BLUEPRINT_LIBRARY_SEED.find((b) => b.id === id);
}

export function getBlueprintsByScope(scope: BlueprintScope): BlueprintDefinition[] {
  return BLUEPRINT_LIBRARY_SEED.filter((b) => b.scope === scope);
}

export function getBlueprintsByCategory(category: BlueprintCategoryId): BlueprintDefinition[] {
  return BLUEPRINT_LIBRARY_SEED.filter((b) => b.identity.category === category);
}

export const BLUEPRINT_STATUS_LABELS: Record<BlueprintStatus, string> = {
  draft: 'DRAFT',
  review: 'REVIEW',
  approved: 'APPROVED',
  deprecated: 'DEPRECATED',
  archived: 'ARCHIVED',
};

export type BlueprintReviewSuggestion = {
  id: string;
  severity: 'info' | 'warn' | 'critical';
  title: string;
  detail: string;
  source: 'config' | 'history';
};

export const BLUEPRINT_REVIEW_SUGGESTIONS: BlueprintReviewSuggestion[] = [
  { id: 'br-1', severity: 'warn', title: 'MISSING LIGHTING PRESET', detail: 'HOLIDAY VARIANT HAS NO MATCHING LIGHTING PRESET CONFIGURED.', source: 'config' },
  { id: 'br-2', severity: 'critical', title: 'PROMPT STACK INCOMPLETE', detail: 'PROVIDER FORMATTING LAYER NOT VALIDATED FOR VIDEO OUTPUT.', source: 'config' },
  { id: 'br-3', severity: 'warn', title: 'HOLIDAY VARIATION NOT CONFIGURED', detail: 'REQUIRED IMAGE LIST INCLUDES HOLIDAY — NO CHECKLIST ITEM.', source: 'config' },
  { id: 'br-4', severity: 'info', title: 'CAMERA PRESETS INCONSISTENT', detail: 'POV + TOP DOWN SHARE SAME FOCAL LENGTH IN METADATA.', source: 'history' },
];

export type BlueprintFactoryStats = {
  ready: number;
  missingAssets: number;
  awaitingApproval: number;
  health: number;
  factoryReadiness: number;
};

export function computeBlueprintFactoryStats(blueprints: BlueprintDefinition[]): BlueprintFactoryStats {
  let ready = 0;
  let missing = 0;
  let awaiting = 0;
  let readinessSum = 0;

  for (const bp of blueprints) {
    const waiting = bp.checklist.filter((c) => c.status === 'waiting' || c.status === 'incomplete').length;
    if (bp.status === 'approved' && waiting === 0) ready += 1;
    if (waiting > 0) missing += 1;
    if (bp.status === 'review' || bp.status === 'draft') awaiting += 1;
    const readyCount = bp.checklist.filter((c) => c.status === 'ready').length;
    readinessSum += bp.checklist.length ? Math.round((readyCount / bp.checklist.length) * 100) : 0;
  }

  const n = blueprints.length || 1;
  return {
    ready,
    missingAssets: missing,
    awaitingApproval: awaiting,
    health: Math.round(readinessSum / n),
    factoryReadiness: Math.round((ready / n) * 100),
  };
}
