export const config = { maxDuration: 120 };

/**
 * POST /api/live-wig-after-color-styling
 *
 * **Signed-in** Supabase session (Bearer JWT). Runs fal once per angle when outputs are missing (or all angles when **`forceRegenerate: true`**).
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
 * **BANGS + LAYERS** or **BANGS + CRIMPS:** same color WebP; salon prompt + **`includeBangs: true`** (curtain bangs aligned to **part**). **Output:** `.../after-color/layers-with-bangs-*-part/` or `crimps-with-bangs-*-part/`.
 *
 * **FLAT IRON** (any part **MIDDLE** | **LEFT** | **RIGHT**): same color WebP; `buildFlatIronStylePromptFromColorTierWebp` — **bone-straight** + **part only** (same base as color tier). **Output:** `.../after-color/flat-iron-{middle|left|right}-part/`
 * **FLAT IRON + UI LEFT:** response **`publicUrls.right`** (right camera / **R** thumbnail) uses the **same Storage object** as **RIGHT** part flat-iron **`right.webp`** when that file exists — so the R thumb matches the current R-part asset; **`outputPaths.right`** stays the LEFT-part folder (Fal still generated the LEFT triple).
 *
 * **BANGS + FLAT IRON:** `.../flat-iron-with-bangs-*-part/`
 *
 * **BANGS only** (BANGS without LAYERS/CRIMPS/FLAT IRON): same color WebP input; `buildBangsOnlyStylePrompt`. **Output:** `.../after-color/bangs-only/{angle}.webp`
 *
 * Body: live color fields + `color` + optional `angle` + optional `forceRegenerate` + `partSelection` + `styling`.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { getSupabaseAdminServiceRole } from './_lib/supabase.js';
import {
  wigPreviewManifestHash,
  wigPreviewManifestHashLiveColorTier,
  wigPreviewLiveAnglePaths,
  wigPreviewLiveAfterColorStylingPaths,
  wigPreviewLiveCrimpsPartFolder,
  wigPreviewLiveCrimpsWithBangsPartFolder,
  wigPreviewLiveFlatIronPartFolder,
  wigPreviewLiveFlatIronWithBangsPartFolder,
  wigPreviewLiveLayersPartFolder,
  wigPreviewLiveLayersWithBangsPartFolder,
  type WigPreviewSelections,
} from './_lib/wigPreviewSelectionHash.js';
import { catalogColorForPrompt } from './_lib/bawCatalogHairColors.js';
import {
  buildBangsOnlyStylePrompt,
  buildCrimpsStylePromptFromColorTierWebp,
  buildFlatIronStylePromptFromColorTierWebp,
  buildLayersStylePromptFromColorTierWebp,
  buildUiRightSalonFromMiddlePartOutputPrompt,
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

/** Origin fal can fetch for static `/assets/natural *.png` (MIDDLE + FLAT IRON second ref). */
function wigPreviewPublicAppOrigin(): string {
  const explicit = (process.env.WIG_PREVIEW_PUBLIC_APP_ORIGIN || process.env.SITE_URL || '').trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const v = (process.env.VERCEL_URL || '').trim();
  if (v) return v.startsWith('http') ? v : `https://${v}`;
  return 'https://fsbw.vercel.app';
}

/** Same NOIR base angles as BAW hub static mannequins (`bawStaticMannequinTriplePaths` naturals). */
function noirBaseNaturalMannequinPublicUrlForAngle(angle: 'front' | 'left' | 'right'): string {
  const file =
    angle === 'left' ? 'natural%20left.png' : angle === 'right' ? 'natural%20right.png' : 'natural%20front.png';
  return `${wigPreviewPublicAppOrigin()}/assets/${file}`;
}

function stylingModePayload(
  middleLayers: boolean,
  middleCrimps: boolean,
  middleFlatIron: boolean,
  bangsWithSalon: boolean
): Record<string, unknown> {
  return {
    stylingMode: middleLayers
      ? bangsWithSalon
        ? 'middle-layers-with-bangs'
        : 'middle-layers'
      : middleCrimps
        ? bangsWithSalon
          ? 'middle-crimps-with-bangs'
          : 'middle-crimps'
        : middleFlatIron
          ? bangsWithSalon
            ? 'middle-flat-iron-with-bangs'
            : 'middle-flat-iron'
          : 'bangs-only',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
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
    const hasFlatIron = stylingRaw.includes('FLAT IRON');
    const hasBangs = stylingRaw.includes('BANGS');
    const salonCount = [hasLayers, hasCrimps, hasFlatIron].filter(Boolean).length;
    const bangsOnly = hasBangs && salonCount === 0;
    const middleLayers = hasLayers && salonCount === 1;
    const middleCrimps = hasCrimps && salonCount === 1;
    const middleFlatIron = hasFlatIron && salonCount === 1;
    const bangsWithSalon = hasBangs && salonCount === 1 && (middleLayers || middleCrimps || middleFlatIron);

    if (salonCount > 1) {
      sendJson(res, 400, {
        error: 'Live styling: pick **one** salon style among **LAYERS**, **CRIMPS**, **FLAT IRON** (not multiple).',
      });
      return;
    }

    if (!middleLayers && !middleCrimps && !middleFlatIron && !bangsOnly) {
      sendJson(res, 400, {
        error:
          'Live styling: either **LAYERS**, **CRIMPS**, or **FLAT IRON** (each with part from partSelection), or **BANGS** only without those salon styles.',
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
      ? hasBangs
        ? wigPreviewLiveLayersWithBangsPartFolder(partStyling)
        : wigPreviewLiveLayersPartFolder(partStyling)
      : middleCrimps
        ? hasBangs
          ? wigPreviewLiveCrimpsWithBangsPartFolder(partStyling)
          : wigPreviewLiveCrimpsPartFolder(partStyling)
        : middleFlatIron
          ? hasBangs
            ? wigPreviewLiveFlatIronWithBangsPartFolder(partStyling)
            : wigPreviewLiveFlatIronPartFolder(partStyling)
          : 'bangs-only';
    const outPaths = wigPreviewLiveAfterColorStylingPaths(promptVersion, 'NOIR', colorTierHash, storageFolderKey);

    /** FLAT IRON + UI LEFT: **right** camera thumbnail uses the same asset as **RIGHT** part `right.webp` (product request). */
    const flatIronRightPartFolderForLeftThumb =
      middleFlatIron && partStyling === 'LEFT'
        ? hasBangs
          ? wigPreviewLiveFlatIronWithBangsPartFolder('RIGHT')
          : wigPreviewLiveFlatIronPartFolder('RIGHT')
        : null;
    const flatIronRightPartOutPathsForLeftThumb =
      flatIronRightPartFolderForLeftThumb !== null
        ? wigPreviewLiveAfterColorStylingPaths(
            promptVersion,
            'NOIR',
            colorTierHash,
            flatIronRightPartFolderForLeftThumb
          )
        : null;

    /** UI R + LAYERS/CRIMPS: use **MIDDLE-part** after-color output as Fal input (not raw color-tier WebP). */
    const useMiddlePartOutputAsUiRightInput =
      partStyling === 'RIGHT' && (middleLayers || middleCrimps);
    const middleFolderKeyForUiR = middleLayers
      ? hasBangs
        ? wigPreviewLiveLayersWithBangsPartFolder('MIDDLE')
        : wigPreviewLiveLayersPartFolder('MIDDLE')
      : middleCrimps
        ? hasBangs
          ? wigPreviewLiveCrimpsWithBangsPartFolder('MIDDLE')
          : wigPreviewLiveCrimpsPartFolder('MIDDLE')
        : '';
    const middleOutPathsForUiR =
      useMiddlePartOutputAsUiRightInput && middleFolderKeyForUiR
        ? wigPreviewLiveAfterColorStylingPaths(promptVersion, 'NOIR', colorTierHash, middleFolderKeyForUiR)
        : null;

    let supabase;
    try {
      supabase = getSupabaseAdminServiceRole();
    } catch {
      sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required for Storage upload' });
      return;
    }

    /** When set, **LEFT** flat-iron `publicUrls.right` is the **RIGHT**-part flat-iron `right.webp` (if it exists). */
    let flatIronLeftRightThumbOverrideUrl: string | null = null;
    if (flatIronRightPartOutPathsForLeftThumb) {
      const pRightPartRightAngle = flatIronRightPartOutPathsForLeftThumb.right;
      const { error: rightPartRightDlErr } = await supabase.storage.from(bucket).download(pRightPartRightAngle);
      if (!rightPartRightDlErr) {
        const { data: pubOverride } = supabase.storage.from(bucket).getPublicUrl(pRightPartRightAngle);
        flatIronLeftRightThumbOverrideUrl = pubOverride?.publicUrl ?? null;
      }
    }

    const angleOrder: Array<'front' | 'left' | 'right'> = ['front', 'left', 'right'];
    const anglesToRun = singleAngle ? [singleAngle] : angleOrder;

    /** All requested outputs already in Storage — skip Fal + skip auth (same UX as before when cache was warm). */
    if (!forceRegenerate) {
      let allOutputsExist = true;
      for (const angle of anglesToRun) {
        const { error: outDlErr } = await supabase.storage.from(bucket).download(outPaths[angle]);
        if (outDlErr) {
          allOutputsExist = false;
          break;
        }
      }
      if (allOutputsExist) {
        const { data: pubFront } = supabase.storage.from(bucket).getPublicUrl(outPaths.front);
        const { data: pubLeft } = supabase.storage.from(bucket).getPublicUrl(outPaths.left);
        const { data: pubRight } = supabase.storage.from(bucket).getPublicUrl(outPaths.right);
        const skippedAngles = [...anglesToRun];
        const pubRightOut =
          flatIronLeftRightThumbOverrideUrl ?? pubRight?.publicUrl ?? null;
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
            right: pubRightOut,
          },
          generated: [] as string[],
          skipped: skippedAngles,
          selections,
          ...stylingModePayload(middleLayers, middleCrimps, middleFlatIron, bangsWithSalon),
          ...(middleLayers || middleCrimps || middleFlatIron ? { partSelection: partStyling, bangsWithSalon } : {}),
          ...(singleAngle ? { singleAngle } : {}),
          cacheOnly: true,
        });
        return;
      }
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

      let colorPublicUrl: string;
      let prompt: string;
      let imageUrls: string[];

      if (useMiddlePartOutputAsUiRightInput && middleOutPathsForUiR) {
        const middlePath = middleOutPathsForUiR[angle];
        const { error: midDlErr } = await supabase.storage.from(bucket).download(middlePath);
        if (midDlErr) {
          sendJson(res, 400, {
            error:
              'RIGHT part needs the **MIDDLE part** version of this style first. On NOIR → Styling, select **MIDDLE** part with the same salon style and **regenerate** (or wait for preview), then select **RIGHT** part again.',
            colorTierHash,
            missingMiddlePartPath: middlePath,
          });
          return;
        }
        const { data: pubMid } = supabase.storage.from(bucket).getPublicUrl(middlePath);
        colorPublicUrl = pubMid?.publicUrl ?? '';
        if (!colorPublicUrl) {
          sendJson(res, 500, { error: 'Could not build public URL for middle-part styling layer' });
          return;
        }
        prompt = buildUiRightSalonFromMiddlePartOutputPrompt(
          angle,
          middleLayers ? 'layers' : 'crimps',
          bangsWithSalon
        );
        imageUrls = [colorPublicUrl];
      } else {
        const colorPath = colorPaths[angle];
        const { error: colorDlErr } = await supabase.storage.from(bucket).download(colorPath);
        if (colorDlErr) {
          sendJson(res, 400, {
            error:
              'Color preview files not found for this combo. Open NOIR → Color first so left/front/right color WebPs exist, then try styling again.',
            colorTierHash,
            missingColorPath: colorPath,
          });
          return;
        }

        const { data: pubColor } = supabase.storage.from(bucket).getPublicUrl(colorPath);
        colorPublicUrl = pubColor?.publicUrl ?? '';
        if (!colorPublicUrl) {
          sendJson(res, 500, { error: 'Could not build public URL for color layer' });
          return;
        }

        const flatIronMiddleUsesBaseNoirGeometry =
          middleFlatIron && partStyling === 'MIDDLE' && !bangsWithSalon;

        prompt = middleLayers
          ? buildLayersStylePromptFromColorTierWebp(angle, partStyling, catalog, {
              includeBangs: bangsWithSalon,
            })
          : middleCrimps
            ? buildCrimpsStylePromptFromColorTierWebp(angle, partStyling, catalog, {
                includeBangs: bangsWithSalon,
              })
            : middleFlatIron
              ? buildFlatIronStylePromptFromColorTierWebp(angle, partStyling, catalog, {
                  includeBangs: bangsWithSalon,
                  baseNoirGeometrySecondRef: flatIronMiddleUsesBaseNoirGeometry,
                })
              : buildBangsOnlyStylePrompt(angle);
        imageUrls = flatIronMiddleUsesBaseNoirGeometry
          ? [colorPublicUrl, noirBaseNaturalMannequinPublicUrlForAngle(angle)]
          : [colorPublicUrl];
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
    const pubRightOut =
      flatIronLeftRightThumbOverrideUrl ?? pubRight?.publicUrl ?? null;

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
        right: pubRightOut,
      },
      generated,
      skipped,
      selections,
      ...stylingModePayload(middleLayers, middleCrimps, middleFlatIron, bangsWithSalon),
      ...(middleLayers || middleCrimps || middleFlatIron ? { partSelection: partStyling, bangsWithSalon } : {}),
      ...(singleAngle ? { singleAngle } : {}),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[live-wig-after-color-styling]', msg);
    sendJson(res, 500, { error: msg });
  }
}
