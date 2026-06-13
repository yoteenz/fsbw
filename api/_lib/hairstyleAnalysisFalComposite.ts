import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import {
  photoPostProcessLayoutOverrides,
  resolveClientImageSlotOrDefault,
  resolveClientPhotoFadeSlotOrDefault,
} from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';
import {
  applyClientFaceRestore,
  applyClientFaceRestoreToThumbnails,
  hairstyleAnalysisClientFaceRestoreEnabled,
} from './hairstyleAnalysisClientFaceRestore.js';
import { applyClientPhotoMirrorReflection } from './hairstyleAnalysisClientPhotoReflection.js';
import { hairstyleAnalysisClientPhotoPostProcessEnabled } from './hairstyleAnalysisClientPhotoCutout.js';
import {
  edmRoseIconSlots,
  HAIRSTYLE_ANALYSIS_CANVAS,
  matchThumbnailSlots,
} from './hairstyleAnalysisLayoutSlots.js';
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
  /** Submitted client selfie — used for server face paste when Fal swaps identity. */
  clientPreviewBuf?: Buffer | null;
  /** Premium template: restore face on MATCH 02–04 thumbnails (default 3). */
  matchThumbnailCount?: number;
  layoutOverrides?: CompositeLayoutOverrides;
  applyPhotoFade?: boolean;
};

/**
 * Post-process after Fal:
 * 1. Restore template EDM rose icons
 * 2. Restore submitted client face on main preview + MATCH thumbnails
 * 3. Optional bottom fade refine + mirror reflection
 */
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

  if (input.clientPreviewBuf?.length && hairstyleAnalysisClientFaceRestoreEnabled()) {
    base = await applyClientFaceRestore(base, input.clientPreviewBuf, panelRect, fadeRect);
    const thumbCount = input.matchThumbnailCount ?? 0;
    if (thumbCount > 0) {
      base = await applyClientFaceRestoreToThumbnails(
        base,
        input.clientPreviewBuf,
        matchThumbnailSlots(thumbCount)
      );
    }
  }

  if (applyPhotoFade) {
    base = await applyClientPhotoBottomFade(base, templateBuf, fadeRect, panelRect);
  }

  return applyClientPhotoMirrorReflection(base, panelRect, fadeRect);
}
