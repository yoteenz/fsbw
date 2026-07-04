/**
 * Brand Assets Product Asset Factory — client registry mirror of server pipeline.
 */

export type ProductAssetFactoryStage =
  | 'reference-ready'
  | 'generating-master-hero'
  | 'hero-generated'
  | 'awaiting-hero-approval'
  | 'hero-approved'
  | 'removing-background'
  | 'transparent-master-generated'
  | 'generating-smart-assets'
  | 'uploading-to-supabase'
  | 'registering-assets'
  | 'ready-for-review'
  | 'published'
  | 'failed';

export type ProductAssetFactoryAction =
  | 'generate-hero'
  | 'approve-hero'
  | 'run-derivatives'
  | 'regenerate-derivative'
  | 'retry';

export const PRODUCT_ASSET_FACTORY_STAGES: readonly ProductAssetFactoryStage[] = [
  'reference-ready',
  'generating-master-hero',
  'hero-generated',
  'awaiting-hero-approval',
  'hero-approved',
  'removing-background',
  'transparent-master-generated',
  'generating-smart-assets',
  'uploading-to-supabase',
  'registering-assets',
  'ready-for-review',
  'published',
] as const;

export const PRODUCT_ASSET_FACTORY_STAGE_LABELS: Record<ProductAssetFactoryStage, string> = {
  'reference-ready': 'Reference Ready',
  'generating-master-hero': 'Generating Master Hero',
  'hero-generated': 'Hero Generated',
  'awaiting-hero-approval': 'Awaiting Hero Approval',
  'hero-approved': 'Hero Approved',
  'removing-background': 'Removing Background',
  'transparent-master-generated': 'Transparent Master Generated',
  'generating-smart-assets': 'Generating Smart Assets',
  'uploading-to-supabase': 'Uploading To Supabase',
  'registering-assets': 'Registering Assets',
  'ready-for-review': 'Ready For Review',
  published: 'Published',
  failed: 'Failed',
};

/** Legacy stage labels for jobs persisted before Milestone 24.2. */
const LEGACY_STAGE_LABELS: Record<string, string> = {
  waiting: 'Reference Ready',
  'generating-transparent-master': 'Transparent Master Generated',
  'generating-derivatives': 'Generating Smart Assets',
};

export function productAssetFactoryStageLabel(stage: string): string {
  return (
    PRODUCT_ASSET_FACTORY_STAGE_LABELS[stage as ProductAssetFactoryStage] ??
    LEGACY_STAGE_LABELS[stage] ??
    stage
  );
}

export const PRODUCT_ASSET_FACTORY_POC_UNIT = {
  slug: 'soft-wave' as const,
  label: 'SOFT WAVE',
  collectionNumber: '003',
  productLine: 'signature-collection',
  version: 'v1',
  /** Website product image — reference input only, not the processing master. */
  productReferenceSrc: '/assets/2D WAVY FRONT.png',
} as const;

export const DERIVATIVE_BLOCKED_MESSAGE =
  'Generated Master Hero required before derivative processing.';

export type PhotographyBiblePromptValidation = {
  promptLocked: true;
  lockedTemplateHash: string;
  photographyBibleVersion: string;
  creativeDnaVersion: string;
  validatorStatus: 'passed' | 'failed';
  validatorMessage?: string;
  approvedPlaceholders: string[];
  variableInjectionSummary: string;
  injectedVariables: {
    unitName: string;
    collectionNumber: string;
    texture: string;
    length: string;
    density: string;
    lace: string;
  };
  lockedSectionsVerified: string[];
  finalPromptStatus: string;
  compiledPromptLength: number;
  lockedSectionViolation?: string;
};

export type MasterHeroGenerationDebugLog = {
  promptSent: string;
  falRequestId?: string;
  returnedImageUrl: string;
  imagePassedToBackgroundRemoval?: string;
  finalMasterHeroUrl: string;
};

export type PhotographyBibleProviderValidation = {
  presetId: string;
  presetName: string;
  provider: string;
  model: string;
  modelLabel: string;
  quality: string;
  qualityLabel: string;
  aspectRatio: string;
  resolution: string;
  promptVersion: string;
  creativeDnaVersion: string;
  benchmarkAsset: string;
  background: string;
  cropPhilosophy: string;
  status: 'ready' | 'blocked';
  blockedReason?: string;
  validationMessage: string;
};

export type MasterHeroGenerationPackage = {
  lockedCreativeDnaPromptTemplate: string;
  injectedProductVariables: PhotographyBiblePromptValidation['injectedVariables'];
  displayBustReferenceSrc: string;
  productReferenceImageSrc: string;
  editorialReferencePrompt: string;
  benchmarkAssetSrc: string;
  providerPreset: {
    id: string;
    name: string;
    model: string;
    modelLabel: string;
    qualityLabel: string;
    aspectRatio: string;
    resolutionLabel: string;
    status: 'approved' | 'experimental';
    publishable: boolean;
  };
  outputSettings: {
    aspectRatio: string;
    resolution: string;
    quality: string;
    outputFormat: string;
    background: string;
    cropPhilosophy: string;
  };
  finalPrompt: string;
  referenceAssetsUsed: string[];
  validation: {
    prompt: PhotographyBiblePromptValidation;
    provider: PhotographyBibleProviderValidation;
  };
};

export type MasterHeroGenerationRecord = {
  generationId: string;
  falRequestId?: string;
  falOriginalImageUrl: string;
  canonicalMasterHeroUrl: string;
  generatedAt: string;
  promptVersion: string;
  falModel: string;
  providerPresetId?: string;
  providerValidation?: PhotographyBibleProviderValidation;
  generationPackage?: MasterHeroGenerationPackage;
  productReferenceSrc: string;
  backgroundRemovalInputUrl?: string;
  promptValidation?: PhotographyBiblePromptValidation;
  debugLog: MasterHeroGenerationDebugLog;
};

const PLACEHOLDER_MARKERS = ['/assets/2D WAVY FRONT.png', '/assets/natural front.png'];

/** True when src is a local /assets placeholder — never valid as generated master hero. */
export function isLocalPlaceholderMasterSrc(src: string | undefined): boolean {
  if (!src?.trim()) return true;
  const t = src.trim();
  if (/^https?:\/\//i.test(t)) {
    if (t.includes('generated-master') || t.includes('supabase')) return false;
    try {
      const path = new URL(t).pathname;
      return path.startsWith('/assets/') && PLACEHOLDER_MARKERS.some((m) => path.includes(m));
    } catch {
      return false;
    }
  }
  return t.startsWith('/assets/') && !t.includes('generated-master');
}

/** Canonical generated master must be HTTPS (Supabase/Fal) — not a website placeholder. */
export function resolveCanonicalGeneratedMasterSrc(job: {
  generatedMasterHeroUrl?: string;
  masterHeroGeneration?: MasterHeroGenerationRecord;
} | undefined): string | undefined {
  const fromGeneration = job?.masterHeroGeneration?.canonicalMasterHeroUrl;
  const fromJob = job?.generatedMasterHeroUrl;
  const candidate = fromGeneration ?? fromJob;
  if (!candidate || isLocalPlaceholderMasterSrc(candidate)) return undefined;
  if (!/^https?:\/\//i.test(candidate)) return undefined;
  return candidate;
}

export type ProductAssetRegistryRecord = {
  id: string;
  product: string;
  productSlug: string;
  collectionNumber: string;
  version: string;
  assetType: string;
  cropTemplateId: string;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  transparency: boolean;
  supabaseUrl: string;
  storagePath: string;
  createdDate: string;
  lastUpdated: string;
  status: 'ready-for-review' | 'approved' | 'published' | 'failed';
};

export type ProductAssetFactoryJobRecord = {
  id: string;
  unitSlug: string;
  productLabel: string;
  collectionNumber: string;
  version: string;
  stage: ProductAssetFactoryStage | string;
  failedStage?: ProductAssetFactoryStage | string;
  error?: string;
  productReferenceUrl?: string;
  generatedMasterHeroUrl?: string;
  masterHeroGeneration?: MasterHeroGenerationRecord;
  heroApproved?: boolean;
  masterHeroUrl: string;
  transparentMasterUrl?: string;
  derivativeCount: number;
  registryEntryIds: string[];
  startedAt: string;
  lastUpdated: string;
};

export type ProductAssetFactoryLogRecord = {
  id: string;
  timestamp: string;
  stage: ProductAssetFactoryStage | string;
  message: string;
  level: 'info' | 'warn' | 'error';
};

/** Supabase folder example for docs/UI. */
export function productAssetSupabasePath(unitSlug: string, version: string, fileName: string): string {
  return `products/signature-collection/${unitSlug}/${version}/${fileName}`;
}
