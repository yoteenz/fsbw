/**
 * Client mirror — locked Fal provider preset for Photography Bible Master Hero v1.
 */

import { CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT } from './CreativeDnaEditorialPrompt';
import { CREATIVE_DNA_VERSION } from './CreativeDnaRegistry';
import {
  PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE,
  PHOTOGRAPHY_BIBLE_PROMPT_VERSION,
  type PhotographyBiblePromptValidation,
  type PhotographyBibleUnitVariables,
} from './promptCompiler';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_ID = 'photography-bible-master-hero-v1' as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_NAME = 'Photography Bible Master Hero v1';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL = 'openai/gpt-image-2/edit' as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_MODEL_LABEL = 'GPT Image 2';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY = 'high' as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY_LABEL = '2K HIGH';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_ASPECT_RATIO = '1:1' as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_RESOLUTION_LABEL = '4096×4096';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_BACKGROUND = 'Pure white seamless studio';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_CROP_PHILOSOPHY =
  'Center-weighted 1:1 editorial crop — hair continues beyond bottom edge';

export const PHOTOGRAPHY_BIBLE_BANNED_FAL_MODELS = [
  'fal-ai/nano-banana-pro/edit',
  'fal-ai/nano-banana-pro',
  'fal-ai/nano-banana',
] as const;

export type PhotographyBibleProviderPresetStatus = 'approved' | 'experimental';

export type PhotographyBibleProviderPreset = {
  id: typeof PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_ID;
  name: string;
  provider: 'fal';
  model: typeof PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL;
  modelLabel: string;
  quality: typeof PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY;
  qualityLabel: string;
  aspectRatio: typeof PHOTOGRAPHY_BIBLE_MASTER_HERO_ASPECT_RATIO;
  resolutionLabel: string;
  outputFormat: 'png';
  background: string;
  mode: 'edit';
  promptVersion: typeof PHOTOGRAPHY_BIBLE_PROMPT_VERSION;
  creativeDnaVersion: typeof CREATIVE_DNA_VERSION;
  status: PhotographyBibleProviderPresetStatus;
  publishable: boolean;
};

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET: PhotographyBibleProviderPreset = {
  id: PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_ID,
  name: PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_NAME,
  provider: 'fal',
  model: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
  modelLabel: PHOTOGRAPHY_BIBLE_MASTER_HERO_MODEL_LABEL,
  quality: PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY,
  qualityLabel: PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY_LABEL,
  aspectRatio: PHOTOGRAPHY_BIBLE_MASTER_HERO_ASPECT_RATIO,
  resolutionLabel: PHOTOGRAPHY_BIBLE_MASTER_HERO_RESOLUTION_LABEL,
  outputFormat: 'png',
  background: PHOTOGRAPHY_BIBLE_MASTER_HERO_BACKGROUND,
  mode: 'edit',
  promptVersion: PHOTOGRAPHY_BIBLE_PROMPT_VERSION,
  creativeDnaVersion: CREATIVE_DNA_VERSION,
  status: 'approved',
  publishable: true,
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
  injectedProductVariables: PhotographyBibleUnitVariables;
  displayBustReferenceSrc: string;
  productReferenceImageSrc: string;
  editorialReferencePrompt: string;
  benchmarkAssetSrc: string;
  providerPreset: PhotographyBibleProviderPreset;
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

export function isBannedPhotographyBibleFalModel(model: string | undefined): boolean {
  if (!model?.trim()) return false;
  const normalized = model.trim().toLowerCase();
  return PHOTOGRAPHY_BIBLE_BANNED_FAL_MODELS.some((banned) => normalized === banned.toLowerCase());
}

export function validateLockedProviderSettings(opts: {
  preset?: PhotographyBibleProviderPreset;
  benchmarkAssetSrc: string;
  requestedModel?: string;
}): PhotographyBibleProviderValidation {
  const preset = opts.preset ?? PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET;
  const requestedModel = opts.requestedModel?.trim();

  const base: PhotographyBibleProviderValidation = {
    presetId: preset.id,
    presetName: preset.name,
    provider: preset.provider,
    model: preset.model,
    modelLabel: preset.modelLabel,
    quality: preset.quality,
    qualityLabel: preset.qualityLabel,
    aspectRatio: preset.aspectRatio,
    resolution: preset.resolutionLabel,
    promptVersion: preset.promptVersion,
    creativeDnaVersion: preset.creativeDnaVersion,
    benchmarkAsset: opts.benchmarkAssetSrc,
    background: preset.background,
    cropPhilosophy: PHOTOGRAPHY_BIBLE_MASTER_HERO_CROP_PHILOSOPHY,
    status: 'ready',
    validationMessage: 'Provider preset locked — ready for Photography Bible master hero generation',
  };

  if (preset.status === 'experimental') {
    return {
      ...base,
      status: 'blocked',
      blockedReason: 'Experimental preset selected — not approved for master hero generation',
      validationMessage:
        'Generation blocked: experimental preset. Use Photography Bible Master Hero v1 or promote output manually.',
    };
  }

  if (requestedModel && requestedModel !== preset.model) {
    const banned = isBannedPhotographyBibleFalModel(requestedModel);
    return {
      ...base,
      status: 'blocked',
      blockedReason: banned
        ? `Provider preset mismatch. Expected: ${preset.modelLabel} / ${preset.qualityLabel} / ${preset.aspectRatio}. Received: ${requestedModel}.`
        : `Provider preset mismatch. Expected: ${preset.model}. Received: ${requestedModel}.`,
      validationMessage: `Generation blocked: provider preset mismatch. Expected: ${preset.modelLabel} / ${preset.qualityLabel} / ${preset.aspectRatio}. Received: ${requestedModel}.`,
    };
  }

  if (preset.model !== PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL) {
    return {
      ...base,
      status: 'blocked',
      blockedReason: `Provider preset mismatch. Expected: ${preset.modelLabel} / ${preset.qualityLabel} / ${preset.aspectRatio}. Received: ${preset.model}.`,
      validationMessage: `Generation blocked: model must be ${PHOTOGRAPHY_BIBLE_MASTER_HERO_MODEL_LABEL}`,
    };
  }

  if (isBannedPhotographyBibleFalModel(preset.model)) {
    return {
      ...base,
      status: 'blocked',
      blockedReason: `Banned model: ${preset.model}`,
      validationMessage: `Generation blocked: ${preset.model} is not approved for Photography Bible master heroes`,
    };
  }

  return base;
}

export function buildMasterHeroGenerationPackagePreview(opts: {
  compiledPrompt: string;
  promptValidation: PhotographyBiblePromptValidation;
  providerValidation: PhotographyBibleProviderValidation;
  displayBustSrc: string;
  productReferenceSrc: string;
  benchmarkAssetSrc: string;
}): MasterHeroGenerationPackage {
  const preset = PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET;
  const referenceAssetsUsed = [opts.displayBustSrc, opts.productReferenceSrc];
  if (opts.benchmarkAssetSrc && opts.benchmarkAssetSrc !== opts.displayBustSrc) {
    referenceAssetsUsed.push(opts.benchmarkAssetSrc);
  }

  return {
    lockedCreativeDnaPromptTemplate: PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE,
    injectedProductVariables: opts.promptValidation.injectedVariables,
    displayBustReferenceSrc: opts.displayBustSrc,
    productReferenceImageSrc: opts.productReferenceSrc,
    editorialReferencePrompt: CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT,
    benchmarkAssetSrc: opts.benchmarkAssetSrc,
    providerPreset: preset,
    outputSettings: {
      aspectRatio: preset.aspectRatio,
      resolution: preset.resolutionLabel,
      quality: preset.qualityLabel,
      outputFormat: preset.outputFormat,
      background: preset.background,
      cropPhilosophy: PHOTOGRAPHY_BIBLE_MASTER_HERO_CROP_PHILOSOPHY,
    },
    finalPrompt: opts.compiledPrompt,
    referenceAssetsUsed,
    validation: {
      prompt: opts.promptValidation,
      provider: opts.providerValidation,
    },
  };
}
