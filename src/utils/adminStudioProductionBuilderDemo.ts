/**
 * Production Builder — visual assembly workspace (Milestone 14.5).
 * Demo/placeholder only; bridges Asset Director + Content Packs.
 */

import type { ContentPackAssetSelection } from './adminStudioAssetDirectorDemo';
import { PRODUCTION_SCENE_LAYER_STACK } from './adminStudioSetSeparation';
import {
  ASSET_DIRECTOR_ANIMATIONS,
  ASSET_DIRECTOR_AUDIO,
  ASSET_DIRECTOR_BRAND_MATERIALS,
  ASSET_DIRECTOR_CAMERA,
  ASSET_DIRECTOR_EXPRESSIONS,
  ASSET_DIRECTOR_LIGHTING,
  ASSET_DIRECTOR_MATERIALS,
  ASSET_DIRECTOR_MOODBOARDS,
  ASSET_DIRECTOR_POSES,
  ASSET_DIRECTOR_PROPS,
  ASSET_DIRECTOR_STUDIOS,
  ASSET_DIRECTOR_TALENT,
  ASSET_DIRECTOR_WARDROBE,
} from './adminStudioAssetDirectorDemo';

export const PRODUCTION_BUILDER_SUBTITLE =
  'BUILD YOUR PRODUCTION VISUALLY BEFORE AI CREATES IT.';

export const PRODUCTION_BUILDER_INHERITANCE_CHAIN = [
  'CONTENT BRAIN',
  'ASSET DIRECTOR',
  'PRODUCTION BUILDER',
  'CONTENT PACKS',
  'AI PRODUCTION',
  'DISTRIBUTION',
  'LEGACY',
] as const;

export type ProductionAssetCategoryId =
  | 'studios'
  | 'talent'
  | 'wardrobe'
  | 'expressions'
  | 'poses'
  | 'props'
  | 'lighting'
  | 'camera'
  | 'materials'
  | 'animations'
  | 'audio'
  | 'brand'
  | 'moodboards';

export type ProductionAssetThumb = {
  id: string;
  name: string;
  previewSrc: string;
  category: ProductionAssetCategoryId;
  accentHex: string;
  promptNotes?: string;
};

export const PRODUCTION_ASSET_CATEGORIES: Array<{ id: ProductionAssetCategoryId; label: string }> = [
  { id: 'studios', label: 'STUDIOS' },
  { id: 'talent', label: 'TALENT' },
  { id: 'wardrobe', label: 'WARDROBE' },
  { id: 'expressions', label: 'EXPRESSIONS' },
  { id: 'poses', label: 'POSES' },
  { id: 'props', label: 'PROPS' },
  { id: 'lighting', label: 'LIGHTING' },
  { id: 'camera', label: 'CAMERA' },
  { id: 'materials', label: 'MATERIALS' },
  { id: 'animations', label: 'ANIMATIONS' },
  { id: 'audio', label: 'AUDIO' },
  { id: 'brand', label: 'BRAND' },
  { id: 'moodboards', label: 'MOODBOARDS' },
];

export type ProductionSceneAssetSelection = ContentPackAssetSelection & {
  brandElementIds?: string[];
  graphicsId?: string;
  ctaId?: string;
  voiceId?: string;
  moodboardId?: string;
};

export type ProductionScene = {
  id: string;
  name: string;
  order: number;
  selection: ProductionSceneAssetSelection;
};

export type ProductionOutputTypeId =
  | 'lounge-tv'
  | 'journal'
  | 'email'
  | 'instagram-reel'
  | 'tiktok'
  | 'pinterest'
  | 'youtube-short'
  | 'product-hero'
  | 'website-banner'
  | 'push-notification';

export const PRODUCTION_OUTPUT_TYPES: Array<{
  id: ProductionOutputTypeId;
  label: string;
  aspect: string;
}> = [
  { id: 'lounge-tv', label: 'LOUNGE TV', aspect: '16:9' },
  { id: 'journal', label: 'JOURNAL', aspect: '4:5' },
  { id: 'email', label: 'EMAIL', aspect: '600px' },
  { id: 'instagram-reel', label: 'INSTAGRAM REEL', aspect: '9:16' },
  { id: 'tiktok', label: 'TIKTOK', aspect: '9:16' },
  { id: 'pinterest', label: 'PINTEREST', aspect: '2:3' },
  { id: 'youtube-short', label: 'YOUTUBE SHORT', aspect: '9:16' },
  { id: 'product-hero', label: 'PRODUCT HERO', aspect: '1:1' },
  { id: 'website-banner', label: 'WEBSITE BANNER', aspect: '21:9' },
  { id: 'push-notification', label: 'PUSH NOTIFICATION', aspect: '1:1' },
];

export type BrandPreviewFormatId =
  | '9-16'
  | '4-5'
  | '1-1'
  | '16-9'
  | '21-9'
  | 'email'
  | 'desktop-hero'
  | 'mobile-hero';

export const BRAND_PREVIEW_FORMATS: Array<{ id: BrandPreviewFormatId; label: string; ratio: string }> = [
  { id: '9-16', label: '9:16', ratio: '9 / 16' },
  { id: '4-5', label: '4:5', ratio: '4 / 5' },
  { id: '1-1', label: '1:1', ratio: '1 / 1' },
  { id: '16-9', label: '16:9', ratio: '16 / 9' },
  { id: '21-9', label: '21:9', ratio: '21 / 9' },
  { id: 'email', label: 'EMAIL WIDTH', ratio: '5 / 3' },
  { id: 'desktop-hero', label: 'DESKTOP HERO', ratio: '21 / 6' },
  { id: 'mobile-hero', label: 'MOBILE HERO', ratio: '3 / 4' },
];

export type DepartmentStatus = 'waiting' | 'working' | 'ready' | 'complete';

export type ProductionDepartmentId =
  | 'research'
  | 'creative'
  | 'visual'
  | 'production'
  | 'editorial'
  | 'publishing'
  | 'analytics'
  | 'legacy';

export const PRODUCTION_DEPARTMENTS: Array<{ id: ProductionDepartmentId; label: string }> = [
  { id: 'research', label: 'RESEARCH' },
  { id: 'creative', label: 'CREATIVE' },
  { id: 'visual', label: 'VISUAL' },
  { id: 'production', label: 'PRODUCTION' },
  { id: 'editorial', label: 'EDITORIAL' },
  { id: 'publishing', label: 'PUBLISHING' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'legacy', label: 'LEGACY' },
];

export type ProductionTemplateId =
  | 'slay-report'
  | 'psa-interview'
  | 'build-studio'
  | 'product-reveal'
  | 'launch-campaign'
  | 'email-campaign'
  | 'trend-forecast';

export type ProductionTemplate = {
  id: ProductionTemplateId;
  name: string;
  description: string;
  scenes: ProductionScene[];
  outputTypes: ProductionOutputTypeId[];
  productionName: string;
  show: string;
  episode: string;
};

export type ProductionVersionEntry = {
  id: string;
  label: string;
  savedAt: string;
  note: string;
};

export type ProductionDraft = {
  id: string;
  productionName: string;
  workspace: string;
  project: string;
  contentPackId?: string;
  show: string;
  episode: string;
  brand: string;
  targetAudience: string;
  cta: string;
  aspectRatio: string;
  scenes: ProductionScene[];
  outputTypes: ProductionOutputTypeId[];
  promptOverride?: string;
  favorite: boolean;
  archived: boolean;
  templateId?: ProductionTemplateId;
  generationStatus: 'idle' | 'queued' | 'complete';
  promptStatus: 'draft' | 'assembled' | 'edited' | 'ready';
  departmentStatus: Record<ProductionDepartmentId, DepartmentStatus>;
  versionHistory: ProductionVersionEntry[];
  updatedAt: string;
};

export type ProductionGenerationOutput = {
  id: string;
  label: string;
  status: 'queued' | 'ready';
};

export const PRODUCTION_GENERATION_OUTPUTS: ProductionGenerationOutput[] = [
  { id: 'scene-prompts', label: 'SCENE PROMPTS', status: 'queued' },
  { id: 'image-prompts', label: 'IMAGE PROMPTS', status: 'queued' },
  { id: 'video-prompts', label: 'VIDEO PROMPTS', status: 'queued' },
  { id: 'voice-prompt', label: 'VOICE PROMPT', status: 'queued' },
  { id: 'blog-draft', label: 'BLOG DRAFT', status: 'queued' },
  { id: 'email-draft', label: 'EMAIL DRAFT', status: 'queued' },
  { id: 'captions', label: 'CAPTIONS', status: 'queued' },
  { id: 'thumbnail-prompt', label: 'THUMBNAIL PROMPT', status: 'queued' },
  { id: 'seo-metadata', label: 'SEO METADATA', status: 'queued' },
  { id: 'hashtags', label: 'HASHTAGS', status: 'queued' },
  { id: 'cta', label: 'CTA', status: 'queued' },
];

export const PRODUCTION_RELATED_CONTENT = {
  previousEpisodes: [
    { id: 'ep-12', title: 'CHERRY RED FORECAST', thumb: '/assets/NOIR/noir-thumb.png' },
    { id: 'ep-11', title: 'CUTTING YOUR LACE', thumb: '/assets/NOIR/wave-thumb.png' },
    { id: 'ep-10', title: 'SOFT WAVE REVEAL', thumb: '/assets/NOIR/curl-thumb.png' },
  ],
  relatedCampaigns: [
    { id: 'camp-1', title: 'SUMMER LUXURY LAUNCH', thumb: '/assets/NOIR/blanco-thumb.png' },
    { id: 'camp-2', title: 'NOIR EDITORIAL', thumb: '/assets/NOIR/noir-thumb.png' },
  ],
  relatedProducts: [
    { id: 'noir', title: 'NOIR', thumb: '/assets/NOIR/noir-thumb.png' },
    { id: 'soft-wave', title: 'SOFT WAVE', thumb: '/assets/NOIR/wave-thumb.png' },
  ],
  previousPacks: [
    { id: 'cherry-red-forecast', title: 'CHERRY RED FORECAST', thumb: '/assets/NOIR/noir-thumb.png' },
    { id: 'cutting-your-lace', title: 'CUTTING YOUR LACE', thumb: '/assets/NOIR/wave-thumb.png' },
  ],
  recommendedAssets: [
    { id: 'ad-studio-weather', name: 'WEATHER STUDIO', thumb: '/assets/NOIR/noir-thumb.png' },
    { id: 'ad-talent-psa', name: 'PSA', thumb: '/assets/NOIR/blanco-thumb.png' },
  ],
  recommendedTalent: [
    { id: 'ad-talent-psa', name: 'PSA', thumb: '/assets/NOIR/noir-thumb.png' },
    { id: 'ad-talent-luxury', name: 'LUXURY STYLIST', thumb: '/assets/NOIR/wave-thumb.png' },
  ],
};

function cardToThumb(
  card: { id: string; name: string; previewSrc: string; accentHex: string; promptNotes?: string },
  category: ProductionAssetCategoryId
): ProductionAssetThumb {
  return {
    id: card.id,
    name: card.name,
    previewSrc: card.previewSrc,
    category,
    accentHex: card.accentHex,
    promptNotes: card.promptNotes,
  };
}

export function getProductionAssetLibrary(): Record<ProductionAssetCategoryId, ProductionAssetThumb[]> {
  return {
    studios: ASSET_DIRECTOR_STUDIOS.map((s) => ({
      id: s.id,
      name: s.name,
      previewSrc: s.previewSrc,
      category: 'studios' as const,
      accentHex: s.accentHex,
      promptNotes: s.masterEnvironment,
    })),
    talent: ASSET_DIRECTOR_TALENT.map((t) => ({
      id: t.id,
      name: t.name,
      previewSrc: t.previewSrc,
      category: 'talent' as const,
      accentHex: t.accentHex,
      promptNotes: t.masterPortrait,
    })),
    wardrobe: ASSET_DIRECTOR_WARDROBE.map((w) => cardToThumb(w, 'wardrobe')),
    expressions: ASSET_DIRECTOR_EXPRESSIONS.map((e) => cardToThumb(e, 'expressions')),
    poses: ASSET_DIRECTOR_POSES.map((p) => cardToThumb(p, 'poses')),
    props: ASSET_DIRECTOR_PROPS.map((p) => cardToThumb(p, 'props')),
    lighting: ASSET_DIRECTOR_LIGHTING.map((l) => cardToThumb(l, 'lighting')),
    camera: ASSET_DIRECTOR_CAMERA.map((c) => cardToThumb(c, 'camera')),
    materials: ASSET_DIRECTOR_MATERIALS.map((m) => cardToThumb(m, 'materials')),
    animations: ASSET_DIRECTOR_ANIMATIONS.map((a) => cardToThumb(a, 'animations')),
    audio: ASSET_DIRECTOR_AUDIO.map((a) => cardToThumb(a, 'audio')),
    brand: ASSET_DIRECTOR_BRAND_MATERIALS.map((b) => cardToThumb(b, 'brand')),
    moodboards: ASSET_DIRECTOR_MOODBOARDS.map((m) => ({
      id: m.id,
      name: m.title,
      previewSrc: m.coverSrc,
      category: 'moodboards' as const,
      accentHex: m.accentHex,
      promptNotes: m.visualDirection,
    })),
  };
}

export function findProductionAsset(id: string): ProductionAssetThumb | undefined {
  const lib = getProductionAssetLibrary();
  for (const cat of PRODUCTION_ASSET_CATEGORIES) {
    const hit = lib[cat.id].find((a) => a.id === id);
    if (hit) return hit;
  }
  return undefined;
}

const defaultSceneSelection: ProductionSceneAssetSelection = {
  studioId: 'ad-studio-weather',
  talentId: 'ad-talent-psa',
  wardrobeId: 'ad-wardrobe-0',
  poseId: 'ad-pose-0',
  lightingId: 'ad-lighting-0',
  cameraId: 'ad-camera-0',
  propIds: ['ad-prop-0'],
  materialIds: ['ad-material-0'],
  brandElementIds: ['ad-brand-0'],
  graphicsId: 'ad-brand-1',
  musicId: 'ad-audio-0',
  ctaId: 'shop-now',
};

function scene(id: string, name: string, order: number, selection: Partial<ProductionSceneAssetSelection> = {}): ProductionScene {
  return { id, name, order, selection: { ...defaultSceneSelection, ...selection } };
}

export const PRODUCTION_TEMPLATES: ProductionTemplate[] = [
  {
    id: 'slay-report',
    name: 'THE SLAY REPORT',
    description: 'EDITORIAL NEWS DESK · LUXURY FORECAST FORMAT',
    productionName: 'THE SLAY REPORT — WEEKLY',
    show: 'THE SLAY REPORT',
    episode: 'EP. 14',
    outputTypes: ['lounge-tv', 'journal', 'instagram-reel', 'email'],
    scenes: [
      scene('s1', 'SCENE 1 — OPEN', 0),
      scene('s2', 'SCENE 2 — FORECAST', 1, { cameraId: 'ad-camera-1' }),
      scene('s3', 'SCENE 3 — CTA', 2, { poseId: 'ad-pose-2' }),
    ],
  },
  {
    id: 'psa-interview',
    name: 'PSA INTERVIEW',
    description: 'FOUNDER CONVERSATION · INTIMATE BROADCAST',
    productionName: 'PSA INTERVIEW — LUXURY EDUCATION',
    show: 'PSA SESSIONS',
    episode: 'EP. 08',
    outputTypes: ['lounge-tv', 'youtube-short', 'journal'],
    scenes: [
      scene('s1', 'SCENE 1 — INTRO', 0, { talentId: 'ad-talent-psa', studioId: 'ad-studio-mansion' }),
      scene('s2', 'SCENE 2 — INTERVIEW', 1),
    ],
  },
  {
    id: 'build-studio',
    name: 'BUILD STUDIO',
    description: 'VIRTUAL SET TOUR · PRODUCT STORY',
    productionName: 'BUILD STUDIO — WEATHER WING',
    show: 'STUDIO TOURS',
    episode: 'EP. 03',
    outputTypes: ['lounge-tv', 'website-banner', 'pinterest'],
    scenes: [scene('s1', 'SCENE 1 — TOUR', 0, { studioId: 'ad-studio-weather' })],
  },
  {
    id: 'product-reveal',
    name: 'PRODUCT REVEAL',
    description: 'HERO PRODUCT · MACRO LUXURY',
    productionName: 'NOIR PRODUCT REVEAL',
    show: 'PRODUCT STORIES',
    episode: 'NOIR',
    outputTypes: ['product-hero', 'instagram-reel', 'tiktok', 'website-banner'],
    scenes: [
      scene('s1', 'SCENE 1 — HERO', 0, { cameraId: 'ad-camera-4', wardrobeId: 'ad-wardrobe-2' }),
      scene('s2', 'SCENE 2 — DETAIL', 1, { cameraId: 'ad-camera-5' }),
    ],
  },
  {
    id: 'launch-campaign',
    name: 'LAUNCH CAMPAIGN',
    description: 'MULTI-CHANNEL LAUNCH · FULL FUNNEL',
    productionName: 'SUMMER LUXURY LAUNCH',
    show: 'CAMPAIGNS',
    episode: 'LAUNCH 2026',
    outputTypes: ['lounge-tv', 'email', 'instagram-reel', 'tiktok', 'push-notification', 'website-banner'],
    scenes: [
      scene('s1', 'SCENE 1 — TEASE', 0),
      scene('s2', 'SCENE 2 — REVEAL', 1),
      scene('s3', 'SCENE 3 — SHOP', 2),
      scene('s4', 'SCENE 4 — LEGACY', 3),
    ],
  },
  {
    id: 'email-campaign',
    name: 'EMAIL CAMPAIGN',
    description: 'EDITORIAL EMAIL · LUXURY WIDTH',
    productionName: 'WEEKLY EDITORIAL EMAIL',
    show: 'EMAIL',
    episode: 'ISSUE 42',
    outputTypes: ['email', 'journal'],
    scenes: [scene('s1', 'SCENE 1 — HERO', 0)],
  },
  {
    id: 'trend-forecast',
    name: 'TREND FORECAST',
    description: 'WEATHER STUDIO · FORECAST GRAPHICS',
    productionName: 'CHERRY RED FORECAST',
    show: 'TREND FORECAST',
    episode: 'EP. 12',
    outputTypes: ['lounge-tv', 'journal', 'pinterest', 'youtube-short'],
    scenes: [
      scene('s1', 'SCENE 1 — DESK', 0, {
        studioId: 'ad-studio-weather',
        talentId: 'ad-talent-psa',
        wardrobeId: 'ad-wardrobe-0',
        propIds: ['ad-prop-0', 'ad-prop-1'],
        graphicsId: 'ad-brand-2',
      }),
      scene('s2', 'SCENE 2 — MAP', 1, { cameraId: 'ad-camera-2' }),
    ],
  },
];

export function getProductionTemplate(id: ProductionTemplateId): ProductionTemplate | undefined {
  return PRODUCTION_TEMPLATES.find((t) => t.id === id);
}

export function createDefaultDepartmentStatus(): Record<ProductionDepartmentId, DepartmentStatus> {
  return {
    research: 'ready',
    creative: 'working',
    visual: 'working',
    production: 'waiting',
    editorial: 'waiting',
    publishing: 'waiting',
    analytics: 'waiting',
    legacy: 'waiting',
  };
}

export function createProductionDraft(overrides: Partial<ProductionDraft> = {}): ProductionDraft {
  const template = overrides.templateId ? getProductionTemplate(overrides.templateId) : undefined;
  const now = new Date().toISOString().slice(0, 10);
  return {
    id: overrides.id ?? `pb-${Date.now()}`,
    productionName: overrides.productionName ?? template?.productionName ?? 'UNTITLED PRODUCTION',
    workspace: overrides.workspace ?? 'FRONTAL SLAYER',
    project: overrides.project ?? 'STUDIOOS',
    contentPackId: overrides.contentPackId,
    show: overrides.show ?? template?.show ?? 'THE SLAY REPORT',
    episode: overrides.episode ?? template?.episode ?? 'EP. 01',
    brand: overrides.brand ?? 'FRONTAL SLAYER',
    targetAudience: overrides.targetAudience ?? 'LUXURY WIG CLIENTS · PREMIUM MEMBERS',
    cta: overrides.cta ?? 'SHOP THE COLLECTION',
    aspectRatio: overrides.aspectRatio ?? '16:9',
    scenes: overrides.scenes ?? template?.scenes ?? [scene('s1', 'SCENE 1', 0)],
    outputTypes: overrides.outputTypes ?? template?.outputTypes ?? ['lounge-tv', 'journal', 'email'],
    promptOverride: overrides.promptOverride,
    favorite: overrides.favorite ?? false,
    archived: overrides.archived ?? false,
    templateId: overrides.templateId,
    generationStatus: overrides.generationStatus ?? 'idle',
    promptStatus: overrides.promptStatus ?? 'draft',
    departmentStatus: overrides.departmentStatus ?? createDefaultDepartmentStatus(),
    versionHistory: overrides.versionHistory ?? [],
    updatedAt: overrides.updatedAt ?? now,
  };
}

export function createDraftFromContentPack(packId: string, packTitle: string): ProductionDraft {
  const forecastTemplate = getProductionTemplate('trend-forecast');
  return createProductionDraft({
    id: `pb-pack-${packId}`,
    productionName: packTitle,
    contentPackId: packId,
    show: forecastTemplate?.show ?? 'CONTENT PACK',
    episode: packTitle,
    scenes: forecastTemplate?.scenes ?? [scene('s1', 'SCENE 1', 0)],
    outputTypes: forecastTemplate?.outputTypes,
    templateId: 'trend-forecast',
    promptStatus: 'assembled',
  });
}

/** Stack labels for live scene preview (storyboard order). */
export const SCENE_STACK_SLOTS: Array<{
  key: keyof ProductionSceneAssetSelection | 'cta' | 'masterStudio' | 'setDressing' | 'episodeGraphics';
  label: string;
}> = [
  { key: 'masterStudio', label: 'MASTER STUDIO' },
  { key: 'setDressing', label: 'SET DRESSING' },
  { key: 'studioId', label: 'STUDIO PROFILE' },
  { key: 'talentId', label: 'TALENT LAYER' },
  { key: 'wardrobeId', label: 'WARDROBE' },
  { key: 'poseId', label: 'POSE' },
  { key: 'lightingId', label: 'LIGHTING' },
  { key: 'cameraId', label: 'CAMERA' },
  { key: 'propIds', label: 'SET DRESSING PROPS' },
  { key: 'graphicsId', label: 'EPISODE GRAPHICS' },
  { key: 'episodeGraphics', label: 'GRAPHICS PACK' },
  { key: 'brandElementIds', label: 'BRAND' },
  { key: 'cta', label: 'CTA' },
];

/** Visual layer formula for scene builder education. */
export const PRODUCTION_LAYER_FORMULA = PRODUCTION_SCENE_LAYER_STACK.map((l) => l.label).join(' + ') + ' = FINAL PRODUCTION SCENE';

export function resolveSceneStackLabel(
  key: keyof ProductionSceneAssetSelection | 'cta' | 'masterStudio' | 'setDressing' | 'episodeGraphics',
  selection: ProductionSceneAssetSelection,
  ctaText: string
): string | null {
  if (key === 'cta') return ctaText || null;
  if (key === 'masterStudio') {
    if (selection.studioId) {
      const studio = ASSET_DIRECTOR_STUDIOS.find((s) => s.id === selection.studioId);
      return studio ? `${studio.name} · MASTER BASE` : null;
    }
    return null;
  }
  if (key === 'setDressing') {
    const props = selection.propIds?.map((id) => findProductionAsset(id)?.name).filter(Boolean);
    return props?.length ? props.join(' · ') : '—';
  }
  if (key === 'episodeGraphics') {
    return selection.graphicsId ? findProductionAsset(selection.graphicsId)?.name ?? selection.graphicsId : null;
  }
  const val = selection[key];
  if (!val) return null;
  if (Array.isArray(val)) {
    if (!val.length) return null;
    const names = val.map((id) => findProductionAsset(id)?.name ?? id).slice(0, 2);
    return names.join(' · ');
  }
  return findProductionAsset(val as string)?.name ?? (val as string);
}

export function getScenePreviewSrc(selection: ProductionSceneAssetSelection): string {
  if (selection.studioId) {
    const studio = ASSET_DIRECTOR_STUDIOS.find((s) => s.id === selection.studioId);
    if (studio) return studio.previewSrc;
  }
  if (selection.talentId) {
    const talent = ASSET_DIRECTOR_TALENT.find((t) => t.id === selection.talentId);
    if (talent) return talent.previewSrc;
  }
  return '/assets/NOIR/noir-thumb.png';
}
