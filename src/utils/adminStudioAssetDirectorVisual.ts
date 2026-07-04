/**
 * Asset Director — visual-first data bundles (Milestone 14).
 * Demo/placeholder only; no AI or file storage connected.
 */

import type { AssetDirectorCard, AssetDirectorStatus, AssetDirectorStudioProfile, AssetHealthIndicator } from './adminStudioAssetDirectorDemo';
import {
  inferSetLayerFromAssetName,
  STUDIO_SET_SEPARATION_RULE,
  type StudioSetLayerId,
} from './adminStudioSetSeparation';
import {
  ASSET_DIRECTOR_CAMERA,
  ASSET_DIRECTOR_EXPRESSIONS,
  ASSET_DIRECTOR_HEALTH_QUEUE,
  ASSET_DIRECTOR_LIGHTING,
  ASSET_DIRECTOR_MATERIALS,
  ASSET_DIRECTOR_MOODBOARDS,
  ASSET_DIRECTOR_POSES,
  ASSET_DIRECTOR_PROPS,
  ASSET_DIRECTOR_STUDIOS,
  ASSET_DIRECTOR_TALENT,
  ASSET_DIRECTOR_VERSION_HISTORY,
  ASSET_DIRECTOR_WARDROBE,
  ASSET_DIRECTOR_ANIMATIONS,
  getAssetDirectorStudioById,
  getAssetDirectorTalentById,
} from './adminStudioAssetDirectorDemo';

const ARTWORK = [
  '/assets/NOIR/wave-thumb.png',
  '/assets/NOIR/curl-thumb.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/NOIR/blanco-thumb.png',
];

export type AssetDirectorViewMode = 'gallery' | 'list';

export type AssetDirectorFilterId =
  | 'all'
  | 'approved'
  | 'needs-review'
  | 'recently-used'
  | 'recently-generated'
  | 'needs-review-queue'
  | 'missing'
  | 'favorites';

export const ASSET_DIRECTOR_FILTER_OPTIONS: Array<{ id: AssetDirectorFilterId; label: string }> = [
  { id: 'all', label: 'ALL' },
  { id: 'approved', label: 'APPROVED' },
  { id: 'needs-review', label: 'NEEDS REVIEW' },
  { id: 'recently-used', label: 'RECENTLY USED' },
  { id: 'recently-generated', label: 'RECENTLY GENERATED' },
  { id: 'missing', label: 'MISSING' },
  { id: 'favorites', label: 'FAVORITES' },
];

export type VisualAssetItem = {
  id: string;
  name: string;
  previewSrc: string;
  status: AssetDirectorStatus;
  resolution: string;
  version: string;
  duration?: string;
  accentHex: string;
  subtitle?: string;
  /** Studio set separation layer — drives preview modal labels. */
  setLayer?: StudioSetLayerId;
};

export type WardrobeVisualItem = VisualAssetItem & {
  views: Array<{ id: string; label: string; previewSrc: string }>;
  currentPrompt: string;
};

export type TalentVisualItem = VisualAssetItem & {
  wardrobe: string;
  hairstyle: string;
  role: string;
};

export type RelationshipVisualNode = {
  id: string;
  name: string;
  previewSrc: string;
  route?: string;
};

export type MoodboardPin = {
  id: string;
  src: string;
  caption: string;
  category: string;
  span?: 'tall' | 'wide' | 'normal';
};

export type VersionTimelineEntry = {
  id: string;
  version: string;
  previewSrc: string;
  date: string;
  notes: string;
  changes: string;
};

export type AssetMetadataBlock = {
  prompt: string;
  notes: string;
  resolution: string;
  fileType: string;
  created: string;
  modified: string;
  tags: string[];
  relationships: string[];
  systemIds: string[];
};

export type StudioVisualBundle = {
  studio: AssetDirectorStudioProfile;
  heroSrc: string;
  heroType: 'image' | 'video' | 'interactive';
  productionCount: number;
  /** Set separation — primary clean environment. */
  masterStudio: VisualAssetItem[];
  /** Staged example — may include talent/graphics; not reusable base. */
  referenceScene: VisualAssetItem[];
  /** Reusable props and environment add-ons. */
  setDressing: VisualAssetItem[];
  /** Episode overlays — per content pack. */
  episodeGraphics: VisualAssetItem[];
  separationRule: string;
  versions: VisualAssetItem[];
  videos: VisualAssetItem[];
  cameras: VisualAssetItem[];
  lighting: VisualAssetItem[];
  props: VisualAssetItem[];
  talent: TalentVisualItem[];
  wardrobe: WardrobeVisualItem[];
  expressions: VisualAssetItem[];
  poses: VisualAssetItem[];
  materials: VisualAssetItem[];
  relationships: {
    source: RelationshipVisualNode;
    usedBy: RelationshipVisualNode[];
  };
  moodboardPins: MoodboardPin[];
  versionTimeline: VersionTimelineEntry[];
  healthCards: Array<{ id: string; label: string; previewSrc: string; indicator: AssetHealthIndicator }>;
  metadata: AssetMetadataBlock;
};

function thumb(idx: number): string {
  return ARTWORK[idx % ARTWORK.length];
}

function visualFromCard(card: AssetDirectorCard, idx: number, subtitle?: string, setLayer?: StudioSetLayerId): VisualAssetItem {
  return {
    id: card.id,
    name: card.name,
    previewSrc: card.previewSrc,
    status: card.status,
    resolution: idx % 2 === 0 ? '3840×2160' : '1920×1080',
    version: card.version,
    duration: undefined,
    accentHex: card.accentHex,
    subtitle,
    setLayer: setLayer ?? inferSetLayerFromAssetName(card.name),
  };
}

function layerItem(
  studio: AssetDirectorStudioProfile,
  id: string,
  name: string,
  idx: number,
  setLayer: StudioSetLayerId,
  status: AssetDirectorStatus = 'approved',
  subtitle?: string
): VisualAssetItem {
  return {
    id,
    name,
    previewSrc: thumb(idx),
    status,
    resolution: '3840×1600',
    version: 'v1.0',
    accentHex: studio.accentHex,
    subtitle,
    setLayer,
  };
}

function buildWeatherStudioBundle(studio: AssetDirectorStudioProfile): StudioVisualBundle {
  const hero = studio.previewSrc;
  const versionLabels = ['DAY', 'NIGHT', 'HOLIDAY', 'SUMMER', 'SPRING', 'LUXURY', 'LAUNCH'];
  const videoLabels = ['INTRO ANIMATION', 'IDLE ANIMATION', 'LOOP', 'OUTRO ANIMATION', 'TRANSITION'];
  const cameraLabels = ['WIDE', 'MEDIUM', 'CLOSE', 'HERO', 'PRODUCT', 'POV', 'TOP DOWN'];
  const lightingLabels = ['LUXURY DAY', 'LUXURY NIGHT', 'BROADCAST', 'RUNWAY', 'GOLDEN HOUR'];
  const propLabels = [
    'FORECAST DESK',
    'GLASS SCREENS',
    'LUXURY DISPLAYS',
    'DIGITAL WALL',
    'FLOOR GRAPHICS',
    'FORECAST MAP',
    'CLOUD PANELS',
  ];

  return {
    studio,
    heroSrc: hero,
    heroType: 'interactive',
    productionCount: 12,
    separationRule: STUDIO_SET_SEPARATION_RULE,
    masterStudio: [
      layerItem(studio, `${studio.id}-master-base`, 'MASTER BASE', 0, 'master-studio', 'needs-review', 'NEEDS GENERATION · EMPTY SET'),
      layerItem(studio, `${studio.id}-master-day`, 'DAY', 1, 'master-studio', 'needs-review', 'CLEAN ENVIRONMENT VARIANT'),
      layerItem(studio, `${studio.id}-master-night`, 'NIGHT', 2, 'master-studio', 'needs-review', 'CLEAN ENVIRONMENT VARIANT'),
    ],
    referenceScene: [
      layerItem(studio, `${studio.id}-ref-day`, 'DAY · STAGED REFERENCE', 3, 'reference-scene', 'approved', 'EXAMPLE ONLY · MAY INCLUDE TALENT'),
      layerItem(studio, `${studio.id}-ref-broadcast`, 'FINISHED BROADCAST LOOK', 4, 'reference-scene', 'approved', 'VISUAL GUIDANCE'),
    ],
    setDressing: propLabels.map((name, i) =>
      layerItem(studio, `${studio.id}-dress-${i}`, name, i + 1, 'set-dressing', i < 5 ? 'in-use' : 'draft', 'REUSABLE PROP')
    ),
    episodeGraphics: [
      'FORECAST TITLE',
      'TREND MAP',
      'LOWER THIRD',
      'COUNTDOWN',
      'CTA CALLOUT',
      'PRODUCT SPOTLIGHT',
    ].map((name, i) =>
      layerItem(studio, `${studio.id}-gfx-${i}`, name, i, 'episode-graphics', 'approved', 'PER CONTENT PACK')
    ),
    versions: versionLabels.map((name, i) => ({
      id: `${studio.id}-ver-${i}`,
      name,
      previewSrc: thumb(i),
      status: i < 5 ? ('needs-review' as const) : ('needs-review' as const),
      resolution: '3840×1600',
      version: `v1.${i}`,
      accentHex: studio.accentHex,
      setLayer: 'master-studio' as const,
      subtitle: 'ENVIRONMENT VARIANT · EMPTY SET',
    })),
    videos: videoLabels.map((name, i) => ({
      id: `${studio.id}-vid-${i}`,
      name,
      previewSrc: thumb(i + 1),
      status: 'approved',
      resolution: '1920×1080',
      version: `v2.${i}`,
      duration: `${8 + i * 4}s`,
      accentHex: studio.accentHex,
    })),
    cameras: cameraLabels.map((name, i) => ({
      id: `${studio.id}-cam-${i}`,
      name,
      previewSrc: thumb(i + 2),
      status: 'approved',
      resolution: '21:9 FRAME',
      version: `v1.0`,
      accentHex: '#0D9488',
      subtitle: 'FRAMING PREVIEW',
    })),
    lighting: lightingLabels.map((name, i) => ({
      id: `${studio.id}-lit-${i}`,
      name,
      previewSrc: thumb(i),
      status: 'approved',
      resolution: 'LUT PRESET',
      version: `v1.${i}`,
      accentHex: '#D97706',
    })),
    props: propLabels.map((name, i) => ({
      id: `${studio.id}-prop-${i}`,
      name,
      previewSrc: thumb(i + 1),
      status: i < 5 ? 'in-use' : 'draft',
      resolution: 'PNG · ALPHA',
      version: `v1.${i}`,
      accentHex: '#9333EA',
      setLayer: 'set-dressing' as const,
      subtitle: 'SET DRESSING',
    })),
    talent: ASSET_DIRECTOR_TALENT.slice(0, 4).map((t, i) => ({
      id: t.id,
      name: t.name,
      previewSrc: t.previewSrc,
      status: t.status,
      resolution: 'PORTRAIT 3:4',
      version: t.version,
      accentHex: t.accentHex,
      wardrobe: t.wardrobe[0] ?? 'EDITORIAL',
      hairstyle: t.hairstyle,
      role: ['PSA HOST', 'LUXURY STYLIST', 'REPORTER', 'GUEST'][i] ?? 'ON CAMERA',
      setLayer: 'talent-layer' as const,
      subtitle: 'TALENT AGENCY · LAYER IN PRODUCTION',
    })),
    wardrobe: ASSET_DIRECTOR_WARDROBE.slice(0, 7).map((w, i) => ({
      id: w.id,
      name: w.name,
      previewSrc: w.previewSrc,
      status: w.status,
      resolution: 'LOOKBOOK',
      version: w.version,
      accentHex: w.accentHex,
      views: [
        { id: 'front', label: 'FRONT', previewSrc: thumb(i) },
        { id: 'back', label: 'BACK', previewSrc: thumb(i + 1) },
        { id: 'side', label: 'SIDE', previewSrc: thumb(i + 2) },
        { id: 'detail', label: 'DETAIL', previewSrc: thumb(i + 3) },
      ],
      currentPrompt: w.promptNotes ?? `EDITORIAL LOOK — ${w.name}`,
    })),
    expressions: ASSET_DIRECTOR_EXPRESSIONS.map((e, i) => visualFromCard(e, i)),
    poses: ASSET_DIRECTOR_POSES.map((p, i) => visualFromCard(p, i)),
    materials: ASSET_DIRECTOR_MATERIALS.slice(0, 8).map((m, i) => visualFromCard(m, i, m.usageRules)),
    relationships: {
      source: { id: studio.id, name: studio.name, previewSrc: hero },
      usedBy: studio.usageMap.map((name, i) => ({
        id: `rel-${i}`,
        name,
        previewSrc: thumb(i),
        route: undefined,
      })),
    },
    moodboardPins: [
      { id: 'mb-1', src: thumb(0), caption: 'GLASS ARCHITECTURE', category: 'ARCHITECTURE', span: 'tall' },
      { id: 'mb-2', src: thumb(1), caption: 'FORECAST GRAPHICS', category: 'EDITORIAL', span: 'normal' },
      { id: 'mb-3', src: thumb(2), caption: 'LUXURY RED ACCENT', category: 'LUXURY', span: 'wide' },
      { id: 'mb-4', src: thumb(3), caption: 'CLOUD TEXTURE', category: 'TEXTURES', span: 'normal' },
      { id: 'mb-5', src: thumb(0), caption: 'BROADCAST LIGHTING', category: 'LIGHTING', span: 'tall' },
      { id: 'mb-6', src: thumb(1), caption: 'PROMPT INSPIRATION', category: 'PROMPT', span: 'normal' },
    ],
    versionTimeline: [
      { id: 'vt-1', version: 'VERSION 1.0', previewSrc: thumb(0), date: '2026-03-01', notes: 'INITIAL GLASS FORECAST WING', changes: 'MASTER ENVIRONMENT LOCKED' },
      { id: 'vt-2', version: 'VERSION 2.0', previewSrc: thumb(1), date: '2026-05-12', notes: 'HOLIDAY LUXURY VARIANT', changes: 'ADDED SEASONAL LIGHTING' },
      { id: 'vt-3', version: 'VERSION 3.0', previewSrc: thumb(2), date: '2026-07-01', notes: 'LAUNCH CAMPAIGN REFRESH', changes: 'UPDATED MAP GRAPHICS · APPROVED' },
    ],
    healthCards: [
      { id: 'h1', label: 'MISSING VIDEO', previewSrc: thumb(0), indicator: 'needs-video' },
      { id: 'h2', label: 'NEEDS UPSCALE', previewSrc: thumb(1), indicator: 'needs-upscale' },
      { id: 'h3', label: 'OUTDATED PROMPT', previewSrc: thumb(2), indicator: 'outdated-prompt' },
      { id: 'h4', label: 'UNUSED', previewSrc: thumb(3), indicator: 'unused' },
      { id: 'h5', label: 'DUPLICATE', previewSrc: thumb(0), indicator: 'duplicate' },
      { id: 'h6', label: 'READY', previewSrc: thumb(1), indicator: 'ready-for-production' },
    ],
    metadata: {
      prompt: studio.promptVersions[0]?.body ?? studio.masterEnvironment,
      notes: 'GLASS FORECAST STUDIO — PRIMARY WEATHER VISUAL DNA',
      resolution: '3840×1600 · 21:9 MASTER',
      fileType: 'WEBP · PNG · MP4 PLACEHOLDER',
      created: '2026-01-15',
      modified: studio.lastUpdated,
      tags: ['WEATHER', 'BROADCAST', 'GLASS', 'MARBLE', 'FORECAST'],
      relationships: studio.usageMap,
      systemIds: [studio.id, `${studio.id}-master`, `${studio.id}-hero`],
    },
  };
}

/** Build visual bundle for any studio — Weather Studio gets the richest demo set. */
export function getStudioVisualBundle(studioId: string): StudioVisualBundle | undefined {
  const studio = getAssetDirectorStudioById(studioId);
  if (!studio) return undefined;
  if (studioId === 'ad-studio-weather') return buildWeatherStudioBundle(studio);

  const idx = ASSET_DIRECTOR_STUDIOS.findIndex((s) => s.id === studioId);
  const versionNames = ['DAY', 'NIGHT', 'SEASONAL', 'LUXURY'];
  return {
    studio,
    heroSrc: studio.previewSrc,
    heroType: 'image',
    productionCount: 4 + (idx % 8),
    separationRule: STUDIO_SET_SEPARATION_RULE,
    masterStudio: [
      layerItem(studio, `${studio.id}-master-base`, 'MASTER BASE', idx, 'master-studio', 'needs-review', 'NEEDS GENERATION'),
    ],
    referenceScene: [
      layerItem(studio, `${studio.id}-ref-example`, 'STAGED REFERENCE', idx + 1, 'reference-scene', 'approved', 'EXAMPLE ONLY'),
    ],
    setDressing: ASSET_DIRECTOR_PROPS.slice(0, 4).map((p, i) =>
      layerItem(studio, `${studio.id}-dress-${i}`, p.name, i, 'set-dressing', 'approved')
    ),
    episodeGraphics: [
      layerItem(studio, `${studio.id}-gfx-title`, 'TITLE OVERLAY', 0, 'episode-graphics', 'approved'),
    ],
    versions: versionNames.map((name, i) => ({
      id: `${studio.id}-ver-${i}`,
      name,
      previewSrc: thumb(i + idx),
      status: 'approved' as const,
      resolution: '3840×1600',
      version: `v1.${i}`,
      accentHex: studio.accentHex,
      setLayer: 'master-studio' as const,
      subtitle: 'ENVIRONMENT VARIANT',
    })),
    videos: ASSET_DIRECTOR_ANIMATIONS.slice(0, 5).map((a, i) => ({
      ...visualFromCard(a, i),
      duration: `${10 + i * 3}s`,
      name: ['INTRO', 'IDLE', 'LOOP', 'OUTRO', 'TRANSITION'][i] ?? a.name,
    })),
    cameras: ASSET_DIRECTOR_CAMERA.slice(0, 6).map((c, i) => visualFromCard(c, i, 'FRAMING')),
    lighting: ASSET_DIRECTOR_LIGHTING.map((l, i) => visualFromCard(l, i)),
    props: ASSET_DIRECTOR_PROPS.slice(0, 6).map((p, i) => visualFromCard(p, i)),
    talent: ASSET_DIRECTOR_TALENT.slice(0, 3).map((t) => ({
      id: t.id,
      name: t.name,
      previewSrc: t.previewSrc,
      status: t.status,
      resolution: 'PORTRAIT',
      version: t.version,
      accentHex: t.accentHex,
      wardrobe: t.wardrobe[0] ?? '—',
      hairstyle: t.hairstyle,
      role: t.appearances[0] ?? 'ON CAMERA',
    })),
    wardrobe: ASSET_DIRECTOR_WARDROBE.slice(0, 5).map((w, i) => ({
      id: w.id,
      name: w.name,
      previewSrc: w.previewSrc,
      status: w.status,
      resolution: 'LOOKBOOK',
      version: w.version,
      accentHex: w.accentHex,
      views: [
        { id: 'front', label: 'FRONT', previewSrc: thumb(i) },
        { id: 'back', label: 'BACK', previewSrc: thumb(i + 1) },
      ],
      currentPrompt: w.promptNotes ?? w.name,
    })),
    expressions: ASSET_DIRECTOR_EXPRESSIONS.slice(0, 8).map((e, i) => visualFromCard(e, i)),
    poses: ASSET_DIRECTOR_POSES.slice(0, 8).map((p, i) => visualFromCard(p, i)),
    materials: ASSET_DIRECTOR_MATERIALS.slice(0, 6).map((m, i) => visualFromCard(m, i)),
    relationships: {
      source: { id: studio.id, name: studio.name, previewSrc: studio.previewSrc },
      usedBy: studio.usageMap.map((name, i) => ({ id: `rel-${i}`, name, previewSrc: thumb(i) })),
    },
    moodboardPins: ASSET_DIRECTOR_MOODBOARDS[0]?.images.map((img) => ({
      id: img.id,
      src: img.src,
      caption: img.caption,
      category: 'REFERENCE',
      span: 'normal' as MoodboardPin['span'],
    })) ?? [],
    versionTimeline: ASSET_DIRECTOR_VERSION_HISTORY.slice(0, 3).map((v, i) => ({
      id: v.id,
      version: v.version,
      previewSrc: thumb(i),
      date: v.changedAt,
      notes: v.changeSummary,
      changes: v.previousVersion,
    })),
    healthCards: ASSET_DIRECTOR_HEALTH_QUEUE.slice(0, 4).map((h, idx) => ({
      id: h.assetId,
      label: h.indicators[0]?.replace(/-/g, ' ').toUpperCase() ?? 'REVIEW',
      previewSrc: thumb(idx),
      indicator: h.indicators[0] ?? 'missing-preview',
    })),
    metadata: {
      prompt: studio.promptVersions[0]?.body ?? studio.masterEnvironment,
      notes: studio.masterEnvironment,
      resolution: '3840×2160',
      fileType: 'WEBP PLACEHOLDER',
      created: '2026-01-01',
      modified: studio.lastUpdated,
      tags: [studio.category, studio.name.split(' ')[0]],
      relationships: studio.usageMap,
      systemIds: [studio.id],
    },
  };
}

export function getTalentVisualBundle(talentId: string) {
  const talent = getAssetDirectorTalentById(talentId);
  if (!talent) return undefined;
  return {
    talent,
    heroSrc: talent.previewSrc,
    portraits: [
      { id: 'master', label: 'MASTER', src: talent.previewSrc },
      { id: 'video', label: 'VIDEO REF', src: thumb(1) },
      { id: 'editorial', label: 'EDITORIAL', src: thumb(2) },
    ],
    wardrobe: ASSET_DIRECTOR_WARDROBE.slice(0, 4).map((w) => ({
      id: w.id,
      name: w.name,
      previewSrc: w.previewSrc,
      status: w.status,
      resolution: 'LOOKBOOK',
      version: w.version,
      accentHex: w.accentHex,
      views: [{ id: 'front', label: 'FRONT', previewSrc: w.previewSrc }],
      currentPrompt: w.name,
    })),
    expressions: ASSET_DIRECTOR_EXPRESSIONS.slice(0, 8).map((e, i) => visualFromCard(e, i)),
    poses: ASSET_DIRECTOR_POSES.slice(0, 8).map((p, i) => visualFromCard(p, i)),
    metadata: {
      prompt: talent.promptVersions[0]?.body ?? talent.masterPortrait,
      notes: talent.masterPortrait,
      resolution: 'PORTRAIT 3:4',
      fileType: 'PNG',
      created: '2026-02-01',
      modified: talent.lastUpdated,
      tags: ['TALENT', talent.name],
      relationships: talent.usageMap,
      systemIds: [talent.id],
    },
  };
}

export type GalleryBrowseItem = AssetDirectorCard & { route: string };

export function listAssetDirectorGalleryItems(kind: 'studios' | 'talent' | 'wardrobe' | 'props' | 'materials' | 'all'): GalleryBrowseItem[] {
  const items: GalleryBrowseItem[] = [];
  if (kind === 'studios' || kind === 'all') {
    ASSET_DIRECTOR_STUDIOS.forEach((s) => items.push({ ...s, route: `/admin/studio/asset-director/studios/${s.id}` }));
  }
  if (kind === 'talent' || kind === 'all') {
    ASSET_DIRECTOR_TALENT.forEach((t) => items.push({ ...t, route: `/admin/studio/asset-director/talent/${t.id}` }));
  }
  if (kind === 'wardrobe' || kind === 'all') {
    ASSET_DIRECTOR_WARDROBE.forEach((w) => items.push({ ...w, route: '/admin/studio/asset-director/section/wardrobe' }));
  }
  if (kind === 'props' || kind === 'all') {
    ASSET_DIRECTOR_PROPS.forEach((p) => items.push({ ...p, route: '/admin/studio/asset-director/section/props' }));
  }
  if (kind === 'materials' || kind === 'all') {
    ASSET_DIRECTOR_MATERIALS.forEach((m) => items.push({ ...m, route: '/admin/studio/asset-director/section/materials' }));
  }
  return items;
}

export function filterGalleryItems(
  items: GalleryBrowseItem[],
  filter: AssetDirectorFilterId,
  favorites: string[]
): GalleryBrowseItem[] {
  if (filter === 'all') return items;
  if (filter === 'approved') return items.filter((i) => i.status === 'approved' || i.status === 'in-use');
  if (filter === 'needs-review') return items.filter((i) => i.status === 'needs-review' || i.status === 'draft');
  if (filter === 'missing') return items.filter((i) => i.health.includes('missing-preview'));
  if (filter === 'favorites') return items.filter((i) => favorites.includes(i.id));
  if (filter === 'recently-used') return items.filter((i) => i.usedBy.length > 1);
  if (filter === 'recently-generated') return [...items].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 12);
  return items;
}

export function searchGalleryItems(items: GalleryBrowseItem[], query: string): GalleryBrowseItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.usedBy.some((u) => u.toLowerCase().includes(q)) ||
      (i.promptNotes?.toLowerCase().includes(q) ?? false)
  );
}

export const ASSET_DIRECTOR_GALLERY_SECTIONS = [
  { id: 'studios', label: 'STUDIOS', route: '/admin/studio/asset-director/studios', count: ASSET_DIRECTOR_STUDIOS.length },
  { id: 'talent', label: 'TALENT', route: '/admin/studio/asset-director/talent', count: ASSET_DIRECTOR_TALENT.length },
  { id: 'wardrobe', label: 'WARDROBE', route: '/admin/studio/asset-director/section/wardrobe', count: ASSET_DIRECTOR_WARDROBE.length },
  { id: 'props', label: 'PROPS', route: '/admin/studio/asset-director/section/props', count: ASSET_DIRECTOR_PROPS.length },
  { id: 'lighting', label: 'LIGHTING', route: '/admin/studio/asset-director/section/lighting', count: ASSET_DIRECTOR_LIGHTING.length },
  { id: 'camera', label: 'CAMERA', route: '/admin/studio/asset-director/section/camera', count: ASSET_DIRECTOR_CAMERA.length },
  { id: 'materials', label: 'MATERIALS', route: '/admin/studio/asset-director/section/materials', count: ASSET_DIRECTOR_MATERIALS.length },
  { id: 'moodboards', label: 'MOODBOARDS', route: '/admin/studio/asset-director/section/moodboards', count: ASSET_DIRECTOR_MOODBOARDS.length },
] as const;

export const ASSET_DIRECTOR_BULK_ACTIONS = [
  'REPLACE',
  'MOVE',
  'ARCHIVE',
  'DUPLICATE',
  'GENERATE VARIATIONS',
  'EXPORT',
  'ASSIGN',
] as const;
