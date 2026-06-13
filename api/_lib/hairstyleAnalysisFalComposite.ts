import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import { resolveClientPhotoFadeSlotOrDefault } from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';

type FalClient = {
  storage: { upload: (file: File) => Promise<string> };
  subscribe: (
    model: string,
    opts: { input: Record<string, unknown>; logs?: boolean }
  ) => Promise<unknown>;
};

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Post-process: Ideogram cutout, bottom-anchor, symmetrical fade — template marble shows through. */
export async function compositeHairstyleAnalysisPostProcess(
  falImageUrl: string,
  templateImageUrl: string,
  layoutOverrides?: CompositeLayoutOverrides,
  fal?: FalClient | null
): Promise<Buffer> {
  const [falBuf, templateBuf] = await Promise.all([
    fetchBuffer(falImageUrl),
    fetchBuffer(templateImageUrl),
  ]);

  const fadeRect = resolveClientPhotoFadeSlotOrDefault(layoutOverrides);
  return applyClientPhotoBottomFade(falBuf, templateBuf, fadeRect, fal);
}
