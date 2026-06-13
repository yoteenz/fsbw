import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import {
  photoPostProcessLayoutOverrides,
  resolveClientImageSlotOrDefault,
  resolveClientPhotoFadeSlotOrDefault,
} from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';
import { HAIRSTYLE_ANALYSIS_CANVAS } from './hairstyleAnalysisLayoutSlots.js';

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

/** Fal may return `auto` size — slot rects are calibrated for 2048×2560. */
async function resizeToAnalysisCanvas(buf: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { width, height } = HAIRSTYLE_ANALYSIS_CANVAS;
  const meta = await sharp(buf).metadata();
  if (meta.width === width && meta.height === height) return buf;
  return sharp(buf).resize(width, height, { fit: 'fill' }).png().toBuffer();
}

/** Post-process: client photo only (Ideogram cutout + fade). Match-row text is Fal in-image — never composited here. */
export async function compositeHairstyleAnalysisPostProcess(
  falImageUrl: string,
  templateImageUrl: string,
  layoutOverrides?: CompositeLayoutOverrides,
  fal?: FalClient | null
): Promise<Buffer> {
  const [falRaw, templateRaw] = await Promise.all([
    fetchBuffer(falImageUrl),
    fetchBuffer(templateImageUrl),
  ]);

  const [falBuf, templateBuf] = await Promise.all([
    resizeToAnalysisCanvas(falRaw),
    resizeToAnalysisCanvas(templateRaw),
  ]);

  const photoOverrides = photoPostProcessLayoutOverrides(layoutOverrides);
  const fadeRect = resolveClientPhotoFadeSlotOrDefault(photoOverrides);
  const panelRect = resolveClientImageSlotOrDefault(photoOverrides);
  return applyClientPhotoBottomFade(falBuf, templateBuf, fadeRect, panelRect, fal);
}
