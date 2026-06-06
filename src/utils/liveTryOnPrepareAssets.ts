import type { LiveTryOnPhotoModel } from '../constants/liveTryOnSpikeAssets';
import {
  resolveLiveTryOnOverlayTripleBestEffort,
  resolveLiveTryOnOverlayTripleIfStored,
  resolveLiveTryOnPortraitTripleIfStored,
} from './liveTryOnOverlayPublicUrls';
import {
  buildLiveTryOnPayloadFromBaw,
  buildLiveTryOnPayloadFromConsult,
  type LiveTryOnSourcePayload,
} from './liveTryOnSelections';
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
  partial?: boolean;
};

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

/**
 * **Storage only** — no Fal on the shopper device. Layers must exist from Admin → Backend → LIVE TRY-ON batch.
 */
export async function prepareLiveTryOnAssets(
  payload: LiveTryOnSourcePayload,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  const hashPayload = { ...payload, unitKey: payload.unitKey };

  onStatus?.('LOADING YOUR LOOK…');
  const compare = await buildCompareFromStorage(hashPayload);

  const full = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, photoModel);
  if (full) {
    return {
      overlayUrls: full,
      usedFallback: false,
      compare,
      activePhotoModel: photoModel,
    };
  }

  const partial = await resolveLiveTryOnOverlayTripleBestEffort(hashPayload, photoModel);
  if (partial) {
    return {
      overlayUrls: partial,
      usedFallback: false,
      compare,
      activePhotoModel: photoModel,
      partial: true,
    };
  }

  throw new Error(
    'YOUR TRY-ON LOOK IS NOT IN STUDIO YET. WE PREPARE THESE AHEAD OF TIME — TRY ANOTHER COLOR OR CHECK BACK SOON.'
  );
}

export function prepareLiveTryOnAssetsFromBaw(
  pathname: string,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  return prepareLiveTryOnAssets(buildLiveTryOnPayloadFromBaw(pathname), photoModel, onStatus);
}

export function prepareLiveTryOnAssetsFromConsult(
  unitKey: string,
  selections: ConsultQuoteSelections,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  return prepareLiveTryOnAssets(buildLiveTryOnPayloadFromConsult(unitKey, selections), photoModel, onStatus);
}
