import type { WarehouseAsset, WarehouseRecommendation, WarehouseSceneRecipe } from './types';

export const STORY_TABLE_SCENE_RECIPE: WarehouseSceneRecipe = {
  workspaceId: 'story-table',
  workspaceName: 'Story Table™',
  department: 'Creative Direction Studio™',
  ingredients: [
    { role: 'Environment Shell™', assetId: 'wh-env-editorial-loft-v2', assetName: 'Editorial Loft V2', version: 'v2.4' },
    { role: 'Lighting™', assetId: 'wh-light-luxury-editorial-white', assetName: 'Luxury Editorial White', version: 'v1.8' },
    { role: 'Furniture™', assetId: 'wh-furn-exec-glass-collection', assetName: 'Executive Glass Collection', version: 'v3.1' },
    { role: 'Materials™', assetId: 'wh-mat-white-marble-collection', assetName: 'White Marble Collection', version: 'v2.0' },
    { role: 'Atmosphere™', assetId: 'wh-atm-soft-dust', assetName: 'Soft Dust', version: 'v1.2' },
    { role: 'Hero Object™', assetId: 'wh-hero-studio-orb-v3', assetName: 'Studio Orb V3', version: 'v3.0' },
    { role: 'Particles™', assetId: 'wh-atm-ambient-pack-02', assetName: 'Ambient Pack 02', version: 'v1.0' },
    { role: 'Runtime™', assetId: 'wh-motion-luxury-idle', assetName: 'Luxury Idle', version: 'v2.1' },
  ],
};

export const WAREHOUSE_SCENE_RECIPES: WarehouseSceneRecipe[] = [
  STORY_TABLE_SCENE_RECIPE,
  {
    workspaceId: 'arrival',
    workspaceName: 'Arrival Zone™',
    department: 'Creative Direction Studio™',
    ingredients: [
      { role: 'Environment Shell™', assetId: 'wh-env-bronze-arch-threshold', assetName: 'Bronze Arch Threshold', version: 'v1.6' },
      { role: 'Lighting™', assetId: 'wh-light-arrival-warm-spot', assetName: 'Arrival Warm Spot', version: 'v1.1' },
      { role: 'Materials™', assetId: 'wh-mat-bronze-patina', assetName: 'Bronze Patina Wall', version: 'v1.0' },
      { role: 'Atmosphere™', assetId: 'wh-atm-lobby-haze', assetName: 'Lobby Haze', version: 'v1.3' },
    ],
  },
  {
    workspaceId: 'mood-wall',
    workspaceName: 'Living Mood Wall™',
    department: 'Creative Direction Studio™',
    ingredients: [
      { role: 'Environment Shell™', assetId: 'wh-env-gallery-wing', assetName: 'Gallery Wing Shell', version: 'v2.0' },
      { role: 'Lighting™', assetId: 'wh-light-track-gallery', assetName: 'Track Gallery Lights', version: 'v1.4' },
      { role: 'Materials™', assetId: 'wh-mat-charcoal-plaster', assetName: 'Charcoal Plaster', version: 'v1.2' },
    ],
  },
];

export function buildWarehouseRecommendations(
  assets: WarehouseAsset[],
  focusAssetId?: string
): WarehouseRecommendation[] {
  const focus = focusAssetId ? assets.find((a) => a.id === focusAssetId) : assets[0];
  if (!focus) return [];

  const candidates = assets
    .filter((a) => a.id !== focus.id && !a.archived && a.districtId === focus.districtId)
    .sort((a, b) => b.goldenBuildCount + b.reuseCount - (a.goldenBuildCount + a.reuseCount))
    .slice(0, 4);

  return candidates.map((asset) => {
    const reasons: string[] = [];
    if (asset.goldenBuildCount >= 8) {
      reasons.push(`Used in ${asset.goldenBuildCount} successful Golden Builds™`);
    }
    if (asset.genomeCompatibilityPct >= 80) {
      reasons.push('Matches your Brand DNA™');
    }
    if (asset.reuseCount >= 5) {
      reasons.push(`Saves approximately ${Math.min(92, 40 + asset.reuseCount * 6)}% generation cost`);
    }
    if (asset.tags.some((t) => focus.tags.includes(t))) {
      reasons.push('Similar to your preferred environments');
    }
    if (asset.category === 'lighting-pack' && focus.category === 'environment-shell') {
      reasons.push('Frequently paired with current lighting');
    }
    if (reasons.length === 0) {
      reasons.push('Compatible with current workspace recipe');
    }
    return {
      assetId: asset.id,
      reasons,
      savingsPct: Math.min(92, 30 + asset.reuseCount * 8),
      compatibilityPct: asset.genomeCompatibilityPct,
    };
  });
}

export function shouldRecommendReuse(asset: WarehouseAsset): boolean {
  return asset.reuseCount >= 3 || asset.goldenBuildCount >= 5 || asset.usageCount >= 2;
}
