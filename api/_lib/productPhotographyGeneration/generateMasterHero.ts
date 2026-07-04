import { uploadBufferToFalStorage } from '../productAssetFactory/ideogramCutout.js';
import { productAssetStoragePath, uploadProductAsset } from '../productAssetFactory/supabaseStorage.js';
import {
  compileAndValidatePhotographyBiblePrompt,
  PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE,
  validateCreativeDnaBeforeGeneration,
} from './promptCompiler.js';
import {
  PRODUCT_PHOTOGRAPHY_POC_UNIT,
  resolveDisplayBustFront,
} from './creativeDnaV1.js';
import {
  assertCanonicalGeneratedMasterUrl,
  isLocalPlaceholderAsset,
  logMasterHeroDebug,
  normalizeAssetPath,
  resolveAbsoluteAssetUrl,
} from './masterHeroValidation.js';
import {
  buildGptImage2MasterHeroFalInput,
  buildMasterHeroGenerationPackage,
  PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
  PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE,
  PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE_FALLBACK,
  PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET,
  PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_ID,
  validateLockedProviderSettings,
} from './providerPreset.js';
import type {
  MasterHeroGenerationRecord,
  ProductPhotographyGenerateAction,
  ProductPhotographyGenerateLogEntry,
} from './types.js';

/** @deprecated Use PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL — locked preset only. */
export const PRODUCT_PHOTOGRAPHY_FAL_MODEL = PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL;

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

function resolveBenchmarkHeroSrc(unitBenchmark: string, override?: string): string {
  const envOverride = process.env.PRODUCT_PHOTOGRAPHY_APPROVED_BENCHMARK_URL?.trim();
  return (override ?? envOverride ?? unitBenchmark).trim();
}

function shouldAttachBenchmark(benchmarkSrc: string, productRef: string, displayBust: string): boolean {
  if (isLocalPlaceholderAsset(benchmarkSrc)) return false;
  const benchmarkPath = normalizeAssetPath(benchmarkSrc);
  const displayPath = normalizeAssetPath(displayBust);
  if (benchmarkPath === displayPath) return false;
  if (/^https?:\/\//i.test(benchmarkSrc)) {
    return benchmarkPath !== normalizeAssetPath(productRef) || !isLocalPlaceholderAsset(productRef);
  }
  if (benchmarkSrc === productRef || benchmarkSrc === displayBust) return false;
  return true;
}

async function callGptImage2MasterHero(
  falKey: string,
  prompt: string,
  imageUrls: string[],
  logs: ProductPhotographyGenerateLogEntry[]
): Promise<{ result: unknown; imageSize: { width: number; height: number } }> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const sizes = [PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE, PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE_FALLBACK];
  let lastError: Error | null = null;

  for (const imageSize of sizes) {
    const label = `${imageSize.width}×${imageSize.height}`;
    logs.push(
      log(
        `Calling FAL ${PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL} · GPT Image 2 · ${label} · quality high · PNG · edit mode`
      )
    );

    try {
      const result = await fal.subscribe(PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL, {
        input: buildGptImage2MasterHeroFalInput(prompt, imageUrls, imageSize),
        logs: false,
      });
      const falImageUrl = extractFalImageUrl(result);
      if (!falImageUrl) {
        throw new Error(`GPT Image 2 returned no image URL at ${label}`);
      }
      return { result, imageSize };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (imageSize === PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE) {
        logs.push(
          log(
            `GPT Image 2 rejected ${label} — retrying same model at ${PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE_FALLBACK.width}×${PHOTOGRAPHY_BIBLE_MASTER_HERO_IMAGE_SIZE_FALLBACK.height} (no model fallback)`,
            'warn'
          )
        );
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error('GPT Image 2 generation failed');
}

export type GenerateMasterHeroInput = {
  action: ProductPhotographyGenerateAction;
  unitSlug: string;
  productReferenceImageSrc?: string;
  benchmarkHeroSrc?: string;
  includeBenchmarkAttachment?: boolean;
  requestedFalModel?: string;
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

/** Generate Master Hero Portrait via Fal GPT Image 2 using Creative DNA v1.0 locked preset. */
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
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
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
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
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
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
      logs: [log('SUPABASE_URL not configured', 'error')],
      error: 'SUPABASE_URL not configured',
    };
  }

  const productRef = (input.productReferenceImageSrc ?? unit.defaultProductRef).trim();
  const displayBust = resolveDisplayBustFront(unit.slug);
  const benchmarkSrc = resolveBenchmarkHeroSrc(unit.benchmarkHeroSrc, input.benchmarkHeroSrc);
  const attachBenchmark =
    (input.includeBenchmarkAttachment ?? input.action === 'generate-variants') &&
    shouldAttachBenchmark(benchmarkSrc, productRef, displayBust);

  const providerValidation = validateLockedProviderSettings({
    preset: PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET,
    benchmarkAssetSrc: benchmarkSrc,
    requestedModel: input.requestedFalModel,
  });

  logs.push(log(`Provider preset · ${PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET.name}`));
  logs.push(
    log(
      `Model · ${providerValidation.modelLabel} · Quality · ${providerValidation.qualityLabel} · Aspect · ${providerValidation.aspectRatio} · Resolution · ${providerValidation.resolution}`
    )
  );
  logs.push(
    log(
      `Prompt · Photography Bible ${providerValidation.promptVersion} · Creative DNA v${providerValidation.creativeDnaVersion} · Benchmark · ${benchmarkSrc}`
    )
  );

  if (providerValidation.status === 'blocked') {
    logs.push(log(providerValidation.validationMessage, 'error'));
    return {
      ok: false,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
      logs,
      error: providerValidation.blockedReason ?? providerValidation.validationMessage,
    };
  }

  logs.push(log('Creative DNA v1.0 validated — compiling locked Photography Bible prompt (placeholder substitution only)'));
  logs.push(log(`Action: ${input.action} · Unit: ${unit.label} · Generation ID: ${generationId}`));

  const dnaValidation = validateCreativeDnaBeforeGeneration();
  if (!dnaValidation.ok) {
    logs.push(log(dnaValidation.error, 'error'));
    return {
      ok: false,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
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
        `Template hash verified · ${promptValidation.lockedTemplateHash} · Photography Bible ${promptValidation.photographyBibleVersion} · ${promptValidation.finalPromptStatus}`
      )
    );
  } catch (compileErr) {
    const msg = compileErr instanceof Error ? compileErr.message : String(compileErr);
    logs.push(log(`Photography Bible prompt compiler aborted: ${msg}`, 'error'));
    return {
      ok: false,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
      logs,
      error: msg,
    };
  }

  if (promptValidation.validatorStatus !== 'passed') {
    const msg = promptValidation.validatorMessage ?? 'Photography Bible prompt validation failed';
    logs.push(log(msg, 'error'));
    return {
      ok: false,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
      logs,
      error: msg,
    };
  }

  try {
    logs.push(log(`Uploading Display Bust v1.0 reference to FAL · ${displayBust}`));
    const displayBustFalUrl = await uploadRefToFal(falKey, displayBust, 'display-bust');

    const imageUrls: string[] = [displayBustFalUrl];
    const referenceAssetsUsed: string[] = [displayBust];

    if (productRef !== displayBust) {
      logs.push(log(`Uploading product reference to FAL (input only) · ${productRef}`));
      imageUrls.push(await uploadRefToFal(falKey, productRef, 'product-ref'));
      referenceAssetsUsed.push(productRef);
    } else {
      logs.push(
        log(
          'Product reference matches display bust path — single attachment sent to FAL to avoid copy-through of placeholder',
          'warn'
        )
      );
    }

    if (attachBenchmark) {
      logs.push(log(`Uploading approved benchmark reference to FAL · ${benchmarkSrc}`));
      imageUrls.push(await uploadRefToFal(falKey, benchmarkSrc, 'benchmark'));
      referenceAssetsUsed.push(benchmarkSrc);
    } else if (isLocalPlaceholderAsset(benchmarkSrc)) {
      logs.push(
        log(
          'Benchmark attachment skipped — local placeholder; promote approved SOFT WAVE master hero to HTTPS benchmark for visual lock',
          'warn'
        )
      );
    } else {
      logs.push(log('Benchmark attachment skipped — would duplicate display bust or product reference'));
    }

    const prompt = compiledPrompt;

    const generationPackage = buildMasterHeroGenerationPackage({
      lockedTemplate: PHOTOGRAPHY_BIBLE_LOCKED_MASTER_TEMPLATE,
      compiledPrompt: prompt,
      promptValidation,
      providerValidation,
      displayBustSrc: displayBust,
      productReferenceSrc: productRef,
      benchmarkAssetSrc: benchmarkSrc,
      referenceAssetsUsed,
    });

    logMasterHeroDebug('FAL request starting', {
      generationId,
      model: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
      providerPreset: PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_ID,
      promptVersion: promptValidation.photographyBibleVersion,
      promptLocked: promptValidation.promptLocked,
      lockedTemplateHash: promptValidation.lockedTemplateHash,
      validatorStatus: promptValidation.validatorStatus,
      providerValidationStatus: providerValidation.status,
      variableInjectionSummary: promptValidation.variableInjectionSummary,
      promptSent: prompt.slice(0, 2000),
      imageUrlCount: imageUrls.length,
      productReferenceSrc: productRef,
      benchmarkSrc,
    });

    const { result, imageSize } = await callGptImage2MasterHero(falKey, prompt, imageUrls, logs);

    const falRequestId = extractFalRequestId(result);
    const falImageUrl = extractFalImageUrl(result);

    logMasterHeroDebug('FAL response received', {
      generationId,
      falRequestId: falRequestId ?? null,
      returnedImageUrl: falImageUrl ?? null,
      imageSize,
    });

    if (!falImageUrl) {
      throw new Error('GPT Image 2 returned no image URL — generation failed (no model fallback)');
    }
    if (isLocalPlaceholderAsset(falImageUrl)) {
      throw new Error(`GPT Image 2 returned a local placeholder URL (${falImageUrl}) — refusing as Master Hero`);
    }

    logs.push(
      log(
        `GPT Image 2 returned image URL · ${imageSize.width}×${imageSize.height}${falRequestId ? ` · request ${falRequestId}` : ''}`
      )
    );
    const masterBuf = await fetchImageBuffer(falImageUrl);

    const fileName = `generated-master-${Date.now()}.png`;
    const storagePath = productAssetStoragePath(unit.productLine, unit.slug, unit.version, fileName);
    logs.push(log(`Uploading GPT Image 2 output to Supabase · ${storagePath}`));
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
      promptVersion: promptValidation.photographyBibleVersion,
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
      providerPresetId: PHOTOGRAPHY_BIBLE_MASTER_HERO_PRESET_ID,
      providerValidation,
      generationPackage,
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
    logs.push(log('GPT Image 2 generation complete — canonical Master Hero ready for preview/approval'));

    return {
      ok: true,
      generatedMasterUrl: canonicalMasterHeroUrl,
      storagePath: upload.storagePath,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
      generation,
      logs,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logs.push(log(`GPT Image 2 generation failed — ${msg} (no silent model fallback)`, 'error'));
    logMasterHeroDebug('FAL generation failed', { generationId, error: msg });
    return {
      ok: false,
      productReferenceImageSrc: productRef,
      displayBustSrc: displayBust,
      falModel: PHOTOGRAPHY_BIBLE_MASTER_HERO_FAL_MODEL,
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
