import { listAllRegistryAssets } from '../studio-os-core/studio-builder/registry-store';
import {
  CATEGORY_TO_DISTRICT,
  type WarehouseAsset,
  type WarehouseAssetCategory,
  type WarehouseDistrictId,
} from '../studio-os-core/studio-warehouse';

export const STUDIO_ARCHIVES_SUBTITLE =
  'Studio World\'s Industrial Design Campus™ — the living memory of every reusable asset, blueprint, and prototype under one architectural roof.';

/** @deprecated Use STUDIO_ARCHIVES_SUBTITLE */
export const STUDIO_WAREHOUSE_SUBTITLE = STUDIO_ARCHIVES_SUBTITLE;

export const STUDIO_ARCHIVES_INHERITANCE_CHAIN =
  'Asset Registry™ → Studio Archives™ → Scene Recipe™ → Replace Workflow → Golden Build™';

/** @deprecated Use STUDIO_ARCHIVES_INHERITANCE_CHAIN */
export const STUDIO_WAREHOUSE_INHERITANCE_CHAIN = STUDIO_ARCHIVES_INHERITANCE_CHAIN;

const GRADIENTS = [
  'linear-gradient(135deg, #1a1814 0%, #3d3428 50%, #c9a962 100%)',
  'linear-gradient(160deg, #0f1419 0%, #2a3544 60%, #8ba4c4 100%)',
  'linear-gradient(145deg, #141210 0%, #2c2824 40%, #e8e0d4 100%)',
  'linear-gradient(120deg, #1c1510 0%, #4a3828 55%, #d4af7a 100%)',
  'linear-gradient(170deg, #101418 0%, #243040 70%, #6b8cae 100%)',
  'linear-gradient(135deg, #18161a 0%, #32283a 50%, #b8a0c8 100%)',
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % GRADIENTS.length;
  return GRADIENTS[hash]!;
}

function mapRegistryCategory(category: string): WarehouseAssetCategory {
  const c = category.toLowerCase();
  if (c.includes('light')) return 'lighting-pack';
  if (c.includes('furn')) return 'furniture';
  if (c.includes('material') || c.includes('surface')) return 'materials';
  if (c.includes('atmos') || c.includes('ambient')) return 'atmosphere';
  if (c.includes('hero') || c.includes('landmark') || c.includes('orb')) return 'hero-object';
  if (c.includes('scene-stack') || c.includes('environment')) return 'environment-shell';
  if (c.includes('texture') || c.includes('icon')) return 'texture';
  if (c.includes('audio')) return 'audio';
  if (c.includes('anim') || c.includes('motion')) return 'animation';
  return 'environment-shell';
}

function districtForCategory(category: WarehouseAssetCategory, registryCategory: string): WarehouseDistrictId {
  return CATEGORY_TO_DISTRICT[registryCategory] ?? CATEGORY_TO_DISTRICT[category] ?? 'environment-gallery';
}

function registryToWarehouse(entry: ReturnType<typeof listAllRegistryAssets>[number], index: number): WarehouseAsset {
  const category = mapRegistryCategory(entry.category);
  const name = entry.assetId.replace(/scene-stack-|[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const id = `wh-reg-${entry.id}`;
  const scenePacks = new Set<string>(['story-table', 'arrival', 'mood-wall']);
  if (entry.stationId) scenePacks.add(entry.stationId);
  return {
    id,
    name: name || entry.assetId,
    version: `v${index + 1}.0`,
    category,
    districtId: districtForCategory(category, entry.category),
    department: entry.departmentId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    workspace: entry.stationId
      ? entry.stationId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Frontal Slayer HQ',
    generationDate: entry.registeredAt?.slice(0, 10) ?? '—',
    generationCostUsd: 0.42 + (index % 7) * 0.18,
    provider: entry.model?.split('/').pop() ?? 'FAL',
    usageCount: index % 5,
    reuseCount: index % 4,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 72 + (index % 22),
    previewGradient: gradientFor(id),
    previewUrl: entry.publicUrl || undefined,
    tags: [entry.category, entry.departmentId, 'pipeline-registered'],
    similarAssetIds: [],
    compatibleScenePackIds: [...scenePacks],
    goldenBuildCount: index % 12,
    archived: false,
    favorite: index % 9 === 0,
    registryAssetId: entry.id,
  };
}

const SEED_ASSETS: WarehouseAsset[] = [
  {
    id: 'wh-env-editorial-loft-v2',
    name: 'Editorial Loft V2',
    version: 'v2.4',
    category: 'environment-shell',
    districtId: 'environment-gallery',
    department: 'Creative Direction Studio™',
    workspace: 'Story Table™',
    generationDate: '2026-06-18',
    generationCostUsd: 2.84,
    provider: 'nano-banana-pro',
    usageCount: 18,
    reuseCount: 14,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 94,
    previewGradient: gradientFor('wh-env-editorial-loft-v2'),
    tags: ['editorial', 'loft', 'white marble', 'headquarters', 'luxury'],
    similarAssetIds: ['wh-env-gallery-wing', 'wh-env-bronze-arch-threshold'],
    compatibleScenePackIds: ['story-table', 'mood-wall'],
    goldenBuildCount: 12,
    archived: false,
    favorite: true,
  },
  {
    id: 'wh-light-luxury-editorial-white',
    name: 'Luxury Editorial White',
    version: 'v1.8',
    category: 'lighting-pack',
    districtId: 'lighting-gallery',
    department: 'Creative Direction Studio™',
    workspace: 'Story Table™',
    generationDate: '2026-06-18',
    generationCostUsd: 1.12,
    provider: 'nano-banana-pro',
    usageCount: 22,
    reuseCount: 19,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 91,
    previewGradient: gradientFor('wh-light-luxury-editorial-white'),
    tags: ['soft key', 'editorial', 'white bounce', 'luxury'],
    similarAssetIds: ['wh-light-track-gallery'],
    compatibleScenePackIds: ['story-table', 'arrival'],
    goldenBuildCount: 15,
    archived: false,
    favorite: true,
  },
  {
    id: 'wh-furn-exec-glass-collection',
    name: 'Executive Glass Collection',
    version: 'v3.1',
    category: 'furniture',
    districtId: 'furniture-hall',
    department: 'Creative Direction Studio™',
    workspace: 'Story Table™',
    generationDate: '2026-06-19',
    generationCostUsd: 1.64,
    provider: 'nano-banana-pro',
    usageCount: 9,
    reuseCount: 7,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 88,
    previewGradient: gradientFor('wh-furn-exec-glass-collection'),
    tags: ['glass table', 'executive', 'showroom', 'furniture pack'],
    similarAssetIds: [],
    compatibleScenePackIds: ['story-table'],
    goldenBuildCount: 8,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-mat-white-marble-collection',
    name: 'White Marble Collection',
    version: 'v2.0',
    category: 'materials',
    districtId: 'materials-library',
    department: 'Creative Direction Studio™',
    workspace: 'Story Table™',
    generationDate: '2026-06-19',
    generationCostUsd: 0.86,
    provider: 'nano-banana-pro',
    usageCount: 31,
    reuseCount: 28,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 96,
    previewGradient: gradientFor('wh-mat-white-marble-collection'),
    tags: ['white marble', 'marble', 'surface', 'headquarters'],
    similarAssetIds: ['wh-mat-charcoal-plaster'],
    compatibleScenePackIds: ['story-table', 'mood-wall', 'arrival'],
    goldenBuildCount: 22,
    archived: false,
    favorite: true,
  },
  {
    id: 'wh-atm-soft-dust',
    name: 'Soft Dust',
    version: 'v1.2',
    category: 'atmosphere',
    districtId: 'atmosphere-lab',
    department: 'Creative Direction Studio™',
    workspace: 'Story Table™',
    generationDate: '2026-06-20',
    generationCostUsd: 0.48,
    provider: 'cursor-runtime',
    usageCount: 14,
    reuseCount: 11,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 85,
    previewGradient: gradientFor('wh-atm-soft-dust'),
    tags: ['dust', 'particles', 'ambient', 'atmosphere'],
    similarAssetIds: ['wh-atm-ambient-pack-02', 'wh-atm-lobby-haze'],
    compatibleScenePackIds: ['story-table'],
    goldenBuildCount: 10,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-hero-studio-orb-v3',
    name: 'Studio Orb V3',
    version: 'v3.0',
    category: 'hero-object',
    districtId: 'hero-object-vault',
    department: 'Creative Direction Studio™',
    workspace: 'Story Table™',
    generationDate: '2026-06-21',
    generationCostUsd: 1.92,
    provider: 'nano-banana-pro',
    usageCount: 26,
    reuseCount: 4,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 99,
    previewGradient: gradientFor('wh-hero-studio-orb-v3'),
    tags: ['studio orb', 'monument', 'interactive landmark'],
    similarAssetIds: [],
    compatibleScenePackIds: ['story-table', 'pipeline-board'],
    goldenBuildCount: 18,
    archived: false,
    favorite: true,
  },
  {
    id: 'wh-atm-ambient-pack-02',
    name: 'Ambient Pack 02',
    version: 'v1.0',
    category: 'particles',
    districtId: 'atmosphere-lab',
    department: 'Creative Direction Studio™',
    workspace: 'Story Table™',
    generationDate: '2026-06-20',
    generationCostUsd: 0.36,
    provider: 'cursor-runtime',
    usageCount: 6,
    reuseCount: 5,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 82,
    previewGradient: gradientFor('wh-atm-ambient-pack-02'),
    tags: ['particles', 'ambient', 'bloom'],
    similarAssetIds: ['wh-atm-soft-dust'],
    compatibleScenePackIds: ['story-table'],
    goldenBuildCount: 6,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-motion-luxury-idle',
    name: 'Luxury Idle',
    version: 'v2.1',
    category: 'runtime-fx',
    districtId: 'motion-sound-wing',
    department: 'Creative Direction Studio™',
    workspace: 'Story Table™',
    generationDate: '2026-06-22',
    generationCostUsd: 0.24,
    provider: 'cursor-runtime',
    usageCount: 19,
    reuseCount: 16,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 90,
    previewGradient: gradientFor('wh-motion-luxury-idle'),
    tags: ['idle life', 'runtime', 'luxury', 'animation'],
    similarAssetIds: [],
    compatibleScenePackIds: ['story-table', 'arrival'],
    goldenBuildCount: 11,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-env-bronze-arch-threshold',
    name: 'Bronze Arch Threshold',
    version: 'v1.6',
    category: 'environment-shell',
    districtId: 'environment-gallery',
    department: 'Creative Direction Studio™',
    workspace: 'Arrival Zone™',
    generationDate: '2026-06-14',
    generationCostUsd: 2.1,
    provider: 'nano-banana-pro',
    usageCount: 11,
    reuseCount: 8,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 89,
    previewGradient: gradientFor('wh-env-bronze-arch-threshold'),
    tags: ['bronze', 'arch', 'threshold', 'floating architecture'],
    similarAssetIds: ['wh-env-editorial-loft-v2'],
    compatibleScenePackIds: ['arrival'],
    goldenBuildCount: 9,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-light-arrival-warm-spot',
    name: 'Arrival Warm Spot',
    version: 'v1.1',
    category: 'lighting-pack',
    districtId: 'lighting-gallery',
    department: 'Creative Direction Studio™',
    workspace: 'Arrival Zone™',
    generationDate: '2026-06-14',
    generationCostUsd: 0.94,
    provider: 'nano-banana-pro',
    usageCount: 8,
    reuseCount: 6,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 86,
    previewGradient: gradientFor('wh-light-arrival-warm-spot'),
    tags: ['warm', 'spot', 'arrival'],
    similarAssetIds: ['wh-light-luxury-editorial-white'],
    compatibleScenePackIds: ['arrival', 'story-table'],
    goldenBuildCount: 7,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-mat-bronze-patina',
    name: 'Bronze Patina Wall',
    version: 'v1.0',
    category: 'materials',
    districtId: 'materials-library',
    department: 'Creative Direction Studio™',
    workspace: 'Arrival Zone™',
    generationDate: '2026-06-14',
    generationCostUsd: 0.52,
    provider: 'nano-banana-pro',
    usageCount: 4,
    reuseCount: 3,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 84,
    previewGradient: gradientFor('wh-mat-bronze-patina'),
    tags: ['bronze', 'patina', 'metal wall'],
    similarAssetIds: [],
    compatibleScenePackIds: ['arrival'],
    goldenBuildCount: 4,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-atm-lobby-haze',
    name: 'Lobby Haze',
    version: 'v1.3',
    category: 'atmosphere',
    districtId: 'atmosphere-lab',
    department: 'Creative Direction Studio™',
    workspace: 'Arrival Zone™',
    generationDate: '2026-06-15',
    generationCostUsd: 0.38,
    provider: 'cursor-runtime',
    usageCount: 7,
    reuseCount: 5,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 81,
    previewGradient: gradientFor('wh-atm-lobby-haze'),
    tags: ['haze', 'fog', 'lobby'],
    similarAssetIds: ['wh-atm-soft-dust'],
    compatibleScenePackIds: ['arrival'],
    goldenBuildCount: 5,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-env-gallery-wing',
    name: 'Gallery Wing Shell',
    version: 'v2.0',
    category: 'environment-shell',
    districtId: 'environment-gallery',
    department: 'Creative Direction Studio™',
    workspace: 'Living Mood Wall™',
    generationDate: '2026-06-16',
    generationCostUsd: 2.44,
    provider: 'nano-banana-pro',
    usageCount: 5,
    reuseCount: 4,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 87,
    previewGradient: gradientFor('wh-env-gallery-wing'),
    tags: ['gallery', 'mood wall', 'floating architecture'],
    similarAssetIds: ['wh-env-editorial-loft-v2'],
    compatibleScenePackIds: ['mood-wall'],
    goldenBuildCount: 5,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-light-track-gallery',
    name: 'Track Gallery Lights',
    version: 'v1.4',
    category: 'lighting-pack',
    districtId: 'lighting-gallery',
    department: 'Creative Direction Studio™',
    workspace: 'Living Mood Wall™',
    generationDate: '2026-06-16',
    generationCostUsd: 1.02,
    provider: 'nano-banana-pro',
    usageCount: 3,
    reuseCount: 2,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 83,
    previewGradient: gradientFor('wh-light-track-gallery'),
    tags: ['track lights', 'gallery'],
    similarAssetIds: [],
    compatibleScenePackIds: ['mood-wall'],
    goldenBuildCount: 3,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-mat-charcoal-plaster',
    name: 'Charcoal Plaster',
    version: 'v1.2',
    category: 'materials',
    districtId: 'materials-library',
    department: 'Creative Direction Studio™',
    workspace: 'Living Mood Wall™',
    generationDate: '2026-06-16',
    generationCostUsd: 0.44,
    provider: 'nano-banana-pro',
    usageCount: 2,
    reuseCount: 1,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 80,
    previewGradient: gradientFor('wh-mat-charcoal-plaster'),
    tags: ['charcoal', 'plaster', 'wall'],
    similarAssetIds: ['wh-mat-white-marble-collection'],
    compatibleScenePackIds: ['mood-wall'],
    goldenBuildCount: 2,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-furn-unused-lounge-set',
    name: 'Lounge Accent Set (Unused)',
    version: 'v1.0',
    category: 'furniture',
    districtId: 'furniture-hall',
    department: 'Creative Direction Studio™',
    workspace: 'Frontal Slayer HQ',
    generationDate: '2026-05-28',
    generationCostUsd: 1.28,
    provider: 'nano-banana-pro',
    usageCount: 0,
    reuseCount: 0,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 76,
    previewGradient: gradientFor('wh-furn-unused-lounge-set'),
    tags: ['lounge', 'unused', 'furniture pack'],
    similarAssetIds: [],
    compatibleScenePackIds: ['story-table'],
    goldenBuildCount: 0,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-mkt-import-luxury-lighting',
    name: 'Marketplace · Nordic Rim Light',
    version: 'v1.0',
    category: 'lighting-pack',
    districtId: 'lighting-gallery',
    department: 'Marketplace Import',
    workspace: 'Importable',
    generationDate: '2026-06-01',
    generationCostUsd: 0,
    provider: 'marketplace',
    usageCount: 0,
    reuseCount: 0,
    marketplaceStatus: 'imported',
    genomeCompatibilityPct: 78,
    previewGradient: gradientFor('wh-mkt-import-luxury-lighting'),
    tags: ['marketplace', 'import', 'lighting only'],
    similarAssetIds: [],
    compatibleScenePackIds: ['story-table', 'mood-wall'],
    goldenBuildCount: 0,
    archived: false,
    favorite: false,
  },
  {
    id: 'wh-tex-ui-chrome-gold',
    name: 'UI Chrome Gold Trim',
    version: 'v2.2',
    category: 'texture',
    districtId: 'texture-archive',
    department: 'Design Genome™',
    workspace: 'Frontal Slayer HQ',
    generationDate: '2026-05-10',
    generationCostUsd: 0.12,
    provider: 'internal',
    usageCount: 45,
    reuseCount: 40,
    marketplaceStatus: 'owned',
    genomeCompatibilityPct: 97,
    previewGradient: gradientFor('wh-tex-ui-chrome-gold'),
    tags: ['icon', 'texture', 'ui chrome', 'gold'],
    similarAssetIds: [],
    compatibleScenePackIds: ['story-table', 'arrival', 'mood-wall', 'pipeline-board'],
    goldenBuildCount: 30,
    archived: false,
    favorite: true,
  },
];

function linkSimilarAssets(assets: WarehouseAsset[]): WarehouseAsset[] {
  const byDistrict = new Map<string, string[]>();
  for (const a of assets) {
    const list = byDistrict.get(a.districtId) ?? [];
    list.push(a.id);
    byDistrict.set(a.districtId, list);
  }
  return assets.map((a) => ({
    ...a,
    similarAssetIds: (byDistrict.get(a.districtId) ?? []).filter((id) => id !== a.id).slice(0, 3),
  }));
}

export function buildStudioWarehouseCatalog(): WarehouseAsset[] {
  const registryAssets = listAllRegistryAssets().map(registryToWarehouse);
  const seedIds = new Set(SEED_ASSETS.map((a) => a.id));
  const registryNames = new Set(SEED_ASSETS.map((a) => a.name.toLowerCase()));
  const merged = [
    ...SEED_ASSETS,
    ...registryAssets.filter(
      (r) => !seedIds.has(r.id) && !registryNames.has(r.name.toLowerCase())
    ),
  ];
  return linkSimilarAssets(merged);
}

export function getWarehouseAssetById(id: string, catalog?: WarehouseAsset[]): WarehouseAsset | null {
  const list = catalog ?? buildStudioWarehouseCatalog();
  return list.find((a) => a.id === id) ?? null;
}

export function listWarehouseAssetsByDistrict(
  districtId: WarehouseDistrictId,
  catalog?: WarehouseAsset[]
): WarehouseAsset[] {
  const list = catalog ?? buildStudioWarehouseCatalog();
  return list.filter((a) => a.districtId === districtId && !a.archived);
}

export function exportWarehouseSnapshot() {
  const catalog = buildStudioWarehouseCatalog();
  return {
    totalAssets: catalog.length,
    districtCounts: Object.fromEntries(
      (['environment-gallery', 'lighting-gallery', 'furniture-hall', 'materials-library', 'atmosphere-lab', 'hero-object-vault', 'motion-sound-wing', 'texture-archive'] as const).map(
        (id) => [id, listWarehouseAssetsByDistrict(id, catalog).length]
      )
    ),
    totalReuseSavingsUsd: catalog.reduce((sum, a) => sum + a.reuseCount * a.generationCostUsd * 0.82, 0),
    catalog,
  };
}
