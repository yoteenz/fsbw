import type { BuildWigLivePreviewSelections } from './buildWigLivePreviewSelections';
import { isBuildAWigCustomizePath } from './buildAWigRoutes';
import type { LiveTryOnSourcePayload } from './liveTryOnSelections';

export type LiveTryOnPartSelection = 'MIDDLE' | 'LEFT' | 'RIGHT';

const UNIT_SLUG_TO_KEY: Record<string, string> = {
  noir: 'NOIR',
  blanco: 'BLANCO',
  'soft-wave': 'SOFT WAVE',
  'beach-wave': 'BEACH WAVE',
  'soft-curl': 'SOFT CURL',
  'ocean-curl': 'OCEAN CURL',
};

/** Infer unit from `/build-a-wig/{slug}/...` (reliable vs `selectedUnit` localStorage). */
export function unitKeyFromBuildAWigPathname(pathname: string): string {
  const m = pathname.match(/\/build-a-wig\/([^/?#]+)/i);
  if (!m) return 'NOIR';
  return UNIT_SLUG_TO_KEY[m[1].toLowerCase()] || 'NOIR';
}

export function readBuildWigPartSelection(pathname: string): LiveTryOnPartSelection {
  const isOnEditRoute = pathname.includes('/edit');
  const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
  const raw = isOnEditRoute
    ? localStorage.getItem('editSelectedPartSelection') ||
      localStorage.getItem('selectedPartSelection') ||
      'MIDDLE'
    : isOnCustomizeRoute
      ? localStorage.getItem('customizeSelectedPartSelection') ||
        localStorage.getItem('selectedPartSelection') ||
        'MIDDLE'
      : localStorage.getItem('selectedPartSelection') || 'MIDDLE';
  const u = String(raw || 'MIDDLE').toUpperCase();
  if (u === 'LEFT' || u === 'RIGHT') return u;
  return 'MIDDLE';
}

export type LiveTryOnStylingMode =
  | 'color-only'
  | 'layers'
  | 'crimps'
  | 'flat-iron'
  | 'bangs-only';

/** Derive which live Fal styling pass applies (mirrors server after-color-styling). */
export function resolveLiveTryOnStylingMode(stylingCsv: string): LiveTryOnStylingMode {
  const raw = String(stylingCsv || 'NONE').toUpperCase();
  const hasLayers = raw.includes('LAYERS');
  const hasCrimps = raw.includes('CRIMPS');
  const hasFlatIron = raw.includes('FLAT IRON');
  const hasBangs = raw.includes('BANGS');
  const salonCount = [hasLayers, hasCrimps, hasFlatIron].filter(Boolean).length;
  if (salonCount > 1) return 'color-only';
  if (hasLayers && salonCount === 1) return 'layers';
  if (hasCrimps && salonCount === 1) return 'crimps';
  if (hasFlatIron && salonCount === 1) return 'flat-iron';
  if (hasBangs && salonCount === 0) return 'bangs-only';
  return 'color-only';
}

export function liveTryOnApiBodyFromPayload(
  payload: LiveTryOnSourcePayload,
  partSelection: LiveTryOnPartSelection
): BuildWigLivePreviewSelections & {
  color: string;
  partSelection: LiveTryOnPartSelection;
  unitKey: string;
} {
  return {
    unitKey: payload.unitKey,
    color: payload.color,
    length: payload.length,
    density: payload.density,
    lace: payload.lace,
    texture: payload.texture,
    hairline: payload.hairline,
    styling: payload.styling,
    addOns: payload.addOns,
    partSelection,
  };
}
