import type { LiveTryOnPhotoModel } from '../constants/liveTryOnSpikeAssets';
import { postLiveTryOnResolve } from './api';
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
import { liveTryOnStorageLookupPayload } from './liveTryOnStorageLookup';
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

function studioNotReadyMessage(color: string): string {
  const label = String(color || 'THIS COLOR').toUpperCase().trim();
  return `${label} IS NOT IN STUDIO YET. WE PREPARE THESE AHEAD OF TIME — TRY ANOTHER COLOR OR CHECK BACK SOON.`;
}

async function buildCompareFromStorage(
  lookupPayload: ReturnType<typeof liveTryOnStorageLookupPayload>
): Promise<LiveTryOnCompareBundles | undefined> {
  const portraits: LiveTryOnCompareBundles['portraits'] = {};
  const overlays: LiveTryOnCompareBundles['overlays'] = {};
  for (const model of ['nbp', 'gpt2'] as LiveTryOnPhotoModel[]) {
    const p = await resolveLiveTryOnPortraitTripleIfStored(lookupPayload, model);
    const o = await resolveLiveTryOnOverlayTripleIfStored(lookupPayload, model);
    if (p) portraits[model] = p;
    if (o) overlays[model] = o;
  }
  if (!portraits.nbp && !portraits.gpt2 && !overlays.nbp && !overlays.gpt2) return undefined;
  return { portraits, overlays };
}

async function resolveViaApi(
  payload: LiveTryOnSourcePayload,
  photoModel: LiveTryOnPhotoModel
): Promise<LiveTryOnPreparedAssets | null> {
  try {
    const res = await postLiveTryOnResolve({
      unitKey: payload.unitKey,
      color: payload.color,
      photoModel,
    });
    if (!res.ready || !res.overlayUrls) return null;
    return {
      overlayUrls: res.overlayUrls,
      manifestHash: res.manifestHash,
      usedFallback: false,
      activePhotoModel: photoModel,
      partial: res.partial,
    };
  } catch {
    return null;
  }
}

/**
 * **Storage only** — no Fal on the shopper device. Layers must exist from Admin → Backend → LIVE TRY-ON batch.
 * Lookup uses studio default NOIR build + shopper color (same keys as admin batch).
 */
export async function prepareLiveTryOnAssets(
  payload: LiveTryOnSourcePayload,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  const lookupPayload = liveTryOnStorageLookupPayload(payload);

  onStatus?.('LOADING YOUR LOOK…');
  const compare = await buildCompareFromStorage(lookupPayload);

  const full = await resolveLiveTryOnOverlayTripleIfStored(lookupPayload, photoModel);
  if (full) {
    return {
      overlayUrls: full,
      usedFallback: false,
      compare,
      activePhotoModel: photoModel,
    };
  }

  const partial = await resolveLiveTryOnOverlayTripleBestEffort(lookupPayload, photoModel);
  if (partial) {
    return {
      overlayUrls: partial,
      usedFallback: false,
      compare,
      activePhotoModel: photoModel,
      partial: true,
    };
  }

  onStatus?.('CHECKING STUDIO…');
  const fromApi = await resolveViaApi(payload, photoModel);
  if (fromApi) {
    return { ...fromApi, compare };
  }

  throw new Error(studioNotReadyMessage(payload.color));
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
