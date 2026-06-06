import { Jimp } from 'jimp';
import { catalogColorForPrompt } from './bawCatalogHairColors.js';
import {
  buildLiveTryOnPhotorealWomanPrompt,
  falEditModelId,
  LIVE_TRY_ON_FAL_NBP_EDIT,
  LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT,
  LIVE_TRY_ON_IDEOGRAM_MODEL,
  liveTryOnOverlayStoragePath,
  liveTryOnPortraitStoragePath,
  type LiveTryOnAngle,
  type LiveTryOnPhotoModel,
} from './liveTryOnOverlay.js';
import { getSupabaseAdminServiceRole } from './supabase.js';
import {
  wigPreviewLiveAnglePaths,
  wigPreviewManifestHashLiveColorTier,
  type WigPreviewSelections,
} from './wigPreviewSelectionHash.js';

export type LiveTryOnBatchStep = 'portrait' | 'overlay';

export type LiveTryOnBatchJob = {
  unitKey: string;
  length: string;
  density: string;
  lace: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  addOns: string[];
};

function readTryOnFalResolution(): '1K' | '2K' | '4K' {
  const tryOn = process.env.WIG_PREVIEW_TRYON_FAL_RESOLUTION?.trim().toUpperCase();
  if (tryOn === '1K' || tryOn === '2K' || tryOn === '4K') return tryOn;
  const global = process.env.WIG_PREVIEW_FAL_RESOLUTION?.trim().toUpperCase();
  if (global === '1K' || global === '2K' || global === '4K') return global;
  return '1K';
}

async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`download failed ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function extractFalImageUrl(result: unknown): string | null {
  const url = (result as { data?: { images?: { url?: string }[]; image?: { url?: string } } })?.data
    ?.images?.[0]?.url;
  if (url) return url;
  return (result as { data?: { image?: { url?: string } } })?.data?.image?.url ?? null;
}

type FalClient = {
  subscribe: (model: string, opts: { input: Record<string, unknown>; logs: boolean }) => Promise<unknown>;
  storage: { upload: (file: File) => Promise<string> };
};

function mimeForStoragePath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/webp';
}

function formatFalSubscribeError(e: unknown, stepLabel: string): Error {
  const raw = e instanceof Error ? e.message : String(e);
  if (/unprocessable entity/i.test(raw) || /\b422\b/.test(raw)) {
    return new Error(
      `${stepLabel}: Fal rejected the image (422 Unprocessable Entity). Fal could not fetch or read the input — we now re-upload to Fal storage before each step.`
    );
  }
  return new Error(`${stepLabel}: ${raw}`);
}

/** Fal often 422s on raw Supabase public URLs — download via service role, upload to Fal storage. */
async function uploadStorageObjectToFal(
  fal: FalClient,
  bucket: string,
  path: string,
  fileName: string
): Promise<string> {
  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) {
    throw new Error(`storage download failed for ${path}: ${error?.message || 'missing'}`);
  }
  const buf = Buffer.from(await data.arrayBuffer());
  const mime = mimeForStoragePath(path);
  const file = new File([buf], fileName, { type: mime });
  return fal.storage.upload(file);
}

async function uploadRemoteUrlToFal(fal: FalClient, url: string, fileName: string): Promise<string> {
  const buf = await downloadUrlToBuffer(url);
  const mime = mimeForStoragePath(fileName);
  const file = new File([buf], fileName, { type: mime });
  return fal.storage.upload(file);
}

async function falHostedImageUrl(fal: FalClient, url: string, fileName: string): Promise<string> {
  if (/fal\.(media|run)|fal-cdn|fal\.files/i.test(url)) return url;
  return uploadRemoteUrlToFal(fal, url, fileName);
}

async function validateHairOnlyOverlayPng(buf: Buffer): Promise<void> {
  const img = await Jimp.read(buf);
  const w = img.width;
  const h = img.height;
  if (w < 64 || h < 64) throw new Error('overlay too small');

  const sample = (u: number, v: number): number => {
    const x = Math.min(w - 1, Math.max(0, Math.floor(u * w)));
    const y = Math.min(h - 1, Math.max(0, Math.floor(v * h)));
    return img.getPixelColor(x, y) & 0xff;
  };

  if (sample(0.5, 0.42) > 90 && sample(0.5, 0.14) > 90) {
    throw new Error('overlay still contains an opaque face');
  }
  if (sample(0.5, 0.72) > 120 && sample(0.5, 0.14) > 120) {
    throw new Error('overlay still contains shoulders or bust');
  }
  if (sample(0.5, 0.14) < 40) {
    throw new Error('overlay missing visible hair at top');
  }
}

export async function storageObjectExists(bucket: string, path: string): Promise<boolean> {
  const supabase = getSupabaseAdminServiceRole();
  const { error } = await supabase.storage.from(bucket).download(path);
  return !error;
}

export function jobToSelections(job: LiveTryOnBatchJob): WigPreviewSelections {
  return {
    unitKey: String(job.unitKey || 'NOIR').toUpperCase(),
    length: job.length,
    density: job.density,
    lace: job.lace,
    texture: job.texture,
    color: job.color.toUpperCase().replace(/\s+/g, ' ').trim(),
    hairline: job.hairline,
    styling: 'NONE',
    addOns: Array.isArray(job.addOns) ? job.addOns.map((x) => String(x).toUpperCase()) : [],
  };
}

export type LiveTryOnBatchMissingStep = {
  step: 'color' | LiveTryOnBatchStep;
  angle: LiveTryOnAngle;
  photoModel?: LiveTryOnPhotoModel;
};

const ANGLES: LiveTryOnAngle[] = ['left', 'front', 'right'];

export async function listMissingLiveTryOnBatchSteps(
  job: LiveTryOnBatchJob,
  photoModels: LiveTryOnPhotoModel[]
): Promise<{ manifestHash: string; missing: LiveTryOnBatchMissingStep[] }> {
  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  const selections = jobToSelections(job);
  const manifestHash = wigPreviewManifestHashLiveColorTier(selections);
  const unitKey = selections.unitKey;
  const colorPaths = wigPreviewLiveAnglePaths(promptVersion, unitKey, manifestHash);
  const missing: LiveTryOnBatchMissingStep[] = [];

  for (const angle of ANGLES) {
    const colorOk = await storageObjectExists(bucket, colorPaths[angle]);
    if (!colorOk) {
      missing.push({ step: 'color', angle });
      continue;
    }

    for (const photoModel of photoModels) {
      const portraitPath = liveTryOnPortraitStoragePath(
        promptVersion,
        unitKey,
        manifestHash,
        photoModel,
        angle
      );
      const overlayPath = liveTryOnOverlayStoragePath(
        promptVersion,
        unitKey,
        manifestHash,
        photoModel,
        angle
      );
      const hasPortrait = await storageObjectExists(bucket, portraitPath);
      if (!hasPortrait) {
        missing.push({ step: 'portrait', angle, photoModel });
        continue;
      }
      const hasOverlay = await storageObjectExists(bucket, overlayPath);
      if (!hasOverlay) {
        missing.push({ step: 'overlay', angle, photoModel });
      }
    }
  }

  return { manifestHash, missing: sortLiveTryOnBatchMissingSteps(missing) };
}

async function generatePhotorealPortrait(
  fal: FalClient,
  photoModel: LiveTryOnPhotoModel,
  mannequinColorUrl: string,
  prompt: string
): Promise<Buffer> {
  const falModel = falEditModelId(photoModel);
  const resolution = readTryOnFalResolution();

  if (photoModel === 'gpt2') {
    const result = await fal.subscribe(falModel, {
      input: {
        prompt,
        image_urls: [mannequinColorUrl],
        image_size: 'auto',
        quality: 'medium',
        output_format: 'webp',
        num_images: 1,
      },
      logs: false,
    });
    const url = extractFalImageUrl(result);
    if (!url) throw new Error('fal: no GPT Image 2 portrait URL');
    return downloadUrlToBuffer(url);
  }

  const result = await fal.subscribe(falModel, {
    input: {
      prompt,
      image_urls: [mannequinColorUrl],
      aspect_ratio: 'auto',
      resolution,
      output_format: 'webp',
      num_images: 1,
    },
    logs: false,
  });
  const url = extractFalImageUrl(result);
  if (!url) throw new Error('fal: no NBP portrait URL');
  return downloadUrlToBuffer(url);
}

/**
 * Photoreal portraits still contain a face — Ideogram bg-remove alone is not hair-only.
 * Always NBP hair isolation → Ideogram alpha (2 Fal jobs max per attempt).
 */
async function generateHairOnlyOverlayFromPortrait(fal: FalClient, portraitUrl: string): Promise<Buffer> {
  const resolution = readTryOnFalResolution();
  const skipValidate =
    (process.env.WIG_PREVIEW_TRYON_OVERLAY_SKIP_VALIDATE || '').trim().toLowerCase() === 'true';

  const runPipeline = async (): Promise<Buffer> => {
    const portraitFalUrl = await falHostedImageUrl(fal, portraitUrl, 'tryon-portrait-input.webp');

    let nbpResult: unknown;
    try {
      nbpResult = await fal.subscribe(LIVE_TRY_ON_FAL_NBP_EDIT, {
        input: {
          prompt: LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT,
          image_urls: [portraitFalUrl],
          aspect_ratio: 'auto',
          resolution,
          output_format: 'png',
          num_images: 1,
        },
        logs: false,
      });
    } catch (e) {
      throw formatFalSubscribeError(e, 'NBP hair isolation');
    }
    const nbpUrl = extractFalImageUrl(nbpResult);
    if (!nbpUrl) throw new Error('fal: no hair isolation URL');

    const nbpFalUrl = await falHostedImageUrl(fal, nbpUrl, 'tryon-nbp-isolate.png');

    let cutResult: unknown;
    try {
      cutResult = await fal.subscribe(LIVE_TRY_ON_IDEOGRAM_MODEL, {
        input: { image_url: nbpFalUrl },
        logs: false,
      });
    } catch (e) {
      throw formatFalSubscribeError(e, 'Ideogram cutout');
    }
    const cutUrl = extractFalImageUrl(cutResult);
    if (!cutUrl) throw new Error('fal: no Ideogram cutout URL');

    return downloadUrlToBuffer(cutUrl);
  };

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const buf = await runPipeline();
      try {
        await validateHairOnlyOverlayPng(buf);
      } catch (ve) {
        if (skipValidate || attempt === 1) return buf;
        throw ve;
      }
      return buf;
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error('overlay generation failed');
}

const BATCH_STEP_ORDER: Record<LiveTryOnBatchMissingStep['step'], number> = {
  color: 0,
  portrait: 1,
  overlay: 2,
};

const BATCH_ANGLE_ORDER: Record<LiveTryOnAngle, number> = {
  left: 0,
  front: 1,
  right: 2,
};

export function sortLiveTryOnBatchMissingSteps(
  missing: LiveTryOnBatchMissingStep[]
): LiveTryOnBatchMissingStep[] {
  return [...missing].sort((a, b) => {
    const stepDelta = BATCH_STEP_ORDER[a.step] - BATCH_STEP_ORDER[b.step];
    if (stepDelta !== 0) return stepDelta;
    const angleDelta = BATCH_ANGLE_ORDER[a.angle] - BATCH_ANGLE_ORDER[b.angle];
    if (angleDelta !== 0) return angleDelta;
    return String(a.photoModel || '').localeCompare(String(b.photoModel || ''));
  });
}

export type RunLiveTryOnBatchStepResult = {
  ok: boolean;
  skipped?: boolean;
  step: LiveTryOnBatchStep;
  angle: LiveTryOnAngle;
  photoModel: LiveTryOnPhotoModel;
  manifestHash: string;
};

export async function runLiveTryOnBatchStep(opts: {
  job: LiveTryOnBatchJob;
  step: LiveTryOnBatchStep;
  angle: LiveTryOnAngle;
  photoModel: LiveTryOnPhotoModel;
  forceRegenerate?: boolean;
}): Promise<RunLiveTryOnBatchStepResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY is not configured');

  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  const selections = jobToSelections(opts.job);
  const catalog = catalogColorForPrompt(selections.color);
  if (!catalog) throw new Error(`Unknown color: ${selections.color}`);

  const unitKey = selections.unitKey;
  const manifestHash = wigPreviewManifestHashLiveColorTier(selections);
  const colorPaths = wigPreviewLiveAnglePaths(promptVersion, unitKey, manifestHash);
  const portraitPath = liveTryOnPortraitStoragePath(
    promptVersion,
    unitKey,
    manifestHash,
    opts.photoModel,
    opts.angle
  );
  const overlayPath = liveTryOnOverlayStoragePath(
    promptVersion,
    unitKey,
    manifestHash,
    opts.photoModel,
    opts.angle
  );

  const supabase = getSupabaseAdminServiceRole();

  if (opts.step === 'portrait' && !opts.forceRegenerate) {
    if (await storageObjectExists(bucket, portraitPath)) {
      return {
        ok: true,
        skipped: true,
        step: opts.step,
        angle: opts.angle,
        photoModel: opts.photoModel,
        manifestHash,
      };
    }
  }

  if (opts.step === 'overlay' && !opts.forceRegenerate) {
    if (await storageObjectExists(bucket, overlayPath)) {
      return {
        ok: true,
        skipped: true,
        step: opts.step,
        angle: opts.angle,
        photoModel: opts.photoModel,
        manifestHash,
      };
    }
  }

  const colorPath = colorPaths[opts.angle];
  if (!(await storageObjectExists(bucket, colorPath))) {
    throw new Error('COLOR_PREVIEW_MISSING');
  }

  const { data: pubColor } = supabase.storage.from(bucket).getPublicUrl(colorPath);
  const mannequinUrl = pubColor?.publicUrl;
  if (!mannequinUrl) throw new Error('mannequin color URL missing');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  if (opts.step === 'portrait') {
    const womanPrompt = buildLiveTryOnPhotorealWomanPrompt(catalog.label, catalog.hex, opts.angle);
    const portraitBuf = await generatePhotorealPortrait(
      fal,
      opts.photoModel,
      mannequinUrl,
      womanPrompt
    );
    const { error: upErr } = await supabase.storage.from(bucket).upload(portraitPath, portraitBuf, {
      contentType: 'image/webp',
      upsert: true,
    });
    if (upErr) throw new Error(`upload portrait: ${upErr.message}`);
    return {
      ok: true,
      step: opts.step,
      angle: opts.angle,
      photoModel: opts.photoModel,
      manifestHash,
    };
  }

  if (!(await storageObjectExists(bucket, portraitPath))) {
    throw new Error('PORTRAIT_MISSING');
  }

  const portraitFalUrl = await uploadStorageObjectToFal(
    fal,
    bucket,
    portraitPath,
    `tryon-portrait-${opts.photoModel}-${opts.angle}.webp`
  );

  const overlayBuf = await generateHairOnlyOverlayFromPortrait(fal, portraitFalUrl);
  const { error: upOverlay } = await supabase.storage.from(bucket).upload(overlayPath, overlayBuf, {
    contentType: 'image/png',
    upsert: true,
  });
  if (upOverlay) throw new Error(`upload overlay: ${upOverlay.message}`);

  return {
    ok: true,
    step: opts.step,
    angle: opts.angle,
    photoModel: opts.photoModel,
    manifestHash,
  };
}
