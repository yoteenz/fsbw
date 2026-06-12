/**
 * Fal GPT Image 2 hair-only edits for composite pipeline — client preview + match thumbs.
 */

import { collectStylingRefsForAnalysis } from './hairstyleAnalysisBawStylingRefs.js';
import type { FalClient } from './hairstyleAnalysisFalShared.js';
import {
  fetchFalResultBuffer,
  resolveHairstyleAnalysisImageUrl,
  resolveStylingRefForFal,
  runGptImage2HairEdit,
} from './hairstyleAnalysisFalShared.js';
import {
  buildClientPreviewHairOnlyPrompt,
  buildMatchThumbHairOnlyPrompt,
  type FalAnalysisLook,
  type FalHairstyleAnalysis,
  type FalPromptImageRefs,
} from './hairstyleAnalysisFalPrompt.js';
import { getLayoutFieldsForAnalysis } from './hairstyleAnalysisLayoutFields.js';
import {
  collectMannequinRefsForAnalysis,
  hairstyleAnalysis3dMannequinFrontPath,
} from './hairstyleAnalysisMannequinRefs.js';
import { lookForImageFieldId } from './hairstyleAnalysisOverlayValues.js';
import { fetchImageBuffer } from './hairstyleAnalysisCompositeElements.js';

export type HairImageTarget = {
  fieldId: string;
  look: FalAnalysisLook;
  kind: 'client' | 'thumb';
};

export function collectHairImageTargets(analysis: FalHairstyleAnalysis): HairImageTarget[] {
  const targets: HairImageTarget[] = [];
  for (const field of getLayoutFieldsForAnalysis(analysis)) {
    if (field.kind !== 'image') continue;
    if (field.id === 'clientImage') {
      targets.push({ fieldId: 'clientImage', look: analysis.topMatch, kind: 'client' });
      continue;
    }
    const look = lookForImageFieldId(field.id, analysis);
    if (look) targets.push({ fieldId: field.id, look, kind: 'thumb' });
  }
  return targets;
}

function refsForLook(look: FalAnalysisLook): FalPromptImageRefs {
  const mannequinRefs = collectMannequinRefsForAnalysis([look.unit], 2);
  const stylingRefs = collectStylingRefsForAnalysis([look], 2 + mannequinRefs.length);
  return { mannequinRefs, stylingRefs };
}

async function resolveHairEditImageUrls(
  fal: FalClient,
  clientFalUrl: string,
  look: FalAnalysisLook,
  siteOrigin: string,
  refs: FalPromptImageRefs
): Promise<string[]> {
  const mannequinUrls = await Promise.all(
    refs.mannequinRefs.map((ref) =>
      resolveHairstyleAnalysisImageUrl(fal, ref.path, siteOrigin, `mannequin-${ref.unit}`)
    )
  );
  const stylingUrls = await Promise.all(
    refs.stylingRefs.map((ref) => resolveStylingRefForFal(fal, ref))
  );
  return [clientFalUrl, ...mannequinUrls, ...stylingUrls];
}

async function generateOneHairImage(
  fal: FalClient,
  clientFalUrl: string,
  target: HairImageTarget,
  siteOrigin: string
): Promise<Buffer> {
  if (target.kind === 'thumb' && target.look.imageUrl?.trim()) {
    return fetchImageBuffer(target.look.imageUrl.trim(), siteOrigin);
  }

  const refs = refsForLook(target.look);
  const imageUrls = await resolveHairEditImageUrls(fal, clientFalUrl, target.look, siteOrigin, refs);
  const prompt =
    target.kind === 'client'
      ? buildClientPreviewHairOnlyPrompt(target.look, refs)
      : buildMatchThumbHairOnlyPrompt(target.look, refs, target.fieldId);

  const step = target.kind === 'client' ? 'Client preview hair' : `Thumb ${target.fieldId}`;
  const resultUrl = await runGptImage2HairEdit(fal, imageUrls, prompt, step);
  return fetchFalResultBuffer(resultUrl);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i]!);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** Generate styled hair photos for every image slot on the card (Fal GPT Image 2). */
export async function generateHairstyleHairImages(
  fal: FalClient,
  analysis: FalHairstyleAnalysis,
  clientPreviewUrl: string,
  siteOrigin: string
): Promise<Map<string, Buffer>> {
  const targets = collectHairImageTargets(analysis);
  if (targets.length === 0) return new Map();

  const clientFalUrl = await resolveHairstyleAnalysisImageUrl(
    fal,
    clientPreviewUrl,
    siteOrigin,
    'client-preview'
  );

  const clientTarget = targets.find((t) => t.kind === 'client');
  const thumbTargets = targets.filter((t) => t.kind === 'thumb');

  const out = new Map<string, Buffer>();

  if (clientTarget) {
    const clientBuf = await generateOneHairImage(fal, clientFalUrl, clientTarget, siteOrigin);
    out.set(clientTarget.fieldId, clientBuf);
  }

  const thumbConcurrency = Math.max(
    1,
    Number(process.env.HAIRSTYLE_ANALYSIS_HAIR_CONCURRENCY?.trim()) || 3
  );

  const thumbBuffers = await mapWithConcurrency(thumbTargets, thumbConcurrency, (target) =>
    generateOneHairImage(fal, clientFalUrl, target, siteOrigin).catch(async (e) => {
      console.warn(`[hairstyle-analysis-hair] ${target.fieldId} failed, using mannequin fallback:`, e);
      return fetchImageBuffer(hairstyleAnalysis3dMannequinFrontPath(target.look.unit), siteOrigin);
    })
  );

  thumbTargets.forEach((target, i) => {
    out.set(target.fieldId, thumbBuffers[i]!);
  });

  return out;
}
