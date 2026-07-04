/**
 * Locked Fal provider preset — Photography Bible Master Hero v1.
 * GPT Image 2 only. No silent fallback to nano-banana or other models.
 */

import { CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT } from './creativeDnaV1.js';
import { CREATIVE_DNA_SPEC_VERSION, PHOTOGRAPHY_BIBLE_PROMPT_VERSION } from './promptCompiler.js';
import type { PhotographyBiblePromptValidation, PhotographyBibleUnitVariables } from './promptCompiler.js';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_ID = 'photography-bible-master-hero-v1' as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_NAME = 'Photography Bible Master Hero v1';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL = 'openai/gpt-image-2/edit' as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_MODEL_LABEL = 'GPT Image 2';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY = 'high' as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY_LABEL = '2K HIGH';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_ASPECT_RATIO = '1:1' as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE = { width: 4096, height: 4096 } as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE_FALLBACK = { width: 2048, height: 2048 } as const;

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_RESOLUTION_LABEL = '4096×4096';

export const PHOTOGRAPHY_BIBLE_MASTER_HERO_OUTPUT_FORMAT = 'png' as const;

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
  imageSize: typeof PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE;
  resolutionLabel: string;
  outputFormat: typeof PHOTOGRAPHY_BIBLE_MASTER_HERO_OUTPUT_FORMAT;
  background: string;
  mode: 'edit';
  promptVersion: typeof PHOTOGRAPHY_BIBLE_PROMPT_VERSION;
  creativeDnaVersion: typeof CREATIVE_DNA_SPEC_VERSION;
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
  imageSize: PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE,
  resolutionLabel: PHOTOGRAPHY_BIBLE_MASTER_HERO_RESOLUTION_LABEL,
  outputFormat: PHOTOGRAPHY_BIBLE_MASTER_HERO_OUTPUT_FORMAT,
  background: PHOTOGRAPHY_BIBLE_MASTER_HERO_BACKGROUND,
  mode: 'edit',
  promptVersion: PHOTOGRAPHY_BIBLE_PROMPT_VERSION,
  creativeDnaVersion: CREATIVE_DNA_SPEC_VERSION,
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

export type ValidateLockedProviderInput = {
  preset?: PhotographyBibleProviderPreset;
  benchmarkAssetSrc: string;
  requestedModel?: string;
};

export function isBannedPhotographyBibleFalModel(model: string | undefined): boolean {
  if (!model?.trim()) return false;
  const normalized = model.trim().toLowerCase();
  return PHOTOGRAPHY_BIBLE_BANNED_FAL_MODELS.some((banned) => normalized === banned.toLowerCase());
}

export function validateLockedProviderSettings(
  input: ValidateLockedProviderInput
): PhotographyBibleProviderValidation {
  const preset = input.preset ?? PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET;
  const requestedModel = input.requestedModel?.trim();

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
    benchmarkAsset: input.benchmarkAssetSrc,
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

  if (preset.id !== PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_ID) {
    return {
      ...base,
      status: 'blocked',
      blockedReason: `Unknown provider preset: ${preset.id}`,
      validationMessage: `Generation blocked: unknown provider preset ${preset.id}`,
    };
  }

  if (preset.model !== PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL) {
    return {
      ...base,
      status: 'blocked',
      blockedReason: `Provider preset mismatch. Expected: ${preset.modelLabel} / ${preset.qualityLabel} / ${preset.aspectRatio}. Received: ${preset.model}.`,
      validationMessage: `Generation blocked: model must be ${PHOTOGRAPHY_BIBLE_MASTER_HERO_MODEL_LABEL} (${PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL})`,
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

  if (preset.quality !== PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY) {
    return {
      ...base,
      status: 'blocked',
      blockedReason: `Quality mismatch. Expected: ${PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY_LABEL}. Received: ${preset.quality}.`,
      validationMessage: `Generation blocked: quality must be ${PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY_LABEL}`,
    };
  }

  if (preset.promptVersion !== PHOTOGRAPHY_BIBLE_PROMPT_VERSION) {
    return {
      ...base,
      status: 'blocked',
      blockedReason: `Prompt version mismatch. Expected: ${PHOTOGRAPHY_BIBLE_PROMPT_VERSION}. Received: ${preset.promptVersion}.`,
      validationMessage: `Generation blocked: prompt version must be Photography Bible ${PHOTOGRAPHY_BIBLE_PROMPT_VERSION}`,
    };
  }

  if (preset.creativeDnaVersion !== CREATIVE_DNA_SPEC_VERSION) {
    return {
      ...base,
      status: 'blocked',
      blockedReason: `Creative DNA version mismatch. Expected: v${CREATIVE_DNA_SPEC_VERSION}. Received: v${preset.creativeDnaVersion}.`,
      validationMessage: `Generation blocked: Creative DNA must be v${CREATIVE_DNA_SPEC_VERSION}`,
    };
  }

  return base;
}

export function buildGptImage2MasterHeroFalInput(
  prompt: string,
  imageUrls: string[],
  imageSize: { width: number; height: number } = PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE
): Record<string, unknown> {
  return {
    prompt,
    image_urls: imageUrls,
    image_size: imageSize,
    quality: PHOTOGRAPHY_BIBLE_MASTER_HERO_QUALITY,
    output_format: PHOTOGRAPHY_BIBLE_MASTER_HERO_OUTPUT_FORMAT,
    num_images: 1,
  };
}

export function buildMasterHeroGenerationPackage(opts: {
  lockedTemplate: string;
  compiledPrompt: string;
  promptValidation: PhotographyBiblePromptValidation;
  providerValidation: PhotographyBibleProviderValidation;
  displayBustSrc: string;
  productReferenceSrc: string;
  benchmarkAssetSrc: string;
  referenceAssetsUsed: string[];
  preset?: PhotographyBibleProviderPreset;
}): MasterHeroGenerationPackage {
  const preset = opts.preset ?? PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET;
  return {
    lockedCreativeDnaPromptTemplate: opts.lockedTemplate,
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
    referenceAssetsUsed: opts.referenceAssetsUsed,
    validation: {
      prompt: opts.promptValidation,
      provider: opts.providerValidation,
    },
  };
}
