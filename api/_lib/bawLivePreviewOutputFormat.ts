/**
 * Live NOIR color + after-color styling Storage / Fal output format.
 * Default **PNG** (lossless between passes). Override: `WIG_PREVIEW_LIVE_OUTPUT_FORMAT=webp`.
 * Client: set `VITE_WIG_PREVIEW_LIVE_OUTPUT_FORMAT=webp` only if server still writes WebP.
 */

export type WigPreviewLiveOutputFormat = 'png' | 'webp';

export function wigPreviewLiveOutputFormat(): WigPreviewLiveOutputFormat {
  const raw = process.env.WIG_PREVIEW_LIVE_OUTPUT_FORMAT?.trim().toLowerCase();
  if (raw === 'webp') return 'webp';
  return 'png';
}

export function wigPreviewLiveFileExtension(): '.png' | '.webp' {
  return wigPreviewLiveOutputFormat() === 'png' ? '.png' : '.webp';
}

export function wigPreviewLiveAngleFileName(angle: 'front' | 'left' | 'right'): string {
  return `${angle}${wigPreviewLiveFileExtension()}`;
}

export function wigPreviewLiveUploadContentType(): 'image/png' | 'image/webp' {
  return wigPreviewLiveOutputFormat() === 'png' ? 'image/png' : 'image/webp';
}

/** Fal GPT Image 2 `output_format` — keep aligned with Storage extension. */
export function wigPreviewLiveFalOutputFormat(): WigPreviewLiveOutputFormat {
  return wigPreviewLiveOutputFormat();
}

/** Legacy `.webp` paths still in Storage before PNG migration. */
export function wigPreviewLiveLegacyWebpPath(preferredPath: string): string | null {
  if (!preferredPath.endsWith('.png')) return null;
  return preferredPath.replace(/\.png$/, '.webp');
}
