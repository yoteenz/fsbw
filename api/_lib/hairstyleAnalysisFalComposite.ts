import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import { resolveClientPhotoFadeSlotOrDefault } from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Post-process: client photo bottom cutout — template marble shows through faded alpha. */
export async function compositeHairstyleAnalysisPostProcess(
  falImageUrl: string,
  templateImageUrl: string,
  _layoutOverrides?: CompositeLayoutOverrides
): Promise<Buffer> {
  const [falBuf, templateBuf] = await Promise.all([
    fetchBuffer(falImageUrl),
    fetchBuffer(templateImageUrl),
  ]);

  const fadeRect = resolveClientPhotoFadeSlotOrDefault(_layoutOverrides);
  return applyClientPhotoBottomFade(falBuf, templateBuf, fadeRect);
}
