import type { RunProductAssetFactoryResult } from '../productAssetFactory/pipeline.js';

export type ProductPhotographyGenerateAction = 'generate-variants' | 'replace-reference';

export type ProductPhotographyGenerateLogEntry = {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
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
  assetFactory?: RunProductAssetFactoryResult;
  logs: ProductPhotographyGenerateLogEntry[];
  error?: string;
};
