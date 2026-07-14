import experienceLabV2ViewportEnvironmentUrl from '../../../assets/studio-world/experience-lab/experience-lab-v2-viewport-environment.png';
import experienceLabV2ViewportEnvironmentDesktopUrl from '../../../assets/studio-world/experience-lab/experience-lab-v2-viewport-environment-desktop.png';

/** Canonical render-direction variant IDs — exactly six (3 light + 3 dark). */
export const DESIGN_VARIANT_IDS = [
  'light-01',
  'light-02',
  'light-03',
  'dark-01',
  'dark-02',
  'dark-03',
] as const;

export type DesignVariantId = (typeof DESIGN_VARIANT_IDS)[number];

export type DesignVariantTheme = 'light' | 'dark';

export type DesignVariantGenerationStage = 'preview' | 'production';

export type DesignVariantCanonicalStatus =
  | 'draft'
  | 'preview'
  | 'approved'
  | 'rejected'
  | 'archived'
  | 'canonical'
  | 'favorite';

export type DesignVariantCardStatus =
  | 'active'
  | 'archived'
  | 'generating'
  | 'failed'
  | 'approved'
  | 'canonical';

export type DesignVariantReadiness = {
  asset: boolean;
  blueprint: boolean;
  construction: boolean;
  lighting: boolean;
};

export type DesignVariantRecord = {
  id: DesignVariantId;
  name: string;
  theme: DesignVariantTheme;
  /** Canonical production object — every variant owns exactly one package. */
  environmentPackageId: string;
  generationStage: DesignVariantGenerationStage;
  /** Stage 1 lightweight preview environment (viewport swap). */
  previewEnvironmentUrl: string;
  /** Stage 2 production render — null until founder promotes one variant. */
  productionEnvironmentUrl: string | null;
  thumbnailUrl: string;
  promptRevision: number;
  promptHash: string;
  generationProvider: string;
  seed: string;
  estimatedCostUsd: number;
  generatedAt: string;
  canonicalStatus: DesignVariantCanonicalStatus;
  cardStatus: DesignVariantCardStatus;
  readiness: DesignVariantReadiness;
  /** Design vault — retained when another variant becomes canonical. */
  vaultStatus: 'active' | 'archived' | 'marketplace-ready';
  compareGroup: DesignVariantTheme;
};

export const DESIGN_VARIANTS_SECTION_LABEL = 'DESIGN VARIANTS';

export const DESIGN_VARIANT_QUERY_KEY = 'variant';

export const DESIGN_VARIANT_STORAGE_KEY = 'experience_lab_v2_design_variants_v1';

/** Future compare mode — architecture only (not implemented). */
export type DesignVariantCompareMode = 'split' | 'overlay' | 'slider';

export type DesignVariantCompareRequest = {
  leftId: DesignVariantId;
  rightId: DesignVariantId;
  mode: DesignVariantCompareMode;
};

export const DESIGN_VARIANT_COMPARE_RESERVED = true;

import {
  migrateDesignVariantsWithPackageIds,
} from './experience-lab-design-variant-package-migration';

const LIGHT_PREVIEW = experienceLabV2ViewportEnvironmentUrl;
const DARK_PREVIEW = experienceLabV2ViewportEnvironmentDesktopUrl;

const RAW_EXPERIENCE_LAB_DESIGN_VARIANTS: Omit<DesignVariantRecord, 'environmentPackageId'>[] = [
  {
    id: 'light-01',
    name: 'Light 01',
    theme: 'light',
    generationStage: 'preview',
    previewEnvironmentUrl: LIGHT_PREVIEW,
    productionEnvironmentUrl: null,
    thumbnailUrl: LIGHT_PREVIEW,
    promptRevision: 1,
    promptHash: 'elab-light-01-v1',
    generationProvider: 'preview-cache',
    seed: '42811',
    estimatedCostUsd: 0.12,
    generatedAt: '2026-07-14T10:00:00.000Z',
    canonicalStatus: 'approved',
    cardStatus: 'active',
    readiness: { asset: true, blueprint: false, construction: false, lighting: false },
    vaultStatus: 'active',
    compareGroup: 'light',
  },
  {
    id: 'light-02',
    name: 'Light 02',
    theme: 'light',
    generationStage: 'preview',
    previewEnvironmentUrl: LIGHT_PREVIEW,
    productionEnvironmentUrl: null,
    thumbnailUrl: LIGHT_PREVIEW,
    promptRevision: 1,
    promptHash: 'elab-light-02-v1',
    generationProvider: 'preview-cache',
    seed: '42812',
    estimatedCostUsd: 0.12,
    generatedAt: '2026-07-14T10:05:00.000Z',
    canonicalStatus: 'preview',
    cardStatus: 'approved',
    readiness: { asset: true, blueprint: false, construction: false, lighting: false },
    vaultStatus: 'archived',
    compareGroup: 'light',
  },
  {
    id: 'light-03',
    name: 'Light 03',
    theme: 'light',
    generationStage: 'preview',
    previewEnvironmentUrl: LIGHT_PREVIEW,
    productionEnvironmentUrl: null,
    thumbnailUrl: LIGHT_PREVIEW,
    promptRevision: 1,
    promptHash: 'elab-light-03-v1',
    generationProvider: 'preview-cache',
    seed: '42813',
    estimatedCostUsd: 0.12,
    generatedAt: '2026-07-14T10:10:00.000Z',
    canonicalStatus: 'preview',
    cardStatus: 'archived',
    readiness: { asset: true, blueprint: false, construction: false, lighting: false },
    vaultStatus: 'archived',
    compareGroup: 'light',
  },
  {
    id: 'dark-01',
    name: 'Dark 01',
    theme: 'dark',
    generationStage: 'preview',
    previewEnvironmentUrl: DARK_PREVIEW,
    productionEnvironmentUrl: null,
    thumbnailUrl: DARK_PREVIEW,
    promptRevision: 1,
    promptHash: 'elab-dark-01-v1',
    generationProvider: 'preview-cache',
    seed: '51801',
    estimatedCostUsd: 0.14,
    generatedAt: '2026-07-14T10:15:00.000Z',
    canonicalStatus: 'preview',
    cardStatus: 'archived',
    readiness: { asset: true, blueprint: false, construction: false, lighting: false },
    vaultStatus: 'archived',
    compareGroup: 'dark',
  },
  {
    id: 'dark-02',
    name: 'Dark 02',
    theme: 'dark',
    generationStage: 'preview',
    previewEnvironmentUrl: DARK_PREVIEW,
    productionEnvironmentUrl: null,
    thumbnailUrl: DARK_PREVIEW,
    promptRevision: 1,
    promptHash: 'elab-dark-02-v1',
    generationProvider: 'preview-cache',
    seed: '51802',
    estimatedCostUsd: 0.14,
    generatedAt: '2026-07-14T10:20:00.000Z',
    canonicalStatus: 'archived',
    cardStatus: 'archived',
    readiness: { asset: true, blueprint: false, construction: false, lighting: false },
    vaultStatus: 'archived',
    compareGroup: 'dark',
  },
  {
    id: 'dark-03',
    name: 'Dark 03',
    theme: 'dark',
    generationStage: 'preview',
    previewEnvironmentUrl: DARK_PREVIEW,
    productionEnvironmentUrl: null,
    thumbnailUrl: DARK_PREVIEW,
    promptRevision: 1,
    promptHash: 'elab-dark-03-v1',
    generationProvider: 'preview-cache',
    seed: '51803',
    estimatedCostUsd: 0.14,
    generatedAt: '2026-07-14T10:25:00.000Z',
    canonicalStatus: 'archived',
    cardStatus: 'generating',
    readiness: { asset: false, blueprint: false, construction: false, lighting: false },
    vaultStatus: 'archived',
    compareGroup: 'dark',
  },
];

/** Stage 1 seed — lightweight preview concepts; auto-migrated with environmentPackageId. */
export const EXPERIENCE_LAB_DESIGN_VARIANTS: DesignVariantRecord[] =
  migrateDesignVariantsWithPackageIds(RAW_EXPERIENCE_LAB_DESIGN_VARIANTS);

export const DEFAULT_ACTIVE_DESIGN_VARIANT_ID: DesignVariantId = 'light-01';

export function isDesignVariantId(value: string | null | undefined): value is DesignVariantId {
  return Boolean(value && DESIGN_VARIANT_IDS.includes(value as DesignVariantId));
}

export function parseDesignVariantFromQuery(search: string): DesignVariantId | null {
  const raw = new URLSearchParams(search).get(DESIGN_VARIANT_QUERY_KEY);
  return isDesignVariantId(raw) ? raw : null;
}

export function designVariantToQuery(id: DesignVariantId): string {
  return id;
}

export function resolveDesignVariantById(id: DesignVariantId): DesignVariantRecord {
  const found = EXPERIENCE_LAB_DESIGN_VARIANTS.find((v) => v.id === id);
  if (!found) return EXPERIENCE_LAB_DESIGN_VARIANTS[0];
  return found;
}

export function resolveVariantEnvironmentUrl(variant: DesignVariantRecord): string {
  return variant.productionEnvironmentUrl ?? variant.previewEnvironmentUrl;
}

export function resolveVariantCardBadge(variant: DesignVariantRecord, isActive: boolean): string | null {
  if (isActive) return 'ACTIVE';
  if (variant.cardStatus === 'generating') return 'GENERATING';
  if (variant.cardStatus === 'failed') return 'FAILED';
  if (variant.canonicalStatus === 'canonical') return 'CANONICAL';
  if (variant.cardStatus === 'approved' || variant.canonicalStatus === 'approved') return 'APPROVED';
  if (variant.vaultStatus === 'archived' || variant.cardStatus === 'archived') return 'ARCHIVED';
  return null;
}

/** Cost protection — never regenerate identical prompt+seed pairs. */
export function designVariantCacheKey(variant: DesignVariantRecord): string {
  return `${variant.promptHash}:${variant.seed}:${variant.generationStage}`;
}
