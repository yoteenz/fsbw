import type { AnalysisFontStyle } from './hairstyleAnalysisFonts.js';
import { buildTextOverlaySvg } from './hairstyleAnalysisFonts.js';
import {
  buildOverallScoreOverlaySvg,
  buildStarComposites,
  fetchImageBuffer,
} from './hairstyleAnalysisCompositeElements.js';
import { getLayoutFieldsForAnalysis } from './hairstyleAnalysisLayoutFields.js';
import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import {
  buildServerOverlayValues,
  resolveServerOverlayImageUrl,
} from './hairstyleAnalysisOverlayValues.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { HAIRSTYLE_ANALYSIS_CANVAS } from './hairstyleAnalysisLayoutSlots.js';

type FalStorageClient = {
  storage: { upload: (file: File) => Promise<string> };
};

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

async function getFalStorageClient(falKey: string): Promise<FalStorageClient> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  return fal as unknown as FalStorageClient;
}

async function uploadPngToFal(fal: FalStorageClient, buf: Buffer): Promise<string> {
  if (!buf.length) throw new Error('Composite PNG is empty');
  const file = new File([buf], 'hairstyle-analysis-composite.png', { type: 'image/png' });
  return fal.storage.upload(file);
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
  if (!falKey) throw new Error('FAL_KEY is not configured (required to upload composite PNG)');

  const sharp = (await import('sharp')).default;
  const { analysis, templateUrl, clientPreviewUrl, siteOrigin } = input;

  const [templateBuf, fields, overlayValues] = await Promise.all([
    fetchImageBuffer(templateUrl, siteOrigin),
    Promise.resolve(getLayoutFieldsForAnalysis(analysis)),
    Promise.resolve(buildServerOverlayValues(analysis)),
  ]);

  const imageOverlays: Array<{ input: Buffer; left: number; top: number }> = [];
  for (const field of fields) {
    if (field.kind !== 'image') continue;
    const rawUrl = resolveServerOverlayImageUrl(field.id, analysis, clientPreviewUrl, siteOrigin);
    if (!rawUrl) continue;
    try {
      const imgBuf = await fetchImageBuffer(rawUrl, siteOrigin);
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

  const fal = await getFalStorageClient(falKey);
  const imageUrl = await uploadPngToFal(fal, composited);

  const tierLabel = analysis.tier.replace(/_/g, ' ');
  return {
    imageUrl,
    prompt: `Server composite on static ${tierLabel} template (2048×2560) — photos, Futura spec text, gray match scores, CBYG overall %, stars.`,
    model: 'sharp-composite',
    imageSize: HAIRSTYLE_ANALYSIS_CANVAS,
    quality: 'medium',
    renderMode: 'composite',
  };
}
