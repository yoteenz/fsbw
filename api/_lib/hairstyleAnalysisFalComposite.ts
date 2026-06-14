import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import {
  photoPostProcessLayoutOverrides,
  resolveClientImageSlotOrDefault,
  resolveClientPhotoFadeSlotOrDefault,
} from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';
import {
  applyClientPanelPhotoRestore,
  hairstyleAnalysisClientPanelRestoreEnabled,
} from './hairstyleAnalysisClientPanelRestore.js';
import { applyClientPhotoMirrorReflection } from './hairstyleAnalysisClientPhotoReflection.js';
import { hairstyleAnalysisClientPhotoPostProcessEnabled } from './hairstyleAnalysisClientPhotoCutout.js';
import { edmRoseIconSlots, HAIRSTYLE_ANALYSIS_CANVAS } from './hairstyleAnalysisLayoutSlots.js';
import { restoreTemplateSlots } from './hairstyleAnalysisTemplateRestore.js';

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

export type HairstyleAnalysisPostProcessInput = {
  falImageUrl: string;
  templateImageUrl: string;
  /** Hair-edited step-1 portrait (preferred) or raw selfie — free-tier panel paste. */
  clientPreviewBuf?: Buffer | null;
  /** When true, paste full client portrait into main photo window after Fal. */
  restoreFreeClientPanel?: boolean;
  layoutOverrides?: CompositeLayoutOverrides;
  applyPhotoFade?: boolean;
};

/** Post-process: restore EDM roses, optional free client panel paste, optional fade, mirror reflection. */
export async function compositeHairstyleAnalysisPostProcess(
  input: HairstyleAnalysisPostProcessInput
): Promise<Buffer> {
  const applyPhotoFade = input.applyPhotoFade ?? hairstyleAnalysisClientPhotoPostProcessEnabled();

  const [falRaw, templateRaw] = await Promise.all([
    fetchBuffer(input.falImageUrl),
    fetchBuffer(input.templateImageUrl),
  ]);

  const [falBuf, templateBuf] = await Promise.all([
    resizeToAnalysisCanvas(falRaw),
    resizeToAnalysisCanvas(templateRaw),
  ]);

  let base = await restoreTemplateSlots(falBuf, templateBuf, edmRoseIconSlots());

  const photoOverrides = photoPostProcessLayoutOverrides(input.layoutOverrides);
  const panelRect = resolveClientImageSlotOrDefault(photoOverrides);
  const fadeRect = resolveClientPhotoFadeSlotOrDefault(photoOverrides);

  if (
    input.restoreFreeClientPanel &&
    input.clientPreviewBuf?.length &&
    hairstyleAnalysisClientPanelRestoreEnabled()
  ) {
    base = await applyClientPanelPhotoRestore(
      base,
      templateBuf,
      input.clientPreviewBuf,
      panelRect,
      fadeRect
    );
  }

  if (applyPhotoFade) {
    base = await applyClientPhotoBottomFade(base, templateBuf, fadeRect, panelRect);
  }

  return applyClientPhotoMirrorReflection(base, panelRect, fadeRect);
}
