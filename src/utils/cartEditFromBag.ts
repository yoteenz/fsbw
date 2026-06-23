import { useNavigate } from 'react-router-dom';
import { beginEditAppointmentFromCart } from './bookingAppointmentFormDraft';
import {
  bookingAppointmentHrefForCartItem,
  bookingConsultationHrefForCartItem,
} from './bookingMemberRoutes';
import { shopBcfPdpHrefFromCartItem } from './bcfProductOptions';
import { isGiftCardCartLine } from './giftCardCheckout';
import { isSlayTicketPackCartLine } from './slayTicketCheckout';
import { slayTicketPackPdpPath } from './slayTicketPacks';

export type CartEditAction =
  | { type: 'navigate'; href: string }
  | { type: 'sign-in'; returnTo: string }
  | { type: 'appointment'; item: Record<string, unknown> };

function isSignedIn(): boolean {
  try {
    return localStorage.getItem('isSignedIn') === 'true';
  } catch {
    return false;
  }
}

function persistBuildAWigEditState(item: Record<string, unknown>) {
  localStorage.setItem('editingCartItem', JSON.stringify(item));
  localStorage.setItem('editingCartItemId', String(item.id));
  localStorage.removeItem('editingSource');

  const capSize = (item.capSize as string) || 'M';
  const length = (item.length as string) || '24"';
  const density = (item.density as string) || '200%';
  let color = item.color as string | undefined;
  if (item.name === 'BLANCO') {
    const valid = ['GOLDEN', 'PLATINUM', 'ASH'];
    if (!color || !valid.includes(color)) color = 'PLATINUM';
  } else {
    color = color || 'OFF BLACK';
  }
  const texture = (item.texture as string) || 'SILKY';
  const lace = (item.lace as string) || '13X6';
  const hairline = (item.hairline as string) || 'NATURAL';
  const partSelection = (item.partSelection as string) || 'MIDDLE';
  const styling = (item.styling as string) || 'NONE';
  const addOns = item.addOns || [];
  const capSizePrice = capSize === 'XXS/XS/S' || capSize === 'S/M/L' ? '40' : '0';

  const pairs: [string, string][] = [
    ['selectedCapSize', capSize],
    ['selectedCapSizePrice', capSizePrice],
    ['selectedLength', length],
    ['selectedDensity', density],
    ['selectedColor', color],
    ['selectedTexture', texture],
    ['selectedLace', lace],
    ['selectedHairline', hairline],
    ['selectedPartSelection', partSelection],
    ['selectedStyling', styling],
    ['editSelectedCapSize', capSize],
    ['editSelectedCapSizePrice', capSizePrice],
    ['editSelectedLength', length],
    ['editSelectedDensity', density],
    ['editSelectedColor', color],
    ['editSelectedTexture', texture],
    ['editSelectedLace', lace],
    ['editSelectedHairline', hairline],
    ['editSelectedStyling', styling],
  ];

  for (const [key, value] of pairs) {
    localStorage.setItem(key, value);
  }
  localStorage.setItem('selectedAddOns', JSON.stringify(addOns));
  localStorage.setItem('editSelectedAddOns', JSON.stringify(addOns));

  window.dispatchEvent(
    new CustomEvent('editingCartItemChanged', { detail: { itemId: item.id } }),
  );
}

function buildAWigEditHref(item: Record<string, unknown>): string {
  if (item.name === 'NOIR') return '/build-a-wig/noir/edit';
  if (item.name === 'BLANCO') return '/build-a-wig/blanco/edit';
  if (item.name === 'SOFT WAVE') return '/build-a-wig/soft-wave/edit';
  if (item.name === 'SOFT CURL') return '/build-a-wig/soft-curl/edit';
  if (item.name === 'BEACH WAVE') return '/build-a-wig/beach-wave/edit';
  if (item.name === 'OCEAN CURL') return '/build-a-wig/ocean-curl/edit';
  return '/build-a-wig/edit';
}

export function resolveCartLineEditAction(item: Record<string, unknown>): CartEditAction | null {
  if (item.type === 'booking-appointment') {
    return { type: 'appointment', item };
  }
  if (item.type === 'booking-consult') {
    return { type: 'navigate', href: bookingConsultationHrefForCartItem(item) };
  }
  if (isGiftCardCartLine(item)) {
    return { type: 'navigate', href: '/tools/gift-card' };
  }
  if (isSlayTicketPackCartLine(item)) {
    return { type: 'navigate', href: slayTicketPackPdpPath(item.id as string) };
  }
  const bcfHref = shopBcfPdpHrefFromCartItem(item);
  if (bcfHref) {
    return { type: 'navigate', href: bcfHref };
  }
  if (
    item.type === 'shop-texture-category' ||
    item.name === 'GIFT CARD' ||
    item.type === 'gift-card'
  ) {
    return null;
  }

  persistBuildAWigEditState(item);
  const href = buildAWigEditHref(item);
  if (!isSignedIn()) {
    return { type: 'sign-in', returnTo: href };
  }
  return { type: 'navigate', href };
}

export function executeCartLineEditAction(
  action: CartEditAction,
  navigate: ReturnType<typeof useNavigate>,
): string | null {
  if (action.type === 'navigate') {
    navigate(action.href);
    return null;
  }
  if (action.type === 'appointment') {
    beginEditAppointmentFromCart(
      action.item as unknown as Parameters<typeof beginEditAppointmentFromCart>[0],
      navigate,
    );
    return null;
  }
  return action.returnTo;
}

export function resolveCartLinePdpHref(item: Record<string, unknown>): string {
  if (isGiftCardCartLine(item)) return '/tools/gift-card';
  if (isSlayTicketPackCartLine(item)) {
    return slayTicketPackPdpPath(item.id as string);
  }
  if (item.type === 'booking-consult') {
    return bookingConsultationHrefForCartItem(item);
  }
  if (item.type === 'booking-appointment') {
    return bookingAppointmentHrefForCartItem(item);
  }
  const bcfHref = shopBcfPdpHrefFromCartItem(item);
  if (bcfHref) return bcfHref;
  if (item.name === 'NOIR') return '/straight/noir';
  if (item.name === 'BLANCO') return '/straight/blanco';
  if (item.name === 'SOFT WAVE') return '/wavy/soft-wave';
  if (item.name === 'SOFT CURL') return '/curly/soft-curl';
  if (item.name === 'BEACH WAVE') return '/wavy/beach-wave';
  if (item.name === 'OCEAN CURL') return '/curly/ocean-curl';
  return '/straight/noir';
}
