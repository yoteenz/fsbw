/**
 * EnvironmentAssetPackage — canonical Studio World production object.
 * Every Design Variant owns exactly ONE package.
 */

import type { CanonicalMainDepartmentId } from '../canonical-studio-world/canonical-department-registry';
import type {
  EnvironmentPackageOutputRegistry,
  EnvironmentPackageOutputKey,
} from './EnvironmentPackageOutputs';
import { buildEmptyOutputRegistry, setOutputCached } from './EnvironmentPackageOutputs';

export const ENVIRONMENT_PACKAGE_SCHEMA_VERSION = 'studio.environment-package.v2' as const;

export const ENVIRONMENT_VARIANT_IDS = [
  'light-01',
  'light-02',
  'light-03',
  'dark-01',
  'dark-02',
  'dark-03',
] as const;

export type EnvironmentVariantId = (typeof ENVIRONMENT_VARIANT_IDS)[number];
export type EnvironmentVariantTheme = 'light' | 'dark';

export type EnvironmentPackageStatus =
  | 'generating'
  | 'review'
  | 'approved'
  | 'canonical'
  | 'archived'
  | 'deprecated'
  | 'superseded'
  | 'marketplace-ready'
  | 'production-ready'
  | 'failed';

export type EnvironmentGenerationStage = 'concept-preview' | 'production-package';

export type EnvironmentPackageRevisionEntry = {
  revision: number;
  status: EnvironmentPackageStatus;
  changedAt: string;
  reason: string;
};

/** One package per design variant — the variant is the head of the package. */
export type EnvironmentAssetPackage = {
  schemaVersion: typeof ENVIRONMENT_PACKAGE_SCHEMA_VERSION;
  packageId: string;
  departmentId: CanonicalMainDepartmentId;
  environmentId: string;
  variantId: EnvironmentVariantId;
  variantName: string;
  theme: EnvironmentVariantTheme;
  revision: number;
  canonical: boolean;
  status: EnvironmentPackageStatus;
  stage: EnvironmentGenerationStage;
  provider: string;
  model: string;
  seed: string;
  promptVersion: string;
  promptHash: string;
  departmentBibleVersion: string;
  estimatedCostUsd: number;
  actualCostUsd: number | null;
  generationDurationMs: number | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  archivedAt: string | null;
  founderNotes: string | null;
  outputs: EnvironmentPackageOutputRegistry;
  revisionHistory: EnvironmentPackageRevisionEntry[];
  cacheKey: string;
  marketplaceReady: boolean;
};

export type BuildVariantPackageInput = {
  departmentId: CanonicalMainDepartmentId;
  environmentId: string;
  variantId: EnvironmentVariantId;
  variantName: string;
  theme: EnvironmentVariantTheme;
  revision?: number;
  promptHash: string;
  promptVersion: string;
  seed: string;
  provider?: string;
  model?: string;
  status?: EnvironmentPackageStatus;
  stage?: EnvironmentGenerationStage;
  canonical?: boolean;
  departmentBibleVersion?: string;
  estimatedCostUsd?: number;
  previewUrl?: string | null;
  desktopPreviewUrl?: string | null;
};

export function buildVariantPackageId(input: {
  departmentId: string;
  environmentId: string;
  variantId: string;
  revision: number;
}): string {
  return `envpkg.${input.departmentId}.${input.environmentId}.${input.variantId}.r${input.revision}`;
}

export function buildVariantEnvironmentPackage(input: BuildVariantPackageInput): EnvironmentAssetPackage {
  const revision = input.revision ?? 1;
  const now = new Date().toISOString();
  const packageId = buildVariantPackageId({
    departmentId: input.departmentId,
    environmentId: input.environmentId,
    variantId: input.variantId,
    revision,
  });

  const bibleVersion = input.departmentBibleVersion ?? 'bible-v1';
  const cacheKey = [
    input.departmentId,
    input.environmentId,
    input.variantId,
    `r${revision}`,
    input.promptHash,
    input.seed,
    input.provider ?? 'preview-cache',
    bibleVersion,
  ].join(':');

  let outputs = buildEmptyOutputRegistry(input.stage !== 'production-package');
  if (input.previewUrl) {
    outputs = setOutputCached(outputs, 'mobile', input.previewUrl);
    outputs = setOutputCached(outputs, 'squareThumbnail', input.previewUrl);
    outputs = setOutputCached(outputs, 'metadata', input.previewUrl);
  }
  if (input.desktopPreviewUrl) {
    outputs = setOutputCached(outputs, 'desktop', input.desktopPreviewUrl);
  } else if (input.theme === 'dark' && input.previewUrl) {
    outputs = setOutputCached(outputs, 'desktop', input.previewUrl);
  }

  return {
    schemaVersion: ENVIRONMENT_PACKAGE_SCHEMA_VERSION,
    packageId,
    departmentId: input.departmentId,
    environmentId: input.environmentId,
    variantId: input.variantId,
    variantName: input.variantName,
    theme: input.theme,
    revision,
    canonical: input.canonical ?? false,
    status: input.status ?? 'review',
    stage: input.stage ?? 'concept-preview',
    provider: input.provider ?? 'preview-cache',
    model: input.model ?? 'stage-1-preview',
    seed: input.seed,
    promptVersion: input.promptVersion,
    promptHash: input.promptHash,
    departmentBibleVersion: bibleVersion,
    estimatedCostUsd: input.estimatedCostUsd ?? (input.theme === 'light' ? 0.12 : 0.14),
    actualCostUsd: null,
    generationDurationMs: null,
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
    approvedBy: null,
    archivedAt: null,
    founderNotes: null,
    outputs,
    revisionHistory: [
      {
        revision,
        status: input.status ?? 'review',
        changedAt: now,
        reason: 'variant-package-created',
      },
    ],
    cacheKey,
    marketplaceReady: false,
  };
}

export type EnvironmentPackageCacheLookup = {
  departmentId: CanonicalMainDepartmentId;
  environmentId: string;
  variantId: EnvironmentVariantId;
  revision: number;
  promptHash: string;
  seed: string;
  provider: string;
  departmentBibleVersion: string;
};

export type EnvironmentPackageRegenerationRequest = {
  reason:
    | 'founder-request'
    | 'prompt-changed'
    | 'department-bible-changed'
    | 'revision-increment'
    | 'canonical-environment-changed'
    | 'provider-changed'
    | 'seed-changed';
  force: boolean;
};

export type EnvironmentPackageConsumerRef = {
  packageId: string;
  outputKey?: EnvironmentPackageOutputKey;
};

export type EnvironmentPackageDrawerModel = {
  packageId: string;
  environmentName: string;
  variantName: string;
  variantId: EnvironmentVariantId;
  packageStatus: EnvironmentPackageStatus;
  revision: number;
  desktopPreviewUrl: string | null;
  mobilePreviewUrl: string | null;
  tabletPreviewUrl: string | null;
  outputsGenerated: number;
  outputsPending: number;
  assetCount: number;
  generationCostUsd: number;
  provider: string;
  seed: string;
  promptVersion: string;
  blueprintReady: boolean;
  constructionReady: boolean;
  lightingReady: boolean;
  materialReady: boolean;
  marketplaceReady: boolean;
  overallHealthPercent: number;
};
