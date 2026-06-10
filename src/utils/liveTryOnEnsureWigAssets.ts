import {
  postLiveWigAfterColorStyling,
  postWigPreviewLiveNoirColor,
  type LiveWigAfterColorStylingPayload,
  type WigPreviewLiveNoirColorPayload,
} from './api';
import {
  liveTryOnApiBodyFromPayload,
  resolveLiveTryOnStylingMode,
  type LiveTryOnPartSelection,
} from './liveTryOnWigReference';
import type { LiveTryOnSourcePayload } from './liveTryOnSelections';
import { liveTryOnPayloadToColorApiBody } from './liveTryOnSelections';

/**
 * Ensure Supabase has color-tier (+ optional after-color styling) WebPs for the
 * shopper's current BAW build. Reuses Storage when paths already exist (API skips).
 */
function tripleFromPublicUrls(urls: {
  left: string | null;
  front: string | null;
  right: string | null;
}): [string, string, string] | null {
  if (!urls.front) return null;
  return [urls.left || urls.front, urls.front, urls.right || urls.front];
}

export async function ensureLiveTryOnWigAssets(
  payload: LiveTryOnSourcePayload,
  partSelection: LiveTryOnPartSelection,
  onStatus?: (msg: string) => void
): Promise<{
  colorTierHash: string;
  stylingMode: ReturnType<typeof resolveLiveTryOnStylingMode>;
  mannequinUrls: [string, string, string] | null;
}> {
  if (String(payload.unitKey || 'NOIR').toUpperCase() !== 'NOIR') {
    return { colorTierHash: '', stylingMode: 'color-only', mannequinUrls: null };
  }

  const colorBody: WigPreviewLiveNoirColorPayload = liveTryOnPayloadToColorApiBody(payload);
  onStatus?.('PREPARING YOUR COLOR…');
  const colorRes = await postWigPreviewLiveNoirColor(colorBody);

  const stylingMode = resolveLiveTryOnStylingMode(payload.styling);
  if (stylingMode === 'color-only') {
    return {
      colorTierHash: colorRes.manifestHash,
      stylingMode,
      mannequinUrls: tripleFromPublicUrls(colorRes.publicUrls),
    };
  }

  const stylingBody: LiveWigAfterColorStylingPayload = {
    ...liveTryOnApiBodyFromPayload(payload, partSelection),
    partSelection,
    styling: payload.styling,
  };

  onStatus?.(
    stylingMode === 'bangs-only'
      ? 'PREPARING BANGS…'
      : stylingMode === 'layers'
        ? 'PREPARING LAYERS…'
        : stylingMode === 'crimps'
          ? 'PREPARING CRIMPS…'
          : 'PREPARING FLAT IRON…'
  );
  const stylingRes = await postLiveWigAfterColorStyling(stylingBody);
  return {
    colorTierHash: stylingRes.colorTierHash,
    stylingMode,
    mannequinUrls: tripleFromPublicUrls(stylingRes.publicUrls),
  };
}
