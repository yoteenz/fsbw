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

async function ensureNoirColorPreview(payload: LiveTryOnSourcePayload): Promise<void> {
  const body = liveTryOnPayloadToColorApiBody(payload);
  const stored = await resolveWigPreviewLiveColorTripleIfStored({ ...body, unitKey: payload.unitKey });
  if (stored) return;
  const angles = ['left', 'front', 'right'] as const;
  for (const angle of angles) {
    await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
  }
}

async function ensureOverlays(payload: LiveTryOnSourcePayload): Promise<LiveTryOnEnsureOverlaysResult> {
  const body = {
    ...liveTryOnPayloadToColorApiBody(payload),
    unitKey: payload.unitKey,
    compareModels: true,
  };
  const angles = ['left', 'front', 'right'] as const;
  let last: LiveTryOnEnsureOverlaysResult | null = null;
  for (const angle of angles) {
    last = await postLiveTryOnEnsureOverlaysOneAngle({ ...body, angle });
    if (last.missingColor?.includes(angle)) {
      await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
      last = await postLiveTryOnEnsureOverlaysOneAngle({ ...body, angle });
    }
  }
  if (!last) throw new Error('Overlay preparation failed');
  return last;
}

function tripleFromApiUrls(
  urls: { left: string | null; front: string | null; right: string | null } | undefined
): [string, string, string] | null {
  if (!urls?.left || !urls.front || !urls.right) return null;
  const t = Date.now();
  return [`${urls.left}?t=${t}`, `${urls.front}?t=${t}`, `${urls.right}?t=${t}`];
}

async function buildCompareFromStorage(
  payload: LiveTryOnSourcePayload
): Promise<LiveTryOnCompareBundles | undefined> {
  const hashPayload = { ...payload, unitKey: payload.unitKey };
  const models: LiveTryOnPhotoModel[] = ['nbp', 'gpt2'];
  const portraits: LiveTryOnCompareBundles['portraits'] = {};
  const overlays: LiveTryOnCompareBundles['overlays'] = {};
  for (const model of models) {
    const p = await resolveLiveTryOnPortraitTripleIfStored(hashPayload, model);
    const o = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, model);
    if (p) portraits[model] = p;
    if (o) overlays[model] = o;
  }
  if (!portraits.nbp && !portraits.gpt2 && !overlays.nbp && !overlays.gpt2) return undefined;
  return { portraits, overlays };
}

function compareFromApiResult(result: LiveTryOnEnsureOverlaysResult): LiveTryOnCompareBundles | undefined {
  const portraits: LiveTryOnCompareBundles['portraits'] = {};
  const overlays: LiveTryOnCompareBundles['overlays'] = {};
  const nbpP = tripleFromApiUrls(result.comparePortraits?.nbp);
  const gptP = tripleFromApiUrls(result.comparePortraits?.gpt2);
  const nbpO = tripleFromApiUrls(result.compareOverlays?.nbp);
  const gptO = tripleFromApiUrls(result.compareOverlays?.gpt2);
  if (nbpP) portraits.nbp = nbpP;
  if (gptP) portraits.gpt2 = gptP;
  if (nbpO) overlays.nbp = nbpO;
  if (gptO) overlays.gpt2 = gptO;
  if (!nbpP && !gptP && !nbpO && !gptO) return undefined;
  return { portraits, overlays };
}

/**
 * Mannequin color WebP → dual Fal portraits (NBP + GPT2, same prompt) → hair-only overlays.
 */
export async function prepareLiveTryOnAssets(
  payload: LiveTryOnSourcePayload,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  const hashPayload = { ...payload, unitKey: payload.unitKey };

  onStatus?.('CHECKING YOUR LOOK…');
  const cachedOverlay = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, photoModel);
  if (cachedOverlay) {
    const compare = await buildCompareFromStorage(hashPayload);
    return {
      overlayUrls: cachedOverlay,
      usedFallback: false,
      compare,
      activePhotoModel: photoModel,
    };
  }

  if (payload.unitKey === 'NOIR') {
    onStatus?.('PREPARING MANNEQUIN COLOR REFERENCE…');
    await ensureNoirColorPreview(payload);
  } else {
    throw new Error('LIVE TRY ON WITH PHOTOREAL MODELS IS AVAILABLE FOR NOIR FIRST');
  }

  onStatus?.('CREATING PHOTOREAL LOOKS (NBP + GPT IMAGE 2)…');
  const overlayResult = await ensureOverlays(payload);
  const compare = compareFromApiResult(overlayResult) ?? (await buildCompareFromStorage(hashPayload));

  const fromSelected =
    compare?.overlays?.[photoModel] ?? tripleFromApiUrls(overlayResult.compareOverlays?.[photoModel]);
  const fromActive = tripleFromApiUrls(overlayResult.publicUrls);

  const overlayUrls = fromSelected ?? fromActive;
  if (overlayUrls) {
    return {
      overlayUrls,
      manifestHash: overlayResult.manifestHash,
      usedFallback: false,
      compare,
      activePhotoModel: photoModel,
    };
  }

  throw new Error(
    'TRY-ON LAYERS COULD NOT BE PREPARED. CHECK YOUR CONNECTION AND TRY AGAIN IN A MOMENT.'
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
