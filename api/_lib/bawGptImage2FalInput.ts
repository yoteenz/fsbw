/**
 * Fal `openai/gpt-image-2/edit` input for BAW live color + styling previews.
 * NBP uses `resolution` / `aspect_ratio`; GPT Image 2 uses `image_size` + `quality`.
 */

export const BAW_LIVE_PREVIEW_GPT2_EDIT_MODEL = 'openai/gpt-image-2/edit';

/** 3:4 portrait, ~2K long edge (2048px height). Keep in sync with `live-noir-color.ts`. */
export const BAW_GPT2_LIVE_PREVIEW_IMAGE_SIZE = { width: 1536, height: 2048 } as const;

/**
 * GPT Image 2 `quality` enum: `low` | `medium` | `high` | `auto` (no literal `2K`).
 * **`medium`** is the ~2K-tier setting paired with `BAW_GPT2_LIVE_PREVIEW_IMAGE_SIZE`.
 */
export const BAW_GPT2_LIVE_PREVIEW_QUALITY = 'medium' as const;

export function bawGptImage2EditFalInput(
  prompt: string,
  imageUrls: string[]
): Record<string, unknown> {
  return {
    prompt,
    image_urls: imageUrls,
    image_size: BAW_GPT2_LIVE_PREVIEW_IMAGE_SIZE,
    quality: BAW_GPT2_LIVE_PREVIEW_QUALITY,
    output_format: 'webp',
    num_images: 1,
  };
}
