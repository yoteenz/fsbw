/**
 * Fal `openai/gpt-image-2/edit` input for BAW live color + styling previews.
 * NBP uses `resolution` / `aspect_ratio`; GPT Image 2 uses `image_size` + `quality`.
 */

export const BAW_LIVE_PREVIEW_GPT2_EDIT_MODEL = 'openai/gpt-image-2/edit';

export function bawGptImage2EditFalInput(
  prompt: string,
  imageUrls: string[]
): Record<string, unknown> {
  return {
    prompt,
    image_urls: imageUrls,
    image_size: 'auto',
    quality: 'auto',
    output_format: 'webp',
    num_images: 1,
  };
}
