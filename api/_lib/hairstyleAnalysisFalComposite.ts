import {
  buildOverallScoreOverlaySvg,
  buildStarComposites,
  fetchImageBuffer,
} from './hairstyleAnalysisCompositeElements.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';

/** Overlay only overall score % and match-rating stars — Fal fills specs and match scores. */
export async function compositeHairstyleAnalysisFalImage(
  falImageUrl: string,
  analysis: FalHairstyleAnalysis,
  siteOrigin: string
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseBuf = await fetchImageBuffer(falImageUrl, siteOrigin);
  const [scoreOverlay, starOverlays] = await Promise.all([
    Promise.resolve(buildOverallScoreOverlaySvg(analysis.topMatch.score)),
    buildStarComposites(analysis.topMatch.rating, siteOrigin),
  ]);

  const scorePng = await sharp(scoreOverlay).png().toBuffer();

  return sharp(baseBuf)
    .composite([{ input: scorePng, left: 0, top: 0 }, ...starOverlays])
    .png()
    .toBuffer();
}
