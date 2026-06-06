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

function tryOnIdeogramOnly(): boolean {
  const v = (process.env.WIG_PREVIEW_TRYON_IDEOGRAM_ONLY || 'true').trim().toLowerCase();
  return v !== 'false' && v !== '0';
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
};

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

  return { manifestHash, missing };
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

async function generateHairOnlyOverlayFromPortrait(fal: FalClient, portraitUrl: string): Promise<Buffer> {
  if (tryOnIdeogramOnly()) {
    const cutResult = await fal.subscribe(LIVE_TRY_ON_IDEOGRAM_MODEL, {
      input: { image_url: portraitUrl },
      logs: false,
    });
    const cutUrl = extractFalImageUrl(cutResult);
    if (cutUrl) {
      const buf = await downloadUrlToBuffer(cutUrl);
      try {
        await validateHairOnlyOverlayPng(buf);
        return buf;
      } catch {
        /* fall through */
      }
    }
  }

  const resolution = readTryOnFalResolution();
  const nbpResult = await fal.subscribe(LIVE_TRY_ON_FAL_NBP_EDIT, {
    input: {
      prompt: LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT,
      image_urls: [portraitUrl],
      aspect_ratio: 'auto',
      resolution,
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });
  const nbpUrl = extractFalImageUrl(nbpResult);
  if (!nbpUrl) throw new Error('fal: no hair isolation URL');

  const cutResult = await fal.subscribe(LIVE_TRY_ON_IDEOGRAM_MODEL, {
    input: { image_url: nbpUrl },
    logs: false,
  });
  const cutUrl = extractFalImageUrl(cutResult);
  if (!cutUrl) throw new Error('fal: no Ideogram cutout URL');

  const buf = await downloadUrlToBuffer(cutUrl);
  await validateHairOnlyOverlayPng(buf);
  return buf;
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

  const { data: pubPortrait } = supabase.storage.from(bucket).getPublicUrl(portraitPath);
  const portraitUrl = pubPortrait?.publicUrl ? `${pubPortrait.publicUrl}?t=${Date.now()}` : '';
  if (!portraitUrl) throw new Error('portrait public URL missing');

  const overlayBuf = await generateHairOnlyOverlayFromPortrait(fal, portraitUrl);
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
