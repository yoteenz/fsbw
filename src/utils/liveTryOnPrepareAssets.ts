import {
  postLiveTryOnEnsureOverlaysOneAngle,
  postWigPreviewLiveNoirColorOneAngle,
  type LiveTryOnEnsureOverlaysResult,
} from './api';
import type { LiveTryOnPhotoModel } from '../constants/liveTryOnSpikeAssets';
import {
  resolveLiveTryOnOverlayTripleIfStored,
  resolveLiveTryOnPortraitTripleIfStored,
} from './liveTryOnOverlayPublicUrls';
import {
  buildLiveTryOnPayloadFromBaw,
  buildLiveTryOnPayloadFromConsult,
  liveTryOnPayloadToColorApiBody,
  type LiveTryOnSourcePayload,
} from './liveTryOnSelections';
import { resolveWigPreviewLiveColorTripleIfStored } from './wigPreviewLiveStoragePublicUrls';
import type { ConsultQuoteSelections } from './consultOfferFromQuote';

export type LiveTryOnCompareBundles = {
  portraits: Partial<Record<LiveTryOnPhotoModel, [string, string, string]>>;
  overlays: Partial<Record<LiveTryOnPhotoModel, [string, string, string]>>;
};

export type LiveTryOnPreparedAssets = {
  overlayUrls: [string, string, string];
  manifestHash?: string;
  usedFallback: boolean;
  compare?: LiveTryOnCompareBundles;
  activePhotoModel: LiveTryOnPhotoModel;
};

export type PrepareLiveTryOnOptions = {
  /** Fires once the active model’s L/F/R hair overlays are in Storage (second model may still be running). */
  onActiveModelReady?: (partial: LiveTryOnPreparedAssets) => void;
};

const ANGLES = ['left', 'front', 'right'] as const;

function compareModelsEnabled(): boolean {
  try {
    const envOff =
      (import.meta as unknown as { env?: { VITE_WIG_PREVIEW_TRYON_COMPARE_BOTH?: string } }).env
        ?.VITE_WIG_PREVIEW_TRYON_COMPARE_BOTH === 'false';
    return !envOff;
  } catch {
    return true;
  }
}

function modelsInRunOrder(active: LiveTryOnPhotoModel): LiveTryOnPhotoModel[] {
  if (!compareModelsEnabled()) return [active];
  const other: LiveTryOnPhotoModel = active === 'nbp' ? 'gpt2' : 'nbp';
  return [active, other];
}

async function ensureNoirColorPreview(payload: LiveTryOnSourcePayload): Promise<void> {
  const body = liveTryOnPayloadToColorApiBody(payload);
  const stored = await resolveWigPreviewLiveColorTripleIfStored({ ...body, unitKey: payload.unitKey });
  if (stored) return;
  for (const angle of ANGLES) {
    await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
  }
}

async function buildCompareFromStorage(
  payload: LiveTryOnSourcePayload
): Promise<LiveTryOnCompareBundles | undefined> {
  const hashPayload = { ...payload, unitKey: payload.unitKey };
  const portraits: LiveTryOnCompareBundles['portraits'] = {};
  const overlays: LiveTryOnCompareBundles['overlays'] = {};
  for (const model of ['nbp', 'gpt2'] as LiveTryOnPhotoModel[]) {
    const p = await resolveLiveTryOnPortraitTripleIfStored(hashPayload, model);
    const o = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, model);
    if (p) portraits[model] = p;
    if (o) overlays[model] = o;
  }
  if (!portraits.nbp && !portraits.gpt2 && !overlays.nbp && !overlays.gpt2) return undefined;
  return { portraits, overlays };
}

function buildPrepared(
  compare: LiveTryOnCompareBundles | undefined,
  photoModel: LiveTryOnPhotoModel,
  manifestHash?: string
): LiveTryOnPreparedAssets | null {
  const overlayUrls = compare?.overlays?.[photoModel];
  if (!overlayUrls) return null;
  return {
    overlayUrls,
    manifestHash,
    usedFallback: false,
    compare,
    activePhotoModel: photoModel,
  };
}

/**
 * Mannequin color WebP → photoreal woman (one model + one angle per API call) → hair-only overlays.
 */
export async function prepareLiveTryOnAssets(
  payload: LiveTryOnSourcePayload,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void,
  options?: PrepareLiveTryOnOptions
): Promise<LiveTryOnPreparedAssets> {
  const hashPayload = { ...payload, unitKey: payload.unitKey };

  onStatus?.('CHECKING YOUR LOOK…');
  let compare = await buildCompareFromStorage(hashPayload);
  const cachedActive = buildPrepared(compare, photoModel);
  if (cachedActive) return cachedActive;

  if (payload.unitKey === 'NOIR') {
    onStatus?.('PREPARING MANNEQUIN COLOR REFERENCE…');
    await ensureNoirColorPreview(payload);
  } else {
    throw new Error('LIVE TRY ON WITH PHOTOREAL MODELS IS AVAILABLE FOR NOIR FIRST');
  }

  const models = modelsInRunOrder(photoModel);
  const body = {
    ...liveTryOnPayloadToColorApiBody(payload),
    unitKey: payload.unitKey,
    compareModels: false,
  };
  const totalSteps = models.length * ANGLES.length;
  let step = 0;
  let lastResult: LiveTryOnEnsureOverlaysResult | null = null;
  let activeModelReadyFired = false;

  for (const model of models) {
    for (const angle of ANGLES) {
      step += 1;
      const label = model === 'nbp' ? 'NBP' : 'GPT IMAGE 2';
      onStatus?.(`PHOTOREAL ${label} · ${angle.toUpperCase()} (${step}/${totalSteps})…`);

      lastResult = await postLiveTryOnEnsureOverlaysOneAngle({ ...body, angle, photoModel: model });
      if (lastResult.missingColor?.includes(angle)) {
        await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
        lastResult = await postLiveTryOnEnsureOverlaysOneAngle({ ...body, angle, photoModel: model });
      }

      compare = await buildCompareFromStorage(hashPayload);

      if (!activeModelReadyFired && model === photoModel) {
        const triple = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, photoModel);
        if (triple) {
          activeModelReadyFired = true;
          const partial = buildPrepared(compare, photoModel, lastResult?.manifestHash);
          if (partial) options?.onActiveModelReady?.(partial);
        }
      }
    }
  }

  compare = await buildCompareFromStorage(hashPayload);
  const final = buildPrepared(compare, photoModel, lastResult?.manifestHash);
  if (final) return final;

  throw new Error(
    'TRY-ON TIMED OUT OR FAILED. EACH ANGLE USES ITS OWN SERVER STEP — WAIT AND TRY AGAIN. ON VERCEL SET WIG_PREVIEW_TRYON_FAL_RESOLUTION=1K IF THIS KEEPS HAPPENING.'
  );
}

export function prepareLiveTryOnAssetsFromBaw(
  pathname: string,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void,
  options?: PrepareLiveTryOnOptions
): Promise<LiveTryOnPreparedAssets> {
  return prepareLiveTryOnAssets(buildLiveTryOnPayloadFromBaw(pathname), photoModel, onStatus, options);
}

export function prepareLiveTryOnAssetsFromConsult(
  unitKey: string,
  selections: ConsultQuoteSelections,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void,
  options?: PrepareLiveTryOnOptions
): Promise<LiveTryOnPreparedAssets> {
  return prepareLiveTryOnAssets(
    buildLiveTryOnPayloadFromConsult(unitKey, selections),
    photoModel,
    onStatus,
    options
  );
}
