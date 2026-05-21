import { isBuildAWigCustomizePath } from './buildAWigRoutes';

/** Same merge as `bawCrossStepSummary.mergeStylingForHub` — kept here to avoid circular imports. */
function mergeStylingCsvForPreview(
  customizeHairCsv: string | null,
  selectedHairCsv: string | null,
  singleToken: string | null,
  stateFallback: string
): string {
  const csv = (customizeHairCsv && customizeHairCsv.trim()) || (selectedHairCsv && selectedHairCsv.trim()) || '';
  if (csv) return csv;
  const sf = (stateFallback && stateFallback.trim()) || '';
  if (sf.includes(',')) return sf;
  const first = (singleToken || '').split(',')[0]?.trim() ?? '';
  if (first && !['MIDDLE', 'LEFT', 'RIGHT', 'NONE', ''].includes(first)) return first;
  const s = (singleToken && singleToken.trim()) || '';
  if (s && s !== 'NONE' && !['MIDDLE', 'LEFT', 'RIGHT'].includes(s)) return s;
  return sf || 'NONE';
}

/** Same keys as live wig-preview APIs (NOIR color + after-color styling). */
export type BuildWigLivePreviewSelections = {
  length: string;
  density: string;
  lace: string;
  texture: string;
  hairline: string;
  styling: string;
  addOns: string[];
};

/**
 * Read BAW selection keys from localStorage for edit/customize/main flows.
 * Used by live preview on color + styling pages.
 */
export function readBuildWigLivePreviewSelections(pathname: string): BuildWigLivePreviewSelections {
  const isOnEditRoute = pathname.includes('/edit');
  const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
  const pick = (editKey: string, custKey: string, mainKey: string, fallback: string) => {
    if (isOnEditRoute) {
      return localStorage.getItem(editKey) || localStorage.getItem(mainKey) || fallback;
    }
    if (isOnCustomizeRoute) {
      return localStorage.getItem(custKey) || localStorage.getItem(mainKey) || fallback;
    }
    return localStorage.getItem(mainKey) || fallback;
  };
  let addOns: string[] = [];
  try {
    const raw = pick('editSelectedAddOns', 'customizeSelectedAddOns', 'selectedAddOns', '[]');
    const parsed = JSON.parse(raw || '[]') as unknown;
    if (Array.isArray(parsed)) addOns = parsed.map((x) => String(x).toUpperCase());
  } catch {
    addOns = [];
  }
  const stylingMerged = isOnEditRoute
    ? mergeStylingCsvForPreview(
        localStorage.getItem('editSelectedHairStyling'),
        localStorage.getItem('selectedHairStyling'),
        localStorage.getItem('editSelectedStyling') || localStorage.getItem('selectedStyling'),
        'NONE'
      )
    : isOnCustomizeRoute
      ? mergeStylingCsvForPreview(
          localStorage.getItem('customizeSelectedHairStyling'),
          localStorage.getItem('selectedHairStyling'),
          localStorage.getItem('customizeSelectedStyling') || localStorage.getItem('selectedStyling'),
          'NONE'
        )
      : mergeStylingCsvForPreview(null, localStorage.getItem('selectedHairStyling'), localStorage.getItem('selectedStyling'), 'NONE');

  return {
    length: pick('editSelectedLength', 'customizeSelectedLength', 'selectedLength', '24"'),
    density: pick('editSelectedDensity', 'customizeSelectedDensity', 'selectedDensity', '200%'),
    lace: pick('editSelectedLace', 'customizeSelectedLace', 'selectedLace', '13X6'),
    texture: pick('editSelectedTexture', 'customizeSelectedTexture', 'selectedTexture', 'SILKY'),
    hairline: pick('editSelectedHairline', 'customizeSelectedHairline', 'selectedHairline', 'NATURAL'),
    styling: stylingMerged,
    addOns,
  };
}

/** True on `.../customize/color` or `.../edit/color` — draft taps live in customize/edit keys; other steps must use hub-confirmed `selectedColor`. */
export function isBuildAWigColorSubPagePathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return p.endsWith('/color') && (p.includes('/customize/') || p.includes('/edit/'));
}

/** Swatch id for live preview APIs (same keys as color page). */
export function readBuildWigLivePreviewColor(pathname: string): string {
  const isOnEditRoute = pathname.includes('/edit');
  const isOnCustomizeRoute = isBuildAWigCustomizePath(pathname);
  if (isOnEditRoute) {
    return (
      localStorage.getItem('editSelectedColor') ||
      localStorage.getItem('selectedColor') ||
      'OFF BLACK'
    );
  }
  if (isOnCustomizeRoute) {
    // On customize, `customizeSelectedColor` updates on every tap (draft). `selectedColor` is hub + Confirm on color page.
    // Styling/length/etc. must match the **confirmed** swatch, not the last in-page tap.
    if (!isBuildAWigColorSubPagePathname(pathname)) {
      return (
        localStorage.getItem('selectedColor') ||
        localStorage.getItem('customizeSelectedColor') ||
        'OFF BLACK'
      );
    }
    // On the color sub-page, in-page taps write **`customizeSelectedColor`** (draft); hub **`selectedColor`**
    // updates on Confirm. Prefer draft here so live preview + ThumbBox highlight follow swatch taps.
    return (
      localStorage.getItem('customizeSelectedColor') ||
      localStorage.getItem('selectedColor') ||
      'OFF BLACK'
    );
  }
  return localStorage.getItem('selectedColor') || 'OFF BLACK';
}
