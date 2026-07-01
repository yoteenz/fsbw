export const config = {
  maxDuration: 300,
};

/**
 * POST /api/wig-preview/live-noir-color
 *
 * **Signed-in** Supabase session: ensure NOIR forward mannequin exists in Supabase for **3 angles** at current
 * build selections + chosen color; call fal **GPT Image 2** (`openai/gpt-image-2/edit`) only for missing angles (saves cost). **`forceRegenerate: true`** re-runs fal even when WebPs exist (any **signed-in** user).
 * Paths use **color-tier** hash (`styling` forced to `NONE` in hash) so salon styling changes do not move color files — see `wigPreviewManifestHashLiveColorTier` in `api/_lib/wigPreviewSelectionHash.ts`.
 *
 * Env (Vercel + local):
 *   FAL_KEY
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   WIG_PREVIEW_STORAGE_BUCKET (default: live-preview or wig-preview)
 *   WIG_PREVIEW_PROMPT_VERSION (default: v1)
 *   WIG_PREVIEW_NOIR_FAL_MANNEQUIN_FRONT_URL, _LEFT_URL, _RIGHT_URL — optional Fal gray-brick scene overrides
 *     (defaults: live-preview/Noir/fal-gray-brick-{front|left|right}.png). Legacy WIG_PREVIEW_NOIR_MANNEQUIN_* also accepted.
 *     UI overlays (image 26|27|28) are **not** Fal inputs — see `api/_lib/bawNoirFalMannequinUrls.ts`.
 *
 * Optional JSON body field **`angle`**: `"left"` | `"front"` | `"right"` — generate **only** that angle in this invocation (for Vercel Hobby ~10s limit). Omit **`angle`** to process all three in one request (needs Pro / higher `maxDuration`).
 * Optional **`forceRegenerate`**: `true` — run fal even if WebPs exist. Requires a **signed-in** Supabase session (same as missing-angle generation).
 *
 * **L/R angles:** when **FRONT (M)** color output exists, side passes use **`[ front colored, gray-brick side pose ]`** (hair from FRONT, **lighting/scene from gray-brick**). Client: **front → left → right** sequentially. **L/R cache is skipped** when **FRONT (M)** is newer than the side file (re-anchors after M regen).
 *
 * Model: **`openai/gpt-image-2/edit`** — `image_size` **3:4** (`1536×2048`), `quality: high` (override `WIG_PREVIEW_LIVE_GPT2_QUALITY`), `output_format: png` (override `WIG_PREVIEW_LIVE_OUTPUT_FORMAT=webp`).
 *
 * **Bundling:** This file intentionally inlines helpers that normally live under `api/_lib/`.
 * Vercel’s output for nested `api/wig-preview/*` can fail to resolve `../_lib/*` at runtime (`ERR_MODULE_NOT_FOUND`).
 * If you change hashing, colors or admin rules, update **`api/_lib/wigPreviewSelectionHash.ts`**, **`bawCatalogHairColors.ts`**, **`adminAuth.ts`**, **`supabase.ts`** and mirror here — or move this handler to **`api/live-noir-color.ts`** and use `./_lib/...` imports.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

/** Keep in sync with `api/_lib/bawNoirFalMannequinUrls.ts`. */
const NOIR_FAL_GRAY_BRICK_LEFT_MANNEQUIN_PUBLIC_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/fal-gray-brick-left.png';
const NOIR_FAL_GRAY_BRICK_FRONT_MANNEQUIN_PUBLIC_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/fal-gray-brick-front.png';
const NOIR_FAL_GRAY_BRICK_RIGHT_MANNEQUIN_PUBLIC_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/fal-gray-brick-right.png';

function envTrim(key: string): string {
  return process.env[key]?.trim() || '';
}

function noirFalGrayBrickMannequinPublicUrlForAngle(angle: 'front' | 'left' | 'right'): string {
  const envByAngle = {
    front:
      envTrim('WIG_PREVIEW_NOIR_FAL_MANNEQUIN_FRONT_URL') || envTrim('WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL'),
    left: envTrim('WIG_PREVIEW_NOIR_FAL_MANNEQUIN_LEFT_URL') || envTrim('WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL'),
    right: envTrim('WIG_PREVIEW_NOIR_FAL_MANNEQUIN_RIGHT_URL') || envTrim('WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL'),
  };
  if (angle === 'left') return envByAngle.left || NOIR_FAL_GRAY_BRICK_LEFT_MANNEQUIN_PUBLIC_URL;
  if (angle === 'right') return envByAngle.right || NOIR_FAL_GRAY_BRICK_RIGHT_MANNEQUIN_PUBLIC_URL;
  return envByAngle.front || NOIR_FAL_GRAY_BRICK_FRONT_MANNEQUIN_PUBLIC_URL;
}

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

/** Keep in sync with `api/_lib/bawLivePreviewOutputFormat.ts`. */
function wigPreviewLiveOutputFormat(): 'png' | 'webp' {
  const raw = process.env.WIG_PREVIEW_LIVE_OUTPUT_FORMAT?.trim().toLowerCase();
  return raw === 'webp' ? 'webp' : 'png';
}

function wigPreviewLiveAngleFileName(angle: 'front' | 'left' | 'right'): string {
  return `${angle}.${wigPreviewLiveOutputFormat()}`;
}

function bawGpt2LivePreviewQuality(): 'low' | 'medium' | 'high' | 'auto' {
  const raw = process.env.WIG_PREVIEW_LIVE_GPT2_QUALITY?.trim().toLowerCase();
  if (raw === 'medium' || raw === 'low' || raw === 'auto') return raw;
  return 'high';
}

async function livePreviewObjectExists(
  supabase: SupabaseClient,
  bucket: string,
  preferredPath: string
): Promise<{ storagePath: string } | null> {
  const { error } = await supabase.storage.from(bucket).download(preferredPath);
  if (!error) return { storagePath: preferredPath };
  if (preferredPath.endsWith('.png')) {
    const legacy = preferredPath.replace(/\.png$/, '.webp');
    const { error: legacyErr } = await supabase.storage.from(bucket).download(legacy);
    if (!legacyErr) return { storagePath: legacy };
  }
  return null;
}

/** Storage `updated_at` for cache invalidation (side color must re-anchor when FRONT is newer). */
async function livePreviewStorageObjectUpdatedAt(
  supabase: SupabaseClient,
  bucket: string,
  preferredPath: string
): Promise<number | null> {
  const hit = await livePreviewObjectExists(supabase, bucket, preferredPath);
  if (!hit) return null;
  const parts = hit.storagePath.split('/');
  const name = parts.pop();
  if (!name) return null;
  const dir = parts.join('/');
  const { data, error } = await supabase.storage.from(bucket).list(dir, {
    limit: 200,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error || !data?.length) return null;
  const obj = data.find((o) => o.name === name);
  if (!obj) return null;
  const ts = obj.updated_at || obj.created_at;
  return ts ? new Date(ts).getTime() : null;
}

/** True when FRONT (M) was regenerated after this L/R file — side must re-run with front anchor. */
async function livePreviewSideColorStaleVsFront(
  supabase: SupabaseClient,
  bucket: string,
  sidePath: string,
  frontPath: string
): Promise<boolean> {
  const frontAt = await livePreviewStorageObjectUpdatedAt(supabase, bucket, frontPath);
  if (!frontAt) return false;
  const sideAt = await livePreviewStorageObjectUpdatedAt(supabase, bucket, sidePath);
  if (!sideAt) return true;
  return frontAt > sideAt;
}

function wigPreviewLiveAnglePaths(
  promptVersion: string,
  unitKey: string,
  manifestHash: string
): { front: string; left: string; right: string } {
  const u = unitKey.toUpperCase();
  const base = `wig-preview-live/${promptVersion}/${u}/${manifestHash}`;
  return {
    front: `${base}/${wigPreviewLiveAngleFileName('front')}`,
    left: `${base}/${wigPreviewLiveAngleFileName('left')}`,
    right: `${base}/${wigPreviewLiveAngleFileName('right')}`,
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

function isJetBlackOffBlackCatalogColor(label: string, hex: string): boolean {
  const h = hex.replace(/^#/, '').toUpperCase();
  if (h === '000000' || h === '00000') return true;
  const l = label.toLowerCase();
  return l.includes('jet black') || l.includes('off black');
}

/** Keep in sync with `api/_lib/bawFalEditFidelityPrompt.ts` (this file cannot import `_lib` on Vercel). */
const BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK = [
  'Treat the input as a **photograph to preserve**, not a scene to repaint: keep **the same effective resolution, sharpness, grain and micro-detail** as the reference — do **not** downscale, blur, soften, over-smooth or add a plastic / waxy / painterly CGI look.',
  'Lock **mannequin bust material**, **skin tone**, **facial features** and **neck seam** to the reference — **no** melting, warping, retexturing or “beauty filter” on the figure.',
  'Lock **background bricks**, **lighting**, **shadows** and **camera perspective** to the reference unless the prompt explicitly asks to change them.',
  'The words on the logo on the chest must read **FRONTAL SLAYER** — keep the logo **consistent** (same size, placement, sharp lettering) for accuracy — **no** smeared, redrawn or re-typed lettering.',
].join(' ');

const BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK =
  'Keep **everything else exactly the same** — same mannequin, brick background, lighting and framing; **only** change the **hair color** as specified. The words on the logo on the chest must read **FRONTAL SLAYER**; keep the logo **consistent** for accuracy.';

const BAW_GPT2_NOIR_COLOR_SCENE_MASTER_BLOCK =
  '**#0 SCENE MASTER (automatic fail if violated):** The input photograph is the **only** source for **crop, canvas size, aspect ratio, camera distance, zoom, head scale, bust scale, bottom alignment, brick tile scale**, **lighting**, **shadows**, and **FRONTAL SLAYER** logo placement. Output must be **pixel-aligned** with that reference — **identical composition** across every color swatch. **FORBIDDEN:** zoom in/out, pan, reframe, subject drift, or a tighter/wider crop than the reference. **Only** hair **pigment** may change.';

const BAW_GPT2_NOIR_COLOR_FRAMING_LOCK =
  '**Framing lock:** Do **not** resize, reposition, re-crop or zoom the mannequin bust or the leaf-brick background. The figure must stay **the same scale** and **bottom-aligned** in the frame as the reference — **identical crop and zoom to the gray-brick reference on every swatch** — **only** hair pigment changes. **FORBIDDEN:** pan left/right, zoom, reframe, or any shift in composition.';

/** Step 2 color: one mannequin ref only — logo described in text (no logo file in image_urls). */
function buildStep2PromptNoLogoAttachment(
  label: string,
  hex: string,
  angle: 'front' | 'left' | 'right'
): string {
  const angleConstraint =
    angle === 'left'
      ? 'This is the **LEFT 3/4 view**: keep hair mass biased toward the **viewer’s right** (mannequin’s left); do **not** add a second mirrored sweep on the opposite shoulder. Preserve the reference image’s part direction and silhouette. **Keep the same camera angle and framing as the reference** (true left 3/4, not front, not mirrored right); do **not** rotate the head toward camera.'
      : angle === 'right'
        ? 'This is the **RIGHT 3/4 view**: keep hair mass biased toward the **viewer’s left** (mannequin’s right); do **not** add a second mirrored sweep on the opposite shoulder. Preserve the reference image’s part direction and silhouette. **Keep the same camera angle and framing as the reference** (true right 3/4, not front, not mirrored left); do **not** rotate the head toward camera.'
        : 'This is the **FRONT view**: keep the **exact** part line, silhouette and **one-sided shoulder sweep** from the reference (same as the black reference — often more hair on one shoulder). Do **not** mirror hair onto the opposite shoulder, do **not** invent a second symmetric drape and do **not** widen the style to “both shoulders.” **Only** recolor the existing black hair; do **not** change cut, length or volume.';

  const nearBlack = isJetBlackOffBlackCatalogColor(label, hex);
  const recolorLead = nearBlack
    ? 'Recreate this exact mannequin image. The wig hair is already black in the reference — **do not** apply a “hair dye” fantasy transform. Instead **match and lock** the hair to **' +
      label +
      '** at hex **#' +
      hex +
      '**: same silhouette, part, length, volume and shoulder bias as the reference; **only** normalize tone/sheen to a consistent salon black. Do **not** restyle, do **not** change which side the hair falls toward, do **not** invent flyaways or a new part.'
    : 'Recreate this exact mannequin image but change the black hair color to ' +
      label +
      ' hex code #' +
      hex +
      ' & ensure this color looks as closely to authentically colored/dyed hair & not a weird unrealistic shade.';

  return [
    BAW_GPT2_NOIR_COLOR_SCENE_MASTER_BLOCK,
    recolorLead,
    angleConstraint,
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    BAW_GPT2_NOIR_COLOR_FRAMING_LOCK,
    'The photo should be extremely high-quality, crisp and pixel-perfect.',
  ].join(' ');
}

async function resolveFrontColorAnchorPublicUrl(
  supabase: SupabaseClient,
  bucket: string,
  frontPath: string
): Promise<string | null> {
  const frontExists = await livePreviewObjectExists(supabase, bucket, frontPath);
  if (!frontExists) return null;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(frontExists.storagePath);
  return pub?.publicUrl ?? null;
}

function bawColorFrontAnchorSideSceneLockBlock(angle: 'front' | 'left' | 'right'): string {
  if (angle === 'front') return '';
  const angleLabel = angle === 'left' ? 'LEFT 3/4' : 'RIGHT 3/4';
  const handedness =
    angle === 'left'
      ? '**LEFT 3/4 check:** mannequin nose/temple aims **toward the image LEFT edge** — **NOT** a front view; **NOT** right 3/4; **NOT** a mirrored/wrong-handed 3/4. **Do not** straighten the head toward front-facing to match **IMAGE 1** (front donor is **hair only** — keep **IMAGE 2** body turn).'
      : '**RIGHT 3/4 check:** mannequin nose/temple aims **toward the image RIGHT edge** — **NOT** a front view; **NOT** left 3/4; **NOT** a mirrored/wrong-handed 3/4. **Do not** straighten the head toward front-facing to match **IMAGE 1** (front donor is **hair only** — keep **IMAGE 2** body turn).';
  return (
    '**MANNEQUIN + LIGHTING LOCK (' +
    angleLabel +
    ' — critical):** **IMAGE 2** is the **only** source for **camera angle**, **head pose**, **framing**, **brick background**, **lighting**, **shadows**, and **FRONTAL SLAYER** logo. Rebuild the output to **match IMAGE 2** pixel-for-pixel on scene/bust/lighting — **edit hair pigment + silhouette only**. **FORBIDDEN:** relighting or reframing to match **IMAGE 1**; **FORBIDDEN:** front-facing composition; **FORBIDDEN:** wrong 3/4 handedness. ' +
    handedness
  );
}

/** Side color when **FRONT (M)** output exists — mirrors styling `buildBawSalonStylingWithFrontAnchorPrompt`. */
function buildBawColorWithFrontAnchorPrompt(
  angle: 'left' | 'right',
  label: string,
  hex: string
): string {
  const h = hex.replace(/^#/, '').toUpperCase();
  const angleLabel = angle === 'left' ? 'LEFT 3/4' : 'RIGHT 3/4';
  const nearBlack = isJetBlackOffBlackCatalogColor(label, hex);
  const colorLead = nearBlack
    ? '**exact** salon black (**' +
      label +
      '**, **#' +
      h +
      '**) — **same** part line, silhouette, length, volume and **one-sided shoulder sweep** as **IMAGE 1**; **only** normalize tone/sheen consistently'
    : '**exact** swatch **' +
      label +
      '** at **#' +
      h +
      '** — authentically dyed hair, **same** part line, silhouette, length, volume and **one-sided shoulder sweep** as **IMAGE 1**';

  return [
    'You get **2 images in order**.',
    '**#0 SCENE MASTER (automatic fail if violated):** **IMAGE 2** (gray-brick **' +
      angleLabel +
      '** photograph) is the **only** source for **crop, zoom, camera distance, head scale, bust scale, bottom alignment, brick tile scale**, **lighting**, **shadows**, and **FRONTAL SLAYER** logo. Output must be **pixel-aligned** with **IMAGE 2** on scene/bust/brick — **identical composition** to the gray-brick reference on every swatch. **FORBIDDEN:** zoom, pan, reframe, or borrowing **IMAGE 1**\'s front-facing crop/lighting. **Only** hair **pigment + silhouette** from **IMAGE 1** may be edited onto **IMAGE 2**.',
    '**IMAGE 1 = CANONICAL FRONT (M) COLOR OUTPUT (hair color + silhouette identity lock):** This is the **already-recolored FRONT** for this swatch. **Reproduce this exact hair** (color, part line, length, volume, **one-sided shoulder sweep**) on the **' +
      angleLabel +
      '** camera from **IMAGE 2** — ' +
      colorLead +
      '. **FORBIDDEN:** a different shade or restyle; **FORBIDDEN:** re-parting; **FORBIDDEN:** inventing a **similar** but not identical look.',
    '**IMAGE 2** = **NOIR gray-brick mannequin** (**' +
      angleLabel +
      '** photograph). **Scene + lighting lock (overrides IMAGE 1 pose/light):** match **IMAGE 2** head turn, neck, shoulders, bust, framing, brick, **lighting**, **shadows**, **FRONTAL SLAYER** logo pixel-for-pixel — **ignore** IMAGE 2 hair color and hair shape; **do not** borrow **IMAGE 1**\'s front-facing head angle or front lighting.',
    bawColorFrontAnchorSideSceneLockBlock(angle),
    '**TASK:** Composite **IMAGE 1** hair (color + silhouette identity) onto **IMAGE 2** scene + lighting — **only** hair edits; bust/brick/logo/lighting must match **IMAGE 2**.',
    BAW_FAL_EDIT_PRESERVE_REFERENCE_BLOCK,
    BAW_GPT2_LOGO_AND_HAIR_ONLY_LOCK,
    BAW_GPT2_NOIR_COLOR_FRAMING_LOCK,
    'Output must be extremely high-quality, crisp and pixel-perfect.',
    'Composite: **IMAGE 1** exact FRONT hair color + shape identity + **IMAGE 2** exact **' + angleLabel + '** scene.',
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

  const authedUser = await getAuthUser(req);
  if (!authedUser) {
    sendJson(res, 401, { error: 'Sign in required' });
    return;
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) {
    sendJson(res, 503, { error: 'FAL_KEY is not configured on the server' });
    return;
  }

  const frontUrl = noirFalGrayBrickMannequinPublicUrlForAngle('front');
  const leftUrl = noirFalGrayBrickMannequinPublicUrlForAngle('left');
  const rightUrl = noirFalGrayBrickMannequinPublicUrlForAngle('right');

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

  let supabase;
  try {
    supabase = getSupabaseAdminServiceRole();
  } catch {
    sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required for Storage upload' });
    return;
  }

  const generated: string[] = [];
  const skipped: string[] = [];
  /** FRONT (M) colored URL — hairstyle + swatch identity lock for L/R in this request. */
  let frontColorAnchorUrl: string | null = null;

  try {
    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    for (const angle of anglesToRun) {
      const path = paths[angle];
      if (!forceRegenerate) {
        const exists = await livePreviewObjectExists(supabase, bucket, path);
        if (exists) {
          const sideStaleVsFront =
            (angle === 'left' || angle === 'right') &&
            (await livePreviewSideColorStaleVsFront(supabase, bucket, path, paths.front));
          if (!sideStaleVsFront) {
            skipped.push(angle);
            continue;
          }
        }
      }

      const mannequinUrl = mannequinByAngle[angle];
      let prompt: string;
      let imageUrls: string[];

      if (angle === 'front') {
        prompt = buildStep2PromptNoLogoAttachment(catalog.label, catalog.hex, 'front');
        imageUrls = [mannequinUrl];
      } else {
        const frontAnchorUrl =
          frontColorAnchorUrl ?? (await resolveFrontColorAnchorPublicUrl(supabase, bucket, paths.front));
        if (frontAnchorUrl) {
          prompt = buildBawColorWithFrontAnchorPrompt(angle, catalog.label, catalog.hex);
          imageUrls = [frontAnchorUrl, mannequinUrl];
        } else {
          prompt = buildStep2PromptNoLogoAttachment(catalog.label, catalog.hex, angle);
          imageUrls = [mannequinUrl];
        }
      }

      const result = await fal.subscribe('openai/gpt-image-2/edit', {
        input: {
          prompt,
          image_urls: imageUrls,
          image_size: { width: 1536, height: 2048 },
          quality: bawGpt2LivePreviewQuality(),
          output_format: wigPreviewLiveOutputFormat(),
          num_images: 1,
        },
        logs: false,
      });
      const url = (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url;
      if (!url) throw new Error(`fal: no image URL for ${angle}`);

      const buf = await downloadUrlToBuffer(url);
      const uploadType = wigPreviewLiveOutputFormat() === 'png' ? 'image/png' : 'image/webp';
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
        contentType: uploadType,
        upsert: true,
      });
      if (upErr) throw new Error(`upload ${path}: ${upErr.message}`);
      generated.push(angle);
      if (angle === 'front') {
        const { data: pubFrontAnchor } = supabase.storage.from(bucket).getPublicUrl(path);
        frontColorAnchorUrl = pubFrontAnchor?.publicUrl ?? null;
      }
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
