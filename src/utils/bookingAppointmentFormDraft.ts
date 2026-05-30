import type { CSSProperties } from 'react';
import type { CartItem } from '../types/cart';
import { bookingAppointmentHrefForCartItem } from './bookingMemberRoutes';

export const BOOKING_APPOINTMENT_FORM_STORAGE_KEY = 'bookingAppointmentFormDraftV1';

/** Same-tab: appointment PDP listens to re-apply draft after cart-driven hydrate. */
export const BOOKING_APPOINTMENT_DRAFT_HYDRATE_EVENT = 'bawBookingAppointmentDraftHydrate';

/** When set, next add-to-bag replaces this cart line id instead of adding a duplicate. */
export const EDITING_BOOKING_APPOINTMENT_CART_ITEM_ID_KEY = 'editingBookingAppointmentCartItemId';

type InstallKind = 'NEW_INSTALL' | 'RE_INSTALL';
type AppointmentStyle = 'BONE STRAIGHT' | 'LAYERED CURLS' | 'CRIMPS';
type PartDirection = 'LEFT SIDE' | 'MIDDLE' | 'RIGHT SIDE';
type MakeupSkinToneId =
  | 'fair'
  | 'light'
  | 'light-medium'
  | 'medium'
  | 'medium-deep'
  | 'deep'
  | 'deep-dark'
  | 'rich-ebony';
type MinkLashVolume = 'NATURAL' | 'DRAMATIC';

export type AppointmentFormDraftV1 = {
  v: 1;
  installKind: InstallKind;
  appointmentStyle: AppointmentStyle;
  partDirection: PartDirection;
  addonIds: string[];
  makeupSkinToneId: MakeupSkinToneId;
  minkLashVolume: MinkLashVolume;
  preferredDateIso: string;
  preferredTimeSlot: string;
  appointmentNotes: string;
};

const APPOINTMENT_STYLE_OPTIONS: AppointmentStyle[] = ['BONE STRAIGHT', 'LAYERED CURLS', 'CRIMPS'];
const PART_DIRECTION_OPTIONS: PartDirection[] = ['LEFT SIDE', 'MIDDLE', 'RIGHT SIDE'];
const KNOWN_ADDON_IDS = new Set([
  'braids',
  'brow-clean',
  'brow-tint',
  'makeup',
  'mink-lashes',
  'clean-lace',
  'travel'
]);

/** Cart stores makeup as display label; draft uses swatch id. */
const MAKEUP_LABEL_TO_ID: Record<string, MakeupSkinToneId> = {
  FAIR: 'fair',
  LIGHT: 'light',
  BEIGE: 'light-medium',
  MEDIUM: 'medium',
  TAN: 'medium-deep',
  'MEDIUM DEEP': 'medium-deep',
  DEEP: 'deep',
  MAHOGANY: 'deep-dark',
  'DEEP DARK': 'deep-dark',
  EBONY: 'rich-ebony',
  'RICH EBONY': 'rich-ebony'
};

function normalizeMakeupLabel(label: string): MakeupSkinToneId | null {
  const k = label.trim().toUpperCase().replace(/\s+/g, ' ');
  if (MAKEUP_LABEL_TO_ID[k]) return MAKEUP_LABEL_TO_ID[k];
  const compact = label.trim().toUpperCase().replace(/\s/g, '');
  for (const [a, b] of Object.entries(MAKEUP_LABEL_TO_ID)) {
    if (a.replace(/\s/g, '') === compact) return b;
  }
  return null;
}

export function loadAppointmentFormDraft(): AppointmentFormDraftV1 | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BOOKING_APPOINTMENT_FORM_STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<AppointmentFormDraftV1>;
    if (d?.v !== 1) return null;
    return d as AppointmentFormDraftV1;
  } catch {
    return null;
  }
}

export function persistAppointmentFormDraft(draft: AppointmentFormDraftV1): void {
  try {
    const payload = JSON.stringify(draft);
    if (payload.length > 4_500_000) return;
    localStorage.setItem(BOOKING_APPOINTMENT_FORM_STORAGE_KEY, payload);
  } catch {
    /* quota or private mode */
  }
}

export function clearAppointmentFormDraft(): void {
  try {
    localStorage.removeItem(BOOKING_APPOINTMENT_FORM_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Writes booking PDP draft from a cart line. Returns false if the item is not an appointment line.
 */
export function applyCartItemToAppointmentFormDraft(item: CartItem): boolean {
  if (item.type !== 'booking-appointment') return false;

  const installRaw = item.bookingInstallKind;
  const installKind: InstallKind =
    installRaw === 'RE_INSTALL' || installRaw === 'NEW_INSTALL' ? installRaw : 'RE_INSTALL';

  const styleRaw = item.bookingStyle;
  const appointmentStyle: AppointmentStyle =
    styleRaw && APPOINTMENT_STYLE_OPTIONS.includes(styleRaw as AppointmentStyle)
      ? (styleRaw as AppointmentStyle)
      : 'BONE STRAIGHT';

  const partRaw = item.bookingPartDirection;
  const partDirection: PartDirection =
    partRaw && PART_DIRECTION_OPTIONS.includes(partRaw as PartDirection)
      ? (partRaw as PartDirection)
      : 'MIDDLE';

  const addonIds: string[] = [];
  if (Array.isArray(item.bookingAddonIds)) {
    for (const id of item.bookingAddonIds) {
      if (typeof id === 'string' && KNOWN_ADDON_IDS.has(id)) {
        if (id === 'clean-lace' && installKind !== 'RE_INSTALL') continue;
        addonIds.push(id);
      }
    }
  }

  let makeupSkinToneId: MakeupSkinToneId = 'fair';
  if (item.bookingMakeupSkinTone && typeof item.bookingMakeupSkinTone === 'string') {
    const fromLabel = normalizeMakeupLabel(item.bookingMakeupSkinTone);
    if (fromLabel) makeupSkinToneId = fromLabel;
  }

  const mv = item.bookingMinkLashVolume;
  const minkLashVolume: MinkLashVolume =
    mv === 'DRAMATIC' || mv === 'NATURAL' ? mv : 'NATURAL';

  const preferredDateIso =
    typeof item.bookingPreferredDate === 'string' ? item.bookingPreferredDate.trim() : '';
  const preferredTimeSlot =
    typeof item.bookingPreferredTime === 'string' ? item.bookingPreferredTime.trim() : '';
  const appointmentNotes = typeof item.bookingNotes === 'string' ? item.bookingNotes : '';

  const draft: AppointmentFormDraftV1 = {
    v: 1,
    installKind,
    appointmentStyle,
    partDirection,
    addonIds,
    makeupSkinToneId,
    minkLashVolume,
    preferredDateIso,
    preferredTimeSlot,
    appointmentNotes
  };

  persistAppointmentFormDraft(draft);
  return true;
}

/** Persist draft, mark cart line for replace on next add-to-bag, hydrate open PDP, navigate. */
export function beginEditAppointmentFromCart(
  item: CartItem,
  navigate: (path: string) => void,
  onClose?: () => void
): void {
  if (item.type !== 'booking-appointment') return;
  try {
    localStorage.setItem(EDITING_BOOKING_APPOINTMENT_CART_ITEM_ID_KEY, item.id);
  } catch {
    /* ignore */
  }
  if (!applyCartItemToAppointmentFormDraft(item)) return;
  window.dispatchEvent(new Event(BOOKING_APPOINTMENT_DRAFT_HYDRATE_EVENT));
  onClose?.();
  navigate(bookingAppointmentHrefForCartItem(item));
}

/** Red edit link — match CartDropdown / bag “EDIT IN BUILD-A-WIG” chrome. */
export const bookingEditLinkClassName = 'font-bold text-center cursor-pointer hover:opacity-80 transition-opacity';

export const bookingEditLinkStyle: CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  color: '#EB1C24',
  textTransform: 'uppercase',
  fontSize: '9px',
  marginTop: '4px',
  marginBottom: '0',
  lineHeight: '1.1',
};
