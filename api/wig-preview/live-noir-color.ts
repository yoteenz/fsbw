export const config = {
  maxDuration: 120,
};

/**
 * POST /api/wig-preview/live-noir-color
 *
 * Admin-only: ensure NOIR forward mannequin exists in Supabase for **3 angles** at current
 * build selections + chosen color; call fal only for missing angles (saves cost).
 *
 * Env (Vercel + local):
 *   FAL_KEY
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   WIG_PREVIEW_STORAGE_BUCKET (default: live-preview or wig-preview)
 *   WIG_PREVIEW_PROMPT_VERSION (default: v1)
 *   WIG_PREVIEW_LIVE_LOGO_URL — public URL to logo image for fal image_urls[1]
 *   WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL, _LEFT_URL, _RIGHT_URL — public URLs to gray-brick refs
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdminServiceRole } from '../_lib/supabase';
import { wigPreviewManifestHash, wigPreviewLiveAnglePaths, type WigPreviewSelections } from '../_lib/wigPreviewSelectionHash';
import { catalogColorForPrompt } from '../_lib/bawCatalogHairColors';

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

function buildStep2Prompt(label: string, hex: string): string {
  return [
    'Recreate this exact mannequin image, but change the black hair color to ' +
      label +
      ' hex code #' +
      hex +
      ' & ensure this color looks as closely to authentically colored/dyed hair & not a weird unrealistic shade.',
    'The logo on the center of the mannequin’s chest should look exactly like reference image with FRONTAL SLAYER fully legible for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo.',
  ].join(' ');
}

async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
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

  const logoUrl = process.env.WIG_PREVIEW_LIVE_LOGO_URL?.trim();
  const frontUrl = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL?.trim();
  const leftUrl = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL?.trim();
  const rightUrl = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL?.trim();
  if (!logoUrl || !frontUrl || !leftUrl || !rightUrl) {
    sendJson(res, 503, {
      error: 'Missing public image URLs for live generation',
      missing: {
        WIG_PREVIEW_LIVE_LOGO_URL: !logoUrl,
        WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL: !frontUrl,
        WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL: !leftUrl,
        WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL: !rightUrl,
      },
    });
    return;
  }

  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';

  const body = parseBody(req);
  const color = readString(body, 'color', '');
  if (!color) {
    sendJson(res, 400, { error: 'color is required' });
    return;
  }

  const catalog = catalogColorForPrompt(color);
  if (!catalog) {
    sendJson(res, 400, { error: `Unknown color for live NOIR preview: ${color}` });
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
    styling: readString(body, 'styling', 'NONE'),
    addOns: readStringArray(body, 'addOns'),
  };

  const manifestHash = wigPreviewManifestHash(selections);
  const paths = wigPreviewLiveAnglePaths(promptVersion, 'NOIR', manifestHash);
  const angleOrder: Array<'front' | 'left' | 'right'> = ['front', 'left', 'right'];
  const mannequinByAngle = { front: frontUrl, left: leftUrl, right: rightUrl } as const;

  let supabase;
  try {
    supabase = getSupabaseAdminServiceRole();
  } catch {
    sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required for Storage upload' });
    return;
  }

  const prompt = buildStep2Prompt(catalog.label, catalog.hex);
  const generated: string[] = [];
  const skipped: string[] = [];

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    for (const angle of angleOrder) {
      const path = paths[angle];
      const { error: dlErr } = await supabase.storage.from(bucket).download(path);
      if (!dlErr) {
        skipped.push(angle);
        continue;
      }

      const mannequinUrl = mannequinByAngle[angle];
      const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
        input: {
          prompt,
          image_urls: [mannequinUrl, logoUrl],
          aspect_ratio: 'auto',
          resolution: '2K',
          output_format: 'webp',
          num_images: 1,
        },
        logs: false,
      });
      const url = (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url;
      if (!url) throw new Error(`fal: no image URL for ${angle}`);

      const buf = await downloadUrlToBuffer(url);
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (upErr) throw new Error(`upload ${path}: ${upErr.message}`);
      generated.push(angle);
    }

    const { data: pubFront } = supabase.storage.from(bucket).getPublicUrl(paths.front);
    const { data: pubLeft } = supabase.storage.from(bucket).getPublicUrl(paths.left);
    const { data: pubRight } = supabase.storage.from(bucket).getPublicUrl(paths.right);

    sendJson(res, 200, {
      ok: true,
      manifestHash,
      bucket,
      paths,
      publicUrls: {
        front: pubFront?.publicUrl ?? null,
        left: pubLeft?.publicUrl ?? null,
        right: pubRight?.publicUrl ?? null,
      },
      generated,
      skipped,
      selections,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[wig-preview/live-noir-color]', msg);
    sendJson(res, 500, { error: msg });
  }
}
