import {
  postLiveTryOnEnsureOverlaysOneAngle,
  type LiveTryOnEnsureOverlaysResult,
} from './api';
import { resolveLiveTryOnOverlayTripleIfStored } from './liveTryOnOverlayPublicUrls';
import {
  buildLiveTryOnPayloadFromBaw,
  buildLiveTryOnPayloadFromConsult,
  liveTryOnPayloadToColorApiBody,
  type LiveTryOnSourcePayload,
} from './liveTryOnSelections';
import type { ConsultQuoteSelections } from './consultOfferFromQuote';

export type LiveTryOnPreparedAssets = {
  overlayUrls: [string, string, string];
  manifestHash?: string;
  usedFallback: boolean;
};

async function ensureOverlays(payload: LiveTryOnSourcePayload): Promise<LiveTryOnEnsureOverlaysResult> {
  const body = {
    ...liveTryOnPayloadToColorApiBody(payload),
    unitKey: payload.unitKey,
  };
  const angles = ['left', 'front', 'right'] as const;
  let last: LiveTryOnEnsureOverlaysResult | null = null;
  for (const angle of angles) {
    last = await postLiveTryOnEnsureOverlaysOneAngle({ ...body, angle });
  }
  if (!last) throw new Error('Overlay preparation failed');
  return last;
}

function tripleFromOverlayResult(result: LiveTryOnEnsureOverlaysResult): [string, string, string] | null {
  const { left, front, right } = result.publicUrls;
  if (left && front && right) {
    const t = Date.now();
    return [`${left}?t=${t}`, `${front}?t=${t}`, `${right}?t=${t}`];
  }
  return null;
}

/**
 * Transparent hair-only L/F/R from on-model references (not mannequin color WebPs).
 */
export async function prepareLiveTryOnAssets(
  payload: LiveTryOnSourcePayload,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  const hashPayload = { ...payload, unitKey: payload.unitKey };

  onStatus?.('CHECKING YOUR LOOK…');
  const cachedOverlay = await resolveLiveTryOnOverlayTripleIfStored(hashPayload);
  if (cachedOverlay) {
    return { overlayUrls: cachedOverlay, usedFallback: false };
  }

  onStatus?.('BUILDING HAIR-ONLY LAYERS FROM ON-MODEL PHOTOS…');
  const overlayResult = await ensureOverlays(payload);
  const fromApi = tripleFromOverlayResult(overlayResult);
  if (fromApi) {
    return {
      overlayUrls: fromApi,
      manifestHash: overlayResult.manifestHash,
      usedFallback: false,
    };
  }

  throw new Error(
    'TRY-ON LAYERS COULD NOT BE PREPARED. CHECK YOUR CONNECTION AND TRY AGAIN IN A MOMENT.'
  );
}

export function prepareLiveTryOnAssetsFromBaw(
  pathname: string,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  return prepareLiveTryOnAssets(buildLiveTryOnPayloadFromBaw(pathname), onStatus);
}

export function prepareLiveTryOnAssetsFromConsult(
  unitKey: string,
  selections: ConsultQuoteSelections,
  onStatus?: (msg: string) => void
): Promise<LiveTryOnPreparedAssets> {
  return prepareLiveTryOnAssets(buildLiveTryOnPayloadFromConsult(unitKey, selections), onStatus);
}
