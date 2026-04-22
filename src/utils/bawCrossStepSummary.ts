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
export function mirrorCustomizeDraftKeysFromSelectedHubKeys(): void {
  const keys: [string, string][] = [
    ['customizeSelectedCapSize', 'selectedCapSize'],
    ['customizeSelectedLength', 'selectedLength'],
    ['customizeSelectedDensity', 'selectedDensity'],
    ['customizeSelectedLace', 'selectedLace'],
    ['customizeSelectedTexture', 'selectedTexture'],
    ['customizeSelectedColor', 'selectedColor'],
    ['customizeSelectedHairline', 'selectedHairline'],
    ['customizeSelectedStyling', 'selectedStyling'],
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
  }
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
