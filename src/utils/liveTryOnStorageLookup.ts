import { LIVE_TRY_ON_BATCH_NOIR_DEFAULTS } from '../constants/liveTryOnBatchManifest';
import type { LiveTryOnSourcePayload } from './liveTryOnSelections';
import type { WigPreviewSelectionsForHash } from './wigPreviewLiveColorTierHash';

/**
 * Map shopper selections → Storage lookup key used by admin batch (default NOIR + their color).
 */
export function liveTryOnStorageLookupPayload(payload: LiveTryOnSourcePayload): WigPreviewSelectionsForHash {
  return {
    unitKey: String(payload.unitKey || 'NOIR').toUpperCase(),
    color: payload.color,
    length: LIVE_TRY_ON_BATCH_NOIR_DEFAULTS.length,
    density: LIVE_TRY_ON_BATCH_NOIR_DEFAULTS.density,
    lace: LIVE_TRY_ON_BATCH_NOIR_DEFAULTS.lace,
    texture: LIVE_TRY_ON_BATCH_NOIR_DEFAULTS.texture,
    hairline: LIVE_TRY_ON_BATCH_NOIR_DEFAULTS.hairline,
    styling: 'NONE',
    addOns: [],
  };
}
