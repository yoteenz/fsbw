/**
 * Verified FAL schema contract for fal-ai/nano-banana-2 family.
 * Do not invent unsupported parameters.
 */

export const NANO_BANANA_2_T2I_ENDPOINT = 'fal-ai/nano-banana-2' as const;
export const NANO_BANANA_2_EDIT_ENDPOINT = 'fal-ai/nano-banana-2/edit' as const;

/** Verified resolution enum on both t2i and edit endpoints. */
export const NANO_BANANA_2_RESOLUTIONS = ['0.5K', '1K', '2K', '4K'] as const;
export type NanoBanana2Resolution = (typeof NANO_BANANA_2_RESOLUTIONS)[number];

/** Highest supported production-safe quality preset. */
export const NANO_BANANA_2_PRODUCTION_QUALITY = '4K' as const satisfies NanoBanana2Resolution;

/** Verified thinking_level values on t2i endpoint. */
export const NANO_BANANA_2_THINKING_LEVELS = ['minimal', 'high', 'dynamic'] as const;
export const NANO_BANANA_2_PRODUCTION_THINKING = 'high' as const;

export const NANO_BANANA_2_MAX_REFERENCE_IMAGES = 14;

export type NanoBanana2FalInput = {
  prompt: string;
  resolution: NanoBanana2Resolution;
  aspect_ratio: string;
  output_format: 'png' | 'webp' | 'jpeg';
  num_images: number;
  thinking_level?: string;
  image_urls?: string[];
};

export function buildNanoBanana2FalInput(input: {
  prompt: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  brandReferenceUrls?: string[];
  negativePrompt?: string;
}): { endpoint: string; falInput: NanoBanana2FalInput; usesReferences: boolean } {
  const hasBrandRefs = (input.brandReferenceUrls?.length ?? 0) > 0;
  const endpoint = hasBrandRefs ? NANO_BANANA_2_EDIT_ENDPOINT : NANO_BANANA_2_T2I_ENDPOINT;

  const falInput: NanoBanana2FalInput = {
    prompt: input.negativePrompt
      ? `${input.prompt}\n\nNEGATIVE: ${input.negativePrompt}`
      : input.prompt,
    resolution: NANO_BANANA_2_PRODUCTION_QUALITY,
    aspect_ratio: input.aspectRatio,
    output_format: input.outputFormat,
    num_images: 1,
    thinking_level: NANO_BANANA_2_PRODUCTION_THINKING,
  };

  if (hasBrandRefs) {
    falInput.image_urls = input.brandReferenceUrls!.slice(0, NANO_BANANA_2_MAX_REFERENCE_IMAGES);
  }

  return { endpoint, falInput, usesReferences: hasBrandRefs };
}

export function classifyResolutionTruth(input: {
  requestedResolution: string;
  providerNativeResolution: string;
  outputWidth?: number;
  outputHeight?: number;
  upscaleApplied?: boolean;
  upscaleModel?: string | null;
}): import('./types.js').ResolutionReport {
  const longEdge = Math.max(input.outputWidth ?? 0, input.outputHeight ?? 0);
  const native4K = input.providerNativeResolution === '4K';
  const outputRes =
    longEdge >= 3800 ? '4K' : longEdge >= 1900 ? '2K' : longEdge >= 900 ? '1K' : 'unknown';

  let truthState: import('./types.js').ResolutionTruthState;
  if (input.upscaleApplied) {
    truthState = 'post-upscaled-4k';
  } else if (native4K && longEdge >= 3800) {
    truthState = 'native-4k';
  } else {
    truthState = 'provider-nearest-supported';
  }

  return {
    requestedResolution: input.requestedResolution,
    providerNativeResolution: input.providerNativeResolution,
    outputResolution: outputRes,
    upscaleApplied: input.upscaleApplied ?? false,
    upscaleModel: input.upscaleModel ?? null,
    finalResolution: input.upscaleApplied ? '4K' : outputRes,
    truthState,
  };
}

/** Native 4K long-edge dimensions for 1:1 aspect at 4K tier (provider contract). */
export const NANO_BANANA_2_NATIVE_4K_LONG_EDGE = 4096;
