export const config = { maxDuration: 120 };

/**
 * POST /api/live-wig-after-color-styling
 *
 * Admin-only. Runs fal once per angle.
 *
 * **LAYERS** (any part **MIDDLE** | **LEFT** | **RIGHT**): single `image_urls` = **color-tier WebP** from Storage (same paths
 * as live color — hair already matches selected swatch). Prompt: `buildLayersStylePromptFromColorTierWebp` — long layered curls
 * + part while **keeping** that hair color (fixes black output when input was HQ black-brick refs only).
 * **Output:** `.../after-color/layers-{middle|left|right}-part/{angle}.webp`
 *
 * **CRIMPS** (any part **MIDDLE** | **LEFT** | **RIGHT**): same color WebP input as LAYERS; prompt `buildCrimpsStylePromptFromColorTierWebp`
 * — **crimps** texture + part, keeping swatch hair color.
 * **Output:** `.../after-color/crimps-{middle|left|right}-part/{angle}.webp`
 *
 * **BANGS only** (BANGS without LAYERS/CRIMPS): same color WebP input; `buildBangsOnlyStylePrompt`. **Output:** `.../after-color/bangs-only/{angle}.webp`
 *
 * Body: live color fields + `color` + optional `angle` + optional `forceRegenerate` + `partSelection` + `styling`.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminFounder } from './_lib/adminAuth.js';
import { getSupabaseAdminServiceRole } from './_lib/supabase.js';
import {
  wigPreviewManifestHash,
  wigPreviewManifestHashLiveColorTier,
  wigPreviewLiveAnglePaths,
  wigPreviewLiveAfterColorStylingPaths,
  wigPreviewLiveCrimpsPartFolder,
  wigPreviewLiveLayersPartFolder,
  type WigPreviewSelections,
} from './_lib/wigPreviewSelectionHash.js';
import { catalogColorForPrompt } from './_lib/bawCatalogHairColors.js';
import {
  buildBangsOnlyStylePrompt,
  buildCrimpsStylePromptFromColorTierWebp,
  buildLayersStylePromptFromColorTierWebp,
} from './_lib/bawLiveStylingPrompts.js';

type LayersPartStyling = 'MIDDLE' | 'LEFT' | 'RIGHT';

function readLayersPartStyling(body: Record<string, unknown>): LayersPartStyling {
  const raw = readString(body, 'partSelection', 'MIDDLE').toUpperCase();
  if (raw === 'LEFT' || raw === 'RIGHT' || raw === 'MIDDLE') return raw;
  return 'MIDDLE';
}

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

function readString(obj: Record<string, unknown>, key: string, fallback: string): string {
  const v = obj[key];
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function readStringArray(obj: Record<string, unknown>, key: string): string[] {
  const v = obj[key];
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).toUpperCase()).filter(Boolean);
}

function readOptionalAngle(body: Record<string, unknown>): 'front' | 'left' | 'right' | null {
  const raw = readString(body, 'angle', '').toLowerCase();
  if (raw === 'front' || raw === 'left' || raw === 'right') return raw;
  return null;
}

function readBool(obj: Record<string, unknown>, key: string): boolean {
  const v = obj[key];
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes';
  }
  return false;
}

function readFalResolutionForAfterColorStyling(): '1K' | '2K' | '4K' {
  const primary = process.env.WIG_PREVIEW_FAL_STYLING_RESOLUTION?.trim();
  const fallback = process.env.WIG_PREVIEW_FAL_RESOLUTION?.trim();
  const r = (primary || fallback || '2K').toUpperCase();
  if (r === '1K' || r === '2K' || r === '4K') return r;
  return '2K';
}

async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    const admin = await requireAdminFounder(req);
    if (!admin) {
      sendJson(res, 403, { error: 'Founder admin session required' });
      return;
    }

    const falKey = process.env.FAL_KEY?.trim();
    if (!falKey) {
      sendJson(res, 503, { error: 'FAL_KEY is not configured on the server' });
      return;
    }

    const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
    const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';
    const body = parseBody(req);
    const singleAngle = readOptionalAngle(body);
    const forceRegenerate = readBool(body, 'forceRegenerate');
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

    const partStyling = readLayersPartStyling(body);
    const stylingRaw = readString(body, 'styling', 'NONE').toUpperCase();
    const hasLayers = stylingRaw.includes('LAYERS');
    const hasCrimps = stylingRaw.includes('CRIMPS');
    const hasBangs = stylingRaw.includes('BANGS');
    const bangsOnly = hasBangs && !hasLayers && !hasCrimps;
    const middleLayers = hasLayers;
    const middleCrimps = hasCrimps && !hasLayers;

    if (hasLayers && hasCrimps) {
      sendJson(res, 400, {
        error: 'Live styling: pick **LAYERS** or **CRIMPS**, not both in one request.',
      });
      return;
    }

    if (!middleLayers && !middleCrimps && !bangsOnly) {
      sendJson(res, 400, {
        error:
          'Live styling: either (1) LAYERS or CRIMPS (salon style + part from partSelection), or (2) BANGS only without LAYERS/CRIMPS.',
      });
      return;
    }

    const selections: WigPreviewSelections = {
      unitKey: 'NOIR',
      length: readString(body, 'length', '24"'),
      density: readString(body, 'density', '200%'),
      lace: readString(body, 'lace', '13X6'),
      texture: readString(body, 'texture', 'SILKY'),
      color: color.toUpperCase().replace(/\s+/g, ' ').trim(),
      hairline: readString(body, 'hairline', 'NATURAL'),
      styling: stylingRaw,
      addOns: readStringArray(body, 'addOns'),
    };

    const colorTierHash = wigPreviewManifestHashLiveColorTier(selections);
    const colorPaths = wigPreviewLiveAnglePaths(promptVersion, 'NOIR', colorTierHash);
    const storageFolderKey = middleLayers
      ? wigPreviewLiveLayersPartFolder(partStyling)
      : middleCrimps
        ? wigPreviewLiveCrimpsPartFolder(partStyling)
        : 'bangs-only';
    const outPaths = wigPreviewLiveAfterColorStylingPaths(promptVersion, 'NOIR', colorTierHash, storageFolderKey);

    let supabase;
    try {
      supabase = getSupabaseAdminServiceRole();
    } catch {
      sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required for Storage upload' });
      return;
    }

    const angleOrder: Array<'front' | 'left' | 'right'> = ['front', 'left', 'right'];
    const anglesToRun = singleAngle ? [singleAngle] : angleOrder;
    const falResolution = readFalResolutionForAfterColorStyling();
    const generated: string[] = [];
    const skipped: string[] = [];

    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    for (const angle of anglesToRun) {
      const outPath = outPaths[angle];
      if (!forceRegenerate) {
        const { error: outDlErr } = await supabase.storage.from(bucket).download(outPath);
        if (!outDlErr) {
          skipped.push(angle);
          continue;
        }
      }

      const colorPath = colorPaths[angle];
      const { error: colorDlErr } = await supabase.storage.from(bucket).download(colorPath);
      if (colorDlErr) {
        sendJson(res, 400, {
          error:
            'Color preview files not found for this combo. Open NOIR → Color (admin) first so left/front/right color WebPs exist, then try styling again.',
          colorTierHash,
          missingColorPath: colorPath,
        });
        return;
      }

      const { data: pubColor } = supabase.storage.from(bucket).getPublicUrl(colorPath);
      const colorPublicUrl = pubColor?.publicUrl;
      if (!colorPublicUrl) {
        sendJson(res, 500, { error: 'Could not build public URL for color layer' });
        return;
      }

      const prompt = middleLayers
        ? buildLayersStylePromptFromColorTierWebp(angle, partStyling, catalog)
        : middleCrimps
          ? buildCrimpsStylePromptFromColorTierWebp(angle, partStyling, catalog)
          : buildBangsOnlyStylePrompt(angle);
      const imageUrls = [colorPublicUrl];

      const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
        input: {
          prompt,
          image_urls: imageUrls,
          aspect_ratio: 'auto',
          resolution: falResolution,
          output_format: 'webp',
          num_images: 1,
        },
        logs: false,
      });
      const falUrl = (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url;
      if (!falUrl) throw new Error(`fal: no image URL for ${angle}`);

      const buf = await downloadUrlToBuffer(falUrl);
      const { error: upErr } = await supabase.storage.from(bucket).upload(outPath, buf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (upErr) throw new Error(`upload ${outPath}: ${upErr.message}`);
      generated.push(angle);
    }

    const { data: pubFront } = supabase.storage.from(bucket).getPublicUrl(outPaths.front);
    const { data: pubLeft } = supabase.storage.from(bucket).getPublicUrl(outPaths.left);
    const { data: pubRight } = supabase.storage.from(bucket).getPublicUrl(outPaths.right);

    sendJson(res, 200, {
      ok: true,
      colorTierHash,
      fullManifestHash: wigPreviewManifestHash(selections),
      bucket,
      colorPaths,
      outputPaths: outPaths,
      publicUrls: {
        front: pubFront?.publicUrl ?? null,
        left: pubLeft?.publicUrl ?? null,
        right: pubRight?.publicUrl ?? null,
      },
      generated,
      skipped,
      selections,
      stylingMode: middleLayers ? 'middle-layers' : middleCrimps ? 'middle-crimps' : 'bangs-only',
      ...(middleLayers || middleCrimps ? { partSelection: partStyling } : {}),
      ...(singleAngle ? { singleAngle } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[live-wig-after-color-styling]', msg);
    sendJson(res, 500, { error: msg });
  }
}
