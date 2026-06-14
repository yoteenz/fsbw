import {
  EDM_BUILD_SUMMARY_GHOST_WIPE_SLOT,
  EDM_PANEL_FOOTER_SLOT,
  type PixelRect,
} from './hairstyleAnalysisLayoutSlots.js';
import { restoreTemplateSlots } from './hairstyleAnalysisTemplateRestore.js';
import {
  buildTextPathsSvg,
  edmPanelFooterFontSize,
  textPathData,
} from './hairstyleAnalysisTextPaths.js';

const EDM_BUILD_SUMMARY_GRAY = '#808080';

export type FreeTierEdmBuildSummary = {
  unit: string;
  color: string;
  length: string;
};

async function compositeCenteredText(
  baseBuf: Buffer,
  text: string,
  slot: PixelRect,
  options: { fontSize: number; fill: string }
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const pathData = textPathData(text, slot, {
    fontFile: 'FuturaPTMedium.ttf',
    fontSize: options.fontSize,
    fill: options.fill,
    align: 'center',
  });
  const svg = buildTextPathsSvg([{ pathData, fill: options.fill }]);
  return sharp(baseBuf)
    .composite([{ input: svg, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

/** Server-composite free-tier gray build summary; wipe Fal fragments in the wrong zone. */
export async function compositeFreeTierEdmBuildSummary(
  baseBuf: Buffer,
  templateBuf: Buffer,
  summaryText: string
): Promise<Buffer> {
  let base = await restoreTemplateSlots(baseBuf, templateBuf, [
    EDM_BUILD_SUMMARY_GHOST_WIPE_SLOT,
    EDM_PANEL_FOOTER_SLOT,
  ]);

  const fontSize = edmPanelFooterFontSize(EDM_PANEL_FOOTER_SLOT);
  base = await compositeCenteredText(base, summaryText, EDM_PANEL_FOOTER_SLOT, {
    fontSize,
    fill: EDM_BUILD_SUMMARY_GRAY,
  });

  return base;
}
