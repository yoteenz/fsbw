import {
  readBawNoirLiveBangsWigViews,
  readBawNoirLiveColorWigViews,
  readBawNoirLiveStylingWigViewsForPart,
  type BawNoirLiveStylingSalonMode,
} from './bawNoirLivePreviewStorage';
import { readBuildWigLivePreviewColor, readBuildWigLivePreviewSelections } from './buildWigLivePreviewSelections';
import {
  readBuildWigPartSelection,
  unitKeyFromBuildAWigPathname,
  type LiveTryOnPartSelection,
} from './liveTryOnWigReference';
import {
  consultSelectionsToSpecialOfferOptions,
  type ConsultQuoteSelections,
} from './consultOfferFromQuote';
import type { WigPreviewSelectionsForHash } from './wigPreviewLiveColorTierHash';
import { LIVE_TRY_ON_SPIKE_WIG_URLS } from '../constants/liveTryOnSpikeAssets';

export type LiveTryOnSourcePayload = WigPreviewSelectionsForHash & {
  unitKey: string;
  partSelection: LiveTryOnPartSelection;
};

/** Static mannequin L/F/R when Storage/Fal not ready (per unit family). */
export function staticMannequinTripleForUnit(unitKey: string): [string, string, string] {
  const u = String(unitKey || 'NOIR').toUpperCase();
  if (u === 'BLANCO') {
    return ['/assets/blanco left.png', '/assets/blanco front.png', '/assets/blanco right.png'];
  }
  if (u === 'SOFT WAVE' || u === 'BEACH WAVE') {
    return ['/assets/wave left.png', '/assets/wave front.png', '/assets/wave right.png'];
  }
  if (u === 'SOFT CURL' || u === 'OCEAN CURL') {
    return ['/assets/2D CURLY LEFT.png', '/assets/2D CURLY FRONT.png', '/assets/2D CURLY RIGHT.png'];
  }
  return [
    LIVE_TRY_ON_SPIKE_WIG_URLS.left,
    LIVE_TRY_ON_SPIKE_WIG_URLS.front,
    LIVE_TRY_ON_SPIKE_WIG_URLS.right,
  ];
}

function parseStylingIds(styling: string): string[] {
  return styling
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

/** Prefer committed live styling/bangs triple when present (NOIR). */
export function readLiveTryOnTripleFromLocalStorage(): [string, string, string] | null {
  try {
    const stylingRaw = localStorage.getItem('selectedHairStyling') || localStorage.getItem('selectedStyling') || '';
    const ids = parseStylingIds(stylingRaw);
    const hasLayers = ids.includes('LAYERS');
    const hasCrimps = ids.includes('CRIMPS');
    const hasFlatIron = ids.includes('FLAT IRON');
    const hasBangs = ids.includes('BANGS');
    const salonCount = [hasLayers, hasCrimps, hasFlatIron].filter(Boolean).length;
    const partU = (localStorage.getItem('selectedPartSelection') || 'MIDDLE').toUpperCase();

    if (salonCount === 1 && (hasLayers || hasCrimps || hasFlatIron)) {
      const salonMode: BawNoirLiveStylingSalonMode = hasLayers
        ? hasBangs
          ? 'LAYERS_BANGS'
          : 'LAYERS'
        : hasCrimps
          ? hasBangs
            ? 'CRIMPS_BANGS'
            : 'CRIMPS'
          : hasBangs
            ? 'FLAT_IRON_BANGS'
            : 'FLAT_IRON';
      const fromStyling = readBawNoirLiveStylingWigViewsForPart(partU, salonMode);
      if (fromStyling) return fromStyling;
    }
    if (hasBangs && salonCount === 0) {
      const bangs = readBawNoirLiveBangsWigViews();
      if (bangs) return bangs;
    }
    const color = readBawNoirLiveColorWigViews();
    if (color) return color;
  } catch {
    /* ignore */
  }
  return null;
}

export function buildLiveTryOnPayloadFromBaw(pathname: string): LiveTryOnSourcePayload {
  const unitKey = unitKeyFromBuildAWigPathname(pathname);
  const base = readBuildWigLivePreviewSelections(pathname);
  const color = readBuildWigLivePreviewColor(pathname);
  const partSelection = readBuildWigPartSelection(pathname);
  return {
    unitKey,
    partSelection,
    ...base,
    color,
  };
}

/** Parse `returnTo` query from `/tools/live-try-on` back to a BAW pathname. */
export function bawPathnameFromReturnTo(returnTo: string): string {
  const raw = String(returnTo || '').trim();
  if (!raw.startsWith('/build-a-wig')) return '/build-a-wig/noir';
  const pathOnly = raw.split('?')[0] || '/build-a-wig/noir';
  return pathOnly.replace(/\/$/, '') || '/build-a-wig/noir';
}

export function buildLiveTryOnPayloadFromConsult(
  unitKey: string,
  selections: ConsultQuoteSelections
): LiveTryOnSourcePayload {
  const opts = consultSelectionsToSpecialOfferOptions(selections);
  return {
    unitKey: String(unitKey || 'NOIR').toUpperCase(),
    partSelection: 'MIDDLE',
    length: opts.length || '24"',
    density: opts.density || '200%',
    lace: opts.lace || '13X6',
    texture: opts.texture || 'SILKY',
    hairline: opts.hairline || 'NATURAL',
    styling: opts.styling || 'NONE',
    addOns: opts.addOns || [],
    color: opts.color || 'OFF BLACK',
  };
}

export function liveTryOnPayloadToColorApiBody(payload: LiveTryOnSourcePayload) {
  return {
    color: payload.color,
    length: payload.length,
    density: payload.density,
    lace: payload.lace,
    texture: payload.texture,
    hairline: payload.hairline,
    styling: 'NONE',
    addOns: payload.addOns,
  };
}
