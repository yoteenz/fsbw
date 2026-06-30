/**
 * Fal `openai/gpt-image-2/edit` input for BAW live color + styling previews.
 * NBP uses `resolution` / `aspect_ratio`; GPT Image 2 uses `image_size` + `quality`.
 */

import {
  wigPreviewLiveFalOutputFormat,
  wigPreviewLiveUploadContentType,
} from './bawLivePreviewOutputFormat.js';

export const BAW_LIVE_PREVIEW_GPT2_EDIT_MODEL = 'openai/gpt-image-2/edit';

/** 3:4 portrait, ~2K long edge (2048px height). Keep in sync with `live-noir-color.ts`. */
export const BAW_GPT2_LIVE_PREVIEW_IMAGE_SIZE = { width: 1536, height: 2048 } as const;

/**
 * GPT Image 2 `quality` enum: `low` | `medium` | `high` | `auto`.
 * **`high`** for live NOIR color + styling (best fidelity; higher cost/latency).
 * Override: `WIG_PREVIEW_LIVE_GPT2_QUALITY=medium|high|auto`.
 */
export function bawGpt2LivePreviewQuality(): 'low' | 'medium' | 'high' | 'auto' {
  const raw = process.env.WIG_PREVIEW_LIVE_GPT2_QUALITY?.trim().toLowerCase();
  if (raw === 'medium' || raw === 'low' || raw === 'auto') return raw;
  return 'high';
}

/** @deprecated Use `bawGpt2LivePreviewQuality()` — default is now `high`. */
export const BAW_GPT2_LIVE_PREVIEW_QUALITY = 'high' as const;

export function bawGptImage2EditFalInput(
  prompt: string,
  imageUrls: string[]
): Record<string, unknown> {
  return {
    prompt,
    image_urls: imageUrls,
    image_size: BAW_GPT2_LIVE_PREVIEW_IMAGE_SIZE,
    quality: bawGpt2LivePreviewQuality(),
    output_format: wigPreviewLiveFalOutputFormat(),
    num_images: 1,
  };
}

export function bawLivePreviewUploadContentType(): 'image/png' | 'image/webp' {
  return wigPreviewLiveUploadContentType();
}
