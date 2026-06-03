/**
 * Apply Build-a-Wig pre-fill from PSA client actions (mirrors cart edit localStorage keys).
 */
const UNIT_BASE_PATH: Record<string, string> = {
  noir: '/build-a-wig/noir',
  blanco: '/build-a-wig/blanco',
  'soft-wave': '/build-a-wig/soft-wave',
  'beach-wave': '/build-a-wig/beach-wave',
  'soft-curl': '/build-a-wig/soft-curl',
  'ocean-curl': '/build-a-wig/ocean-curl',
};

export type PsaBawPrefillSelections = {
  capSize?: string;
  length?: string;
  density?: string;
  color?: string;
  texture?: string;
  lace?: string;
  hairline?: string;
  styling?: string;
  partSelection?: string;
  addOns?: string[];
};

function capSizePriceFor(capSize: string): string {
  return capSize === 'XXS/XS/S' || capSize === 'S/M/L' ? '40' : '0';
}

function writeSelection(key: string, value: string): void {
  localStorage.setItem(`selected${key}`, value);
  localStorage.setItem(`customizeSelected${key}`, value);
}

/** Write BAW selection keys and return the navigation path. */
export function applyPsaBawPrefill(payload: {
  unitId: string;
  path?: string;
  selections?: PsaBawPrefillSelections;
}): string {
  const unitKey = (payload.unitId || '').trim().toLowerCase();
  const basePath = UNIT_BASE_PATH[unitKey] ?? '/build-a-wig';
  const sel = payload.selections ?? {};

  localStorage.removeItem('editingCartItem');
  localStorage.removeItem('editingCartItemId');

  if (sel.capSize) {
    writeSelection('CapSize', sel.capSize);
    localStorage.setItem('selectedCapSizePrice', capSizePriceFor(sel.capSize));
    localStorage.setItem('customizeSelectedCapSizePrice', capSizePriceFor(sel.capSize));
  }
  if (sel.length) writeSelection('Length', sel.length);
  if (sel.density) writeSelection('Density', sel.density);
  if (sel.color) writeSelection('Color', sel.color);
  if (sel.texture) writeSelection('Texture', sel.texture);
  if (sel.lace) writeSelection('Lace', sel.lace);
  if (sel.hairline) writeSelection('Hairline', sel.hairline);
  if (sel.styling) writeSelection('Styling', sel.styling);
  if (sel.partSelection) {
    localStorage.setItem('selectedPartSelection', sel.partSelection);
    localStorage.setItem('customizeSelectedPartSelection', sel.partSelection);
  }
  if (Array.isArray(sel.addOns)) {
    const json = JSON.stringify(sel.addOns);
    localStorage.setItem('selectedAddOns', json);
    localStorage.setItem('customizeSelectedAddOns', json);
  }

  const stepPath = (payload.path || '').trim();
  if (stepPath.startsWith('/build-a-wig')) return stepPath;
  if (stepPath.startsWith('/customize/')) return `${basePath}${stepPath}`;
  if (stepPath.startsWith('customize/')) return `${basePath}/${stepPath}`;
  return basePath;
}
