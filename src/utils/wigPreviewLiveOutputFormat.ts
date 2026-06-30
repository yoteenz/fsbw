/** Keep aligned with `api/_lib/bawLivePreviewOutputFormat.ts` (default PNG). */
export type WigPreviewLiveOutputFormat = 'png' | 'webp';

export function wigPreviewLiveOutputFormat(): WigPreviewLiveOutputFormat {
  const raw = (
    import.meta as unknown as { env?: { VITE_WIG_PREVIEW_LIVE_OUTPUT_FORMAT?: string } }
  ).env?.VITE_WIG_PREVIEW_LIVE_OUTPUT_FORMAT?.trim()
    .toLowerCase();
  if (raw === 'webp') return 'webp';
  return 'png';
}

export function wigPreviewLiveFileExtension(): '.png' | '.webp' {
  return wigPreviewLiveOutputFormat() === 'png' ? '.png' : '.webp';
}

export function wigPreviewLiveAngleFileName(angle: 'front' | 'left' | 'right'): string {
  return `${angle}${wigPreviewLiveFileExtension()}`;
}
