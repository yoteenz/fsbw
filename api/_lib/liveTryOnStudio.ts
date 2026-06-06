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
  buildLiveTryOnStudioTryOnPrompt,
  falEditModelId,
  type LiveTryOnAngle,
  type LiveTryOnPhotoModel,
} from './liveTryOnOverlay.js';
import { getSupabaseAdminServiceRole } from './supabase.js';
import {
  wigPreviewLiveAnglePaths,
  wigPreviewManifestHashLiveColorTier,
} from './wigPreviewSelectionHash.js';

const STUDIO_CAPTURE_MAX_PX = 1280;
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
};

function readTryOnFalResolution(): '1K' | '2K' | '4K' {
  const tryOn = process.env.WIG_PREVIEW_TRYON_FAL_RESOLUTION?.trim().toUpperCase();
  if (tryOn === '1K' || tryOn === '2K' || tryOn === '4K') return tryOn;
  const global = process.env.WIG_PREVIEW_FAL_RESOLUTION?.trim().toUpperCase();
  if (global === '1K' || global === '2K' || global === '4K') return global;
  return '1K';
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
  const file = new File([buf], fileName, { type: mime });
  return fal.storage.upload(file);
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
  userFalUrl: string,
  mannequinFalUrl: string,
  prompt: string
): Record<string, unknown> {
  const imageUrls = [userFalUrl, mannequinFalUrl];
  if (photoModel === 'gpt2') {
    return {
      prompt,
      image_urls: imageUrls,
      image_size: 'auto',
      quality: 'high',
      output_format: 'webp',
      num_images: 1,
    };
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

  const prompt = buildLiveTryOnStudioTryOnPrompt(catalog.label, catalog.hex, poseAngle);
  const falModel = falEditModelId(photoModel);
  const falInput = buildStudioFalInput(photoModel, userFalUrl, mannequinFalUrl, prompt);

  const { request_id: falRequestId } = await fal.queue.submit(falModel, {
    input: falInput,
    logs: false,
  });

  const jobId = randomUUID();
  await saveStudioJob(bucket, promptVersion, {
    jobId,
    userId: input.userId,
    falRequestId,
    falModel,
    photoModel,
    manifestHash,
    unitKey,
    color: job.color,
    poseAngle,
    createdAt: Date.now(),
  });

  return {
    jobId,
    status: 'queued',
    manifestHash,
    color: job.color,
    unitKey,
    photoModel,
    angle: poseAngle,
  };
}

export type PollStudioTryOnRenderResult =
  | { status: 'pending'; queueStatus: string }
  | {
      status: 'complete';
      imageUrl: string;
      manifestHash: string;
      color: string;
      unitKey: string;
      photoModel: LiveTryOnPhotoModel;
      angle: LiveTryOnAngle;
    };

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

  const fal = await getFalClient(falKey);
  const queueStatus = await fal.queue.status(job.falModel, { requestId: job.falRequestId });
  const status = String((queueStatus as { status?: string }).status || 'IN_PROGRESS');

  if (status === 'IN_QUEUE' || status === 'IN_PROGRESS') {
    return { status: 'pending', queueStatus: status };
  }

  if (status !== 'COMPLETED') {
    await deleteStudioJob(bucket, promptVersion, userId, jobId);
    throw new Error(`Studio render failed (${status})`);
  }

  const result = await fal.queue.result(job.falModel, { requestId: job.falRequestId });
  const falUrl = extractFalImageUrl(result);
  if (!falUrl) {
    await deleteStudioJob(bucket, promptVersion, userId, jobId);
    throw new Error('fal: no studio result URL');
  }

  const outBuf = await downloadUrlToBuffer(falUrl);
  const supabase = getSupabaseAdminServiceRole();
  const outPath = `try-on-studio/${promptVersion}/${job.unitKey}/${job.manifestHash}/${job.photoModel}/${job.poseAngle}/${Date.now()}.webp`;
  const { error: upErr } = await supabase.storage.from(bucket).upload(outPath, outBuf, {
    contentType: 'image/webp',
    upsert: false,
    cacheControl: '3600',
  });
  if (upErr) throw new Error(`upload studio result: ${upErr.message}`);

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(outPath);
  const imageUrl = pub?.publicUrl ? `${pub.publicUrl}?t=${Date.now()}` : '';
  if (!imageUrl) throw new Error('Could not build public URL for studio result');

  await deleteStudioJob(bucket, promptVersion, userId, jobId);

  return {
    status: 'complete',
    imageUrl,
    manifestHash: job.manifestHash,
    color: job.color,
    unitKey: job.unitKey,
    photoModel: job.photoModel,
    angle: job.poseAngle,
  };
}
