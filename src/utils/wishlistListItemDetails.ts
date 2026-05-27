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

function formatDetailPrice(price: number): string {
  if (price === 0 || Number.isNaN(price)) return '';
  const sign = price > 0 ? '+' : '-';
  const amount = `$${Math.abs(price).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return (
    '<span style="color: #000000; font-family: &quot;Futura PT Demi&quot;, Futura, sans-serif;"> · </span>' +
    `<span style="color: #EB1C24; font-family: &quot;Futura PT Demi&quot;, Futura, sans-serif;">${sign}${amount}</span>`
  );
}

function getDensityPrice(density: string, productName?: string): number {
  const isBlanco = productName === 'BLANCO';
  const blancoPrices: Record<string, number> = {
    '130%': -80, '150%': -60, '180%': -40, '200%': -20, '250%': 0, '300%': 160, '350%': 240, '400%': 320,
  };
  const defaultPrices: Record<string, number> = {
    '130%': -60, '150%': -40, '180%': -20, '200%': 0, '250%': 80, '300%': 160, '350%': 240, '400%': 320,
  };
  return (isBlanco ? blancoPrices : defaultPrices)[density] ?? 0;
}

function getLacePrice(lace: string): number {
  const lacePrices: Record<string, number> = {
    '13X6': 0, '13X4': -20, '13X5': 0, '2X6': -40, '4X4': -40, '5X5': -20, '6X6': 60, '7X7': 100, '9X6': 80, '360': 160,
    FULL: 240, 'FULL LACE': 240,
  };
  return lacePrices[lace] ?? 0;
}

function getHairlinePrice(hairline: string): number {
  if (!hairline) return 0;
  const parts = hairline.split(',');
  let total = 0;
  parts.forEach((h) => {
    total += ({ NATURAL: 0, PEAK: 40, LAGOS: 60 } as Record<string, number>)[h.trim()] ?? 0;
  });
  if (parts.includes('LAGOS') && parts.includes('PEAK')) total -= 20;
  return total;
}

function getStylingPrice(styling: string): number {
  if (!styling || styling === 'NONE') return 0;
  const stylingPrices: Record<string, number> = { BANGS: 40, CRIMPS: 80, 'FLAT IRON': 80, LAYERS: 120 };
  if (styling.includes(',')) {
    const stylingArray = styling.split(',');
    const hasBangs = stylingArray.includes('BANGS');
    const otherStyling = stylingArray.find((s) => s !== 'BANGS');
    if (hasBangs && otherStyling) return (stylingPrices[otherStyling.trim()] ?? 0) + 20;
    if (hasBangs) return 40;
    if (otherStyling) return stylingPrices[otherStyling.trim()] ?? 0;
    return 0;
  }
  return stylingPrices[styling] ?? 0;
}

function getAddOnsPrice(addOns: string[], laceSize?: string): number {
  if (!addOns?.length) return 0;
  const addOnBasePrices: Record<string, number> = { BLEACH: 60, PLUCK: 80, 'BLUNT CUT': 20 };
  const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
  const hasLaceDiscount = laceSize && discountedLaceSizes.includes(laceSize);
  return addOns.reduce((total, addOn) => {
    let price = addOnBasePrices[addOn] ?? 0;
    if (hasLaceDiscount && (addOn === 'BLEACH' || addOn === 'PLUCK')) price -= 20;
    return total + price;
  }, 0);
}

function getColorPrice(color: string, length?: string, productName?: string): number {
  if (productName === 'BLANCO') {
    return ({ GOLDEN: -20, PLATINUM: 0, ASH: 20 } as Record<string, number>)[color] ?? 0;
  }
  const colorPrices: Record<string, number> = {
    'JET BLACK': 120, 'OFF BLACK': 0, ESPRESSO: 120, CHESTNUT: 120, HONEY: 120, AUBURN: 120, COPPER: 120, GINGER: 120,
    SANGRIA: 120, CHERRY: 120, RASPBERRY: 120, PLUM: 120, COBALT: 120, TEAL: 120, SLIME: 120, CITRINE: 120,
  };
  let basePrice = colorPrices[color] ?? 0;
  if (basePrice > 0 && length && ['30"', '32"', '34"', '36"', '40"'].includes(length)) basePrice += 40;
  return basePrice;
}

/** Same rules as cart dropdown VIEW DETAILS visibility. */
export function wishlistItemHasViewDetails(item: any): boolean {
  if (!item) return false;
  if (item.type === 'booking-consult' || item.type === 'booking-appointment') return true;
  if (item.type === 'shop-texture-category') return true;

  const name = getWishlistItemProductName(item);
  const isBlanco = name === 'BLANCO';
  const isOceanCurl = name === 'OCEAN CURL';
  const hasFlexCap = !isBlanco && item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L');
  const hasFlexCapForOceanCurl = isOceanCurl && item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L');
  const hasCustomLength = item.length && item.length !== '24"';
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

/** HTML detail lines (cart-style) for expanded wishlist list line view. */
export function buildWishlistItemDetailsHtml(item: any): string {
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
  if (item.length && item.length !== '24"') items.push({ type: 'length', value: item.length });
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
      text += `FLEX CAP${formatDetailPrice(40)}`;
    } else if (itemData.type === 'length') {
      const lengthValue = String(itemData.value);
      const lengthNum = parseInt(lengthValue.replace('"', ''), 10);
      const difference = lengthNum - 24;
      const lengthPrices: Record<string, number> = {
        '16"': -50, '18"': -25, '20"': -10, '22"': -5, '24"': 0, '26"': 50, '28"': 100, '30"': 150, '32"': 200,
        '34"': 250, '36"': 300, '40"': 400,
      };
      const price = lengthPrices[lengthValue] ?? 0;
      const priceDisplay = formatDetailPrice(price);
      if (difference > 0) text += `${Math.abs(difference)}" ADDED${priceDisplay}`;
      else if (difference < 0) text += `${Math.abs(difference)}" REMOVED${priceDisplay}`;
    } else if (itemData.type === 'density') {
      const densityValue = String(itemData.value);
      text += `${densityValue} DENSITY${formatDetailPrice(getDensityPrice(densityValue, name))}`.toUpperCase();
    } else if (itemData.type === 'lace') {
      const laceValue = String(itemData.value);
      text += `${laceValue} LACE${formatDetailPrice(getLacePrice(laceValue))}`.toUpperCase();
    } else if (itemData.type === 'color') {
      const colorValue = String(itemData.value);
      const itemLength = item.length || '24"';
      text += `${colorValue} COLOR${formatDetailPrice(getColorPrice(colorValue, itemLength, name))}`.toUpperCase();
    } else if (itemData.type === 'hairline') {
      const hairlineValue = String(itemData.value);
      const hairlineUpper = hairlineValue.toUpperCase();
      const priceDisplay = formatDetailPrice(getHairlinePrice(hairlineValue));
      if (hairlineUpper.includes('LAGOS') && hairlineUpper.includes('PEAK')) text += `LAGOS + PEAK${priceDisplay}`;
      else text += `${hairlineValue} HAIRLINE${priceDisplay}`.toUpperCase();
    } else if (itemData.type === 'styling') {
      const stylingValue = String(itemData.value);
      const priceDisplay = formatDetailPrice(getStylingPrice(stylingValue));
      if (useFullNames) {
        text += String(itemData.fullName ?? stylingValue).toUpperCase() + priceDisplay;
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
        text += '\u00A0' + stylingValue.toUpperCase().replace(/ /g, '\u00A0') + priceDisplay;
      }
    } else if (itemData.type === 'addOns' && Array.isArray(itemData.value)) {
      const itemLace = item.lace || '13X6';
      itemData.value.forEach((addOn: string, addOnIndex: number) => {
        const addOnPriceDisplay = formatDetailPrice(getAddOnsPrice([addOn], itemLace));
        const addOnText = addOn
          .toUpperCase()
          .replace(/BLEACH/g, 'BLEACH KNOTS')
          .replace(/PLUCK/g, 'PLUCK HAIRLINE')
          .replace(/ /g, '\u00A0');
        if (addOnIndex > 0) text += '<br/>';
        text += addOnText + addOnPriceDisplay;
      });
    }
  });

  return text || 'PRODUCT DETAILS';
}
