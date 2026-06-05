export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Jimp } from 'jimp';
import { getAuthUser } from './_lib/auth.js';
import { catalogColorForPrompt } from './_lib/bawCatalogHairColors.js';
import {
  activeLiveTryOnPhotoModel,
  buildLiveTryOnPhotorealWomanPrompt,
  falEditModelId,
  LIVE_TRY_ON_FAL_NBP_EDIT,
  LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT,
  LIVE_TRY_ON_IDEOGRAM_MODEL,
  LIVE_TRY_ON_PHOTO_MODELS,
  liveTryOnOverlayPublicUrls,
  liveTryOnOverlayPublicUrlsForModel,
  liveTryOnOverlayStoragePath,
  liveTryOnPortraitPublicUrlsForModel,
  liveTryOnPortraitStoragePath,
  parseLiveTryOnPhotoModel,
  type LiveTryOnAngle,
  type LiveTryOnAngleUrls,
  type LiveTryOnPhotoModel,
} from './_lib/liveTryOnOverlay.js';
import { getSupabaseAdminServiceRole } from './_lib/supabase.js';
import {
  wigPreviewLiveAnglePaths,
  wigPreviewManifestHashLiveColorTier,
  type WigPreviewSelections,
} from './_lib/wigPreviewSelectionHash.js';

type Body = {
  color?: string;
  unitKey?: string;
  length?: string;
  density?: string;
  lace?: string;
  texture?: string;
  hairline?: string;
  styling?: string;
  addOns?: string[];
  angle?: 'left' | 'front' | 'right';
  forceRegenerate?: boolean;
  /** When true (default), run **both** NBP + GPT2 with the same prompt for side-by-side compare. */
  compareModels?: boolean;
  /** Generate only this model (`nbp` | `gpt2`). Ignored when `compareModels` is true. */
  photoModel?: string;
};

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(req: VercelRequest): Body {
  const body = req.body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Body;
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) return body as Body;
  return {};
}

function readString(body: Body, key: keyof Body, fallback = ''): string {
  const v = body[key];
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function readStringArray(body: Body, key: keyof Body): string[] {
  const v = body[key];
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim().toUpperCase()).filter(Boolean);
}

function readOptionalAngle(body: Body): LiveTryOnAngle | null {
  const a = readString(body, 'angle', '').toLowerCase();
  if (a === 'left' || a === 'front' || a === 'right') return a;
  return null;
}

/** Try-on defaults to 1K — faster per Vercel invocation (override with WIG_PREVIEW_TRYON_FAL_RESOLUTION). */
function readTryOnFalResolution(): '1K' | '2K' | '4K' {
  const tryOn = process.env.WIG_PREVIEW_TRYON_FAL_RESOLUTION?.trim().toUpperCase();
  if (tryOn === '1K' || tryOn === '2K' || tryOn === '4K') return tryOn;
  const global = process.env.WIG_PREVIEW_FAL_RESOLUTION?.trim().toUpperCase();
  if (global === '1K' || global === '2K' || global === '4K') return global;
  return '1K';
}

/** Exactly one Fal stack per HTTP request (angle + photoModel). */
function photoModelForRequest(body: Body): LiveTryOnPhotoModel {
  return parseLiveTryOnPhotoModel(readString(body, 'photoModel', '')) || activeLiveTryOnPhotoModel();
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

export async function validateHairOnlyOverlayPng(buf: Buffer): Promise<void> {
  const img = await Jimp.read(buf);
  const w = img.width;
  const h = img.height;
  if (w < 64 || h < 64) throw new Error('overlay too small');

  const sample = (u: number, v: number): number => {
    const x = Math.min(w - 1, Math.max(0, Math.floor(u * w)));
    const y = Math.min(h - 1, Math.max(0, Math.floor(v * h)));
    return img.getPixelColor(x, y) & 0xff;
  };

  const faceAlpha = sample(0.5, 0.42);
  const hairAlpha = sample(0.5, 0.14);
  const bustAlpha = sample(0.5, 0.72);

  if (faceAlpha > 90 && hairAlpha > 90) {
    throw new Error('overlay still contains an opaque face');
  }
  if (bustAlpha > 120 && hairAlpha > 120) {
    throw new Error('overlay still contains shoulders or bust');
  }
  if (hairAlpha < 40) {
    throw new Error('overlay missing visible hair at top');
  }
}

/** Same prompt → NBP or GPT Image 2 edit from mannequin color WebP. */
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

async function storageObjectExists(
  supabase: ReturnType<typeof getSupabaseAdminServiceRole>,
  bucket: string,
  path: string
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).download(path);
  return !error;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const user = await getAuthUser(req);
  if (!user) {
    sendJson(res, 401, { error: 'Sign in required' });
    return;
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    sendJson(res, 503, { error: 'FAL_KEY is not configured on the server' });
    return;
  }

  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';

  const body = parseBody(req);
  const color = readString(body, 'color', '');
  if (!color) {
    sendJson(res, 400, { error: 'color is required' });
    return;
  }
  const catalog = catalogColorForPrompt(color);
  if (!catalog) {
    sendJson(res, 400, { error: `Unknown color: ${color}` });
    return;
  }

  const unitKey = readString(body, 'unitKey', 'NOIR').toUpperCase();
  const selections: WigPreviewSelections = {
    unitKey,
    length: readString(body, 'length', '24"'),
    density: readString(body, 'density', '200%'),
    lace: readString(body, 'lace', '13X6'),
    texture: readString(body, 'texture', 'SILKY'),
    color: color.toUpperCase().replace(/\s+/g, ' ').trim(),
    hairline: readString(body, 'hairline', 'NATURAL'),
    styling: readString(body, 'styling', 'NONE'),
    addOns: readStringArray(body, 'addOns'),
  };

  const manifestHash = wigPreviewManifestHashLiveColorTier(selections);
  const colorPaths = wigPreviewLiveAnglePaths(promptVersion, unitKey, manifestHash);
  const singleAngle = readOptionalAngle(body);
  if (!singleAngle) {
    sendJson(res, 400, {
      error: 'angle is required',
      hint: 'Send one of left | front | right per request (and photoModel nbp | gpt2) so each serverless call stays within Vercel time limits.',
    });
    return;
  }
  const forceRegenerate = body.forceRegenerate === true;
  const angles: LiveTryOnAngle[] = [singleAngle];
  const photoModels: LiveTryOnPhotoModel[] = [photoModelForRequest(body)];
  const activeModel = activeLiveTryOnPhotoModel();

  let supabase;
  try {
    supabase = getSupabaseAdminServiceRole();
  } catch {
    sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required' });
    return;
  }

  const generated: string[] = [];
  const skipped: string[] = [];
  const missingColor: string[] = [];
  const failed: Array<{ angle: LiveTryOnAngle; photoModel?: LiveTryOnPhotoModel; error: string }> = [];

  const comparePortraits: Partial<Record<LiveTryOnPhotoModel, LiveTryOnAngleUrls>> = {};
  const compareOverlays: Partial<Record<LiveTryOnPhotoModel, LiveTryOnAngleUrls>> = {};

  if (supabaseUrl) {
    for (const pm of LIVE_TRY_ON_PHOTO_MODELS) {
      comparePortraits[pm] = liveTryOnPortraitPublicUrlsForModel(
        supabaseUrl,
        bucket,
        promptVersion,
        unitKey,
        manifestHash,
        pm
      );
      compareOverlays[pm] = liveTryOnOverlayPublicUrlsForModel(
        supabaseUrl,
        bucket,
        promptVersion,
        unitKey,
        manifestHash,
        pm
      );
    }
  }

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    for (const angle of angles) {
      const colorPath = colorPaths[angle];
      const { error: dlColor } = await supabase.storage.from(bucket).download(colorPath);
      if (dlColor) {
        missingColor.push(angle);
        continue;
      }

      const { data: pubColor } = supabase.storage.from(bucket).getPublicUrl(colorPath);
      const mannequinUrl = pubColor?.publicUrl;
      if (!mannequinUrl) {
        missingColor.push(angle);
        continue;
      }

      const womanPrompt = buildLiveTryOnPhotorealWomanPrompt(catalog.label, catalog.hex, angle);

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

        if (!forceRegenerate) {
          const hasOverlay = await storageObjectExists(supabase, bucket, overlayPath);
          if (hasOverlay) {
            skipped.push(`${photoModel}:${angle}`);
            continue;
          }
        }

        try {
          let portraitBuf: Buffer | null = null;
          if (!forceRegenerate) {
            const hasPortrait = await storageObjectExists(supabase, bucket, portraitPath);
            if (hasPortrait) {
              const { data, error } = await supabase.storage.from(bucket).download(portraitPath);
              if (!error && data) portraitBuf = Buffer.from(await data.arrayBuffer());
            }
          }

          if (!portraitBuf) {
            portraitBuf = await generatePhotorealPortrait(fal, photoModel, mannequinUrl, womanPrompt);
            const { error: upPortrait } = await supabase.storage.from(bucket).upload(portraitPath, portraitBuf, {
              contentType: 'image/webp',
              upsert: true,
            });
            if (upPortrait) throw new Error(`upload portrait: ${upPortrait.message}`);
          }

          const { data: pubPortrait } = supabase.storage.from(bucket).getPublicUrl(portraitPath);
          const portraitUrlForFal = pubPortrait?.publicUrl
            ? `${pubPortrait.publicUrl}?t=${Date.now()}`
            : '';
          if (!portraitUrlForFal) throw new Error('portrait public URL missing');

          const overlayBuf = await generateHairOnlyOverlayFromPortrait(fal, portraitUrlForFal);
          const { error: upOverlay } = await supabase.storage.from(bucket).upload(overlayPath, overlayBuf, {
            contentType: 'image/png',
            upsert: true,
          });
          if (upOverlay) throw new Error(`upload overlay: ${upOverlay.message}`);

          generated.push(`${photoModel}:${angle}`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'generation failed';
          failed.push({ angle, photoModel, error: msg });
        }
      }
    }

    if (missingColor.length > 0 && generated.length === 0 && skipped.length === 0) {
      sendJson(res, 409, {
        error: 'COLOR_PREVIEW_MISSING',
        missingColor,
        manifestHash,
        colorPaths,
      });
      return;
    }

    const publicUrls =
      supabaseUrl.length > 0
        ? liveTryOnOverlayPublicUrls(supabaseUrl, bucket, promptVersion, unitKey, manifestHash)
        : { left: null, front: null, right: null };

    sendJson(res, 200, {
      ok: true,
      manifestHash,
      unitKey,
      bucket,
      pipeline: 'hair-v5-photo-woman',
      activeModel,
      photoModelsGenerated: photoModels,
      womanPromptSample: buildLiveTryOnPhotorealWomanPrompt(catalog.label, catalog.hex, 'front'),
      generated,
      skipped,
      missingColor,
      failed,
      publicUrls,
      comparePortraits,
      compareOverlays,
      selections,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Live try-on overlay failed';
    sendJson(res, 500, { error: msg });
  }
}
