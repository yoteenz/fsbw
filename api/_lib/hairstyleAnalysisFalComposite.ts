import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import {
  photoPostProcessLayoutOverrides,
  resolveClientImageSlotOrDefault,
  resolveClientPhotoFadeSlotOrDefault,
} from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';
import { applyClientPhotoMirrorReflection } from './hairstyleAnalysisClientPhotoReflection.js';
import { hairstyleAnalysisClientPhotoPostProcessEnabled } from './hairstyleAnalysisClientPhotoCutout.js';
import { compositeFreeTierEdmBuildSummary } from './hairstyleAnalysisFreeTierFooters.js';
import { edmRoseIconSlots, HAIRSTYLE_ANALYSIS_CANVAS, hairstyleAnalysisGhostWipeSlots } from './hairstyleAnalysisLayoutSlots.js';
import { restoreTemplateSlots } from './hairstyleAnalysisTemplateRestore.js';
import {
  compositeTopMatchSpecValues,
  type TopMatchSpecLook,
} from './hairstyleAnalysisTopMatchSpecs.js';

export type HairstyleAnalysisPostProcessContext = {
  topMatch: TopMatchSpecLook;
  tier: 'free' | 'three_month' | 'six_month' | 'twelve_month' | 'black';
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

/** Post-process: restore EDM rose icons, optional photo fade, mirror reflection, server text overlays. */
export async function compositeHairstyleAnalysisPostProcess(
  falImageUrl: string,
  templateImageUrl: string,
  layoutOverrides?: CompositeLayoutOverrides,
  applyPhotoFade = false,
  postProcess?: HairstyleAnalysisPostProcessContext | null
): Promise<Buffer> {
  const [falRaw, templateRaw] = await Promise.all([
    fetchBuffer(falImageUrl),
    fetchBuffer(templateImageUrl),
  ]);

  const [falBuf, templateBuf] = await Promise.all([
    resizeToAnalysisCanvas(falRaw),
    resizeToAnalysisCanvas(templateRaw),
  ]);

  let base = await restoreTemplateSlots(falBuf, templateBuf, edmRoseIconSlots());

  const photoOverrides = photoPostProcessLayoutOverrides(layoutOverrides);
  const panelRect = resolveClientImageSlotOrDefault(photoOverrides);
  const fadeRect = resolveClientPhotoFadeSlotOrDefault(photoOverrides);

  if (applyPhotoFade) {
    base = await applyClientPhotoBottomFade(base, templateBuf, fadeRect, panelRect);
  }

  base = await applyClientPhotoMirrorReflection(base, panelRect, fadeRect);

  base = await restoreTemplateSlots(base, templateBuf, hairstyleAnalysisGhostWipeSlots());

  if (postProcess) {
    base = await compositeTopMatchSpecValues(base, templateBuf, postProcess.topMatch);

    if (postProcess.tier === 'free') {
      const { formatEdmPanelBuildSummary } = await import('./hairstyleAnalysisDisplay.js');
      const summaryText = formatEdmPanelBuildSummary(
        postProcess.topMatch.unit,
        postProcess.topMatch.color,
        postProcess.topMatch.length
      );
      base = await compositeFreeTierEdmBuildSummary(base, templateBuf, summaryText);
    }
  }

  return base;
}
