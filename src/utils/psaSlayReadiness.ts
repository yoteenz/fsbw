/**
 * Slay Readiness Score — helps members finish consult → customize → checkout.
 */
import { getCurrentUserEmailFromStorage } from './perUserStorage';
import { orderNeedsClientAuthFormSignature } from './giftCardFirstPurchaseForm';

export type PsaSlayReadiness = {
  percent: number;
  checklist: { label: string; done: boolean }[];
};

function readCart(): Record<string, unknown>[] {
  try {
    const raw = localStorage.getItem('cartItems');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

function readActiveOrders(): Record<string, unknown>[] {
  const email = getCurrentUserEmailFromStorage();
  if (!email) return [];
  try {
    const raw = localStorage.getItem(`userOrders_${email.trim().toLowerCase()}`);
    if (!raw) return [];
    const data = JSON.parse(raw) as { activeOrders?: unknown[] };
    return Array.isArray(data.activeOrders) ? (data.activeOrders as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

export function computePsaSlayReadiness(): PsaSlayReadiness {
  const cart = readCart();
  const orders = readActiveOrders();

  const hasCustomUnit = cart.some((line) => {
    const type = String(line.type ?? '');
    if (type !== 'unit' && !line.capSize) return false;
    return Boolean(line.capSize && line.length);
  });

  const hasConsult = cart.some((l) => String(l.type) === 'booking-consult');
  const consultReady = cart.some((l) => {
    if (String(l.type) !== 'booking-consult') return false;
    const m = l.bookingHeadMeasurements as Record<string, string> | undefined;
    const photos = l.bookingInspoPhotoUrls;
    return Boolean(m?.circumference?.trim() && Array.isArray(photos) && photos.length > 0);
  });

  const hasInstall = cart.some((l) => String(l.type) === 'booking-appointment');
  const installScheduled = cart.some((l) => {
    if (String(l.type) !== 'booking-appointment') return false;
    return Boolean(l.bookingPreferredDate && l.bookingPreferredTime);
  });

  const blockingForm = orders.some(
    (o) =>
      String(o.status || '').toUpperCase() === 'PLACED' &&
      o.orderFormSigned !== true &&
      orderNeedsClientAuthFormSignature(o)
  );
  const formClear = !blockingForm;

  const checklist = [
    { label: 'CUSTOM UNIT IN BAG WITH KEY OPTIONS', done: hasCustomUnit },
    { label: 'CONSULT LINE COMPLETE (MEASUREMENTS + INSPO)', done: !hasConsult || consultReady },
    { label: 'INSTALL DATE + TIME SELECTED', done: !hasInstall || installScheduled },
    { label: 'ORDER FORM SIGNED (IF REQUIRED)', done: formClear },
  ];

  const doneCount = checklist.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checklist.length) * 100);

  return { percent, checklist };
}
