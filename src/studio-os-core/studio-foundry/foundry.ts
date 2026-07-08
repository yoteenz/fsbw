import type { RegisteredAssetEntry } from '../asset-registry';
import {
  compileAssetIntent,
  type AssetCompilerIntent,
  type GenerationRecipeId,
} from '../asset-compiler';
import {
  STUDIO_FOUNDRY_ARTICLE,
  STUDIO_FOUNDRY_VERSION,
  type StudioFoundryAssetClassRecord,
  type StudioFoundryResolveRequest,
  type StudioFoundryResolution,
} from './types';

function slugify(value: string): string {
  return value
    .trim()
    .replace(/™/g, '')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export const STUDIO_FOUNDRY_ASSET_CLASS_CATALOG: StudioFoundryAssetClassRecord[] = [
  {
    id: 'hero-icon',
    label: 'Hero Icons',
    status: 'supported',
    recipeId: 'hero-icon',
    description: 'Transparent symbolic platform objects consumed by Orb, Atlas, Mission Control, and UI.',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    status: 'supported',
    recipeId: 'architecture',
    description: 'World-scale architectural concepts and civilization structures.',
  },
  {
    id: 'room',
    label: 'Rooms',
    status: 'supported',
    recipeId: 'room',
    description: 'Immersive Studio World rooms and place-based concepts.',
  },
  {
    id: 'furniture',
    label: 'Furniture',
    status: 'supported',
    recipeId: 'furniture',
    description: 'Reusable modular spatial objects for room assembly.',
  },
  {
    id: 'material',
    label: 'Materials',
    status: 'supported',
    recipeId: 'material',
    description: 'Surface studies, material swatches, and runtime material references.',
  },
  {
    id: 'glass-object',
    label: 'Glass Objects',
    status: 'supported',
    recipeId: 'glass-ui',
    description: 'Glass, acrylic, holographic panel, and transparent interface object assets.',
  },
  {
    id: 'hologram',
    label: 'Holograms',
    status: 'planned',
    description: 'Volumetric and projected spatial communication objects.',
  },
  {
    id: 'motion-asset',
    label: 'Motion Assets',
    status: 'supported',
    recipeId: 'animation',
    description: 'Cinematic loops, subtle environmental motion, and reusable video assets.',
  },
  {
    id: 'particle-system',
    label: 'Particle Systems',
    status: 'supported',
    recipeId: 'particle',
    description: 'Deterministic ambient life systems and ceremonial particles.',
  },
  {
    id: 'portrait',
    label: 'Portraits',
    status: 'supported',
    recipeId: 'portrait',
    description: 'Editorial human/character imagery with registry metadata and usage rules.',
  },
  {
    id: 'ui-component',
    label: 'UI Components',
    status: 'supported',
    recipeId: 'glass-ui',
    description: 'Reusable visual component materials and glass interface primitives.',
  },
  {
    id: 'landmark-object',
    label: 'Landmark Objects',
    status: 'supported',
    recipeId: 'architecture',
    description: 'Signature world artifacts, monuments, and highly recognizable objects.',
  },
  {
    id: 'audio',
    label: 'Audio',
    status: 'planned',
    description: 'Room tones, interaction sounds, ceremonies, and sonic identity assets.',
  },
  {
    id: 'collectible',
    label: 'Collectibles',
    status: 'planned',
    description: 'World objects that can become rewards, marketplace goods, or ceremonial artifacts.',
  },
  {
    id: 'brand-asset',
    label: 'Brand Assets',
    status: 'supported',
    recipeId: 'brand-asset',
    description: 'Reusable identity objects and brand-system visuals.',
  },
  {
    id: 'future-asset',
    label: 'Future Asset Classes',
    status: 'planned',
    description: 'Reserved manufacturing class for future Studio World visual/object systems.',
  },
];

export function buildStudioFoundryAssetId(assetName: string, recipeId: GenerationRecipeId): string {
  return `asset-${recipeId}-${slugify(assetName)}`;
}

export function findRegisteredAssetById(
  registry: RegisteredAssetEntry[],
  assetId: string
): RegisteredAssetEntry | undefined {
  return registry.find((asset) => asset.assetId === assetId);
}

export function upsertRegisteredFoundryAsset(
  registry: RegisteredAssetEntry[],
  entry: RegisteredAssetEntry
): RegisteredAssetEntry[] {
  const withoutExisting = registry.filter((asset) => asset.assetId !== entry.assetId);
  return [entry, ...withoutExisting];
}

function pipelineFor(status: 'registry-hit' | 'manufactured' | 'regenerated'): string[] {
  if (status === 'registry-hit') {
    return [
      'UI requested asset by ID',
      'Asset Registry resolved existing asset',
      'World Graph usage can reference the returned asset ID',
      'UI displays registered asset',
    ];
  }

  return [
    'UI requested asset by ID',
    'Asset Registry missed or regeneration was requested',
    'Studio Foundry selected the appropriate Generation Recipe™',
    'Asset Compiler produced the FAL request and registry metadata',
    'Existing FAL integration performs generation',
    'Asset is versioned, registered, cached, and returned',
    'UI displays registered asset',
  ];
}

function requireManufacturingIntent(request: StudioFoundryResolveRequest): AssetCompilerIntent {
  if (!request.manufacturingIntent) {
    throw new Error(
      'Studio Foundry requires manufacturingIntent when an asset is missing or regeneration is requested.'
    );
  }
  return { ...request.manufacturingIntent, assetId: request.assetId };
}

export function resolveStudioFoundryAsset(
  request: StudioFoundryResolveRequest
): StudioFoundryResolution {
  const existing = findRegisteredAssetById(request.registry, request.assetId);

  if (existing && !request.regenerate) {
    return {
      article: STUDIO_FOUNDRY_ARTICLE,
      foundryVersion: STUDIO_FOUNDRY_VERSION,
      status: 'registry-hit',
      cacheHit: true,
      assetId: existing.assetId,
      registryEntry: existing,
      updatedRegistry: request.registry,
      pipeline: pipelineFor('registry-hit'),
    };
  }

  const plan = compileAssetIntent(requireManufacturingIntent(request));
  const status = existing || request.regenerate ? 'regenerated' : 'manufactured';
  const updatedRegistry = upsertRegisteredFoundryAsset(request.registry, plan.registryEntry);

  return {
    article: STUDIO_FOUNDRY_ARTICLE,
    foundryVersion: STUDIO_FOUNDRY_VERSION,
    status,
    cacheHit: false,
    assetId: plan.registryEntry.assetId,
    registryEntry: plan.registryEntry,
    updatedRegistry,
    manufacturingPlan: plan,
    pipeline: pipelineFor(status),
  };
}
