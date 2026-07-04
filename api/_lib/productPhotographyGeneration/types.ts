import type { RunProductAssetFactoryResult } from '../productAssetFactory/pipeline.js';

export type ProductPhotographyGenerateAction = 'generate-variants' | 'replace-reference';

export type ProductPhotographyGenerateLogEntry = {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
};

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

export type ProductPhotographyGenerateResult = {
  ok: boolean;
  action: ProductPhotographyGenerateAction;
  unitSlug: string;
  falModel: string;
  generatedMasterUrl?: string;
  storagePath?: string;
  productReferenceImageSrc?: string;
  displayBustSrc?: string;
  generation?: MasterHeroGenerationRecord;
  assetFactory?: RunProductAssetFactoryResult;
  logs: ProductPhotographyGenerateLogEntry[];
  error?: string;
};
