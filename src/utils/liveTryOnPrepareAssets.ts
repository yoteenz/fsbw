import {
  postLiveTryOnEnsureOverlaysOneAngle,
  postWigPreviewLiveNoirColorOneAngle,
  type LiveTryOnEnsureOverlaysResult,
} from './api';
import { resolveLiveTryOnOverlayTripleIfStored } from './liveTryOnOverlayPublicUrls';
import {
  buildLiveTryOnPayloadFromBaw,
  buildLiveTryOnPayloadFromConsult,
  liveTryOnPayloadToColorApiBody,
  staticMannequinTripleForUnit,
  type LiveTryOnSourcePayload,
} from './liveTryOnSelections';
import { resolveWigPreviewLiveColorTripleIfStored } from './wigPreviewLiveStoragePublicUrls';
import type { ConsultQuoteSelections } from './consultOfferFromQuote';

export type LiveTryOnPreparedAssets = {
  overlayUrls: [string, string, string];
  manifestHash?: string;
  usedFallback: boolean;
};

async function ensureNoirColorPreview(payload: LiveTryOnSourcePayload): Promise<void> {
  const body = liveTryOnPayloadToColorApiBody(payload);
  const angles = ['left', 'front', 'right'] as const;
  for (const angle of angles) {
    await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
  }
}

async function ensureOverlays(payload: LiveTryOnSourcePayload): Promise<LiveTryOnEnsureOverlaysResult> {
  const body = {
    ...liveTryOnPayloadToColorApiBody(payload),
    unitKey: payload.unitKey,
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

function tripleFromOverlayResult(result: LiveTryOnEnsureOverlaysResult): [string, string, string] | null {
  const { left, front, right } = result.publicUrls;
  if (left && front && right) {
    const t = Date.now();
    return [`${left}?t=${t}`, `${front}?t=${t}`, `${right}?t=${t}`];
  }
  return null;
}

/**
 * Resolve transparent overlay L/F/R for live try-on: Storage cache → Fal color + NBP isolation.
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

  const storedColor = await resolveWigPreviewLiveColorTripleIfStored(hashPayload);

  if (payload.unitKey === 'NOIR') {
    onStatus?.('PREPARING COLOR PREVIEW…');
    if (!storedColor) {
      await ensureNoirColorPreview(payload);
    }

    onStatus?.('CREATING HAIR-ONLY LAYERS…');
    const overlayResult = await ensureOverlays(payload);
    const fromApi = tripleFromOverlayResult(overlayResult);
    if (fromApi) {
      return {
        overlayUrls: fromApi,
        manifestHash: overlayResult.manifestHash,
        usedFallback: false,
      };
    }
    throw new Error('Hair-only try-on layers could not be prepared');
  }

  onStatus?.('USING STUDIO PREVIEW…');
  const fallback = staticMannequinTripleForUnit(payload.unitKey);
  return { overlayUrls: fallback, usedFallback: true };
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
