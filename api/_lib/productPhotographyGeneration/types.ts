import type { RunProductAssetFactoryResult } from '../productAssetFactory/pipeline.js';

export type ProductPhotographyGenerateAction = 'generate-variants' | 'replace-reference';

export type ProductPhotographyGenerateLogEntry = {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
};

export type PhotographyBiblePromptValidation = {
  promptLocked: true;
  promptHash: string;
  masterTemplateHash: string;
  photographyBibleVersion: string;
  creativeDnaVersion: string;
  variableInjectionSummary: string;
  variablesChanged: string[];
  variablesRemainingLocked: string[];
  compiledPromptLength: number;
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
