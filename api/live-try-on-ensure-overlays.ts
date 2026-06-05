export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Jimp } from 'jimp';
import { getAuthUser } from './_lib/auth.js';
import { catalogColorForPrompt } from './_lib/bawCatalogHairColors.js';
import {
  buildLiveTryOnOnModelRecolorPrompt,
  LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT,
  LIVE_TRY_ON_IDEOGRAM_MODEL,
  liveTryOnOnModelReferenceUrl,
  liveTryOnOverlayPublicUrls,
  liveTryOnOverlayStoragePath,
  type LiveTryOnAngle,
} from './_lib/liveTryOnOverlay.js';
import { getSupabaseAdminServiceRole } from './_lib/supabase.js';
import {
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

function readFalResolution(): '1K' | '2K' | '4K' {
  const r = (process.env.WIG_PREVIEW_FAL_RESOLUTION || '2K').trim().toUpperCase();
  if (r === '1K' || r === '2K' || r === '4K') return r;
  return '2K';
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

/** Reject full-mannequin or opaque-face overlays before caching. */
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
    throw new Error('overlay still contains an opaque face (mannequin or portrait)');
  }
  if (bustAlpha > 120 && hairAlpha > 120) {
    throw new Error('overlay still contains shoulders or bust');
  }
  if (hairAlpha < 40) {
    throw new Error('overlay missing visible hair at top');
  }
}

/** On-model recolor → hair-on-white → Ideogram alpha. */
async function generateHairOnlyOverlayPng(
  fal: { subscribe: (model: string, opts: { input: Record<string, unknown>; logs: boolean }) => Promise<unknown> },
  modelRefUrl: string,
  recolorPrompt: string
): Promise<Buffer> {
  const resolution = readFalResolution();

  const recolorResult = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
    input: {
      prompt: recolorPrompt,
      image_urls: [modelRefUrl],
      aspect_ratio: 'auto',
      resolution,
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });
  const recolorUrl = extractFalImageUrl(recolorResult);
  if (!recolorUrl) throw new Error('fal: no on-model recolor URL');

  const nbpResult = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
    input: {
      prompt: LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT,
      image_urls: [recolorUrl],
      aspect_ratio: 'auto',
      resolution,
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });
  const nbpUrl = extractFalImageUrl(nbpResult);
  if (!nbpUrl) throw new Error('fal: no NBP hair isolation URL');

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
  const singleAngle = readOptionalAngle(body);
  const forceRegenerate = body.forceRegenerate === true;
  const angles: LiveTryOnAngle[] = singleAngle ? [singleAngle] : ['left', 'front', 'right'];

  let supabase;
  try {
    supabase = getSupabaseAdminServiceRole();
  } catch {
    sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required' });
    return;
  }

  const generated: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ angle: LiveTryOnAngle; error: string }> = [];

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    for (const angle of angles) {
      const overlayPath = liveTryOnOverlayStoragePath(promptVersion, unitKey, manifestHash, angle);
      if (!forceRegenerate) {
        const { error: dlOverlay } = await supabase.storage.from(bucket).download(overlayPath);
        if (!dlOverlay) {
          skipped.push(angle);
          continue;
        }
      }

      const modelRefUrl = liveTryOnOnModelReferenceUrl(angle);
      const recolorPrompt = buildLiveTryOnOnModelRecolorPrompt(catalog.label, catalog.hex, angle);

      try {
        const buf = await generateHairOnlyOverlayPng(fal, modelRefUrl, recolorPrompt);
        const { error: upErr } = await supabase.storage.from(bucket).upload(overlayPath, buf, {
          contentType: 'image/png',
          upsert: true,
        });
        if (upErr) throw new Error(`upload ${overlayPath}: ${upErr.message}`);
        generated.push(angle);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'generation failed';
        failed.push({ angle, error: msg });
      }
    }

    if (generated.length === 0 && skipped.length === 0 && failed.length > 0) {
      sendJson(res, 500, {
        error: 'TRYON_OVERLAY_FAILED',
        failed,
        manifestHash,
        modelRefs: {
          left: liveTryOnOnModelReferenceUrl('left'),
          front: liveTryOnOnModelReferenceUrl('front'),
          right: liveTryOnOnModelReferenceUrl('right'),
        },
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
      pipeline: LIVE_TRY_ON_OVERLAY_CACHE_SEGMENT,
      generated,
      skipped,
      failed,
      publicUrls,
      selections,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Live try-on overlay failed';
    sendJson(res, 500, { error: msg });
  }
}
