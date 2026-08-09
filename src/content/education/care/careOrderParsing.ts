import type { CarePurchaseProfile } from '../types';
import {
  BCF_CATEGORY_TO_PRODUCT_TYPE,
  CARE_QUALIFYING_ORDER_STATUS,
  CARE_REVOKED_ORDER_STATUSES,
  WIG_UNIT_DISPLAY_NAMES,
  displayNameToUnitSlug,
  normalizeTextureFamily,
  textureFamilyFromUnitSlug,
  type CareProductType,
} from './productCatalog';
import {
  deriveConfigurationTraits,
  deriveTransformationStateFromConfiguration,
} from './careApplicability';
import type { OwnedUnitCustomerConfiguration } from './ownedUnitModel';

function isPhysicalHairLine(line: CareOrderLineLike): boolean {
  const type = String(line.type || '');
  const name = String(line.productName || line.name || '')
    .trim()
    .toUpperCase();
  if (!name) return false;
  if (type === 'gift-card' || name === 'GIFT CARD') return false;
  if (type === 'digital' || type === 'hairstyle-analysis') return false;
  if (type === 'booking-appointment' || type === 'booking-consult') return false;
  if (/\bSLAY\s+TICKETS?\b/i.test(name)) return false;
  if (type === 'shop-texture-category') return true;
  return (WIG_UNIT_DISPLAY_NAMES as readonly string[]).includes(name);
}

export type CareOrderLineLike = {
  name?: string;
  productName?: string;
  type?: string;
  quantity?: number;
  baseUnitId?: string;
  category?: string;
  texture?: string;
  options?: Record<string, string>;
  length?: string;
  density?: string;
  color?: string;
  lace?: string;
  capSize?: string;
  hairline?: string;
  styling?: string;
  partSelection?: string;
  hairOrigin?: string;
  addOns?: string[] | string;
};

export type CareOrderLike = {
  id?: string;
  orderNumber?: string;
  status?: string;
  lineItems?: CareOrderLineLike[];
  productName?: string;
  items?: number;
};

function orderLineKey(orderId: string, line: CareOrderLineLike, index: number): string {
  const name = String(line.productName || line.name || '').trim();
  const type = String(line.type || '');
  const base = String(line.baseUnitId || '');
  const cat = String(line.category || '');
  const opts = JSON.stringify(line.options || {});
  return `${orderId}|${index}|${name}|${type}|${base}|${cat}|${opts}`;
}

function configurationFromOrderLine(line: CareOrderLineLike): OwnedUnitCustomerConfiguration {
  const opts = line.options ?? {};
  const addOnsRaw = opts.addOns ?? line.addOns;
  const addOns = Array.isArray(addOnsRaw)
    ? addOnsRaw
    : typeof addOnsRaw === 'string'
      ? addOnsRaw.split('·').map((s) => s.trim()).filter(Boolean)
      : undefined;

  return {
    length: opts.length ?? line.length,
    density: opts.density ?? line.density,
    color: opts.color ?? line.color,
    texture: opts.texture ?? line.texture,
    lace: opts.lace ?? line.lace,
    capSize: opts.capSize ?? line.capSize,
    hairline: opts.hairline ?? line.hairline,
    styling: opts.styling ?? line.styling,
    partSelection: opts.partSelection ?? line.partSelection,
    addOns,
    hairOrigin: opts.hairOrigin ?? line.hairOrigin,
    configurationTraits: undefined,
  };
}

function parsePurchaseProfileFromLine(
  orderId: string,
  line: CareOrderLineLike,
  index: number
): CarePurchaseProfile | null {
  if (!isPhysicalHairLine(line)) return null;

  const productName = String(line.productName || line.name || '').trim().toUpperCase();
  const type = String(line.type || '');

  let productType: CareProductType | undefined;
  let baseUnitId: string | undefined = line.baseUnitId?.trim().toLowerCase();
  let textureFamily = normalizeTextureFamily(line.texture);

  if (type === 'shop-texture-category') {
    const cat = String(line.category || '').toLowerCase();
    productType = BCF_CATEGORY_TO_PRODUCT_TYPE[cat];
    if (!textureFamily) {
      textureFamily = normalizeTextureFamily(line.options?.texture ?? line.texture);
    }
  } else {
    productType = 'unit';
    if (!baseUnitId) baseUnitId = displayNameToUnitSlug(productName);
    if (!textureFamily) textureFamily = textureFamilyFromUnitSlug(baseUnitId);
  }

  if (!productType) return null;

  const configurationSnapshot = configurationFromOrderLine(line);
  configurationSnapshot.configurationTraits = deriveConfigurationTraits(configurationSnapshot);
  const transformationState = deriveTransformationStateFromConfiguration(configurationSnapshot);

  return {
    id: orderLineKey(orderId, line, index),
    userId: '',
    orderId,
    orderLineKey: orderLineKey(orderId, line, index),
    productName,
    productType,
    baseUnitId,
    textureFamily,
    configurationSnapshot,
    transformationState,
    constructionDna: {
      baseUnitId: baseUnitId as import('./productCatalog').WigUnitSlug | undefined,
      productType,
      textureFamily,
      hairOrigin: configurationSnapshot.hairOrigin,
      laceType: configurationSnapshot.lace,
    },
    grantedAt: new Date().toISOString(),
    status: 'active',
  };
}

function expandOrderLines(order: CareOrderLike): CareOrderLineLike[] {
  if (order.lineItems?.length) return order.lineItems;
  const count = Math.max(1, Number(order.items) || 1);
  return Array.from({ length: count }, () => ({
    productName: order.productName,
    name: order.productName,
  }));
}

/** Extract qualifying purchase profiles from order rows (DELIVERED only for new grants). */
export function careProfilesFromOrders(
  orders: CareOrderLike[],
  userId: string
): CarePurchaseProfile[] {
  const profiles: CarePurchaseProfile[] = [];

  for (const order of orders) {
    const orderId = String(order.id || order.orderNumber || '').trim();
    if (!orderId) continue;

    const status = String(order.status || '').toUpperCase();
    if (CARE_REVOKED_ORDER_STATUSES.has(status)) continue;
    if (status !== CARE_QUALIFYING_ORDER_STATUS) continue;

    expandOrderLines(order).forEach((line, index) => {
      const profile = parsePurchaseProfileFromLine(orderId, line, index);
      if (!profile) return;
      profiles.push({ ...profile, userId });
    });
  }

  return profiles;
}

export function careProfilesFromOrdersWithStatus(
  orders: CareOrderLike[],
  userId: string
): CarePurchaseProfile[] {
  const profiles: CarePurchaseProfile[] = [];

  for (const order of orders) {
    const orderId = String(order.id || order.orderNumber || '').trim();
    if (!orderId) continue;

    const status = String(order.status || '').toUpperCase();
    const entStatus =
      CARE_REVOKED_ORDER_STATUSES.has(status) ? ('revoked' as const) : status === CARE_QUALIFYING_ORDER_STATUS ? ('active' as const) : null;

    if (!entStatus) continue;

    expandOrderLines(order).forEach((line, index) => {
      const profile = parsePurchaseProfileFromLine(orderId, line, index);
      if (!profile) return;
      profiles.push({ ...profile, userId, status: entStatus });
    });
  }

  return profiles;
}
