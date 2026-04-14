export const config = { maxDuration: 120 };

/**
 * POST /api/live-wig-after-color-styling
 *
 * Admin-only. **After** live color WebPs exist, runs fal once per angle to apply **middle part + layers**.
 * Each fal call uses **two** `image_urls`: (1) **color** WebP for that angle, (2) **style inspo** for that angle
 * from env **`WIG_PREVIEW_NOIR_MIDDLE_LAYERS_STYLE_LEFT_URL`**, **`_FRONT_`**, **`_RIGHT_`** (public URLs, same pattern as brick mannequin refs).
 *
 * **Color files live at** `wig-preview-live/{v}/NOIR/{colorTierHash}/{angle}.webp` where `colorTierHash` uses **styling: NONE**
 * so changing salon styling does not move the color folder.
 *
 * **Output:** `wig-preview-live/{v}/NOIR/{colorTierHash}/after-color/middle-layers/{angle}.webp`
 *
 * Body: same selection fields as live color + optional `angle` (left|front|right) + `color` (required for catalog).
 * Optional **`forceRegenerate`**: `true` — re-run fal for requested angle(s) even if output WebP exists.
 * `partSelection` must be **MIDDLE** and `styling` must include **LAYERS**.
 *
 * Optional env **`WIG_PREVIEW_FAL_RESOLUTION`**: **`4K`** (default), **`2K`**, or **`1K`** — same as live color route.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/adminAuth';
import { getSupabaseAdminServiceRole } from './_lib/supabase';
import {
  wigPreviewManifestHash,
  wigPreviewManifestHashLiveColorTier,
  wigPreviewLiveAnglePaths,
  wigPreviewLiveAfterColorStylingPaths,
  type WigPreviewSelections,
} from './_lib/wigPreviewSelectionHash';
import { catalogColorForPrompt } from './_lib/bawCatalogHairColors';
import { buildMiddlePartLayersStylePromptTwoImages } from './_lib/bawLiveStylingPrompts';

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

function readFalResolution(): '1K' | '2K' | '4K' {
  const r = (process.env.WIG_PREVIEW_FAL_RESOLUTION || '4K').trim().toUpperCase();
  if (r === '1K' || r === '2K' || r === '4K') return r;
  return '4K';
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

    const admin = await requireAdmin(req);
    if (!admin) {
      sendJson(res, 403, { error: 'Admin session required' });
      return;
    }

    const falKey = process.env.FAL_KEY?.trim();
    if (!falKey) {
      sendJson(res, 503, { error: 'FAL_KEY is not configured on the server' });
      return;
    }

    const styleFrontUrl = process.env.WIG_PREVIEW_NOIR_MIDDLE_LAYERS_STYLE_FRONT_URL?.trim();
    const styleLeftUrl = process.env.WIG_PREVIEW_NOIR_MIDDLE_LAYERS_STYLE_LEFT_URL?.trim();
    const styleRightUrl = process.env.WIG_PREVIEW_NOIR_MIDDLE_LAYERS_STYLE_RIGHT_URL?.trim();
    if (!styleFrontUrl || !styleLeftUrl || !styleRightUrl) {
      sendJson(res, 503, {
        error: 'Missing public style-inspo image URLs for middle + layers (one per angle)',
        missing: {
          WIG_PREVIEW_NOIR_MIDDLE_LAYERS_STYLE_FRONT_URL: !styleFrontUrl,
          WIG_PREVIEW_NOIR_MIDDLE_LAYERS_STYLE_LEFT_URL: !styleLeftUrl,
          WIG_PREVIEW_NOIR_MIDDLE_LAYERS_STYLE_RIGHT_URL: !styleRightUrl,
        },
      });
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

    const partSelection = readString(body, 'partSelection', 'MIDDLE').toUpperCase();
    const stylingRaw = readString(body, 'styling', 'NONE').toUpperCase();
    if (partSelection !== 'MIDDLE' || !stylingRaw.includes('LAYERS')) {
      sendJson(res, 400, {
        error: 'Live styling requires part MIDDLE and styling including LAYERS (middle + layers).',
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
    const outPaths = wigPreviewLiveAfterColorStylingPaths(
      promptVersion,
      'NOIR',
      colorTierHash,
      'middle-layers'
    );

    let supabase;
    try {
      supabase = getSupabaseAdminServiceRole();
    } catch {
      sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required for Storage upload' });
      return;
    }

    const angleOrder: Array<'front' | 'left' | 'right'> = ['front', 'left', 'right'];
    const anglesToRun = singleAngle ? [singleAngle] : angleOrder;
    const falResolution = readFalResolution();
    const generated: string[] = [];
    const skipped: string[] = [];

    const styleRefByAngle = {
      front: styleFrontUrl,
      left: styleLeftUrl,
      right: styleRightUrl,
    } as const;

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

      const styleRefUrl = styleRefByAngle[angle];
      const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
        input: {
          prompt: buildMiddlePartLayersStylePromptTwoImages(angle),
          image_urls: [colorPublicUrl, styleRefUrl],
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
      ...(singleAngle ? { singleAngle } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[live-wig-after-color-styling]', msg);
    sendJson(res, 500, { error: msg });
  }
}
