import type { StudioWorldIconCategoryId } from './StudioWorldIconCategories';
import type { StudioWorldIconStateAssets } from './StudioWorldIconState';
import type { StudioWorldIconThemeCompatibility } from './StudioWorldIconTheme';

export const STUDIO_WORLD_ICON_CERTIFICATION_STAGES = [
  'draft',
  'generated',
  'qa',
  'founder-review',
  'certified',
  'production',
  'archived',
  'deprecated',
] as const;

export type StudioWorldIconCertificationStage = (typeof STUDIO_WORLD_ICON_CERTIFICATION_STAGES)[number];

export type StudioWorldIconVersionLabel = 'v1' | 'v2' | 'v3' | 'certified' | 'legacy' | 'deprecated' | 'experimental' | 'future';

export type StudioWorldIconProviderKind =
  | 'local-svg'
  | 'local-png'
  | 'sprite'
  | 'cdn'
  | 'studio-asset-package'
  | 'marketplace-pack'
  | 'ai-generated'
  | 'experience-lab-v6';

export type StudioWorldIconFutureCapabilities = {
  supportsAnimation: boolean;
  supportsMorph: boolean;
  supportsVariable: boolean;
  supports3D: boolean;
  supportsParticles: boolean;
  supportsGlow: boolean;
  supportsPhysics: boolean;
};

export type StudioWorldIconMetadata = {
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  departmentUsage: string[];
  usageCount: number;
  favorite: boolean;
  deprecated: boolean;
  replacement: string | null;
};

/** Canonical first-class Studio World icon object — SF Symbols equivalent. */
export type StudioWorldIconDefinition = {
  id: string;
  category: StudioWorldIconCategoryId;
  displayName: string;
  aliases: string[];
  keywords: string[];
  description: string;
  version: StudioWorldIconVersionLabel;
  certification: StudioWorldIconCertificationStage;
  status: 'active' | 'draft' | 'deprecated' | 'experimental' | 'future';
  strokeWidth: number;
  cornerRadius: number;
  opticalWeight: number;
  designFamily: string;
  renderStyle: 'sprite' | 'vector' | 'raster' | 'future';
  themeCompatibility: StudioWorldIconThemeCompatibility;
  provider: StudioWorldIconProviderKind;
  defaultAsset: string | null;
  hoverAsset: string | null;
  activeAsset: string | null;
  disabledAsset: string | null;
  futureAnimatedAsset: string | null;
  futureVariableAsset: string | null;
  future3DAsset: string | null;
  svgPath: string | null;
  pngPath: string | null;
  thumbnail: string | null;
  preview: string | null;
  stateAssets: StudioWorldIconStateAssets;
  future: StudioWorldIconFutureCapabilities;
  metadata: StudioWorldIconMetadata;
  /** Legacy bridge — maps to Experience Lab icon name when seeded from v6 grid. */
  legacyExperienceLabIconName?: string;
};
