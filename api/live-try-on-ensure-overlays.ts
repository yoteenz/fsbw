export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { catalogColorForPrompt } from './_lib/bawCatalogHairColors.js';
import {
  LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT,
  liveTryOnOverlayPublicUrls,
  liveTryOnOverlayStoragePath,
} from './_lib/liveTryOnOverlay.js';

const IDEOGRAM_REMOVE_BG = 'fal-ai/ideogram/remove-background';
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

function readOptionalAngle(body: Body): 'left' | 'front' | 'right' | null {
  const a = readString(body, 'angle', '').toLowerCase();
  if (a === 'left' || a === 'front' || a === 'right') return a;
  return null;
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

/** NBP hair-on-white, then Ideogram for true alpha (same stack as PSA avatars). */
async function generateHairOnlyOverlayPng(
  fal: { subscribe: (model: string, opts: { input: Record<string, unknown>; logs: boolean }) => Promise<unknown> },
  sourceUrl: string
): Promise<Buffer> {
  const nbpResult = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
    input: {
      prompt: LIVE_TRY_ON_HAIR_ISOLATION_NBP_PROMPT,
      image_urls: [sourceUrl],
      aspect_ratio: 'auto',
      resolution: process.env.WIG_PREVIEW_FAL_RESOLUTION?.trim() || '2K',
      output_format: 'png',
      num_images: 1,
    },
    logs: false,
  });
  const nbpUrl = extractFalImageUrl(nbpResult);
  if (!nbpUrl) throw new Error('fal: no NBP hair isolation URL');

  const cutResult = await fal.subscribe(IDEOGRAM_REMOVE_BG, {
    input: { image_url: nbpUrl },
    logs: false,
  });
  const cutUrl = extractFalImageUrl(cutResult);
  if (!cutUrl) throw new Error('fal: no Ideogram cutout URL');

  return downloadUrlToBuffer(cutUrl);
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
  if (!catalogColorForPrompt(color)) {
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
  const forceRegenerate = body.forceRegenerate === true;
  const angles: Array<'left' | 'front' | 'right'> = singleAngle ? [singleAngle] : ['left', 'front', 'right'];

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

      const colorPath = colorPaths[angle];
      const { error: dlColor } = await supabase.storage.from(bucket).download(colorPath);
      if (dlColor) {
        missingColor.push(angle);
        continue;
      }

      const { data: pubColor } = supabase.storage.from(bucket).getPublicUrl(colorPath);
      const sourceUrl = pubColor?.publicUrl;
      if (!sourceUrl) {
        missingColor.push(angle);
        continue;
      }

      const buf = await generateHairOnlyOverlayPng(fal, sourceUrl);
      const { error: upErr } = await supabase.storage.from(bucket).upload(overlayPath, buf, {
        contentType: 'image/png',
        upsert: true,
      });
      if (upErr) throw new Error(`upload ${overlayPath}: ${upErr.message}`);
      generated.push(angle);
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
      generated,
      skipped,
      missingColor,
      publicUrls,
      selections,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Live try-on overlay failed';
    sendJson(res, 500, { error: msg });
  }
}
