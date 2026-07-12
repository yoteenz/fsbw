import type { ModelAssetClass } from '../creative-production/model-registry/types';
import { resolveModelRoute } from '../creative-production/model-registry/resolve-model-route';
import type { RoomOperationalSubsystem } from './contract';
import type { WorldAssetTier } from './asset-hierarchy';
import type { GenerationPhase } from './contract';

export const MODEL_ROUTING_V2_VERSION = 'model-routing-v2.v1';

/** One model — one responsibility */
export const MODEL_ROUTING_V2_MATRIX: Array<{
  hierarchyLevel: string;
  phase: GenerationPhase | 'validation' | 'assembly' | 'repair';
  assetClass: ModelAssetClass | 'world-compiler' | 'quality-guard' | 'immune-system';
  responsibility: string;
}> = [
  {
    hierarchyLevel: 'architecture',
    phase: 'world-blueprint',
    assetClass: 'environment-shell',
    responsibility: 'Environment model — BlueprintShell only',
  },
  {
    hierarchyLevel: 'room-blueprint',
    phase: 'room-blueprint',
    assetClass: 'world-compiler',
    responsibility: 'World Compiler intelligence — no image generation',
  },
  {
    hierarchyLevel: 'hero-assets',
    phase: 'signature-asset-generation',
    assetClass: 'signature-landmark',
    responsibility: 'Asset model — hero objects only',
  },
  {
    hierarchyLevel: 'furniture',
    phase: 'furniture-generation',
    assetClass: 'furniture-objects',
    responsibility: 'Asset model — furniture group',
  },
  {
    hierarchyLevel: 'decor',
    phase: 'decoration-generation',
    assetClass: 'decorative-object',
    responsibility: 'Fast asset model — disposable decor',
  },
  {
    hierarchyLevel: 'materials',
    phase: 'material-application',
    assetClass: 'material-overlay',
    responsibility: 'Material library application — no AI textures',
  },
  {
    hierarchyLevel: 'lighting',
    phase: 'lighting-pass',
    assetClass: 'reflection-overlay',
    responsibility: 'Lighting system — independent pass',
  },
  {
    hierarchyLevel: 'assembly',
    phase: 'scene-assembly',
    assetClass: 'world-compiler',
    responsibility: 'Scene Stack assembly — mount only',
  },
  {
    hierarchyLevel: 'validation',
    phase: 'room-validation',
    assetClass: 'quality-guard',
    responsibility: 'Quality Guard — per-subsystem validation',
  },
  {
    hierarchyLevel: 'repair',
    phase: 'immune-check',
    assetClass: 'immune-system',
    responsibility: 'Immune System — localized recovery only',
  },
];

export function resolveModelForSubsystem(input: {
  subsystem: RoomOperationalSubsystem;
  organizationId: string;
  brandGroundingRequired?: boolean;
}): ReturnType<typeof resolveModelRoute> | null {
  const map: Partial<Record<RoomOperationalSubsystem, ModelAssetClass>> = {
    architecture: 'environment-shell',
    'hero-assets': 'signature-landmark',
    furniture: 'furniture-objects',
    decor: 'decorative-object',
    materials: 'material-overlay',
    lighting: 'reflection-overlay',
    effects: 'atmosphere-overlay',
  };
  const assetClass = map[input.subsystem];
  if (!assetClass) return null;
  return resolveModelRoute({
    organizationId: input.organizationId,
    assetClass,
    brandGroundingRequired: input.brandGroundingRequired,
    surface: 'scene-stack',
  });
}

export function resolveModelForAssetTier(input: {
  tier: WorldAssetTier;
  organizationId: string;
  brandGroundingRequired?: boolean;
}): ReturnType<typeof resolveModelRoute> {
  const assetClass: ModelAssetClass =
    input.tier === 'hero'
      ? 'signature-landmark'
      : input.tier === 'furniture'
        ? 'furniture-objects'
        : 'decorative-object';
  return resolveModelRoute({
    organizationId: input.organizationId,
    assetClass,
    brandGroundingRequired: input.brandGroundingRequired,
    surface: 'scene-stack',
  });
}
