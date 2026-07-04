import { uploadBufferToFalStorage } from '../productAssetFactory/ideogramCutout.js';
import { productAssetStoragePath, uploadProductAsset } from '../productAssetFactory/supabaseStorage.js';
import {
  compileAndValidatePhotographyBiblePrompt,
  validateCreativeDnaBeforeGeneration,
} from './promptCompiler.js';
import {
  PRODUCT_PHOTOGRAPHY_POC_UNIT,
  resolveDisplayBustFront,
} from './creativeDnaV1.js';
import {
  assertCanonicalGeneratedMasterUrl,
  CREATIVE_DNA_PROMPT_VERSION,
  isLocalPlaceholderAsset,
  logMasterHeroDebug,
  resolveAbsoluteAssetUrl,
} from './masterHeroValidation.js';
import type {
  MasterHeroGenerationRecord,
  ProductPhotographyGenerateAction,
  ProductPhotographyGenerateLogEntry,
} from './types.js';

export const PRODUCT_PHOTOGRAPHY_FAL_MODEL = 'fal-ai/nano-banana-pro/edit';

function log(message: string, level: ProductPhotographyGenerateLogEntry['level'] = 'info'): ProductPhotographyGenerateLogEntry {
  return { timestamp: new Date().toISOString(), message, level };
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadRefToFal(falKey: string, pathOrUrl: string, label: string): Promise<string> {
  const absolute = resolveAbsoluteAssetUrl(pathOrUrl);
  const buf = await fetchImageBuffer(absolute);
  const name = pathOrUrl.split('/').pop()?.split('?')[0] || `${label}.png`;
  return uploadBufferToFalStorage(falKey, buf, name);
}

function extractFalImageUrl(result: unknown): string | null {
  const data = (result as { data?: Record<string, unknown> })?.data ?? result;
  if (!data || typeof data !== 'object') return null;
  const candidates = [
    (data as { image?: { url?: string } }).image?.url,
    (data as { images?: Array<{ url?: string }> }).images?.[0]?.url,
    (data as { url?: string }).url,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
}

function extractFalRequestId(result: unknown): string | undefined {
  const root = result as { requestId?: string; request_id?: string };
  if (root.requestId?.trim()) return root.requestId.trim();
  if (root.request_id?.trim()) return root.request_id.trim();
  return undefined;
}

function shouldAttachBenchmark(benchmarkSrc: string, productRef: string, displayBust: string): boolean {
  if (benchmarkSrc === productRef || benchmarkSrc === displayBust) return false;
  return !isLocalPlaceholderAsset(benchmarkSrc);
}

export type GenerateMasterHeroInput = {
  action: ProductPhotographyGenerateAction;
  unitSlug: string;
  productReferenceImageSrc?: string;
  includeBenchmarkAttachment?: boolean;
};

export type GenerateMasterHeroOutput = {
  ok: boolean;
  generatedMasterUrl?: string;
  storagePath?: string;
  productReferenceImageSrc: string;
  displayBustSrc: string;
  falModel: string;
  generation?: MasterHeroGenerationRecord;
  logs: ProductPhotographyGenerateLogEntry[];
  error?: string;
};

/** Generate Master Hero Portrait via Fal using Creative DNA v1.0 package. SOFT WAVE POC. */
export async function generateMasterHeroFromCreativeDna(
  input: GenerateMasterHeroInput
): Promise<GenerateMasterHeroOutput> {
  const logs: ProductPhotographyGenerateLogEntry[] = [];
  const unit = PRODUCT_PHOTOGRAPHY_POC_UNIT;
  const generationId = `mh-${unit.slug}-${Date.now()}`;

  if (input.unitSlug !== unit.slug) {
    return {
      ok: false,
      productReferenceImageSrc: input.productReferenceImageSrc ?? unit.defaultProductRef,
      displayBustSrc: resolveDisplayBustFront(input.unitSlug),
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs: [log(`Only ${unit.slug} POC is enabled`, 'error')],
      error: `Only ${unit.slug} POC is enabled`,
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    return {
      ok: false,
      productReferenceImageSrc: input.productReferenceImageSrc ?? unit.defaultProductRef,
      displayBustSrc: resolveDisplayBustFront(unit.slug),
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs: [log('FAL_KEY not configured — cannot call FAL generation endpoint', 'error')],
      error: 'FAL_KEY not configured',
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return {
      ok: false,
      productReferenceImageSrc: input.productReferenceImageSrc ?? unit.defaultProductRef,
      displayBustSrc: resolveDisplayBustFront(unit.slug),
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs: [log('SUPABASE_URL not configured', 'error')],
      error: 'SUPABASE_URL not configured',
    };
  }

  const productRef = (input.productReferenceImageSrc ?? unit.defaultProductRef).trim();
  const displayBust = resolveDisplayBustFront(unit.slug);
  const attachBenchmark =
    (input.includeBenchmarkAttachment ?? input.action === 'generate-variants') &&
    shouldAttachBenchmark(unit.benchmarkHeroSrc, productRef, displayBust);

  logs.push(log('Creative DNA v1.0 validated — compiling locked Photography Bible prompt (placeholder substitution only)'));
  logs.push(log(`Action: ${input.action} · Unit: ${unit.label} · Generation ID: ${generationId}`));

  const dnaValidation = validateCreativeDnaBeforeGeneration();
  if (!dnaValidation.ok) {
    logs.push(log(dnaValidation.error, 'error'));
    return {
      ok: false,
      productReferenceImageSrc: input.productReferenceImageSrc ?? unit.defaultProductRef,
      displayBustSrc: resolveDisplayBustFront(unit.slug),
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs,
      error: dnaValidation.error,
    };
  }

  let compiledPrompt: string;
  let promptValidation: import('./promptCompiler.js').PhotographyBiblePromptValidation;
  try {
    const compiled = compileAndValidatePhotographyBiblePrompt({
      unitName: unit.label,
      collectionNumber: unit.collectionNumber,
      texture: unit.texture,
      length: unit.length,
      density: unit.density,
      lace: unit.lace,
    });
    compiledPrompt = compiled.compiledPrompt;
    promptValidation = compiled.validation;
    logs.push(
      log(
        `Prompt locked · hash ${promptValidation.promptHash} · Photography Bible ${promptValidation.photographyBibleVersion} · ${promptValidation.variableInjectionSummary}`
      )
    );
  } catch (compileErr) {
    const msg = compileErr instanceof Error ? compileErr.message : String(compileErr);
    logs.push(log(`Photography Bible prompt compiler aborted: ${msg}`, 'error'));
    return {
      ok: false,
      productReferenceImageSrc: input.productReferenceImageSrc ?? unit.defaultProductRef,
      displayBustSrc: resolveDisplayBustFront(unit.slug),
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs,
      error: msg,
    };
  }

  try {
    logs.push(log(`Uploading Display Bust v1.0 reference to FAL · ${displayBust}`));
    const displayBustFalUrl = await uploadRefToFal(falKey, displayBust, 'display-bust');

    const imageUrls: string[] = [displayBustFalUrl];
    if (productRef !== displayBust) {
      logs.push(log(`Uploading product reference to FAL (input only) · ${productRef}`));
      imageUrls.push(await uploadRefToFal(falKey, productRef, 'product-ref'));
    } else {
      logs.push(
        log(
          'Product reference matches display bust path — single attachment sent to FAL to avoid copy-through of placeholder',
          'warn'
        )
      );
    }

    if (attachBenchmark) {
      logs.push(log(`Uploading benchmark reference to FAL · ${unit.benchmarkHeroSrc}`));
      imageUrls.push(await uploadRefToFal(falKey, unit.benchmarkHeroSrc, 'benchmark'));
    } else {
      logs.push(log('Benchmark attachment skipped — would duplicate product/display reference'));
    }

    const prompt = compiledPrompt;

    logMasterHeroDebug('FAL request starting', {
      generationId,
      model: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      promptVersion: CREATIVE_DNA_PROMPT_VERSION,
      promptLocked: promptValidation.promptLocked,
      promptHash: promptValidation.promptHash,
      photographyBibleVersion: promptValidation.photographyBibleVersion,
      variableInjectionSummary: promptValidation.variableInjectionSummary,
      promptSent: prompt.slice(0, 2000),
      imageUrlCount: imageUrls.length,
      productReferenceSrc: productRef,
    });

    logs.push(log(`Calling FAL endpoint ${PRODUCT_PHOTOGRAPHY_FAL_MODEL} (1:1 · 4K · PNG)`));
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    const result = await fal.subscribe(PRODUCT_PHOTOGRAPHY_FAL_MODEL, {
      input: {
        prompt,
        image_urls: imageUrls,
        aspect_ratio: '1:1',
        resolution: '4K',
        output_format: 'png',
        num_images: 1,
      },
      logs: false,
    });

    const falRequestId = extractFalRequestId(result);
    const falImageUrl = extractFalImageUrl(result);

    logMasterHeroDebug('FAL response received', {
      generationId,
      falRequestId: falRequestId ?? null,
      returnedImageUrl: falImageUrl ?? null,
    });

    if (!falImageUrl) {
      throw new Error('FAL returned no image URL — generation failed');
    }
    if (isLocalPlaceholderAsset(falImageUrl)) {
      throw new Error(`FAL returned a local placeholder URL (${falImageUrl}) — refusing as Master Hero`);
    }

    logs.push(log(`FAL returned image URL · awaiting download${falRequestId ? ` · request ${falRequestId}` : ''}`));
    const masterBuf = await fetchImageBuffer(falImageUrl);

    const fileName = `generated-master-${Date.now()}.png`;
    const storagePath = productAssetStoragePath(unit.productLine, unit.slug, unit.version, fileName);
    logs.push(log(`Uploading FAL output to Supabase · ${storagePath}`));
    const upload = await uploadProductAsset(storagePath, masterBuf, 'image/png');

    const canonicalMasterHeroUrl = upload.publicUrl;
    const generatedAt = new Date().toISOString();

    assertCanonicalGeneratedMasterUrl({
      canonicalUrl: canonicalMasterHeroUrl,
      productReferenceSrc: productRef,
      falOriginalUrl: falImageUrl,
      context: 'generateMasterHeroFromCreativeDna',
    });

    const generation: MasterHeroGenerationRecord = {
      generationId,
      falRequestId,
      falOriginalImageUrl: falImageUrl,
      canonicalMasterHeroUrl,
      generatedAt,
      promptVersion: CREATIVE_DNA_PROMPT_VERSION,
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      productReferenceSrc: productRef,
      promptValidation,
      debugLog: {
        promptSent: prompt,
        falRequestId,
        returnedImageUrl: falImageUrl,
        finalMasterHeroUrl: canonicalMasterHeroUrl,
      },
    };

    logMasterHeroDebug('Master Hero canonical asset stored', {
      generationId,
      falRequestId: falRequestId ?? null,
      returnedImageUrl: falImageUrl,
      finalMasterHeroUrl: canonicalMasterHeroUrl,
      imagePassedToBackgroundRemoval: '(pending hero approval)',
    });

    logs.push(log(`Master Hero stored at ${canonicalMasterHeroUrl}`));
    logs.push(log('FAL generation complete — canonical Master Hero ready for preview/approval'));

    return {
      ok: true,
      generatedMasterUrl: canonicalMasterHeroUrl,
      storagePath: upload.storagePath,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      generation,
      logs,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logs.push(log(msg, 'error'));
    logMasterHeroDebug('FAL generation failed', { generationId, error: msg });
    return {
      ok: false,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PRODUCT_PHOTOGRAPHY_FAL_MODEL,
      logs,
      error: msg,
    };
  }
}

/** Update generation record when background removal begins (derivative phase). */
export function attachBackgroundRemovalToGeneration(
  generation: MasterHeroGenerationRecord,
  masterUrlUsed: string
): MasterHeroGenerationRecord {
  const next = {
    ...generation,
    backgroundRemovalInputUrl: masterUrlUsed,
    debugLog: {
      ...generation.debugLog,
      imagePassedToBackgroundRemoval: masterUrlUsed,
    },
  };
  logMasterHeroDebug('Background removal input', {
    generationId: generation.generationId,
    imagePassedToBackgroundRemoval: masterUrlUsed,
    returnedImageUrl: generation.falOriginalImageUrl,
    finalMasterHeroUrl: generation.canonicalMasterHeroUrl,
  });
  return next;
}
