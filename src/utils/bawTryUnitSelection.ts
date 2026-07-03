import {
  isBawTryHubLandingPath,
  resolveBawTryUnitSlugFromPathname,
} from '../constants/bawTutorialConfig';
import { resolveBawProductUnitLabelFromPathname } from './bawSubpageWigViews';

const SESSION_TRY_UNIT = 'bawTryActiveUnitSlug';

const SCALAR_FIELDS = [
  'CapSize',
  'Length',
  'Density',
  'Lace',
  'Texture',
  'Color',
  'Hairline',
  'Styling',
] as const;

const EXTRA_KEYS = [
  'selectedHairStyling',
  'customizeSelectedHairStyling',
  'editSelectedHairStyling',
  'selectedPartSelection',
  'customizeSelectedPartSelection',
  'editSelectedPartSelection',
  'selectedAddOns',
  'customizeSelectedAddOns',
  'editSelectedAddOns',
] as const;

export type BawHubCustomizationDefaults = {
  capSize: string;
  length: string;
  density: string;
  lace: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  addOns: string[];
};

/** Unit-aware hub defaults (member + guest try). */
export function getBawUnitDefaultCustomization(unitLabel: string): BawHubCustomizationDefaults {
  const unit = unitLabel.trim().toUpperCase();
  const isBlanco = unit === 'BLANCO';
  const isOceanCurl = unit === 'OCEAN CURL';
  const isSoftCurl = unit === 'SOFT CURL';
  const isBeachWave = unit === 'BEACH WAVE';
  const isSoftWave = unit === 'SOFT WAVE';

  let texture = 'SILKY';
  if (isOceanCurl || isSoftCurl) texture = 'CURLY';
  else if (isBeachWave || isSoftWave) texture = 'WAVY';

  return {
    capSize: 'M',
    length: '24"',
    density: isBlanco ? '250%' : '200%',
    lace: '13X6',
    texture,
    color: isBlanco ? 'PLATINUM' : 'OFF BLACK',
    hairline: 'NATURAL',
    styling: 'NONE',
    addOns: [],
  };
}

export function getBawUnitDefaultCustomizationFromPathname(pathname: string): BawHubCustomizationDefaults {
  return getBawUnitDefaultCustomization(resolveBawProductUnitLabelFromPathname(pathname));
}

/** Clear all BAW selection keys (hub + customize/edit drafts). */
export function clearBawSelectionStorage(): void {
  for (const field of SCALAR_FIELDS) {
    localStorage.removeItem(`selected${field}`);
    localStorage.removeItem(`selected${field}Price`);
    localStorage.removeItem(`customizeSelected${field}`);
    localStorage.removeItem(`customizeSelected${field}Price`);
    localStorage.removeItem(`editSelected${field}`);
    localStorage.removeItem(`editSelected${field}Price`);
  }
  for (const key of EXTRA_KEYS) {
    localStorage.removeItem(key);
  }
  localStorage.removeItem('selectedAddOnsPrice');
  localStorage.removeItem('customizeSelectedAddOnsPrice');
  localStorage.removeItem('editSelectedAddOnsPrice');
}

/** Write unit defaults to `selected*` (+ zero prices). Does not touch customize/edit draft keys. */
export function applyBawUnitDefaultsToSelectedStorage(defaults: BawHubCustomizationDefaults): void {
  localStorage.setItem('selectedCapSize', defaults.capSize);
  localStorage.setItem('selectedLength', defaults.length);
  localStorage.setItem('selectedDensity', defaults.density);
  localStorage.setItem('selectedLace', defaults.lace);
  localStorage.setItem('selectedTexture', defaults.texture);
  localStorage.setItem('selectedColor', defaults.color);
  localStorage.setItem('selectedHairline', defaults.hairline);
  localStorage.setItem('selectedStyling', defaults.styling);
  localStorage.setItem('selectedAddOns', JSON.stringify(defaults.addOns));
  localStorage.removeItem('selectedHairStyling');
  localStorage.removeItem('selectedPartSelection');

  localStorage.setItem('selectedCapSizePrice', '0');
  localStorage.setItem('selectedColorPrice', '0');
  localStorage.setItem('selectedLengthPrice', '0');
  localStorage.setItem('selectedDensityPrice', '0');
  localStorage.setItem('selectedLacePrice', '0');
  localStorage.setItem('selectedTexturePrice', '0');
  localStorage.setItem('selectedHairlinePrice', '0');
  localStorage.setItem('selectedStylingPrice', '0');
  localStorage.setItem('selectedAddOnsPrice', '0');
}

/**
 * Guest try hub: reset when landing without `comingFromSubPage` so member customize / other units
 * do not leak stale `selected*` / draft keys into view mode.
 */
export function shouldResetBawTryHubSelections(pathname: string): boolean {
  if (!isBawTryHubLandingPath(pathname)) return false;
  if (sessionStorage.getItem('comingFromSubPage') === 'true') return false;
  const slug = resolveBawTryUnitSlugFromPathname(pathname);
  sessionStorage.setItem(SESSION_TRY_UNIT, slug);
  return true;
}

/** Full reset for try hub — clears drafts and applies unit defaults. */
export function resetBawTryHubSelections(pathname: string): BawHubCustomizationDefaults {
  const defaults = getBawUnitDefaultCustomizationFromPathname(pathname);
  clearBawSelectionStorage();
  applyBawUnitDefaultsToSelectedStorage(defaults);
  return defaults;
}
