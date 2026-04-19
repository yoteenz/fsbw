export const config = { maxDuration: 120 };

/**
 * POST /api/live-wig-after-color-styling
 *
 * Admin-only. Runs fal once per angle.
 *
 * **LAYERS** (any part **MIDDLE** | **LEFT** | **RIGHT**): single `image_urls` — same **HQ** mannequin refs as color
 * (`WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL`, `_LEFT_URL`, `_RIGHT_URL`). Prompt: preserve scene like color; **only**
 * restyle hair to **layered curls** with the chosen **part** (`buildLayersStylePromptFromHqMannequinRef`).
 * **Output:** `.../after-color/layers-{middle|left|right}-part/{angle}.webp`
 *
 * **BANGS only** (BANGS without LAYERS): requires **live color WebPs** for this tier — single `image_urls` = color WebP;
 * `buildBangsOnlyStylePrompt`. **Output:** `.../after-color/bangs-only/{angle}.webp`
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
  wigPreviewLiveLayersPartFolder,
  type WigPreviewSelections,
} from './_lib/wigPreviewSelectionHash.js';
import { catalogColorForPrompt } from './_lib/bawCatalogHairColors.js';
import {
  buildBangsOnlyStylePrompt,
  buildLayersStylePromptFromHqMannequinRef,
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
    if (!catalogColorForPrompt(color)) {
      sendJson(res, 400, { error: `Unknown color: ${color}` });
      return;
    }

    const partStyling = readLayersPartStyling(body);
    const stylingRaw = readString(body, 'styling', 'NONE').toUpperCase();
    const hasLayers = stylingRaw.includes('LAYERS');
    const hasBangs = stylingRaw.includes('BANGS');
    const bangsOnly = hasBangs && !hasLayers;
    const middleLayers = hasLayers;

    if (!middleLayers && !bangsOnly) {
      sendJson(res, 400, {
        error:
          'Live styling: either (1) styling including LAYERS (layers + part from partSelection), or (2) styling BANGS only without LAYERS.',
      });
      return;
    }

    const hqFront = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL?.trim();
    const hqLeft = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL?.trim();
    const hqRight = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL?.trim();
    if (middleLayers && (!hqFront || !hqLeft || !hqRight)) {
      sendJson(res, 503, {
        error:
          'LAYERS styling uses the same HQ mannequin URLs as color: set WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL, WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL, WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL.',
        missing: {
          WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL: !hqFront,
          WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL: !hqLeft,
          WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL: !hqRight,
        },
      });
      return;
    }
    const hqMannequinByAngle =
      hqFront && hqLeft && hqRight
        ? ({ front: hqFront, left: hqLeft, right: hqRight } as const)
        : null;

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
    const storageFolderKey = middleLayers ? wigPreviewLiveLayersPartFolder(partStyling) : 'bangs-only';
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

      let prompt: string;
      let imageUrls: string[];

      if (middleLayers && hqMannequinByAngle) {
        const mannequinUrl = hqMannequinByAngle[angle];
        prompt = buildLayersStylePromptFromHqMannequinRef(angle, partStyling);
        imageUrls = [mannequinUrl];
      } else {
        const colorPath = colorPaths[angle];
        const { error: colorDlErr } = await supabase.storage.from(bucket).download(colorPath);
        if (colorDlErr) {
          sendJson(res, 400, {
            error:
              'Color preview files not found for this combo. Open NOIR → Color (admin) first so left/front/right color WebPs exist, then try bangs styling again.',
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

        prompt = buildBangsOnlyStylePrompt(angle);
        imageUrls = [colorPublicUrl];
      }

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
      stylingMode: middleLayers ? 'middle-layers' : 'bangs-only',
      ...(middleLayers ? { partSelection: partStyling } : {}),
      ...(singleAngle ? { singleAngle } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[live-wig-after-color-styling]', msg);
    sendJson(res, 500, { error: msg });
  }
}
