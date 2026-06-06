import {
  postLiveTryOnEnsureOverlaysStep,
  postWigPreviewLiveNoirColorOneAngle,
  type LiveTryOnEnsureOverlaysResult,
} from './api';
import type { LiveTryOnPhotoModel } from '../constants/liveTryOnSpikeAssets';
import {
  resolveLiveTryOnOverlayTripleBestEffort,
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
  partial?: boolean;
};

export type PrepareLiveTryOnOptions = {
  onProgress?: (partial: LiveTryOnPreparedAssets) => void;
  /** When true, also generate the other model (GPT2 or NBP) after the active model. */
  includeCompareModel?: boolean;
};

const ANGLES = ['left', 'front', 'right'] as const;

function isTimeoutError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  return /timed out|timeout|FUNCTION_INVOCATION/i.test(m);
}

async function postStepWithRetry(
  body: Parameters<typeof postLiveTryOnEnsureOverlaysStep>[0],
  onStatus?: (msg: string) => void
): Promise<LiveTryOnEnsureOverlaysResult> {
  try {
    return await postLiveTryOnEnsureOverlaysStep(body);
  } catch (e) {
    if (!isTimeoutError(e)) throw e;
    onStatus?.('STEP TIMED OUT — RETRYING ONCE…');
    return postLiveTryOnEnsureOverlaysStep(body);
  }
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
  overlayUrls: [string, string, string],
  manifestHash?: string,
  partial?: boolean
): LiveTryOnPreparedAssets {
  return {
    overlayUrls,
    manifestHash,
    usedFallback: false,
    compare,
    activePhotoModel: photoModel,
    partial,
  };
}

async function runModelPipeline(
  payload: LiveTryOnSourcePayload,
  photoModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void,
  onProgress?: (partial: LiveTryOnPreparedAssets) => void
): Promise<{ manifestHash?: string; partial: boolean }> {
  const hashPayload = { ...payload, unitKey: payload.unitKey };
  const body = {
    ...liveTryOnPayloadToColorApiBody(payload),
    unitKey: payload.unitKey,
    photoModel,
  };

  const steps: Array<{ step: 'portrait' | 'overlay'; angle: (typeof ANGLES)[number] }> = [];
  for (const angle of ANGLES) {
    steps.push({ step: 'portrait', angle });
    steps.push({ step: 'overlay', angle });
  }

  let lastResult: LiveTryOnEnsureOverlaysResult | null = null;
  let stepNum = 0;

  for (const { step, angle } of steps) {
    stepNum += 1;
    const label = photoModel === 'nbp' ? 'NBP' : 'GPT IMAGE 2';
    onStatus?.(`${label} · ${step.toUpperCase()} · ${angle.toUpperCase()} (${stepNum}/${steps.length})…`);

    lastResult = await postStepWithRetry({ ...body, angle, step }, onStatus);

    if (lastResult.missingColor?.includes(angle) && step === 'portrait') {
      await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
      lastResult = await postStepWithRetry({ ...body, angle, step }, onStatus);
    }
    if (lastResult.error === 'PORTRAIT_MISSING' && step === 'overlay') {
      await postStepWithRetry({ ...body, angle, step: 'portrait' }, onStatus);
      lastResult = await postStepWithRetry({ ...body, angle, step: 'overlay' }, onStatus);
    }

    const compare = await buildCompareFromStorage(hashPayload);
    const best = await resolveLiveTryOnOverlayTripleBestEffort(hashPayload, photoModel);
    if (best && onProgress) {
      const full = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, photoModel);
      onProgress(
        buildPrepared(compare, photoModel, full ?? best, lastResult?.manifestHash, !full)
      );
    }
  }

  const full = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, photoModel);
  return { manifestHash: lastResult?.manifestHash, partial: !full };
}

/**
 * One Fal job per HTTP request: portrait step, then overlay step, per angle.
 * Default: active model only (NBP). GPT2 compare is on-demand.
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

  const cachedFull = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, photoModel);
  if (cachedFull) {
    return buildPrepared(compare, photoModel, cachedFull);
  }

  const cachedPartial = await resolveLiveTryOnOverlayTripleBestEffort(hashPayload, photoModel);
  if (cachedPartial && !options?.includeCompareModel) {
    const full = await resolveLiveTryOnOverlayTripleIfStored(hashPayload, photoModel);
    if (full) return buildPrepared(compare, photoModel, full);
  }

  if (payload.unitKey === 'NOIR') {
    onStatus?.('PREPARING MANNEQUIN COLOR REFERENCE…');
    await ensureNoirColorPreview(payload);
  } else {
    throw new Error('LIVE TRY ON WITH PHOTOREAL MODELS IS AVAILABLE FOR NOIR FIRST');
  }

  const onProgress = options?.onProgress;
  const { manifestHash, partial } = await runModelPipeline(payload, photoModel, onStatus, onProgress);

  if (options?.includeCompareModel) {
    const other: LiveTryOnPhotoModel = photoModel === 'nbp' ? 'gpt2' : 'nbp';
    onStatus?.(`BUILDING ${other === 'gpt2' ? 'GPT IMAGE 2' : 'NBP'} COMPARE…`);
    await runModelPipeline(payload, other, onStatus);
    compare = await buildCompareFromStorage(hashPayload);
  }

  compare = await buildCompareFromStorage(hashPayload);
  const overlayUrls =
    (await resolveLiveTryOnOverlayTripleIfStored(hashPayload, photoModel)) ??
    (await resolveLiveTryOnOverlayTripleBestEffort(hashPayload, photoModel));

  if (overlayUrls) {
    return buildPrepared(compare, photoModel, overlayUrls, manifestHash, partial);
  }

  throw new Error(
    'TRY-ON STILL PREPARING OR TIMED OUT. TAP BACK AND OPEN AGAIN — SAVED STEPS RESUME WHERE THEY LEFT OFF.'
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

/** Generate the other model for side-by-side compare (NBP live view can already be open). */
export async function prepareLiveTryOnCompareModel(
  payload: LiveTryOnSourcePayload,
  activeModel: LiveTryOnPhotoModel,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  const hashPayload = { ...payload, unitKey: payload.unitKey };
  const other: LiveTryOnPhotoModel = activeModel === 'nbp' ? 'gpt2' : 'nbp';
  const otherCached = await resolveLiveTryOnPortraitTripleIfStored(hashPayload, other);
  if (!otherCached) {
    await runModelPipeline(payload, other, onStatus);
  }
  const compare = await buildCompareFromStorage(hashPayload);
  const overlayUrls =
    (await resolveLiveTryOnOverlayTripleIfStored(hashPayload, activeModel)) ??
    (await resolveLiveTryOnOverlayTripleBestEffort(hashPayload, activeModel));
  if (!overlayUrls) {
    throw new Error('ACTIVE MODEL OVERLAYS MISSING');
  }
  return buildPrepared(compare, activeModel, overlayUrls);
}
