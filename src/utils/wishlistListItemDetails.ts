import {
  bcfCartViewDetailsHtml,
  bookingCartRedSubtitle,
  bookingCartViewDetailsHtml,
  CART_RED_LINE_BCF_BOOKING,
} from './cartLineRedAndDetails';
import { isWigUnitProductName } from './productInventoryAvailability';
import {
  shopTextureCategoryHeroPhotoSrc,
  type ShopTextureCategoryThumbCategory,
  type ShopTextureCategoryThumbTexture,
} from './shopTextureCategoryThumb';

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

/**
 * Product-page route for a wishlist item. BCF (`shop-texture-category`) lines route to their
 * `/shop/{category}?texture={texture}` page (not the build-a-wig hub / NOIR). Units route to their
 * PDP; gift cards to the gift-card tool.
 */
export function getWishlistItemRoute(item: any): string {
  if (item?.type === 'shop-texture-category' && item.category) {
    const texture = item.texture || 'straight';
    return `/shop/${item.category}?texture=${texture}`;
  }
  const name = getWishlistItemProductName(item);
  const routes: Record<string, string> = {
    NOIR: '/straight/noir',
    BLANCO: '/straight/blanco',
    'SOFT WAVE': '/wavy/soft-wave',
    'BEACH WAVE': '/wavy/beach-wave',
    'SOFT CURL': '/curly/soft-curl',
    'OCEAN CURL': '/curly/ocean-curl',
    'GIFT CARD': '/tools/gift-card',
  };
  return routes[name] || '/build-a-wig';
}

function inferWishlistBcfCategory(item: any): ShopTextureCategoryThumbCategory | null {
  const raw = item?.category ? String(item.category).toLowerCase() : '';
  if (raw === 'bundles' || raw === 'closures' || raw === 'frontals') return raw;
  const id = String(item?.id || '').toLowerCase();
  const name = getWishlistItemProductName(item);
  if (id.includes('-bundles') || name.includes('BUNDLES')) return 'bundles';
  if (id.includes('-closures') || name.includes('CLOSURES')) return 'closures';
  if (id.includes('-frontals') || name.includes('FRONTALS')) return 'frontals';
  return null;
}

function inferWishlistBcfTexture(item: any): ShopTextureCategoryThumbTexture | null {
  const raw = item?.texture ? String(item.texture).toLowerCase() : '';
  if (raw === 'straight' || raw === 'wavy' || raw === 'curly') return raw;
  const id = String(item?.id || '').toLowerCase();
  const name = getWishlistItemProductName(item);
  if (id.includes('shop-straight-') || name.includes('STRAIGHT')) return 'straight';
  if (id.includes('shop-wavy-') || name.includes('WAVY')) return 'wavy';
  if (id.includes('shop-curly-') || name.includes('CURLY')) return 'curly';
  return null;
}

/**
 * BCF thumbnail on `/wishlist` and `/wishlist/lists` — same image as `/products` shop marble
 * (`shopTextureCategoryThumbSrc`), including straight bundles. Null for non-BCF.
 */
export function getWishlistBcfThumbSrc(item: any): string | null {
  if (item?.type !== 'shop-texture-category') return null;
  const category = inferWishlistBcfCategory(item);
  const texture = inferWishlistBcfTexture(item);
  if (category && texture) {
    return shopTextureCategoryHeroPhotoSrc(texture, category);
  }
  return typeof item?.image === 'string' && item.image.trim() ? item.image : null;
}

/**
 * Name shown on wishlist rows. BCF (`shop-texture-category`) lines show just the category
 * (BUNDLES / CLOSURES / FRONTALS) — not the cart label "BUNDLES · WAVY". Unit names drop "WIG".
 */
export function getWishlistItemDisplayName(item: any): string {
  const raw = getWishlistItemProductName(item);
  if (item?.type === 'shop-texture-category') {
    const cat = item?.category ? String(item.category) : raw.split('·')[0];
    return cat.toUpperCase().trim();
  }
  return raw.replace(/WIG/gi, '').trim();
}

function getWishlistUnitHairOrigin(productName: string): string {
  switch (productName) {
    case 'NOIR':
      return 'CAMBODIAN';
    case 'BLANCO':
      return 'RUSSIAN';
    case 'SOFT WAVE':
      return 'INDIAN';
    case 'BEACH WAVE':
      return 'INDONESIAN';
    case 'SOFT CURL':
      return 'VIETNAMESE';
    case 'OCEAN CURL':
      return 'FILIPINO';
    default:
      return 'CAMBODIAN';
  }
}

/** Collapsed red subtitle on wishlist list rows (matches cart dropdown). */
export function getWishlistItemRedSubtitle(item: any): string {
  if (item?.name === 'GIFT CARD' || item?.type === 'gift-card') return 'DIGITAL ONLY';
  if (item?.type === 'booking-consult' || item?.type === 'booking-appointment') {
    return bookingCartRedSubtitle(item);
  }
  if (item?.type === 'shop-texture-category') return CART_RED_LINE_BCF_BOOKING;
  const productName = getWishlistItemProductName(item);
  const length = item?.length || '24"';
  const hairOrigin =
    productName === 'BLANCO' && item?.hairOrigin === 'CAMBODIAN'
      ? getWishlistUnitHairOrigin('BLANCO')
      : item?.hairOrigin || getWishlistUnitHairOrigin(productName);
  return `${length} RAW ${hairOrigin}`;
}

/** Unit wigs only — not BCF, gift cards, or bookings. */
export function isWishlistBuildAWigEditableItem(item: any): boolean {
  if (!item) return false;
  if (item.name === 'GIFT CARD' || item.type === 'gift-card') return false;
  if (item.type === 'booking-consult' || item.type === 'booking-appointment') return false;
  if (item.type === 'shop-texture-category') return false;
  return isWigUnitProductName(item.name || item.productName);
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
 * Whether to show the VIEW DETAILS link. Tied directly to the rendered details so the link only
 * shows when the panel will actually have content — never an empty "PRODUCT DETAILS" panel. (The
 * old field-by-field check counted customizations like `texture` that `buildWishlistItemDetailsHtml`
 * does not render, so length-only / texture-only units opened an empty panel.)
 * Bookings + BCF always have a details view. `omitLength` mirrors the list/shared line view, which
 * shows length in the RAW line and omits it from the panel.
 */
export function wishlistItemHasViewDetails(item: any, options?: WishlistItemDetailsHtmlOptions): boolean {
  if (!item) return false;
  if (item.type === 'booking-consult' || item.type === 'booking-appointment') return true;
  if (item.type === 'shop-texture-category') return true;

  const html = buildWishlistItemDetailsHtml(item, options).trim();
  return html !== '' && html.toUpperCase() !== 'PRODUCT DETAILS';
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
