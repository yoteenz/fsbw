import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import {
  photoPostProcessLayoutOverrides,
  resolveClientImageSlotOrDefault,
  resolveClientPhotoFadeSlotOrDefault,
} from './hairstyleAnalysisCompositeLayout.js';
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

/** Post-process: client photo only (Ideogram cutout + fade). Match-row text is Fal in-image — never composited here. */
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

  const photoOverrides = photoPostProcessLayoutOverrides(layoutOverrides);
  const fadeRect = resolveClientPhotoFadeSlotOrDefault(photoOverrides);
  const panelRect = resolveClientImageSlotOrDefault(photoOverrides);
  return applyClientPhotoBottomFade(falBuf, templateBuf, fadeRect, panelRect, fal);
}
