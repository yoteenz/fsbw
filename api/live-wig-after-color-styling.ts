export const config = { maxDuration: 300 };

/**
 * POST /api/live-wig-after-color-styling
 *
 * **Signed-in** Supabase session (Bearer JWT). Runs **GPT Image 2** (`openai/gpt-image-2/edit`) once per angle when outputs are missing (or all angles when **`forceRegenerate: true`**).
 *
 * **LAYERS** / **CRIMPS** / **FLAT IRON**: default **`image_urls`** = **[ color-tier PNG, gray-brick mannequin, optional JET BLACK styling ref ]**
 * with `buildBawSalonStylingWithSceneAndShapeRefsPrompt` (IMAGE 3 + **full text spec**) or `buildBawSalonStylingWithSceneRefAndTextSpecPrompt` when no ref.
 * **L/R angles:** when **FRONT (M)** output exists (or was just generated in the same request), **`buildBawSalonStylingWithFrontAnchorPrompt`** uses **[ front styled, gray-brick side pose, optional styling ref ]** so L/R match **M** hairstyle on the correct 3/4 camera.
 * **Output:** `.../after-color/.../{angle}.png` (legacy `.webp` still read). Fal **`quality: high`**, **`output_format: png`**.
 * **`WIG_PREVIEW_LIVE_SINGLE_PASS_SALON=1`**: one pass from gray-brick (+ optional styling ref) via `buildBawSalonSinglePassFromGrayBrickPrompt`.
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
  buildBangsOnlyWithSceneRefPrompt,
  buildBawSalonSinglePassFromGrayBrickPrompt,
  buildBawSalonStylingWithSceneAndShapeRefsPrompt,
  buildBawSalonStylingWithSceneRefPrompt,
  buildBawSalonStylingWithSceneRefAndTextSpecPrompt,
  buildBawSalonStylingWithFrontAnchorPrompt,
  buildUiRightSalonFromMiddlePartOutputPrompt,
} from './_lib/bawLiveStylingPrompts.js';
import {
  bawStylingReferenceStoragePath,
  type BawSalonMode,
} from './_lib/hairstyleAnalysisBawStylingRefs.js';
import {
  BAW_LIVE_PREVIEW_GPT2_EDIT_MODEL,
  bawGptImage2EditFalInput,
  bawLivePreviewUploadContentType,
} from './_lib/bawGptImage2FalInput.js';
import { livePreviewObjectExists, livePreviewPublicUrlIfExists } from './_lib/bawLivePreviewStorageDownload.js';
import { noirFalGrayBrickMannequinPublicUrlForAngle } from './_lib/bawNoirFalMannequinUrls.js';

type LayersPartStyling = 'MIDDLE' | 'LEFT' | 'RIGHT';

function liveSalonMode(
  middleLayers: boolean,
  middleCrimps: boolean,
  middleFlatIron: boolean
): BawSalonMode {
  if (middleLayers) return 'layers';
  if (middleCrimps) return 'crimps';
  if (middleFlatIron) return 'flat_iron';
  return 'none';
}

async function resolveStylingReferencePublicUrl(
  supabase: ReturnType<typeof getSupabaseAdminServiceRole>,
  bucket: string,
  salonMode: BawSalonMode,
  part: LayersPartStyling,
  angle: 'front' | 'left' | 'right'
): Promise<string | null> {
  if (salonMode === 'none') return null;
  const preferredPath = bawStylingReferenceStoragePath(salonMode, part, angle);
  if (!preferredPath) return null;
  const atAngle = await livePreviewPublicUrlIfExists(supabase, bucket, preferredPath);
  if (atAngle) return atAngle;
  if (angle !== 'front') {
    const frontPath = bawStylingReferenceStoragePath(salonMode, part, 'front');
    if (frontPath) return livePreviewPublicUrlIfExists(supabase, bucket, frontPath);
  }
  return null;
}

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

function singlePassSalonEnabled(): boolean {
  const v = process.env.WIG_PREVIEW_LIVE_SINGLE_PASS_SALON?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Fal gray-brick scene refs (not UI transparent overlays). */
function noirFalGrayBrickMannequinPublicUrlForAngleLocal(angle: 'front' | 'left' | 'right'): string {
  return noirFalGrayBrickMannequinPublicUrlForAngle(angle);
}

async function resolveFrontStylingAnchorPublicUrl(
  supabase: ReturnType<typeof getSupabaseAdminServiceRole>,
  bucket: string,
  frontOutPath: string
): Promise<string | null> {
  const frontExists = await livePreviewObjectExists(supabase, bucket, frontOutPath);
  if (!frontExists) return null;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(frontExists.storagePath);
  return pub?.publicUrl ?? null;
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
          'Live styling: either **LAYERS**, **CRIMPS** or **FLAT IRON** (each with part from partSelection) or **BANGS** only without those salon styles.',
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

    /** UI R + LAYERS/CRIMPS: prefer **RIGHT-part** BAW styling ref (two-image); fallback = MIDDLE-part output chain. */
    const salonMode = liveSalonMode(middleLayers, middleCrimps, middleFlatIron);
    let useMiddlePartOutputAsUiRightInput =
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

    if (useMiddlePartOutputAsUiRightInput && salonMode !== 'none') {
      const rightPartStylingRefUrl = await resolveStylingReferencePublicUrl(
        supabase,
        bucket,
        salonMode,
        'RIGHT',
        'front'
      );
      if (rightPartStylingRefUrl) {
        useMiddlePartOutputAsUiRightInput = false;
      }
    }


    /** When set, **LEFT** flat-iron `publicUrls.right` is the **RIGHT**-part flat-iron `right.webp` (if it exists). */
    let flatIronLeftRightThumbOverrideUrl: string | null = null;
    if (flatIronRightPartOutPathsForLeftThumb) {
      const pRightPartRightAngle = flatIronRightPartOutPathsForLeftThumb.right;
      const rightPartExists = await livePreviewObjectExists(supabase, bucket, pRightPartRightAngle);
      if (rightPartExists) {
        const { data: pubOverride } = supabase.storage.from(bucket).getPublicUrl(rightPartExists.storagePath);
        flatIronLeftRightThumbOverrideUrl = pubOverride?.publicUrl ?? null;
      }
    }

    const angleOrder: Array<'front' | 'left' | 'right'> = ['front', 'left', 'right'];
    const anglesToRun = singleAngle ? [singleAngle] : angleOrder;

    /** All requested outputs already in Storage — skip Fal + skip auth (same UX as before when cache was warm). */
    if (!forceRegenerate) {
      let allOutputsExist = true;
      for (const angle of anglesToRun) {
        const exists = await livePreviewObjectExists(supabase, bucket, outPaths[angle]);
        if (!exists) {
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

    const generated: string[] = [];
    const skipped: string[] = [];
    /** FRONT (M) styled URL — used as hairstyle identity lock for L/R in this request. */
    let frontStylingAnchorUrl: string | null = null;

    const { fal } = await import('@fal-ai/client');
    fal.config({ credentials: falKey });

    for (const angle of anglesToRun) {
      const outPath = outPaths[angle];
      if (!forceRegenerate) {
        const exists = await livePreviewObjectExists(supabase, bucket, outPath);
        if (exists) {
          skipped.push(angle);
          continue;
        }
      }

      let colorPublicUrl: string;
      let prompt: string;
      let imageUrls: string[];

      const grayBrickUrl = noirFalGrayBrickMannequinPublicUrlForAngleLocal(angle);
      const salonPromptOpts = { includeBangs: bangsWithSalon };
      const stylingRefUrlForAngle =
        salonMode !== 'none' && !bangsOnly
          ? await resolveStylingReferencePublicUrl(supabase, bucket, salonMode, partStyling, angle)
          : null;

      if (useMiddlePartOutputAsUiRightInput && middleOutPathsForUiR) {
        const middlePath = middleOutPathsForUiR[angle];
        const middleExists = await livePreviewObjectExists(supabase, bucket, middlePath);
        if (!middleExists) {
          sendJson(res, 400, {
            error:
              'RIGHT part needs the **MIDDLE part** version of this style first. On NOIR → Styling, select **MIDDLE** part with the same salon style and **regenerate** (or wait for preview), then select **RIGHT** part again.',
            colorTierHash,
            missingMiddlePartPath: middlePath,
          });
          return;
        }
        const { data: pubMid } = supabase.storage.from(bucket).getPublicUrl(middleExists.storagePath);
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
      } else if (
        singlePassSalonEnabled() &&
        salonMode !== 'none' &&
        !bangsOnly
      ) {
        if (stylingRefUrlForAngle) {
          prompt = buildBawSalonSinglePassFromGrayBrickPrompt(angle, partStyling, salonMode, catalog, {
            ...salonPromptOpts,
            hasStylingShapeRef: true,
          });
          imageUrls = [grayBrickUrl, stylingRefUrlForAngle];
        } else {
          prompt = buildBawSalonSinglePassFromGrayBrickPrompt(angle, partStyling, salonMode, catalog, salonPromptOpts);
          imageUrls = [grayBrickUrl];
        }
      } else {
        const colorPath = colorPaths[angle];
        const colorExists = await livePreviewObjectExists(supabase, bucket, colorPath);
        if (!colorExists) {
          sendJson(res, 400, {
            error:
              'Color preview files not found for this combo. Open NOIR → Color first so left/front/right color previews exist, then try styling again.',
            colorTierHash,
            missingColorPath: colorPath,
          });
          return;
        }

        const { data: pubColor } = supabase.storage.from(bucket).getPublicUrl(colorExists.storagePath);
        colorPublicUrl = pubColor?.publicUrl ?? '';
        if (!colorPublicUrl) {
          sendJson(res, 500, { error: 'Could not build public URL for color layer' });
          return;
        }

        if (bangsOnly) {
          prompt = buildBangsOnlyWithSceneRefPrompt(angle, catalog);
          imageUrls = [colorPublicUrl, grayBrickUrl];
        } else if (salonMode !== 'none') {
          const frontAnchorUrl =
            angle !== 'front'
              ? frontStylingAnchorUrl ??
                (await resolveFrontStylingAnchorPublicUrl(supabase, bucket, outPaths.front))
              : null;
          if (frontAnchorUrl && angle !== 'front') {
            prompt = buildBawSalonStylingWithFrontAnchorPrompt(
              angle,
              partStyling,
              salonMode,
              catalog,
              { ...salonPromptOpts, hasStylingShapeRef: Boolean(stylingRefUrlForAngle) }
            );
            /** Side views: **front styled (M)** = hairstyle + color identity; gray-brick = exact pose/lighting. Omit color-tier side WebP — its unstylized silhouette was pulling L off the front lock. */
            imageUrls = stylingRefUrlForAngle
              ? [frontAnchorUrl, grayBrickUrl, stylingRefUrlForAngle]
              : [frontAnchorUrl, grayBrickUrl];
          } else if (stylingRefUrlForAngle) {
            prompt = buildBawSalonStylingWithSceneAndShapeRefsPrompt(
              angle,
              partStyling,
              salonMode,
              catalog,
              salonPromptOpts
            );
            imageUrls = [colorPublicUrl, grayBrickUrl, stylingRefUrlForAngle];
          } else {
            prompt = buildBawSalonStylingWithSceneRefAndTextSpecPrompt(
              angle,
              partStyling,
              salonMode,
              catalog,
              salonPromptOpts
            );
            imageUrls = [colorPublicUrl, grayBrickUrl];
          }
        } else {
          sendJson(res, 500, { error: 'Unexpected styling mode' });
          return;
        }
      }

      const result = await fal.subscribe(BAW_LIVE_PREVIEW_GPT2_EDIT_MODEL, {
        input: bawGptImage2EditFalInput(prompt, imageUrls),
        logs: false,
      });
      const falUrl = (result as { data?: { images?: { url?: string }[] } })?.data?.images?.[0]?.url;
      if (!falUrl) throw new Error(`fal: no image URL for ${angle}`);

      const buf = await downloadUrlToBuffer(falUrl);
      const { error: upErr } = await supabase.storage.from(bucket).upload(outPath, buf, {
        contentType: bawLivePreviewUploadContentType(),
        upsert: true,
      });
      if (upErr) throw new Error(`upload ${outPath}: ${upErr.message}`);
      generated.push(angle);
      if (angle === 'front') {
        const { data: pubFrontAnchor } = supabase.storage.from(bucket).getPublicUrl(outPath);
        frontStylingAnchorUrl = pubFrontAnchor?.publicUrl ?? null;
      }
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
