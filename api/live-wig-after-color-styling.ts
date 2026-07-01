export const config = { maxDuration: 300 };

/**
 * POST /api/live-wig-after-color-styling
 *
 * **Signed-in** Supabase session (Bearer JWT). Runs **GPT Image 2** (`openai/gpt-image-2/edit`) once per angle when outputs are missing (or all angles when **`forceRegenerate: true`**).
 *
 * **LAYERS** / **CRIMPS** / **FLAT IRON**: default **`image_urls`** = **[ color-tier PNG, gray-brick mannequin, optional JET BLACK styling ref ]**
 * with `buildBawSalonStylingWithSceneAndShapeRefsPrompt` (IMAGE 3 + **full text spec**) or `buildBawSalonStylingWithSceneRefAndTextSpecPrompt` when no ref.
 * **L/R angles (MIDDLE part):** when **FRONT (M)** output exists, **`buildBawSalonStylingWithFrontAnchorPrompt`** uses **[ front styled, gray-brick side pose ]**.
 * **UI L / UI R part:** **FRONT (M)** re-parts from **MIDDLE-part FRONT**. **UI R:** **`[ placement guide, MIDDLE FRONT ]`** (FRONT) or **`[ gray-brick, placement guide, FRONT donor ]`** (L/R) — **`Ref Images/IMG_4665.jpeg`** = part groove authority (#0 priority); donors = texture/color only.
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
  buildBawSalonSidePartFromMiddleFrontPrompt,
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
import { bawRightPartPlacementRefPublicUrl } from './_lib/bawSalonPartPlacementRefs.js';

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

function middlePartStorageFolderKey(
  middleLayers: boolean,
  middleCrimps: boolean,
  middleFlatIron: boolean,
  hasBangs: boolean
): string | null {
  if (middleLayers) {
    return hasBangs ? wigPreviewLiveLayersWithBangsPartFolder('MIDDLE') : wigPreviewLiveLayersPartFolder('MIDDLE');
  }
  if (middleCrimps) {
    return hasBangs ? wigPreviewLiveCrimpsWithBangsPartFolder('MIDDLE') : wigPreviewLiveCrimpsPartFolder('MIDDLE');
  }
  if (middleFlatIron) {
    return hasBangs ? wigPreviewLiveFlatIronWithBangsPartFolder('MIDDLE') : wigPreviewLiveFlatIronPartFolder('MIDDLE');
  }
  return null;
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

    /** UI L / UI R part: **FRONT (M)** from middle FRONT; **L/R cameras** from **this part’s FRONT (M)** (same front-anchor chain as MIDDLE part). */
    const salonMode = liveSalonMode(middleLayers, middleCrimps, middleFlatIron);
    const useMiddlePartFrontAnchor =
      (partStyling === 'LEFT' || partStyling === 'RIGHT') && salonMode !== 'none' && !bangsOnly;
    const middleFolderKey = middlePartStorageFolderKey(middleLayers, middleCrimps, middleFlatIron, hasBangs);
    const middleOutPaths =
      useMiddlePartFrontAnchor && middleFolderKey
        ? wigPreviewLiveAfterColorStylingPaths(promptVersion, 'NOIR', colorTierHash, middleFolderKey)
        : null;

    let supabase;
    try {
      supabase = getSupabaseAdminServiceRole();
    } catch {
      sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY required for Storage upload' });
      return;
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

      if (useMiddlePartFrontAnchor && middleOutPaths) {
        const middleFrontPath = middleOutPaths.front;
        const middleFrontExists = await livePreviewObjectExists(supabase, bucket, middleFrontPath);
        if (!middleFrontExists) {
          sendJson(res, 400, {
            error:
              `${partStyling} part needs the **MIDDLE part FRONT** styled output first. On NOIR → Styling, select **MIDDLE** part with the same salon style and **regenerate** (or wait for preview), then select **${partStyling}** part again.`,
            colorTierHash,
            missingMiddlePartPath: middleFrontPath,
          });
          return;
        }
        const { data: pubMidFront } = supabase.storage.from(bucket).getPublicUrl(middleFrontExists.storagePath);
        const middlePartFrontUrl = pubMidFront?.publicUrl ?? '';
        if (!middlePartFrontUrl) {
          sendJson(res, 500, { error: 'Could not build public URL for middle-part FRONT anchor' });
          return;
        }
        const targetPart = partStyling as 'LEFT' | 'RIGHT';
        const rightPartPlacementRefUrl =
          targetPart === 'RIGHT' ? bawRightPartPlacementRefPublicUrl() : null;
        if (angle === 'front') {
          prompt = buildBawSalonSidePartFromMiddleFrontPrompt(targetPart, salonMode, {
            ...salonPromptOpts,
            hasRightPartPlacementRef: targetPart === 'RIGHT',
          });
          imageUrls = rightPartPlacementRefUrl
            ? [rightPartPlacementRefUrl, middlePartFrontUrl]
            : [middlePartFrontUrl];
        } else {
          /** Same front-anchor chain as **MIDDLE part**: **FRONT (M)** = hairstyle identity; gray-brick = camera/scene lock. */
          const sidePartFrontAnchorUrl =
            frontStylingAnchorUrl ??
            (await resolveFrontStylingAnchorPublicUrl(supabase, bucket, outPaths.front));
          if (!sidePartFrontAnchorUrl) {
            sendJson(res, 400, {
              error:
                `${partStyling} part **${angle}** camera needs this part’s **FRONT (M)** styled output first. Regenerate **FRONT** for **${partStyling}** part (after **MIDDLE** part FRONT exists), then **${angle}** again.`,
              colorTierHash,
              missingSidePartFrontPath: outPaths.front,
            });
            return;
          }
          prompt = buildBawSalonStylingWithFrontAnchorPrompt(
            angle,
            targetPart,
            salonMode,
            catalog,
            {
              ...salonPromptOpts,
              hasRightPartPlacementRef: targetPart === 'RIGHT',
            }
          );
          /** UI R: gray-brick body → placement guide (part) → FRONT donor (texture only). */
          imageUrls = rightPartPlacementRefUrl
            ? [grayBrickUrl, rightPartPlacementRefUrl, sidePartFrontAnchorUrl]
            : [sidePartFrontAnchorUrl, grayBrickUrl];
        }
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
              salonPromptOpts
            );
            /** Side views: **FRONT (M)** = hairstyle identity; gray-brick = scene/camera lock. Omit styling ref — it re-rolls hair off the front lock. */
            imageUrls = [frontAnchorUrl, grayBrickUrl];
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
