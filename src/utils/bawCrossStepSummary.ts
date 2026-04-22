import { isBuildAWigCustomizePath } from './buildAWigRoutes';
import { readBuildWigLivePreviewColor, readBuildWigLivePreviewSelections } from './buildWigLivePreviewSelections';

/** True for `.../customize/.../color` (not hub-only `/customize`). */
export function isBawCustomizeColorSubPagePathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return isBuildAWigCustomizePath(pathname) && p.endsWith('/color');
}

/**
 * Hairline CSV for static mannequin assets on BAW sub-pages.
 * Matches hub-confirmed `selected*` when not on the hairline step (customize draft can be stale).
 */
export function readHairlineCsvForWigPreviewPath(pathname: string): string {
  const isEdit = pathname.includes('/edit');
  const isCust = isBuildAWigCustomizePath(pathname);
  const onHairlineStep = pEndsWith(pathname, '/hairline');
  if (isEdit) {
    return (
      localStorage.getItem('editSelectedHairline') ||
      localStorage.getItem('selectedHairline') ||
      'NATURAL'
    );
  }
  if (isCust) {
    if (onHairlineStep) {
      return localStorage.getItem('customizeSelectedHairline') || localStorage.getItem('selectedHairline') || 'NATURAL';
    }
    return localStorage.getItem('selectedHairline') || localStorage.getItem('customizeSelectedHairline') || 'NATURAL';
  }
  return localStorage.getItem('selectedHairline') || 'NATURAL';
}

function pEndsWith(pathname: string, suffix: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p.endsWith(suffix);
}

/** Styling chips for display (comma-separated salon + bangs). */
export function readStylingSummaryLabel(pathname: string): string {
  const isEdit = pathname.includes('/edit');
  const isCust = isBuildAWigCustomizePath(pathname);
  const onStylingStep = pEndsWith(pathname, '/styling');
  let csv = '';
  if (isEdit) {
    const editCsv =
      localStorage.getItem('editSelectedHairStyling') || localStorage.getItem('editSelectedStyling') || '';
    csv = editCsv || localStorage.getItem('selectedHairStyling') || '';
  } else if (isCust) {
    if (onStylingStep) {
      csv =
        localStorage.getItem('customizeSelectedHairStyling') ||
        localStorage.getItem('selectedHairStyling') ||
        '';
    } else {
      csv =
        localStorage.getItem('selectedHairStyling') ||
        localStorage.getItem('customizeSelectedHairStyling') ||
        '';
    }
  } else {
    csv = localStorage.getItem('selectedHairStyling') || '';
  }
  const parts = csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    const fallback = readBuildWigLivePreviewSelections(pathname).styling;
    return fallback && fallback !== 'NONE' ? fallback : 'NONE';
  }
  return parts.join(' + ');
}

export type BawCrossStepSummary = {
  colorLabel: string;
  hairlineLabel: string;
  stylingLabel: string;
};

export function readBawCrossStepSummary(pathname: string): BawCrossStepSummary {
  return {
    colorLabel: readBuildWigLivePreviewColor(pathname) || 'OFF BLACK',
    hairlineLabel: formatHairlineLabel(readHairlineCsvForWigPreviewPath(pathname)),
    stylingLabel: readStylingSummaryLabel(pathname),
  };
}

function formatHairlineLabel(csv: string): string {
  if (!csv || !csv.trim()) return 'NATURAL';
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' + ') || 'NATURAL';
}

function isValidBlancoColorId(color: string): boolean {
  return ['GOLDEN', 'PLATINUM', 'ASH'].includes(color);
}

/** Set when leaving hairline/styling customize sub-pages toward the customize hub so the color step can re-align draft swatches. */
export const BAW_SESSION_RETURNING_TO_CUSTOMIZE_HUB = 'bawReturningToCustomizeHub';

/** Set when navigating from the customize hub tile to the color sub-page — color page applies `selectedColor` → draft once. */
export const BAW_SESSION_COLOR_STEP_FROM_CUSTOMIZE_HUB = 'bawColorStepFromCustomizeHub';

function isCustomizeHubPath(path: string): boolean {
  const p = path.replace(/\/$/, '') || '/';
  return /\/build-a-wig\/[^/]+\/customize$/.test(p);
}

/**
 * Keep `customizeSelected*` in sync with hub `selected*` when the user is still on the **customize hub**
 * (not a sub-page). The hub UI reads React state, which tracks `customizeSelected*` after returning from
 * sub-pages; `selected*` can lag until Confirm — without mirroring, opening Color would read stale `selectedColor`
 * and the color sub-page would show the wrong swatch.
 */
/** First token of hair styling CSV (matches styling sub-page `selectedHairStyling[0]` → `selectedStyling`). */
export function primaryStylingTokenFromHairCsv(csv: string | null | undefined): string {
  if (!csv || !csv.trim()) return 'NONE';
  const first = csv.split(',')[0]?.trim() ?? '';
  if (!first) return 'NONE';
  const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
  if (partSelectionOptions.includes(first)) return 'NONE';
  return first;
}

/**
 * Hub `customization.styling` must store the **full** comma-separated combo (e.g. `BANGS,LAYERS`) when present.
 * Single-token `selectedStyling` / `customizeSelectedStyling` only holds the salon row — use `*HairStyling` CSV first.
 */
export function mergeStylingForHub(
  customizeHairCsv: string | null,
  selectedHairCsv: string | null,
  singleToken: string | null,
  stateFallback: string
): string {
  const csv = (customizeHairCsv && customizeHairCsv.trim()) || (selectedHairCsv && selectedHairCsv.trim()) || '';
  if (csv) return csv;
  const sf = (stateFallback && stateFallback.trim()) || '';
  if (sf.includes(',')) return sf;
  const tok = primaryStylingTokenFromHairCsv(singleToken || '');
  if (tok && tok !== 'NONE') return tok;
  const s = (singleToken && singleToken.trim()) || '';
  if (s && s !== 'NONE') {
    const partSelectionOptions = ['MIDDLE', 'LEFT', 'RIGHT'];
    if (!partSelectionOptions.includes(s)) return s;
  }
  return sf || 'NONE';
}

export function mirrorCustomizeDraftKeysFromSelectedHubKeys(): void {
  const keys: [string, string][] = [
    ['customizeSelectedCapSize', 'selectedCapSize'],
    ['customizeSelectedLength', 'selectedLength'],
    ['customizeSelectedDensity', 'selectedDensity'],
    ['customizeSelectedLace', 'selectedLace'],
    ['customizeSelectedTexture', 'selectedTexture'],
    ['customizeSelectedColor', 'selectedColor'],
    ['customizeSelectedHairline', 'selectedHairline'],
    ['customizeSelectedAddOns', 'selectedAddOns'],
    ['customizeSelectedCapSizePrice', 'selectedCapSizePrice'],
    ['customizeSelectedColorPrice', 'selectedColorPrice'],
    ['customizeSelectedLengthPrice', 'selectedLengthPrice'],
    ['customizeSelectedDensityPrice', 'selectedDensityPrice'],
    ['customizeSelectedLacePrice', 'selectedLacePrice'],
    ['customizeSelectedTexturePrice', 'selectedTexturePrice'],
    ['customizeSelectedHairlinePrice', 'selectedHairlinePrice'],
    ['customizeSelectedStylingPrice', 'selectedStylingPrice'],
    ['customizeSelectedAddOnsPrice', 'selectedAddOnsPrice'],
  ];
  for (const [cust, sel] of keys) {
    const v = localStorage.getItem(sel);
    if (v != null && v !== '') {
      localStorage.setItem(cust, v);
    }
  }
  const hairStyling = localStorage.getItem('selectedHairStyling');
  if (hairStyling != null && hairStyling !== '') {
    localStorage.setItem('customizeSelectedHairStyling', hairStyling);
    localStorage.setItem('customizeSelectedStyling', primaryStylingTokenFromHairCsv(hairStyling));
  } else {
    const selSty = localStorage.getItem('selectedStyling');
    if (selSty != null && selSty !== '') {
      localStorage.setItem('customizeSelectedStyling', selSty);
    }
  }
}

function normalizeColorForProductRoute(color: string, isBlancoRoute: boolean): string {
  const blancoOnly = ['GOLDEN', 'PLATINUM', 'ASH'];
  if (isBlancoRoute) {
    return isValidBlancoColorId(color) ? color : 'PLATINUM';
  }
  if (blancoOnly.includes(color)) return 'OFF BLACK';
  return color;
}

/**
 * When opening `/…/customize/color` from the hub tile, copy hub `selectedColor` into `customizeSelected*`
 * so in-page draft + Fal use the same swatch as the tile (clears stale draft).
 */
export function hydrateCustomizeColorDraftFromHubIfFlagged(pathname: string): string | null {
  if (!isBawCustomizeColorSubPagePathname(pathname)) return null;
  let flagged = false;
  try {
    flagged = sessionStorage.getItem(BAW_SESSION_COLOR_STEP_FROM_CUSTOMIZE_HUB) === '1';
    if (flagged) {
      sessionStorage.removeItem(BAW_SESSION_COLOR_STEP_FROM_CUSTOMIZE_HUB);
    }
  } catch {
    flagged = false;
  }
  if (!flagged) return null;

  const isBlancoRoute = pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit');
  const raw = localStorage.getItem('selectedColor');
  if (!raw) return null;

  const color = normalizeColorForProductRoute(raw, isBlancoRoute);
  const price = localStorage.getItem('selectedColorPrice') || '0';
  localStorage.setItem('customizeSelectedColor', color);
  localStorage.setItem('customizeSelectedColorPrice', price);
  return color;
}

/** Run hub hydration + return-after-step sync, then read canonical swatch (matches `readBuildWigLivePreviewColor`). */
export function resolveBawCustomizeColorSubPageSwatch(pathname: string): string {
  hydrateCustomizeColorDraftFromHubIfFlagged(pathname);
  syncCustomizeColorDraftFromHubConfirmed(pathname);
  return readBuildWigLivePreviewColor(pathname);
}

/** Call before `navigate` when landing on the customize hub from hairline or styling (not from the color step). */
export function markBawNavigateToCustomizeHubFromOtherStep(targetPath: string): void {
  if (isCustomizeHubPath(targetPath)) {
    try {
      sessionStorage.setItem(BAW_SESSION_RETURNING_TO_CUSTOMIZE_HUB, '1');
    } catch {
      /* ignore */
    }
  }
}

/**
 * On customize color sub-page entry, align draft swatch + `customizeSelectedColor` with
 * hub-confirmed `selectedColor` when the user is returning from another customize step (session flag).
 * Do **not** run on a direct open from the customize hub — hub mirrors `selected*` → `customizeSelected*` in
 * `handleOptionSelect` so draft matches the tile; copying from stale `selectedColor` would regress the swatch.
 */
export function syncCustomizeColorDraftFromHubConfirmed(pathname: string): string | null {
  if (!isBawCustomizeColorSubPagePathname(pathname)) return null;

  let fromOtherStep = false;
  try {
    fromOtherStep = sessionStorage.getItem(BAW_SESSION_RETURNING_TO_CUSTOMIZE_HUB) === '1';
    if (fromOtherStep) {
      sessionStorage.removeItem(BAW_SESSION_RETURNING_TO_CUSTOMIZE_HUB);
    }
  } catch {
    fromOtherStep = false;
  }
  if (!fromOtherStep) return null;

  const isBlancoRoute = pathname.includes('/blanco/customize') || pathname.includes('/blanco/edit');
  const confirmedRaw = localStorage.getItem('selectedColor');
  if (!confirmedRaw) return null;

  let confirmed = confirmedRaw;
  const blancoOnly = ['GOLDEN', 'PLATINUM', 'ASH'];
  if (isBlancoRoute) {
    if (!isValidBlancoColorId(confirmed)) confirmed = 'PLATINUM';
  } else if (blancoOnly.includes(confirmed)) {
    confirmed = 'OFF BLACK';
  }

  const price = localStorage.getItem('selectedColorPrice') || '0';
  localStorage.setItem('customizeSelectedColor', confirmed);
  localStorage.setItem('customizeSelectedColorPrice', price);

  return confirmed;
}
