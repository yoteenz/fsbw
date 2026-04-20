export const config = {
  maxDuration: 120,
};

/**
 * POST /api/wig-preview/live-noir-color
 *
 * **Signed-in** Supabase session: ensure NOIR forward mannequin exists in Supabase for **3 angles** at current
 * build selections + chosen color; call fal only for missing angles (saves cost). **`forceRegenerate: true`** remains **founder Gmail only**.
 * Paths use **color-tier** hash (`styling` forced to `NONE` in hash) so salon styling changes do not move color files — see `wigPreviewManifestHashLiveColorTier` in `api/_lib/wigPreviewSelectionHash.ts`.
 *
 * Env (Vercel + local):
 *   FAL_KEY
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   WIG_PREVIEW_STORAGE_BUCKET (default: live-preview or wig-preview)
 *   WIG_PREVIEW_PROMPT_VERSION (default: v1)
 *   WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL, _LEFT_URL, _RIGHT_URL — public URLs to gray-brick refs (one image per angle; **no** logo attachment — logo in prompt text only, matching your successful fal flow)
 *
 * Optional JSON body field **`angle`**: `"left"` | `"front"` | `"right"` — generate **only** that angle in this invocation (for Vercel Hobby ~10s limit). Omit **`angle`** to process all three in one request (needs Pro / higher `maxDuration`).
 * Optional **`forceRegenerate`**: `true` — run fal even if WebPs exist (**founder session only**). Without it, any signed-in user may invoke (missing angles only).
 *
 * Optional env **`WIG_PREVIEW_FAL_RESOLUTION`**: `4K` (default), `2K`, or `1K` — use **`1K`** / **`2K`** if Vercel timeouts (e.g. Hobby) or fal cost is an issue.
 *
 * **Bundling:** This file intentionally inlines helpers that normally live under `api/_lib/`.
 * Vercel’s output for nested `api/wig-preview/*` can fail to resolve `../_lib/*` at runtime (`ERR_MODULE_NOT_FOUND`).
 * If you change hashing, colors, or admin rules, update **`api/_lib/wigPreviewSelectionHash.ts`**, **`bawCatalogHairColors.ts`**, **`adminAuth.ts`**, **`supabase.ts`** and mirror here — or move this handler to **`api/live-noir-color.ts`** and use `./_lib/...` imports.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

// --- Inlined from api/_lib/auth.ts (keep in sync) ---
async function getAuthUser(
  req: VercelRequest
): Promise<{ id: string; email: string; accessToken: string } | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? '', accessToken: token };
}

// --- Inlined from api/_lib/adminAuth.ts (keep in sync) ---
/** Fal NOIR live color: founder Gmail only — see `requireAdminFounder` in api/_lib/adminAuth.ts */
const FOUNDER_PRIVILEGED_ADMIN_EMAIL = 'kateenaarmstrong@gmail.com';

async function requireAdminFounder(
  req: VercelRequest
): Promise<{ id: string; email: string; accessToken: string } | null> {
  const user = await getAuthUser(req);
  if (!user) return null;
  const emailLower = (user.email || '').trim().toLowerCase();
  if (emailLower !== FOUNDER_PRIVILEGED_ADMIN_EMAIL) return null;
  return user;
}

// --- Inlined from api/_lib/supabase.ts (service role only; keep in sync) ---
let serviceRoleClient: SupabaseClient | null = null;

function getSupabaseAdminServiceRole(): SupabaseClient {
  if (!serviceRoleClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (required for admin clients list)');
    }
    serviceRoleClient = createClient(url, key);
  }
  return serviceRoleClient;
}

// --- Inlined from api/_lib/wigPreviewSelectionHash.ts (keep in sync) ---
type WigPreviewSelections = {
  unitKey: string;
  length: string;
  density: string;
  lace: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  addOns: string[];
};

function canonicalSelections(obj: Record<string, string>): string {
  const keys = Object.keys(obj).sort();
  const ordered: Record<string, string> = {};
  for (const k of keys) ordered[k] = obj[k];
  return JSON.stringify(ordered);
}

function selectionHash(canonicalJson: string): string {
  return createHash('sha256').update(canonicalJson).digest('hex').slice(0, 32);
}

/** Keep in sync with `api/_lib/bawCatalogHairColors.ts` `canonicalWigPreviewColorForHash`. */
function canonicalWigPreviewColorForHash(color: string): string {
  const u = String(color || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  const aliases: Record<string, string> = {
    'OFF BLACK': 'OFF_BLACK',
    OFF_BLACK: 'OFF_BLACK',
    'JET BLACK': 'JET_BLACK_OFF_BLACK',
    'JET BLACK OFF BLACK': 'JET_BLACK_OFF_BLACK',
    JET_BLACK: 'JET_BLACK_OFF_BLACK',
    JET_BLACK_OFF_BLACK: 'JET_BLACK_OFF_BLACK',
  };
  if (aliases[u]) return aliases[u];
  const underscored = u.replace(/\s+/g, '_');
  if (aliases[underscored]) return aliases[underscored];
  return underscored;
}

function wigPreviewManifestHash(s: WigPreviewSelections): string {
  const unitKey = String(s.unitKey || 'NOIR').toUpperCase();
  const addOns = Array.isArray(s.addOns) ? s.addOns.map((x) => String(x).toUpperCase()) : [];
  const canonicalJson = canonicalSelections({
    unitKey,
    length: String(s.length),
    density: String(s.density),
    lace: String(s.lace),
    texture: String(s.texture),
    color: canonicalWigPreviewColorForHash(String(s.color)),
    hairline: String(s.hairline),
    styling: String(s.styling),
    addOns: [...addOns].sort().join(','),
  });
  return selectionHash(canonicalJson);
}

/** Live color WebPs: styling forced NONE so after-color styling can find these paths. Keep in sync with `wigPreviewSelectionHash.ts`. */
function wigPreviewManifestHashLiveColorTier(s: WigPreviewSelections): string {
  return wigPreviewManifestHash({ ...s, styling: 'NONE' });
}

function wigPreviewLiveAnglePaths(
  promptVersion: string,
  unitKey: string,
  manifestHash: string
): { front: string; left: string; right: string } {
  const u = unitKey.toUpperCase();
  const base = `wig-preview-live/${promptVersion}/${u}/${manifestHash}`;
  return {
    front: `${base}/front.webp`,
    left: `${base}/left.webp`,
    right: `${base}/right.webp`,
  };
}

// --- Inlined from api/_lib/bawCatalogHairColors.ts (keep in sync) ---
const BAW_CATALOG_HAIR_COLOR_HEX: Record<string, { label: string; hex: string }> = {
  ESPRESSO: { label: 'espresso', hex: '361504' },
  CHESTNUT: { label: 'chestnut', hex: '643118' },
  HONEY: { label: 'honey', hex: 'BB883C' },
  AUBURN: { label: 'auburn', hex: '925927' },
  COPPER: { label: 'copper', hex: '763412' },
  GINGER: { label: 'ginger', hex: 'E35B2A' },
  SANGRIA: { label: 'sangria', hex: '731921' },
  CHERRY: { label: 'cherry', hex: 'FF1400' },
  RASPBERRY: { label: 'raspberry', hex: 'DA3063' },
  PLUM: { label: 'plum', hex: '5B177C' },
  COBALT: { label: 'cobalt', hex: '25067B' },
  TEAL: { label: 'teal', hex: '7BE7CA' },
  SLIME: { label: 'slime', hex: '63D54B' },
  CITRINE: { label: 'citrine', hex: 'E3E851' },
  JET_BLACK: { label: 'jet black', hex: '000000' },
  OFF_BLACK: { label: 'off black', hex: '160604' },
  'JET BLACK': { label: 'jet black', hex: '000000' },
  'OFF BLACK': { label: 'off black', hex: '160604' },
};

function catalogColorForPrompt(colorId: string): { label: string; hex: string } | null {
  const raw = String(colorId || '').trim().toUpperCase();
  if (raw === 'PINK') return BAW_CATALOG_HAIR_COLOR_HEX.RASPBERRY;
  const spaced = raw;
  const underscored = raw.replace(/\s+/g, '_');
  return BAW_CATALOG_HAIR_COLOR_HEX[spaced] ?? BAW_CATALOG_HAIR_COLOR_HEX[underscored] ?? null;
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

function readFalResolution(): '1K' | '2K' | '4K' {
  const r = (process.env.WIG_PREVIEW_FAL_RESOLUTION || '4K').trim().toUpperCase();
  if (r === '1K' || r === '2K' || r === '4K') return r;
  return '4K';
}

function isJetBlackOffBlackCatalogColor(label: string, hex: string): boolean {
  const h = hex.replace(/^#/, '').toUpperCase();
  if (h === '000000' || h === '00000') return true;
  const l = label.toLowerCase();
  return l.includes('jet black') || l.includes('off black');
}

/** Keep in sync with `api/_lib/bawFalEditFidelityPrompt.ts` (this file cannot import `_lib` on Vercel). */
const BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK = [
  'Treat the input as a **photograph to preserve**, not a scene to repaint: keep **the same effective resolution, sharpness, grain, and micro-detail** as the reference — do **not** downscale, blur, soften, over-smooth, or add a plastic / waxy / painterly CGI look.',
  'Lock **mannequin bust material**, **skin tone**, **facial features**, and **neck seam** to the reference — **no** melting, warping, retexturing, or “beauty filter” on the figure.',
  'Lock **background bricks**, **lighting**, **shadows**, and **camera perspective** to the reference unless the prompt explicitly asks to change them.',
  'Keep the **FRONTAL SLAYER** chest logo **sharp**, same **size** and **placement**, clean edges — **no** smeared, redrawn, or re-typed lettering.',
].join(' ');

/** Step 2 color: one mannequin ref only — logo described in text (no logo file in image_urls). */
function buildStep2PromptNoLogoAttachment(
  label: string,
  hex: string,
  angle: 'front' | 'left' | 'right'
): string {
  const angleConstraint =
    angle === 'left'
      ? 'This is the **LEFT 3/4 view**: keep hair mass biased toward the **viewer’s right** (mannequin’s left); do **not** add a second mirrored sweep on the opposite shoulder. Preserve the reference image’s part direction and silhouette.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 view**: keep hair mass biased toward the **viewer’s left** (mannequin’s right); do **not** add a second mirrored sweep on the opposite shoulder. Preserve the reference image’s part direction and silhouette. **Keep the same camera angle and framing as the reference** (true right 3/4, not front, not mirrored left); do **not** rotate the head toward camera.'
        : 'This is the **FRONT view**: keep the **exact** part line, silhouette, and **one-sided shoulder sweep** from the reference (same as the black reference — often more hair on one shoulder). Do **not** mirror hair onto the opposite shoulder, do **not** invent a second symmetric drape, and do **not** widen the style to “both shoulders.” **Only** recolor the existing black hair; do **not** change cut, length, or volume.';

  const nearBlack = isJetBlackOffBlackCatalogColor(label, hex);
  const recolorLead = nearBlack
    ? 'Recreate this exact mannequin image. The wig hair is already black in the reference — **do not** apply a “hair dye” fantasy transform. Instead **match and lock** the hair to **' +
      label +
      '** at hex **#' +
      hex +
      '**: same silhouette, part, length, volume, and shoulder bias as the reference; **only** normalize tone/sheen to a consistent salon black. Do **not** restyle, do **not** change which side the hair falls toward, do **not** invent flyaways or a new part.'
    : 'Recreate this exact mannequin image, but change the black hair color to ' +
      label +
      ' hex code #' +
      hex +
      ' & ensure this color looks as closely to authentically colored/dyed hair & not a weird unrealistic shade.';

  return [
    recolorLead,
    angleConstraint,
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    'The logo on the center of the mannequin’s chest should be clear & legible — FRONTAL SLAYER fully readable — for accuracy & consistency.',
    'The photo should be extremely high-quality, crisp & pixel perfect.',
    'Do not change anything else about the photo except **hair color** as specified.',
  ].join(' ');
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

  const bodyPreview = parseBody(req);
  const forceRegeneratePreview = readBool(bodyPreview, 'forceRegenerate');

  if (forceRegeneratePreview) {
    const founder = await requireAdminFounder(req);
    if (!founder) {
      sendJson(res, 403, { error: 'Founder admin session required for forceRegenerate' });
      return;
    }
  } else {
    const user = await getAuthUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Sign in required' });
      return;
    }
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    sendJson(res, 503, { error: 'FAL_KEY is not configured on the server' });
    return;
  }

  const frontUrl = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL?.trim();
  const leftUrl = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL?.trim();
  const rightUrl = process.env.WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL?.trim();
  if (!frontUrl || !leftUrl || !rightUrl) {
    sendJson(res, 503, {
      error: 'Missing public mannequin image URLs for live generation',
      missing: {
        WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL: !frontUrl,
        WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL: !leftUrl,
        WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL: !rightUrl,
      },
    });
    return;
  }

  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || 'live-preview';
  const promptVersion = process.env.WIG_PREVIEW_PROMPT_VERSION?.trim() || 'v1';

  const body = bodyPreview;
  const singleAngle = readOptionalAngle(body);
  const forceRegenerate = forceRegeneratePreview;
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

  const manifestHash = wigPreviewManifestHashLiveColorTier(selections);
  const paths = wigPreviewLiveAnglePaths(promptVersion, 'NOIR', manifestHash);
  const angleOrder: Array<'front' | 'left' | 'right'> = ['front', 'left', 'right'];
  const anglesToRun = singleAngle ? [singleAngle] : angleOrder;
  const mannequinByAngle = { front: frontUrl, left: leftUrl, right: rightUrl } as const;
  const falResolution = readFalResolution();

  let supabase;
  try {
    supabase = getSupabaseAdminServiceRole();
  } catch {
    sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required for Storage upload' });
    return;
  }

  const generated: string[] = [];
  const skipped: string[] = [];

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    for (const angle of anglesToRun) {
      const path = paths[angle];
      if (!forceRegenerate) {
        const { error: dlErr } = await supabase.storage.from(bucket).download(path);
        if (!dlErr) {
          skipped.push(angle);
          continue;
        }
      }

      const prompt = buildStep2PromptNoLogoAttachment(catalog.label, catalog.hex, angle);
      const mannequinUrl = mannequinByAngle[angle];
      const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
        input: {
          prompt,
          image_urls: [mannequinUrl],
          aspect_ratio: 'auto',
          resolution: falResolution,
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
    const publicUrls = {
      front: pubFront?.publicUrl ?? null,
      left: pubLeft?.publicUrl ?? null,
      right: pubRight?.publicUrl ?? null,
    };

    sendJson(res, 200, {
      ok: true,
      manifestHash,
      bucket,
      paths,
      publicUrls,
      generated,
      skipped,
      selections,
      ...(singleAngle ? { singleAngle } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[wig-preview/live-noir-color]', msg);
    sendJson(res, 500, { error: msg });
    return;
  }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[wig-preview/live-noir-color] outer', msg);
    try {
      sendJson(res, 500, { error: msg });
    } catch {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: msg }));
    }
  }
}
