import type { AnalysisFontStyle } from './hairstyleAnalysisFonts.js';
import { buildTextOverlaySvg } from './hairstyleAnalysisFonts.js';
import {
  buildOverallScoreOverlaySvg,
  buildStarComposites,
  fetchImageBuffer,
} from './hairstyleAnalysisCompositeElements.js';
import { getLayoutFieldsForAnalysis } from './hairstyleAnalysisLayoutFields.js';
import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { buildServerOverlayValues } from './hairstyleAnalysisOverlayValues.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { HAIRSTYLE_ANALYSIS_CANVAS } from './hairstyleAnalysisLayoutSlots.js';
import { renderBuiltCardChrome } from './hairstyleAnalysisBuiltTemplate.js';
import { normalizeHairstyleAnalysisCardTier } from './hairstyleAnalysisTemplates.js';
import { createHairstyleAnalysisFalClient, uploadBufferToFalStorage } from './hairstyleAnalysisFalShared.js';
import { generateHairstyleHairImages } from './hairstyleAnalysisHairGenerate.js';
import { normalizeHairstyleAnalysisForFal } from './hairstyleAnalysisNormalize.js';

function textStyleForField(
  fieldId: string
): { style: AnalysisFontStyle; align: 'left' | 'center' } | null {
  if (fieldId === 'rating') return null;
  if (fieldId === 'clientName') return { style: 'futura-red', align: 'center' };
  if (fieldId === 'topScore') return { style: 'covered-red', align: 'center' };
  if (fieldId.endsWith('-score') || /^alt-\d+-score$/.test(fieldId)) {
    return { style: 'futura-gray', align: 'left' };
  }
  return { style: 'futura-black', align: 'left' };
}

async function resizeCover(buf: Buffer, rect: PixelRect): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(buf)
    .resize(rect.width, rect.height, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();
}


export type GenerateHairstyleAnalysisCompositeInput = {
  analysis: FalHairstyleAnalysis;
  templateUrl: string;
  clientPreviewUrl: string;
  siteOrigin: string;
};

export type GenerateHairstyleAnalysisCompositeResult = {
  imageUrl: string;
  prompt: string;
  model: string;
  imageSize: typeof HAIRSTYLE_ANALYSIS_CANVAS;
  quality: 'medium';
  renderMode: 'composite';
};

export async function generateHairstyleAnalysisComposite(
  input: GenerateHairstyleAnalysisCompositeInput
): Promise<GenerateHairstyleAnalysisCompositeResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY is not configured (required for hair generation and upload)');

  const sharp = (await import('sharp')).default;
  const analysis = normalizeHairstyleAnalysisForFal(input.analysis);
  const { clientPreviewUrl, siteOrigin } = input;
  const tier = normalizeHairstyleAnalysisCardTier(analysis.tier);

  const fal = await createHairstyleAnalysisFalClient(falKey);

  const [templateBuf, fields, overlayValues, hairImages] = await Promise.all([
    renderBuiltCardChrome(tier, siteOrigin),
    Promise.resolve(getLayoutFieldsForAnalysis(analysis)),
    Promise.resolve(buildServerOverlayValues(analysis)),
    generateHairstyleHairImages(fal, analysis, clientPreviewUrl, siteOrigin),
  ]);

  const imageOverlays: Array<{ input: Buffer; left: number; top: number }> = [];
  for (const field of fields) {
    if (field.kind !== 'image') continue;
    const imgBuf = hairImages.get(field.id);
    if (!imgBuf) continue;
    try {
      const resized = await resizeCover(imgBuf, field.rect);
      imageOverlays.push({ input: resized, left: field.rect.left, top: field.rect.top });
    } catch (e) {
      console.warn(`[hairstyle-analysis-composite] skip image ${field.id}:`, e);
    }
  }

  const textItems: Array<{
    text: string;
    rect: PixelRect;
    style: AnalysisFontStyle;
    align?: 'left' | 'center';
  }> = [];

  for (const field of fields) {
    if (field.kind !== 'text') continue;
    if (field.id === 'topScore') continue;
    const styleInfo = textStyleForField(field.id);
    if (!styleInfo) continue;
    const text = (overlayValues[field.id] ?? '').trim();
    if (!text) continue;
    const displayText = field.id.startsWith('whyLine-') ? text : text.toUpperCase();
    textItems.push({
      text: displayText,
      rect: field.rect,
      style: styleInfo.style,
      align: styleInfo.align,
    });
  }

  const [textOverlayBuf, scoreOverlayBuf, starOverlays] = await Promise.all([
    Promise.resolve(buildTextOverlaySvg(textItems)),
    Promise.resolve(buildOverallScoreOverlaySvg(analysis.topMatch.score)),
    buildStarComposites(analysis.topMatch.rating, siteOrigin),
  ]);

  const textPng = await sharp(textOverlayBuf).png().toBuffer();
  const scorePng = await sharp(scoreOverlayBuf).png().toBuffer();

  const composited = await sharp(templateBuf)
    .composite([
      ...imageOverlays,
      { input: textPng, left: 0, top: 0 },
      { input: scorePng, left: 0, top: 0 },
      ...starOverlays,
    ])
    .png()
    .toBuffer();

  const imageUrl = await uploadBufferToFalStorage(
    fal,
    composited,
    'hairstyle-analysis-composite.png',
    'image/png'
  );

  const hairCount = hairImages.size;
  const tierLabel = analysis.tier.replace(/_/g, ' ');
  return {
    imageUrl,
    prompt: `Fal GPT Image 2 hair on ${hairCount} photo slot(s), then sharp composite on code-built ${tierLabel} card chrome — Futura labels + values, gray match scores, CBYG overall %, stars.`,
    model: 'built-template+fal-hair',
    imageSize: HAIRSTYLE_ANALYSIS_CANVAS,
    quality: 'medium',
    renderMode: 'composite',
  };
}
