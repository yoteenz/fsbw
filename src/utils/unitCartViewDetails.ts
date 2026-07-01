import { CartItem } from '../types/cart';
import { BAW_SALON_STYLING_IDS, computeBawStylingPriceUsd } from './bawUnitStylingOptions';
import { DEFAULT_CURRENCY_RATES } from './defaultCurrencyRates';
import { normalizeCartLineProductName } from './cartCapSizeLineMargin';

export type UnitCartDetailDescriptor = {
  type: string;
  value?: unknown;
  partSelection?: string;
  fullName?: unknown;
};

export function getUnitDefaultTexture(productName: string): string {
  const name = productName.toUpperCase();
  const isWavyProduct = name === 'SOFT WAVE' || name === 'BEACH WAVE';
  const isCurlyProduct = name === 'SOFT CURL' || name === 'OCEAN CURL';
  return isWavyProduct ? 'WAVY' : isCurlyProduct ? 'CURLY' : 'SILKY';
}

function getUnitDefaultDensity(productName: string): string {
  return productName === 'BLANCO' ? '250%' : '200%';
}

function normalizeBlancoColor(color: string | undefined): string {
  const validBlancoColors = ['GOLDEN', 'PLATINUM', 'ASH'];
  if (!color || !validBlancoColors.includes(color)) return 'PLATINUM';
  return color;
}

function isDefaultUnitColor(productName: string, color: string | undefined): boolean {
  if (productName === 'BLANCO') {
    const blancoDefaultColors = ['PLATINUM', 'OFF WHITE', 'OFF BLACK'];
    return blancoDefaultColors.includes(color || '');
  }
  return color === 'OFF BLACK';
}

/** Same option list as unit VIEW DETAILS HTML (one row per option; add-ons = one row each). */
export function buildUnitCartViewDetailItemDescriptors(item: CartItem): UnitCartDetailDescriptor[] {
  const productName = normalizeCartLineProductName(item) || item.name || '';
  const items: UnitCartDetailDescriptor[] = [];

  if (item.length && item.length !== '24"') {
    items.push({ type: 'length', value: item.length, fullName: item.length });
  }

  const defaultDensity = getUnitDefaultDensity(productName);
  if (item.density && item.density !== defaultDensity) {
    items.push({ type: 'density', value: item.density, fullName: `${item.density} density` });
  }

  if (item.lace && item.lace !== '13X6') {
    items.push({ type: 'lace', value: item.lace, fullName: `${item.lace} lace` });
  }

  const defaultTexture = getUnitDefaultTexture(productName);
  if (item.texture && item.texture !== defaultTexture) {
    items.push({ type: 'texture', value: item.texture, fullName: `${item.texture} texture` });
  }

  const itemColor = productName === 'BLANCO' ? normalizeBlancoColor(item.color) : item.color;
  if (itemColor && !isDefaultUnitColor(productName, itemColor)) {
    items.push({ type: 'color', value: itemColor, fullName: itemColor });
  }

  if (item.hairline && item.hairline !== 'NATURAL') {
    items.push({ type: 'hairline', value: item.hairline, fullName: `${item.hairline} hairline` });
  }

  const hairStylingOptions: string[] = [...BAW_SALON_STYLING_IDS];
  if (
    item.styling &&
    item.styling !== 'NONE' &&
    hairStylingOptions.includes(item.styling) &&
    item.partSelection
  ) {
    items.push({
      type: 'styling',
      value: item.styling,
      partSelection: item.partSelection,
      fullName: item.styling,
    });
  }

  if (item.addOns && (Array.isArray(item.addOns) ? item.addOns.length > 0 : true)) {
    items.push({ type: 'addOns', value: item.addOns, fullName: item.addOns });
  }

  return items;
}

export function unitCartViewDetailsLineCount(item: CartItem): number {
  let lines = 0;
  for (const descriptor of buildUnitCartViewDetailItemDescriptors(item)) {
    if (descriptor.type === 'addOns' && Array.isArray(descriptor.value)) {
      lines += descriptor.value.length;
    } else {
      lines += 1;
    }
  }
  return lines;
}

/** Whether unit cart line should show VIEW DETAILS toggle (matches rendered detail rows + flex cap). */
export function unitCartItemHasViewDetails(item: CartItem): boolean {
  const productName = normalizeCartLineProductName(item) || item.name || '';
  const isBlanco = productName === 'BLANCO';
  const isOceanCurl = productName === 'OCEAN CURL';

  const hasFlexCap = !isBlanco && item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L');
  const hasFlexCapForOceanCurl =
    isOceanCurl && item.capSize && (item.capSize === 'XXS/XS/S' || item.capSize === 'S/M/L');

  if (buildUnitCartViewDetailItemDescriptors(item).length > 0) return true;
  return Boolean(isOceanCurl ? hasFlexCapForOceanCurl : hasFlexCap);
}

function getColorPriceUsd(color: string, length?: string, productName?: string): number {
  if (productName === 'BLANCO') {
    const blancoColorPrices: Record<string, number> = {
      GOLDEN: -20,
      PLATINUM: 0,
      ASH: 20,
    };
    return blancoColorPrices[color] || 0;
  }

  const colorPrices: Record<string, number> = {
    'JET BLACK': 120,
    'OFF BLACK': 0,
    ESPRESSO: 120,
    CHESTNUT: 120,
    HONEY: 120,
    AUBURN: 120,
    COPPER: 120,
    GINGER: 120,
    SANGRIA: 120,
    CHERRY: 120,
    RASPBERRY: 120,
    PLUM: 120,
    COBALT: 120,
    TEAL: 120,
    SLIME: 120,
    CITRINE: 120,
  };

  let basePrice = colorPrices[color] || 0;
  if (basePrice > 0 && length && ['30"', '32"', '34"', '36"', '40"'].includes(length)) {
    basePrice += 40;
  }
  return basePrice;
}

function getDensityPriceUsd(density: string, productName?: string): number {
  const isBlanco = productName === 'BLANCO';
  const blancoPrices: Record<string, number> = {
    '130%': -80,
    '150%': -60,
    '180%': -40,
    '200%': -20,
    '250%': 0,
    '300%': 160,
    '350%': 240,
    '400%': 320,
  };
  const defaultPrices: Record<string, number> = {
    '130%': -60,
    '150%': -40,
    '180%': -20,
    '200%': 0,
    '250%': 80,
    '300%': 160,
    '350%': 240,
    '400%': 320,
  };
  const densityPrices = isBlanco ? blancoPrices : defaultPrices;
  return densityPrices[density] ?? 0;
}

function getLacePriceUsd(lace: string): number {
  const lacePrices: Record<string, number> = {
    '13X6': 0,
    '13X4': -40,
    '13X5': 0,
    '2X6': -40,
    '4X4': -40,
    '5X5': -20,
    '6X6': 60,
    '7X7': 100,
    '9X6': 80,
    '360': 160,
    FULL: 240,
    'FULL LACE': 240,
  };
  return lacePrices[lace] || 0;
}

function getTexturePriceUsd(texture: string): number {
  const texturePrices: Record<string, number> = {
    SILKY: 0,
    KINKY: 40,
    YAKI: 40,
    WAVY: 0,
    CURLY: 0,
  };
  return texturePrices[texture] || 0;
}

function getHairlinePriceUsd(hairline: string): number {
  if (!hairline) return 0;
  const hairlineArray = hairline.split(',');
  let total = 0;

  hairlineArray.forEach((h) => {
    const hairlinePrices: Record<string, number> = {
      NATURAL: 0,
      PEAK: 40,
      LAGOS: 60,
    };
    total += hairlinePrices[h.trim()] || 0;
  });

  if (hairlineArray.includes('LAGOS') && hairlineArray.includes('PEAK')) {
    total -= 20;
  }

  return total;
}

function getAddOnsPriceUsd(addOns: string[], laceSize?: string): number {
  if (!addOns || addOns.length === 0) return 0;

  const addOnBasePrices: Record<string, number> = {
    BLEACH: 100,
    PLUCK: 120,
    'BLUNT CUT': 40,
  };

  const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
  const hasLaceDiscount = laceSize && discountedLaceSizes.includes(laceSize);

  return addOns.reduce((total, addOn) => {
    let price = addOnBasePrices[addOn] || 0;
    if (hasLaceDiscount && (addOn === 'BLEACH' || addOn === 'PLUCK')) {
      price -= 20;
    }
    return total + price;
  }, 0);
}

function formatUnitViewDetailPriceDisplay(price: number, selectedCurrency: string): string {
  if (price === 0 || price === null || price === undefined || Number.isNaN(price)) {
    return '';
  }
  const currencyRates = DEFAULT_CURRENCY_RATES;
  const currency = currencyRates[selectedCurrency as keyof typeof currencyRates] || currencyRates.USD;
  const convertedPrice = price * currency.rate;
  const sign = price > 0 ? '+' : '-';
  const priceStr = Math.abs(convertedPrice).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return ' <span style="color: #000000;">' + sign + currency.symbol + priceStr + '</span>';
}

/** HTML lines for unit wig VIEW DETAILS (labels + optional price deltas). */
export function buildUnitCartViewDetailsHtml(item: CartItem, selectedCurrency: string): string {
  const productName = normalizeCartLineProductName(item) || item.name || '';
  const items = buildUnitCartViewDetailItemDescriptors(item);
  const customizableItems = items.filter((row) => row.type !== 'density' && row.type !== 'lace');
  const useFullNames = customizableItems.length === 1;

  let text = '';

  items.forEach((itemData) => {
    if (text) text += '<br/>';

    if (itemData.type === 'length') {
      const lengthValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
      const lengthNum = parseInt(lengthValue.replace('"', ''), 10);
      const difference = lengthNum - 24;
      const lengthPrices: Record<string, number> = {
        '16"': -50,
        '18"': -25,
        '20"': -10,
        '22"': -5,
        '24"': 0,
        '26"': 50,
        '28"': 100,
        '30"': 150,
        '32"': 200,
        '34"': 250,
        '36"': 300,
        '40"': 400,
      };
      const price = lengthPrices[lengthValue] || 0;
      const priceDisplay = formatUnitViewDetailPriceDisplay(price, selectedCurrency);
      if (difference > 0) {
        text += `${Math.abs(difference)}" ADDED${priceDisplay}`;
      } else if (difference < 0) {
        text += `${Math.abs(difference)}" REMOVED${priceDisplay}`;
      }
    } else if (itemData.type === 'density') {
      const densityValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
      const price = getDensityPriceUsd(densityValue, productName);
      const priceDisplay = formatUnitViewDetailPriceDisplay(price, selectedCurrency);
      text += `${densityValue} DENSITY${priceDisplay}`.toUpperCase();
    } else if (itemData.type === 'lace') {
      const laceValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
      const price = getLacePriceUsd(laceValue);
      const priceDisplay = formatUnitViewDetailPriceDisplay(price, selectedCurrency);
      text += `${laceValue} LACE${priceDisplay}`.toUpperCase();
    } else if (itemData.type === 'texture') {
      const textureValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
      const price = getTexturePriceUsd(textureValue);
      const priceDisplay = formatUnitViewDetailPriceDisplay(price, selectedCurrency);
      text += `${textureValue} TEXTURE${priceDisplay}`.toUpperCase();
    } else if (itemData.type === 'color') {
      const colorValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
      const itemLength = item.length || '24"';
      const price = getColorPriceUsd(colorValue, itemLength, productName);
      const priceDisplay = formatUnitViewDetailPriceDisplay(price, selectedCurrency);
      text += `${colorValue} COLOR${priceDisplay}`.toUpperCase();
    } else if (itemData.type === 'hairline') {
      const hairlineValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
      const hairlineUpper = hairlineValue.toUpperCase();
      const price = getHairlinePriceUsd(hairlineValue);
      const priceDisplay = formatUnitViewDetailPriceDisplay(price, selectedCurrency);
      if (hairlineUpper.includes('LAGOS') && hairlineUpper.includes('PEAK')) {
        text += `LAGOS + PEAK${priceDisplay}`.toUpperCase();
      } else {
        text += `${hairlineValue} HAIRLINE${priceDisplay}`.toUpperCase();
      }
    } else if (itemData.type === 'styling') {
      const stylingValue = typeof itemData.value === 'string' ? itemData.value : String(itemData.value);
      const price = computeBawStylingPriceUsd(stylingValue, {
        productName,
        length: item.length || '24"',
      });
      const priceDisplay = formatUnitViewDetailPriceDisplay(price, selectedCurrency);

      if (useFullNames) {
        const displayValue = itemData.fullName;
        const displayText = typeof displayValue === 'string' ? displayValue : String(displayValue);
        text += displayText.toUpperCase() + priceDisplay;
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
            break;
        }
        text += partAbbrev;
        if (typeof itemData.value === 'string') {
          const stylingText = itemData.value.toUpperCase().replace(/ /g, '\u00A0');
          text += '\u00A0' + stylingText + priceDisplay;
        }
      }
    } else if (itemData.type === 'addOns') {
      const itemLace = item.lace || '13X6';
      if (Array.isArray(itemData.value)) {
        itemData.value.forEach((addOn: string, addOnIndex: number) => {
          const addOnPrice = getAddOnsPriceUsd([addOn], itemLace);
          const addOnPriceDisplay = formatUnitViewDetailPriceDisplay(addOnPrice, selectedCurrency);
          const addOnText = addOn
            .toUpperCase()
            .replace(/BLEACH/g, 'BLEACH KNOTS')
            .replace(/PLUCK/g, 'PLUCK HAIRLINE')
            .replace(/ /g, '\u00A0');
          if (addOnIndex > 0) text += '<br/>';
          text += addOnText + addOnPriceDisplay;
        });
      } else {
        const addOnPrice = getAddOnsPriceUsd([String(itemData.value)], itemLace);
        const addOnPriceDisplay = formatUnitViewDetailPriceDisplay(addOnPrice, selectedCurrency);
        const addOnText = String(itemData.value)
          .toUpperCase()
          .replace(/BLEACH/g, 'BLEACH KNOTS')
          .replace(/PLUCK/g, 'PLUCK HAIRLINE')
          .replace(/ /g, '\u00A0');
        text += addOnText + addOnPriceDisplay;
      }
    }
  });

  return text;
}
