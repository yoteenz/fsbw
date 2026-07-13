import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { AssetDnaRecord } from './asset-dna';
import type { StudioWorldMaterialId } from '../studio-world-architecture-v2/material-library';

export const RENDER_INTENT_VERSION = 'render-intent.v1';

export type GenerationMode = 'architecture-shell' | 'isolated-asset' | 'lighting-pass' | 'atmosphere' | 'interaction' | 'material-overlay';

export type OutputType = 'environment-png' | 'transparent-png' | 'lighting-overlay' | 'atmosphere-overlay';

export type RenderIntent = {
  intentVersion: typeof RENDER_INTENT_VERSION;
  intentId: string;
  assetId: string;
  assetRevision: string;
  purpose: string;
  generationMode: GenerationMode;
  outputType: OutputType;
  isolation: true;
  transparency: 'opaque' | 'alpha' | 'glass';
  camera: string | null;
  perspective: 'orthographic' | 'perspective' | 'inspection';
  lens: string;
  lighting: string;
  materialLibraryId: string;
  materialLibraryVersion: string;
  materialIds: StudioWorldMaterialId[];
  referenceAssets: string[];
  expectedScale: string;
  expectedGeometry: string;
  expectedSilhouette: string;
  expectedReflection: number;
  expectedTransparency: 'opaque' | 'alpha' | 'glass';
  expectedDimensions: { width: number; height: number; depth: number };
  textureLibrary: string;
  organizationAssets: string[];
  negativeRules: string[];
  qualityThreshold: number;
  validationThreshold: number;
  repairThreshold: number;
  forbiddenArchitecture: true;
  forbiddenFurniture: boolean;
  forbiddenPeople: true;
  background: 'transparent' | 'studio-white' | 'environment';
};

export function buildRenderIntentFromDna(input: {
  plan: ConstructionPlan;
  dna: AssetDnaRecord;
  jobId: string;
}): RenderIntent {
  const { plan, dna } = input;
  const isArchitecture = dna.assetFamily === 'architecture';
  const isHero = dna.assetFamily === 'hero';
  const isLighting = dna.assetFamily === 'lighting';

  const generationMode: GenerationMode = isArchitecture
    ? 'architecture-shell'
    : isLighting
      ? 'lighting-pass'
      : 'isolated-asset';

  const outputType: OutputType = isArchitecture
    ? 'environment-png'
    : isLighting
      ? 'lighting-overlay'
      : 'transparent-png';

  const cameraAnchor = isHero
    ? plan.cameraAnchors.find((a) => a.purpose === 'inspection' || a.purpose === 'hero')
    : plan.cameraAnchors.find((a) => a.purpose === 'overview');

  return {
    intentVersion: RENDER_INTENT_VERSION,
    intentId: `intent-${input.jobId}`,
    assetId: dna.assetId,
    assetRevision: dna.assetRevision,
    purpose: isArchitecture
      ? `Immutable shell ${dna.assetId}`
      : isHero
        ? `Hero ${dna.assetCategory}`
        : `${dna.assetFamily} ${dna.assetCategory}`,
    generationMode,
    outputType,
    isolation: true,
    transparency: dna.visualDna.transparency,
    camera: cameraAnchor?.anchorId ?? null,
    perspective: isHero ? 'orthographic' : 'perspective',
    lens: isHero ? '50mm-product' : '35mm-environment',
    lighting: isHero ? 'asset-studio-white' : plan.lightingProfile.profileId,
    materialLibraryId: plan.materialSet.materialSetId,
    materialLibraryVersion: plan.materialSet.version,
    materialIds: dna.materialIds,
    referenceAssets: dna.materialIds.map((m) => `org-asset:${m}`),
    expectedScale: dna.visualDna.scale,
    expectedGeometry: dna.visualDna.silhouette,
    expectedSilhouette: dna.visualDna.silhouette,
    expectedReflection: dna.visualDna.reflection,
    expectedTransparency: dna.visualDna.transparency,
    expectedDimensions: dna.physical.boundingVolume,
    textureLibrary: plan.materialSet.materialSetId,
    organizationAssets: dna.materialIds,
    negativeRules: [
      ...dna.negativeDna.forbiddenMaterials.map((m) => `no-${m}`),
      ...dna.negativeDna.forbiddenGenerations.map((g) => `no-${g}`),
      ...plan.negativeRules,
    ],
    qualityThreshold: 0.85,
    validationThreshold: 0.75,
    repairThreshold: 0.6,
    forbiddenArchitecture: true,
    forbiddenFurniture: isHero,
    forbiddenPeople: true,
    background: isArchitecture ? 'environment' : 'transparent',
  };
}

export function buildRenderIntentsForPlan(input: {
  plan: ConstructionPlan;
  dnaRecords: AssetDnaRecord[];
  jobIds: Record<string, string>;
}): RenderIntent[] {
  return input.dnaRecords.map((dna) =>
    buildRenderIntentFromDna({
      plan: input.plan,
      dna,
      jobId: input.jobIds[dna.assetId] ?? `job-${dna.assetId}`,
    })
  );
}

/** Generation receives manufacturing instructions — not free-form prompts */
export function assertNoPromptInRenderIntent(intent: RenderIntent): { ok: true } | { ok: false; code: string } {
  const keys = Object.keys(intent);
  if (keys.some((k) => k.toLowerCase().includes('prompt') && k !== 'intentVersion')) {
    return { ok: false, code: 'PROMPT_FIELD_FORBIDDEN' };
  }
  return { ok: true };
}
