import { Jimp } from 'jimp';
import { catalogColorForPrompt } from './bawCatalogHairColors.js';
import { liveTryOnStorageLookupJob } from './liveTryOnBatchManifest.js';
import {
  jobToSelections,
  storageObjectExists,
} from './liveTryOnBatchGenerate.js';
import {
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

type FalClient = {
  subscribe: (model: string, opts: { input: Record<string, unknown>; logs: boolean }) => Promise<unknown>;
  storage: { upload: (file: File) => Promise<string> };
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
  return fal;
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

function formatFalSubscribeError(e: unknown, stepLabel: string): Error {
  const raw = e instanceof Error ? e.message : String(e);
  if (/timeout|timed out/i.test(raw)) {
    return new Error(`${stepLabel}: timed out — try again in good lighting.`);
  }
  return new Error(`${stepLabel}: ${raw}`);
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

async function runStudioFalEdit(
  fal: FalClient,
  photoModel: LiveTryOnPhotoModel,
  userFalUrl: string,
  mannequinFalUrl: string,
  prompt: string
): Promise<Buffer> {
  const falModel = falEditModelId(photoModel);
  const resolution = readTryOnFalResolution();
  const label = photoModel === 'gpt2' ? 'GPT Image 2 studio try-on' : 'NBP studio try-on';
  const imageUrls = [userFalUrl, mannequinFalUrl];

  if (photoModel === 'gpt2') {
    let result: unknown;
    try {
      result = await fal.subscribe(falModel, {
        input: {
          prompt,
          image_urls: imageUrls,
          image_size: 'auto',
          quality: 'medium',
          output_format: 'webp',
          num_images: 1,
        },
        logs: false,
      });
    } catch (e) {
      throw formatFalSubscribeError(e, label);
    }
    const url = extractFalImageUrl(result);
    if (!url) throw new Error('fal: no GPT Image 2 studio URL');
    return downloadUrlToBuffer(url);
  }

  let result: unknown;
  try {
    result = await fal.subscribe(falModel, {
      input: {
        prompt,
        image_urls: imageUrls,
        aspect_ratio: 'auto',
        resolution,
        output_format: 'webp',
        num_images: 1,
      },
      logs: false,
    });
  } catch (e) {
    throw formatFalSubscribeError(e, label);
  }
  const url = extractFalImageUrl(result);
  if (!url) throw new Error('fal: no NBP studio URL');
  return downloadUrlToBuffer(url);
}

export type RunStudioTryOnRenderInput = {
  imageDataUrl: string;
  color: string;
  unitKey?: string;
  photoModel: LiveTryOnPhotoModel;
  angle?: LiveTryOnAngle;
};

export type RunStudioTryOnRenderResult = {
  imageUrl: string;
  manifestHash: string;
  color: string;
  unitKey: string;
  photoModel: LiveTryOnPhotoModel;
  angle: LiveTryOnAngle;
};

export async function runStudioTryOnRender(input: RunStudioTryOnRenderInput): Promise<RunStudioTryOnRenderResult> {
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
  const angle: LiveTryOnAngle = input.angle || 'front';
  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  const unitKey = job.unitKey;
  const colorPaths = wigPreviewLiveAnglePaths(promptVersion, unitKey, manifestHash);
  const colorPath = colorPaths[angle];

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
    `studio-mannequin-${angle}.webp`
  );

  const prompt = buildLiveTryOnStudioTryOnPrompt(catalog.label, catalog.hex, angle);
  const outBuf = await runStudioFalEdit(fal, input.photoModel, userFalUrl, mannequinFalUrl, prompt);

  const supabase = getSupabaseAdminServiceRole();
  const outPath = `try-on-studio/${promptVersion}/${unitKey}/${manifestHash}/${input.photoModel}/${angle}/${Date.now()}.webp`;
  const { error: upErr } = await supabase.storage.from(bucket).upload(outPath, outBuf, {
    contentType: 'image/webp',
    upsert: false,
    cacheControl: '3600',
  });
  if (upErr) throw new Error(`upload studio result: ${upErr.message}`);

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(outPath);
  const imageUrl = pub?.publicUrl ? `${pub.publicUrl}?t=${Date.now()}` : '';
  if (!imageUrl) throw new Error('Could not build public URL for studio result');

  return {
    imageUrl,
    manifestHash,
    color: job.color,
    unitKey,
    photoModel: input.photoModel,
    angle,
  };
}
