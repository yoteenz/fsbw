import { bcfCartViewDetailsHtml, bookingCartViewDetailsHtml } from './cartLineRedAndDetails';

const DEFAULT_UNIT_PRICES: Record<string, number> = {
  NOIR: 740,
  BLANCO: 820,
  'SOFT WAVE': 760,
  'BEACH WAVE': 780,
  'SOFT CURL': 780,
  'OCEAN CURL': 780,
  'GIFT CARD': 100,
};

export function getWishlistItemProductName(item: any): string {
  return (item?.name || item?.productName || 'NOIR').toString().toUpperCase();
}

export function getWishlistItemDefaultPrice(productName: string): number {
  return DEFAULT_UNIT_PRICES[productName] ?? 580;
}

export function getWishlistItemDisplayPrice(item: any, productName?: string): number {
  const name = productName ?? getWishlistItemProductName(item);
  const price = item?.price;
  if (typeof price === 'number' && !Number.isNaN(price)) return price;
  return getWishlistItemDefaultPrice(name);
}

export function formatWishlistListItemPrice(price: number): string {
  const n = Number(price);
  if (!n || Number.isNaN(n)) return '$0 USD';
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 })} USD`;
}

/**
 * Same rules as cart dropdown VIEW DETAILS visibility.
 * `omitLength`: list/shared list line view shows the length in the RAW line and omits it from the
 * details panel, so a length-only customization must NOT count toward showing VIEW DETAILS there
 * (otherwise the link opens an empty "PRODUCT DETAILS" panel). Mirror the details rendered.
 */
export function wishlistItemHasViewDetails(item: any, options?: WishlistItemDetailsHtmlOptions): boolean {
  if (!item) return false;
  if (item.type === 'booking-consult' || item.type === 'booking-appointment') return true;
  if (item.type === 'shop-texture-category') return true;

  const name = getWishlistItemProductName(item);
  const isBlanco = name === 'BLANCO';
  const isOceanCurl = name === 'OCEAN CURL';
  const hasFlexCap = !isBlanco && item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L');
  const hasFlexCapForOceanCurl = isOceanCurl && item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L');
  const hasCustomLength = !options?.omitLength && item.length && item.length !== '24"';
  const defaultDensity = name === 'BLANCO' ? '250%' : '200%';
  const hasCustomDensity = item.density && item.density !== defaultDensity;
  const hasCustomLace = item.lace && item.lace !== '13X6';
  const isWavyProduct = name === 'SOFT WAVE' || name === 'BEACH WAVE';
  const isCurlyProduct = name === 'SOFT CURL' || name === 'OCEAN CURL';
  const defaultTexture = isWavyProduct ? 'WAVY' : isCurlyProduct ? 'CURLY' : 'SILKY';
  const hasCustomTexture = item.texture && item.texture !== defaultTexture;
  const blancoDefaultColors = ['PLATINUM', 'OFF WHITE', 'OFF BLACK'];
  const hasCustomColor =
    name === 'BLANCO' ? item.color && !blancoDefaultColors.includes(item.color) : item.color && item.color !== 'OFF BLACK';
  const hasCustomHairline = item.hairline && item.hairline !== 'NATURAL';
  const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
  const hasCustomStyling =
    item.styling && item.styling !== 'NONE' && hairStylingOptions.includes(item.styling) && item.partSelection;
  const hasAddOns = Array.isArray(item.addOns) && item.addOns.length > 0;

  return (
    (isOceanCurl ? hasFlexCapForOceanCurl : hasFlexCap) ||
    hasCustomLength ||
    hasCustomDensity ||
    hasCustomLace ||
    hasCustomTexture ||
    hasCustomColor ||
    hasCustomHairline ||
    hasCustomStyling ||
    hasAddOns
  );
}

export type WishlistItemDetailsHtmlOptions = {
  /** Omit length ADDED/REMOVED lines (RAW line already shows inches). List view only. */
  omitLength?: boolean;
};

/** HTML detail lines for expanded wishlist list line view (labels only, no price deltas). */
export function buildWishlistItemDetailsHtml(item: any, options?: WishlistItemDetailsHtmlOptions): string {
  if (item.type === 'booking-consult' || item.type === 'booking-appointment') {
    return bookingCartViewDetailsHtml(item);
  }
  if (item.type === 'shop-texture-category') {
    return bcfCartViewDetailsHtml(item);
  }

  const name = getWishlistItemProductName(item);
  const items: Array<{ type: string; value?: unknown; fullName?: string; partSelection?: string }> = [];

  if (item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L')) {
    items.push({ type: 'capSize', value: item.capSize });
  }
  if (item.length && item.length !== '24"' && !options?.omitLength) {
    items.push({ type: 'length', value: item.length });
  }
  const defaultDensity = name === 'BLANCO' ? '250%' : '200%';
  if (item.density && item.density !== defaultDensity) items.push({ type: 'density', value: item.density });
  if (item.lace && item.lace !== '13X6') items.push({ type: 'lace', value: item.lace });

  let itemColor = item.color;
  if (name === 'BLANCO') {
    const valid = ['GOLDEN', 'PLATINUM', 'ASH'];
    if (!itemColor || !valid.includes(itemColor)) itemColor = 'PLATINUM';
  }
  const blancoDefaultColors = ['PLATINUM', 'OFF WHITE', 'OFF BLACK'];
  const isDefaultColor =
    name === 'BLANCO' ? blancoDefaultColors.includes(itemColor || '') : itemColor === 'OFF BLACK';
  if (itemColor && !isDefaultColor) items.push({ type: 'color', value: itemColor });
  if (item.hairline && item.hairline !== 'NATURAL') items.push({ type: 'hairline', value: item.hairline });

  const hairStylingOptions = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
  if (item.styling && item.styling !== 'NONE' && hairStylingOptions.includes(item.styling) && item.partSelection) {
    items.push({ type: 'styling', value: item.styling, partSelection: item.partSelection });
  }
  if (item.addOns?.length) items.push({ type: 'addOns', value: item.addOns });

  const customizableItems = items.filter((row) => row.type !== 'density' && row.type !== 'lace');
  const useFullNames = customizableItems.length === 1;

  let text = '';
  items.forEach((itemData) => {
    if (text) text += '<br/>';

    if (itemData.type === 'capSize') {
      text += 'FLEX CAP';
    } else if (itemData.type === 'length') {
      const lengthValue = String(itemData.value);
      const lengthNum = parseInt(lengthValue.replace('"', ''), 10);
      const difference = lengthNum - 24;
      if (difference > 0) text += `${Math.abs(difference)}" ADDED`;
      else if (difference < 0) text += `${Math.abs(difference)}" REMOVED`;
    } else if (itemData.type === 'density') {
      const densityValue = String(itemData.value);
      text += `${densityValue} DENSITY`.toUpperCase();
    } else if (itemData.type === 'lace') {
      const laceValue = String(itemData.value);
      text += `${laceValue} LACE`.toUpperCase();
    } else if (itemData.type === 'color') {
      const colorValue = String(itemData.value);
      text += `${colorValue} COLOR`.toUpperCase();
    } else if (itemData.type === 'hairline') {
      const hairlineValue = String(itemData.value);
      const hairlineUpper = hairlineValue.toUpperCase();
      if (hairlineUpper.includes('LAGOS') && hairlineUpper.includes('PEAK')) text += 'LAGOS + PEAK';
      else text += `${hairlineValue} HAIRLINE`.toUpperCase();
    } else if (itemData.type === 'styling') {
      const stylingValue = String(itemData.value);
      if (useFullNames) {
        text += String(itemData.fullName ?? stylingValue).toUpperCase();
      } else {
        let partAbbrev = '(M)';
        switch (itemData.partSelection) {
          case 'LEFT':
            partAbbrev = '(L)';
            break;
          case 'RIGHT':
            partAbbrev = '(R)';
            break;
          default:
            partAbbrev = '(M)';
        }
        text += partAbbrev;
        text += '\u00A0' + stylingValue.toUpperCase().replace(/ /g, '\u00A0');
      }
    } else if (itemData.type === 'addOns' && Array.isArray(itemData.value)) {
      itemData.value.forEach((addOn: string, addOnIndex: number) => {
        const addOnText = addOn
          .toUpperCase()
          .replace(/BLEACH/g, 'BLEACH KNOTS')
          .replace(/PLUCK/g, 'PLUCK HAIRLINE')
          .replace(/ /g, '\u00A0');
        if (addOnIndex > 0) text += '<br/>';
        text += addOnText;
      });
    }
  });

  return text || 'PRODUCT DETAILS';
}
