import { randomUUID } from 'crypto';
import { Jimp } from 'jimp';
import { catalogColorForPrompt } from './bawCatalogHairColors.js';
import { liveTryOnStorageLookupJob } from './liveTryOnBatchManifest.js';
import {
  jobToSelections,
  storageObjectExists,
} from './liveTryOnBatchGenerate.js';
import {
  activeLiveTryOnStudioPhotoModel,
  buildLiveTryOnStudioMakeupPassPrompt,
  buildLiveTryOnStudioMakeupPassPromptCompact,
  buildLiveTryOnStudioTryOnPrompt,
  buildLiveTryOnStudioTryOnPromptCompact,
  falEditModelId,
  liveTryOnPortraitStoragePath,
  type LiveTryOnAngle,
  type LiveTryOnPhotoModel,
} from './liveTryOnOverlay.js';
import { getSupabaseAdminServiceRole } from './supabase.js';
import {
  wigPreviewLiveAnglePaths,
  wigPreviewManifestHashLiveColorTier,
} from './wigPreviewSelectionHash.js';

const STUDIO_CAPTURE_MAX_PX = 1024;
const STUDIO_JOB_MAX_AGE_MS = 15 * 60 * 1000;

type FalClient = {
  storage: { upload: (file: File) => Promise<string> };
  queue: {
    submit: (
      model: string,
      opts: { input: Record<string, unknown>; logs?: boolean }
    ) => Promise<{ request_id: string }>;
    status: (model: string, opts: { requestId: string }) => Promise<{ status: string }>;
    result: (model: string, opts: { requestId: string }) => Promise<unknown>;
  };
};

export type StudioTryOnPhase = 'base' | 'base_complete' | 'makeup';

export type StudioTryOnJobRecord = {
  jobId: string;
  userId: string;
  falRequestId: string;
  falModel: string;
  photoModel: LiveTryOnPhotoModel;
  manifestHash: string;
  unitKey: string;
  color: string;
  poseAngle: LiveTryOnAngle;
  createdAt: number;
  phase: StudioTryOnPhase;
  /** Public URL after base wig render completes (before optional makeup pass). */
  naturalImageUrl?: string;
  /** Storage path for re-uploading natural render to Fal for makeup. */
  naturalStoragePath?: string;
  /** Shared timestamp for natural/makeup storage filenames. */
  outputTimestamp?: number;
};

function readTryOnFalResolution(): '1K' | '2K' | '4K' {
  const tryOn = process.env.WIG_PREVIEW_TRYON_FAL_RESOLUTION?.trim().toUpperCase();
  if (tryOn === '1K' || tryOn === '2K' || tryOn === '4K') return tryOn;
  const global = process.env.WIG_PREVIEW_FAL_RESOLUTION?.trim().toUpperCase();
  if (global === '1K' || global === '2K' || global === '4K') return global;
  return '1K';
}

type FalValidationError = Error & {
  status?: number;
  body?: { detail?: unknown; message?: string };
};

function isFalValidationError(e: unknown): boolean {
  const err = e as FalValidationError;
  return err?.status === 422 || /unprocessable entity/i.test(String(err?.message || e));
}

type StudioFalInputOverrides = {
  quality?: 'low' | 'medium' | 'high' | 'auto';
  output_format?: 'webp' | 'png' | 'jpeg';
  omitImageSize?: boolean;
};

function formatStudioFalError(e: unknown, step: string): Error {
  const err = e as FalValidationError & { name?: string };
  const raw = err?.message || String(e);
  const detail = err?.body?.detail;
  const bodyMsg = typeof err?.body?.message === 'string' ? err.body.message : '';
  let detailStr = '';
  if (typeof detail === 'string') detailStr = detail;
  else if (Array.isArray(detail)) {
    detailStr = detail
      .map((d) =>
        typeof d === 'object' && d && 'msg' in d ? String((d as { msg: string }).msg) : JSON.stringify(d)
      )
      .filter(Boolean)
      .join('; ');
  } else if (detail != null) detailStr = JSON.stringify(detail);
  else if (err?.body && typeof err.body === 'object') {
    try {
      detailStr = JSON.stringify(err.body);
    } catch {
      /* ignore */
    }
  }

  if (isFalValidationError(e) || err?.name === 'ValidationError') {
    const hint = [detailStr, bodyMsg, raw].filter(Boolean).join(' — ');
    return new Error(`${step} rejected by Fal: ${hint}`);
  }
  return new Error(`${step}: ${raw}${detailStr ? ` — ${detailStr}` : ''}`);
}

async function submitStudioFalJob(
  fal: FalClient,
  falModel: string,
  photoModel: LiveTryOnPhotoModel,
  imageUrls: string[],
  prompt: string,
  inputOverrides?: StudioFalInputOverrides
): Promise<string> {
  const falInput = buildStudioFalInput(photoModel, imageUrls, prompt, inputOverrides);
  try {
    const { request_id: falRequestId } = await fal.queue.submit(falModel, {
      input: falInput,
      logs: false,
    });
    return falRequestId;
  } catch (e) {
    throw formatStudioFalError(
      e,
      `Studio render (${photoModel}, ${imageUrls.length} ref image${imageUrls.length === 1 ? '' : 's'})`
    );
  }
}

type StudioSubmitAttempt = {
  photoModel: LiveTryOnPhotoModel;
  imageUrls: string[];
  prompt: string;
  inputOverrides?: StudioFalInputOverrides;
};

async function submitStudioRenderWithFallbacks(
  fal: FalClient,
  preferredModel: LiveTryOnPhotoModel,
  label: string,
  hex: string,
  poseAngle: LiveTryOnAngle,
  headYawDeg: number | undefined,
  selfieUrl: string,
  mannequinUrl: string,
  portraitUrl?: string
): Promise<{ falRequestId: string; photoModel: LiveTryOnPhotoModel; falModel: string }> {
  const twoUrls = [selfieUrl, mannequinUrl];
  const threeUrls = portraitUrl ? [...twoUrls, portraitUrl] : twoUrls;
  const twoImgPrompt = buildLiveTryOnStudioTryOnPrompt(label, hex, poseAngle, {
    hasPortraitRef: false,
    headYawDeg,
  });
  const compactPrompt = buildLiveTryOnStudioTryOnPromptCompact(label, hex, poseAngle, headYawDeg);

  const attempts: StudioSubmitAttempt[] = [
    { photoModel: preferredModel, imageUrls: twoUrls, prompt: twoImgPrompt },
    {
      photoModel: preferredModel,
      imageUrls: twoUrls,
      prompt: twoImgPrompt,
      inputOverrides: { omitImageSize: true },
    },
    {
      photoModel: 'gpt2',
      imageUrls: twoUrls,
      prompt: twoImgPrompt,
      inputOverrides: { quality: 'low' },
    },
    {
      photoModel: 'gpt2',
      imageUrls: twoUrls,
      prompt: compactPrompt,
      inputOverrides: { output_format: 'png', quality: 'low', omitImageSize: true },
    },
    {
      photoModel: 'gpt2',
      imageUrls: twoUrls,
      prompt: compactPrompt,
      inputOverrides: { output_format: 'jpeg', quality: 'low', omitImageSize: true },
    },
    { photoModel: 'nbp', imageUrls: twoUrls, prompt: compactPrompt },
  ];

  if (portraitUrl) {
    attempts.push({
      photoModel: preferredModel,
      imageUrls: threeUrls,
      prompt: buildLiveTryOnStudioTryOnPrompt(label, hex, poseAngle, {
        hasPortraitRef: true,
        headYawDeg,
      }),
    });
  }

  const seen = new Set<string>();
  let lastErr: Error | undefined;

  for (const attempt of attempts) {
    const key = `${attempt.photoModel}|${attempt.imageUrls.length}|${attempt.prompt.length}|${JSON.stringify(attempt.inputOverrides || {})}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const falModel = falEditModelId(attempt.photoModel);
    try {
      const falRequestId = await submitStudioFalJob(
        fal,
        falModel,
        attempt.photoModel,
        attempt.imageUrls,
        attempt.prompt,
        attempt.inputOverrides
      );
      return { falRequestId, photoModel: attempt.photoModel, falModel };
    } catch (e) {
      if (!isFalValidationError(e)) throw e;
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastErr ?? new Error('Studio render rejected by Fal');
}

async function submitStudioMakeupWithFallbacks(
  fal: FalClient,
  job: StudioTryOnJobRecord,
  naturalFalUrl: string
): Promise<string> {
  const attempts = [
    { prompt: buildLiveTryOnStudioMakeupPassPrompt(), overrides: undefined as StudioFalInputOverrides | undefined },
    {
      prompt: buildLiveTryOnStudioMakeupPassPrompt(),
      overrides: { quality: 'low' as const, omitImageSize: true },
    },
    {
      prompt: buildLiveTryOnStudioMakeupPassPromptCompact(),
      overrides: { output_format: 'png' as const, quality: 'low' as const, omitImageSize: true },
    },
  ];
  let lastErr: Error | undefined;
  for (const attempt of attempts) {
    try {
      return await submitStudioFalJob(
        fal,
        job.falModel,
        job.photoModel,
        [naturalFalUrl],
        attempt.prompt,
        attempt.overrides
      );
    } catch (e) {
      if (!isFalValidationError(e)) throw e;
      lastErr = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastErr ?? new Error('Studio makeup rejected by Fal');
}

async function getFalClient(falKey: string): Promise<FalClient> {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  return fal as unknown as FalClient;
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

function parseDataUrl(dataUrl: string): { mime: string; buf: Buffer } {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl.trim());
  if (!m) throw new Error('Invalid image data URL');
  const mime = m[1].toLowerCase();
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length < 1024) throw new Error('Image too small');
  if (buf.length > 12_000_000) throw new Error('Image too large — move closer or use lower resolution');
  return { mime, buf };
}

async function downscaleCaptureBuffer(buf: Buffer): Promise<Buffer> {
  const img = await Jimp.read(buf);
  if (img.width > STUDIO_CAPTURE_MAX_PX || img.height > STUDIO_CAPTURE_MAX_PX) {
    img.scaleToFit({ w: STUDIO_CAPTURE_MAX_PX, h: STUDIO_CAPTURE_MAX_PX });
  }
  return img.getBuffer('image/jpeg');
}

async function uploadBufferToFal(fal: FalClient, buf: Buffer, fileName: string, mime: string): Promise<string> {
  if (!buf.length) throw new Error(`Fal upload empty file: ${fileName}`);
  const file = new File([buf], fileName, { type: mime });
  try {
    return await fal.storage.upload(file);
  } catch (e) {
    throw formatStudioFalError(e, `Fal storage upload (${fileName})`);
  }
}

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
  const lower = path.toLowerCase();
  const mime = lower.endsWith('.png') ? 'image/png' : lower.endsWith('.jpg') || lower.endsWith('.jpeg') ? 'image/jpeg' : 'image/webp';
  return uploadBufferToFal(fal, buf, fileName, mime);
}

function studioJobPath(promptVersion: string, userId: string, jobId: string): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  return `try-on-studio-jobs/${promptVersion}/${safeUser}/${jobId}.json`;
}

async function saveStudioJob(bucket: string, promptVersion: string, job: StudioTryOnJobRecord): Promise<void> {
  const supabase = getSupabaseAdminServiceRole();
  const path = studioJobPath(promptVersion, job.userId, job.jobId);
  const { error } = await supabase.storage.from(bucket).upload(path, JSON.stringify(job), {
    contentType: 'application/json',
    upsert: true,
    cacheControl: '60',
  });
  if (error) throw new Error(`save studio job: ${error.message}`);
}

async function loadStudioJob(
  bucket: string,
  promptVersion: string,
  userId: string,
  jobId: string
): Promise<StudioTryOnJobRecord | null> {
  const supabase = getSupabaseAdminServiceRole();
  const path = studioJobPath(promptVersion, userId, jobId);
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) return null;
  try {
    const job = JSON.parse(await data.text()) as StudioTryOnJobRecord;
    if (job.userId !== userId) return null;
    if (Date.now() - job.createdAt > STUDIO_JOB_MAX_AGE_MS) return null;
    return job;
  } catch {
    return null;
  }
}

async function deleteStudioJob(bucket: string, promptVersion: string, userId: string, jobId: string): Promise<void> {
  const supabase = getSupabaseAdminServiceRole();
  await supabase.storage.from(bucket).remove([studioJobPath(promptVersion, userId, jobId)]);
}

function buildStudioFalInput(
  photoModel: LiveTryOnPhotoModel,
  imageUrls: string[],
  prompt: string,
  overrides?: StudioFalInputOverrides
): Record<string, unknown> {
  if (photoModel === 'gpt2') {
    const input: Record<string, unknown> = {
      prompt,
      image_urls: imageUrls,
      quality: overrides?.quality ?? 'medium',
      output_format: overrides?.output_format ?? 'webp',
      num_images: 1,
    };
    if (!overrides?.omitImageSize) input.image_size = 'auto';
    return input;
  }
  const resolution = readTryOnFalResolution();
  return {
    prompt,
    image_urls: imageUrls,
    aspect_ratio: 'auto',
    resolution,
    output_format: 'webp',
    num_images: 1,
  };
}

export type StartStudioTryOnRenderInput = {
  imageDataUrl: string;
  color: string;
  unitKey?: string;
  photoModel?: LiveTryOnPhotoModel;
  angle?: LiveTryOnAngle;
  /** Measured head yaw in degrees (+40 left cheek to camera, −40 right, 0 front). */
  headYawDeg?: number;
  userId: string;
};

export type StartStudioTryOnRenderResult = {
  jobId: string;
  status: 'queued';
  manifestHash: string;
  color: string;
  unitKey: string;
  photoModel: LiveTryOnPhotoModel;
  angle: LiveTryOnAngle;
};

/** Queue Fal job and return immediately (avoids Vercel FUNCTION_INVOCATION_TIMEOUT). */
export async function startStudioTryOnRender(
  input: StartStudioTryOnRenderInput
): Promise<StartStudioTryOnRenderResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY is not configured');

  const job = liveTryOnStorageLookupJob({
    unitKey: String(input.unitKey || 'NOIR').toUpperCase(),
    color: input.color,
  });
  const selections = jobToSelections(job);
  const catalog = catalogColorForPrompt(selections.color);
  if (!catalog) throw new Error(`Unknown color: ${selections.color}`);

  const manifestHash = wigPreviewManifestHashLiveColorTier(selections);
  const poseAngle: LiveTryOnAngle = input.angle || 'front';
  const photoModel = activeLiveTryOnStudioPhotoModel();
  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  const unitKey = job.unitKey;
  const colorPaths = wigPreviewLiveAnglePaths(promptVersion, unitKey, manifestHash);
  const colorPath = colorPaths.front;

  if (!(await storageObjectExists(bucket, colorPath))) {
    throw new Error('COLOR_PREVIEW_MISSING');
  }

  const { buf: rawBuf } = parseDataUrl(input.imageDataUrl);
  const captureBuf = await downscaleCaptureBuffer(rawBuf);

  const fal = await getFalClient(falKey);
  const userFalUrl = await uploadBufferToFal(fal, captureBuf, 'studio-selfie.jpg', 'image/jpeg');
  const mannequinFalUrl = await uploadStorageObjectToFal(
    fal,
    bucket,
    colorPath,
    'studio-mannequin-front.webp'
  );

  const portraitPath = liveTryOnPortraitStoragePath(
    promptVersion,
    unitKey,
    manifestHash,
    photoModel,
    'front'
  );
  const hasPortraitInStorage = await storageObjectExists(bucket, portraitPath);
  const attachPortraitRef =
    hasPortraitInStorage && process.env.WIG_PREVIEW_TRYON_STUDIO_PORTRAIT_REF?.trim().toLowerCase() === 'true';

  let portraitFalUrl: string | undefined;
  if (attachPortraitRef) {
    portraitFalUrl = await uploadStorageObjectToFal(
      fal,
      bucket,
      portraitPath,
      `studio-portrait-${photoModel}-front.webp`
    );
  }

  const headYawDeg =
    typeof input.headYawDeg === 'number' && Number.isFinite(input.headYawDeg)
      ? Math.round(Math.max(-40, Math.min(40, input.headYawDeg)))
      : undefined;

  const { falRequestId, photoModel: usedPhotoModel, falModel } = await submitStudioRenderWithFallbacks(
    fal,
    photoModel,
    catalog.label,
    catalog.hex,
    poseAngle,
    headYawDeg,
    userFalUrl,
    mannequinFalUrl,
    portraitFalUrl
  );

  const jobId = randomUUID();
  await saveStudioJob(bucket, promptVersion, {
    jobId,
    userId: input.userId,
    falRequestId,
    falModel,
    photoModel: usedPhotoModel,
    manifestHash,
    unitKey,
    color: job.color,
    poseAngle,
    createdAt: Date.now(),
    phase: 'base',
  });

  return {
    jobId,
    status: 'queued',
    manifestHash,
    color: job.color,
    unitKey,
    photoModel: usedPhotoModel,
    angle: poseAngle,
  };
}

export type PollStudioTryOnRenderResult =
  | { status: 'pending'; queueStatus: string; phase: 'base' | 'makeup' }
  | {
      status: 'complete';
      jobId: string;
      imageUrl: string;
      makeupImageUrl?: string;
      makeupAvailable?: boolean;
      makeupError?: string;
      manifestHash: string;
      color: string;
      unitKey: string;
      photoModel: LiveTryOnPhotoModel;
      angle: LiveTryOnAngle;
    };

function studioOutputBasePath(
  promptVersion: string,
  job: Pick<StudioTryOnJobRecord, 'unitKey' | 'manifestHash' | 'photoModel' | 'poseAngle' | 'outputTimestamp'>
): string {
  const ts = job.outputTimestamp ?? Date.now();
  return `try-on-studio/${promptVersion}/${job.unitKey}/${job.manifestHash}/${job.photoModel}/${job.poseAngle}/${ts}`;
}

async function uploadStudioWebp(
  bucket: string,
  path: string,
  buf: Buffer
): Promise<string> {
  const supabase = getSupabaseAdminServiceRole();
  const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
    contentType: 'image/webp',
    upsert: false,
    cacheControl: '3600',
  });
  if (upErr) throw new Error(`upload studio result: ${upErr.message}`);

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  const imageUrl = pub?.publicUrl ? `${pub.publicUrl}?t=${Date.now()}` : '';
  if (!imageUrl) throw new Error('Could not build public URL for studio result');
  return imageUrl;
}

async function queueMakeupPass(
  fal: FalClient,
  job: StudioTryOnJobRecord,
  naturalBuf: Buffer
): Promise<string> {
  const naturalFalUrl = await uploadBufferToFal(fal, naturalBuf, 'studio-natural.webp', 'image/webp');
  return submitStudioMakeupWithFallbacks(fal, job, naturalFalUrl);
}

function completeStudioResult(
  job: StudioTryOnJobRecord,
  imageUrl: string,
  opts?: { makeupImageUrl?: string; makeupAvailable?: boolean; makeupError?: string }
): Extract<PollStudioTryOnRenderResult, { status: 'complete' }> {
  return {
    status: 'complete',
    jobId: job.jobId,
    imageUrl,
    ...(opts?.makeupImageUrl ? { makeupImageUrl: opts.makeupImageUrl } : {}),
    ...(opts?.makeupAvailable ? { makeupAvailable: true } : {}),
    ...(opts?.makeupError ? { makeupError: opts.makeupError } : {}),
    manifestHash: job.manifestHash,
    color: job.color,
    unitKey: job.unitKey,
    photoModel: job.photoModel,
    angle: job.poseAngle,
  };
}

export async function pollStudioTryOnRender(
  userId: string,
  jobId: string
): Promise<PollStudioTryOnRenderResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY is not configured');

  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  const job = await loadStudioJob(bucket, promptVersion, userId, jobId);
  if (!job) throw new Error('Studio job not found or expired');

  if (job.phase === 'base_complete' && job.naturalImageUrl) {
    return completeStudioResult(job, job.naturalImageUrl, { makeupAvailable: true });
  }

  const fal = await getFalClient(falKey);
  const queueStatus = await fal.queue.status(job.falModel, { requestId: job.falRequestId });
  const status = String((queueStatus as { status?: string }).status || 'IN_PROGRESS');

  const phase: 'base' | 'makeup' = job.phase === 'makeup' ? 'makeup' : 'base';

  if (status === 'IN_QUEUE' || status === 'IN_PROGRESS') {
    return { status: 'pending', queueStatus: status, phase };
  }

  if (status !== 'COMPLETED') {
    if (phase === 'makeup' && job.naturalImageUrl) {
      await saveStudioJob(bucket, promptVersion, { ...job, phase: 'base_complete' });
      return completeStudioResult(job, job.naturalImageUrl, {
        makeupAvailable: true,
        makeupError: `Polished glam failed (${status})`,
      });
    }
    await deleteStudioJob(bucket, promptVersion, userId, jobId);
    throw new Error(`Studio render failed (${status})`);
  }

  const result = await fal.queue.result(job.falModel, { requestId: job.falRequestId });
  const falUrl = extractFalImageUrl(result);
  if (!falUrl) {
    if (phase === 'makeup' && job.naturalImageUrl) {
      await saveStudioJob(bucket, promptVersion, { ...job, phase: 'base_complete' });
      return completeStudioResult(job, job.naturalImageUrl, {
        makeupAvailable: true,
        makeupError: 'Polished glam produced no image',
      });
    }
    await deleteStudioJob(bucket, promptVersion, userId, jobId);
    throw new Error('fal: no studio result URL');
  }

  const outBuf = await downloadUrlToBuffer(falUrl);

  if (phase === 'base') {
    const outputTimestamp = Date.now();
    const naturalPath = `${studioOutputBasePath(promptVersion, { ...job, outputTimestamp })}-natural.webp`;
    const naturalImageUrl = await uploadStudioWebp(bucket, naturalPath, outBuf);

    await saveStudioJob(bucket, promptVersion, {
      ...job,
      phase: 'base_complete',
      naturalImageUrl,
      naturalStoragePath: naturalPath,
      outputTimestamp,
    });

    return completeStudioResult(job, naturalImageUrl, { makeupAvailable: true });
  }

  const makeupPath = `${studioOutputBasePath(promptVersion, job)}-makeup.webp`;
  const makeupImageUrl = await uploadStudioWebp(bucket, makeupPath, outBuf);
  const naturalImageUrl = job.naturalImageUrl;
  if (!naturalImageUrl) {
    await deleteStudioJob(bucket, promptVersion, userId, jobId);
    throw new Error('Studio job missing natural image');
  }

  await deleteStudioJob(bucket, promptVersion, userId, jobId);
  return completeStudioResult(job, naturalImageUrl, { makeupImageUrl });
}

export type StartStudioMakeupRenderResult = {
  jobId: string;
  status: 'queued';
};

/** Queue optional makeup pass after user confirms (natural render must be complete). */
export async function startStudioMakeupRender(
  userId: string,
  jobId: string
): Promise<StartStudioMakeupRenderResult> {
  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY is not configured');

  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  const job = await loadStudioJob(bucket, promptVersion, userId, jobId);
  if (!job) throw new Error('Studio job not found or expired');
  if (job.phase !== 'base_complete') {
    throw new Error('Studio natural render is not ready for makeup');
  }
  if (!job.naturalStoragePath) {
    throw new Error('Studio job missing natural image');
  }

  const supabase = getSupabaseAdminServiceRole();
  const { data, error } = await supabase.storage.from(bucket).download(job.naturalStoragePath);
  if (error || !data) {
    throw new Error(`storage download failed for natural render: ${error?.message || 'missing'}`);
  }
  const naturalBuf = Buffer.from(await data.arrayBuffer());

  const fal = await getFalClient(falKey);
  const makeupRequestId = await queueMakeupPass(fal, job, naturalBuf);

  await saveStudioJob(bucket, promptVersion, {
    ...job,
    phase: 'makeup',
    falRequestId: makeupRequestId,
  });

  return { jobId, status: 'queued' };
}
