import type { CartItem } from '../types/cart';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';

type EditableBuildAWigItem = Partial<CartItem> & {
  id?: string | number;
  productName?: string;
};

export type BuildAWigEditSource = 'wishlist';

const BUILD_A_WIG_EDIT_ROUTES_BY_PRODUCT: Record<string, string> = {
  NOIR: '/build-a-wig/noir/edit',
  BLANCO: '/build-a-wig/blanco/edit',
  'SOFT WAVE': '/build-a-wig/soft-wave/edit',
  'BEACH WAVE': '/build-a-wig/beach-wave/edit',
  'SOFT CURL': '/build-a-wig/soft-curl/edit',
  'OCEAN CURL': '/build-a-wig/ocean-curl/edit',
};

function getNormalizedBuildAWigProductName(item: EditableBuildAWigItem): string {
  return normalizeCartLineProductName(item) || 'NOIR';
}

function getResolvedEditColor(productName: string, color?: string): string {
  if (productName === 'BLANCO') {
    const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
    return color && validBlancoColors.includes(color) ? color : 'PLATINUM';
  }
  return color || 'OFF BLACK';
}

function getResolvedCapSizePrice(capSize: string): string {
  return capSize === 'XXS/XS/S' || capSize === 'S/M/L' ? '40' : '0';
}

export function getBuildAWigEditRouteForItem(item: EditableBuildAWigItem): string {
  const productName = getNormalizedBuildAWigProductName(item);
  return BUILD_A_WIG_EDIT_ROUTES_BY_PRODUCT[productName] ?? '/build-a-wig/edit';
}

/**
 * Seeds the product-specific Build-a-Wig edit state so any existing line item
 * opens with its saved selections loaded.
 */
export function prepareBuildAWigEditSession(
  item: EditableBuildAWigItem,
  options: { source?: BuildAWigEditSource } = {}
): { editRoute: string; productName: string } {
  const productName = getNormalizedBuildAWigProductName(item);
  const editRoute = getBuildAWigEditRouteForItem(item);

  if (typeof window === 'undefined') {
    return { editRoute, productName };
  }

  const seededItem = item.name ? item : { ...item, name: productName };
  const capSize = item.capSize || 'M';
  const length = item.length || '24"';
  const density = item.density || '200%';
  const color = getResolvedEditColor(productName, item.color);
  const texture = item.texture || 'SILKY';
  const lace = item.lace || '13X6';
  const hairline = item.hairline || 'NATURAL';
  const partSelection = item.partSelection || 'MIDDLE';
  const styling = item.styling || 'NONE';
  const addOns = Array.isArray(item.addOns) ? item.addOns : [];
  const capSizePrice = getResolvedCapSizePrice(capSize);

  localStorage.setItem('editingCartItem', JSON.stringify(seededItem));
  localStorage.setItem('editingCartItemId', String(item.id ?? ''));
  if (options.source) {
    localStorage.setItem('editingSource', options.source);
  } else {
    localStorage.removeItem('editingSource');
  }

  localStorage.setItem('selectedCapSize', capSize);
  localStorage.setItem('selectedCapSizePrice', capSizePrice);
  localStorage.setItem('selectedLength', length);
  localStorage.setItem('selectedDensity', density);
  localStorage.setItem('selectedColor', color);
  localStorage.setItem('selectedTexture', texture);
  localStorage.setItem('selectedLace', lace);
  localStorage.setItem('selectedHairline', hairline);
  localStorage.setItem('selectedPartSelection', partSelection);
  localStorage.setItem('selectedStyling', styling);
  localStorage.setItem('selectedAddOns', JSON.stringify(addOns));

  localStorage.setItem('editSelectedCapSize', capSize);
  localStorage.setItem('editSelectedCapSizePrice', capSizePrice);
  localStorage.setItem('editSelectedLength', length);
  localStorage.setItem('editSelectedDensity', density);
  localStorage.setItem('editSelectedColor', color);
  localStorage.setItem('editSelectedTexture', texture);
  localStorage.setItem('editSelectedLace', lace);
  localStorage.setItem('editSelectedHairline', hairline);
  localStorage.setItem('editSelectedPartSelection', partSelection);
  localStorage.setItem('editSelectedStyling', styling);
  localStorage.setItem('editSelectedAddOns', JSON.stringify(addOns));

  window.dispatchEvent(new CustomEvent('editingCartItemChanged', { detail: { itemId: String(item.id ?? '') } }));

  return { editRoute, productName };
}
