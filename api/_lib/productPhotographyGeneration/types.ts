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

export type MasterHeroGenerationRecord = {
  generationId: string;
  falRequestId?: string;
  falOriginalImageUrl: string;
  canonicalMasterHeroUrl: string;
  generatedAt: string;
  promptVersion: string;
  falModel: string;
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
