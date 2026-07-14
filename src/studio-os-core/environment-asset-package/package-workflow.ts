import type {
  EnvironmentAssetPackage,
  EnvironmentGenerationStage,
  EnvironmentPackageStatus,
  EnvironmentVariantId,
  EnvironmentVariantRecord,
} from './types';
import { buildPendingOutputs } from './output-formats';
import { buildEnvironmentPackageCacheKey } from './cache-policy';

const VARIANT_DEFS: Array<{
  id: EnvironmentVariantId;
  name: string;
  theme: 'light' | 'dark';
  seed: string;
  promptHash: string;
}> = [
  { id: 'light-01', name: 'Light 01', theme: 'light', seed: '42811', promptHash: 'elab-light-01-v1' },
  { id: 'light-02', name: 'Light 02', theme: 'light', seed: '42812', promptHash: 'elab-light-02-v1' },
  { id: 'light-03', name: 'Light 03', theme: 'light', seed: '42813', promptHash: 'elab-light-03-v1' },
  { id: 'dark-01', name: 'Dark 01', theme: 'dark', seed: '51801', promptHash: 'elab-dark-01-v1' },
  { id: 'dark-02', name: 'Dark 02', theme: 'dark', seed: '51802', promptHash: 'elab-dark-02-v1' },
  { id: 'dark-03', name: 'Dark 03', theme: 'dark', seed: '51803', promptHash: 'elab-dark-03-v1' },
];

function buildProductionAssets(stage: EnvironmentGenerationStage) {
  const pending = stage === 'concept-preview';
  return [
    { kind: 'blueprint' as const, status: pending ? ('pending' as const) : ('ready' as const), revision: 1, url: null, summary: null },
    { kind: 'construction-plan' as const, status: 'pending' as const, revision: 1, url: null, summary: null },
    { kind: 'lighting-profile' as const, status: 'pending' as const, revision: 1, url: null, summary: null },
    { kind: 'materials-profile' as const, status: 'pending' as const, revision: 1, url: null, summary: null },
    { kind: 'asset-manifest' as const, status: pending ? ('pending' as const) : ('ready' as const), revision: 1, url: null, summary: null },
    { kind: 'prompt-archive' as const, status: 'ready' as const, revision: 1, url: null, summary: 'Prompt archived at package creation' },
    { kind: 'seed-archive' as const, status: 'ready' as const, revision: 1, url: null, summary: 'Seed archived at package creation' },
    { kind: 'revision-history' as const, status: 'ready' as const, revision: 1, url: null, summary: 'Revision history initialized' },
  ];
}

export function buildConceptPreviewVariants(
  previewUrls: Partial<Record<EnvironmentVariantId, string>>
): EnvironmentVariantRecord[] {
  return VARIANT_DEFS.map((def, index) => ({
    id: def.id,
    name: def.name,
    theme: def.theme,
    stage: 'concept-preview',
    architecturalSummary: `${def.name} architectural direction for department environment`,
    promptHash: def.promptHash,
    promptRevision: 1,
    seed: def.seed,
    provider: 'preview-cache',
    model: 'stage-1-preview',
    estimatedCostUsd: def.theme === 'light' ? 0.12 : 0.14,
    generatedAt: '2026-07-14T10:00:00.000Z',
    approvalStatus: index === 0 ? 'approved' : index === 5 ? 'generating' : 'review',
    vaultStatus: index === 0 ? 'active' : 'archived',
    outputs: buildPendingOutputs(true).map((output) => {
      const url = previewUrls[def.id] ?? null;
      if (!url) return output;
      if (output.formatId === 'mobile-9-16' || output.formatId === 'thumbnail-square' || output.formatId === 'preview-card') {
        return { ...output, status: 'cached' as const, url, lazy: false };
      }
      if (output.formatId === 'desktop-21-9' && def.theme === 'dark') {
        return { ...output, status: 'cached' as const, url, lazy: false };
      }
      return output;
    }),
    productionAssets: buildProductionAssets('concept-preview'),
  }));
}

export type BuildEnvironmentPackageInput = {
  packageId: string;
  environmentId: string;
  departmentId: 'experience-lab';
  displayName: string;
  revision: number;
  prompt: string;
  promptVersion: string;
  provider: string;
  model: string;
  seed: string;
  status: EnvironmentPackageStatus;
  stage: EnvironmentGenerationStage;
  promotedVariantId: EnvironmentVariantId | null;
  previewUrls: Partial<Record<EnvironmentVariantId, string>>;
};

export function buildEnvironmentAssetPackage(input: BuildEnvironmentPackageInput): EnvironmentAssetPackage {
  const cacheKey = buildEnvironmentPackageCacheKey({
    departmentId: input.departmentId,
    environmentId: input.environmentId,
    revision: input.revision,
    promptHash: input.promptVersion,
    seed: input.seed,
    provider: input.provider,
  });

  return {
    schemaVersion: 'studio.environment-package.v1',
    packageId: input.packageId,
    status: input.status,
    stage: input.stage,
    metadata: {
      environmentId: input.environmentId,
      departmentId: input.departmentId,
      displayName: input.displayName,
      revision: input.revision,
      prompt: input.prompt,
      promptVersion: input.promptVersion,
      provider: input.provider,
      model: input.model,
      seed: input.seed,
      costUsd: 0.82,
      generationTimeMs: null,
      approvalDate: input.promotedVariantId ? '2026-07-14T12:00:00.000Z' : null,
      founderNotes: null,
      variantNotes: {},
      materialSetId: null,
      lightingProfileId: null,
      constructionProfileId: null,
      blueprintProfileId: null,
    },
    variants: buildConceptPreviewVariants(input.previewUrls),
    promotedVariantId: input.promotedVariantId,
    revisionHistory: [
      {
        revision: input.revision,
        promotedVariantId: input.promotedVariantId,
        status: input.status,
        changedAt: '2026-07-14T10:00:00.000Z',
        reason: 'concept-preview-seed',
      },
    ],
    cacheKey,
    marketplaceReady: false,
  };
}
