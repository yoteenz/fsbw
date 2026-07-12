import type { SubsystemHealthState } from './contract';

export const ASSET_HIERARCHY_VERSION = 'asset-hierarchy.v1';

export type HeroAssetClass =
  | 'reception-desk'
  | 'signature-landmark'
  | 'elevator'
  | 'feature-staircase'
  | 'water-feature'
  | 'crystal-installation'
  | 'display-platform'
  | 'command-center';

export type FurnitureAssetClass =
  | 'chair'
  | 'table'
  | 'lounge'
  | 'display-case'
  | 'bench'
  | 'desk'
  | 'pod';

export type DecorAssetClass =
  | 'flowers'
  | 'books'
  | 'plants'
  | 'accessories'
  | 'glass-object'
  | 'sculptural-accent'
  | 'wall-piece';

export type WorldAssetTier = 'hero' | 'furniture' | 'decor';

export type WorldAssetRecord = {
  assetId: string;
  organizationId: string;
  roomId: string;
  tier: WorldAssetTier;
  assetClass: string;
  health: SubsystemHealthState;
  version: number;
  promptVersion: string;
  providerModel: string;
  generationMetadata: Record<string, unknown>;
  placementMetadata: Record<string, unknown>;
  boundingVolume: { width: number; height: number; depth: number } | null;
  socketCompatibility: string[];
  transparencyStatus: 'opaque' | 'alpha' | 'glass' | 'unknown';
  qualityScore: number;
  repairHistory: string[];
  sourceUrl: string | null;
  approved: boolean;
  createdAt: string;
};

export const HERO_ASSET_CLASSES: HeroAssetClass[] = [
  'reception-desk',
  'signature-landmark',
  'elevator',
  'feature-staircase',
  'water-feature',
  'crystal-installation',
  'display-platform',
  'command-center',
];

export function assetTierForClass(assetClass: string): WorldAssetTier {
  if (HERO_ASSET_CLASSES.includes(assetClass as HeroAssetClass)) return 'hero';
  const furniture: FurnitureAssetClass[] = ['chair', 'table', 'lounge', 'display-case', 'bench', 'desk', 'pod'];
  if (furniture.includes(assetClass as FurnitureAssetClass)) return 'furniture';
  return 'decor';
}

export function subsystemForAssetTier(tier: WorldAssetTier): import('./contract').RoomOperationalSubsystem {
  switch (tier) {
    case 'hero':
      return 'hero-assets';
    case 'furniture':
      return 'furniture';
    case 'decor':
      return 'decor';
  }
}
