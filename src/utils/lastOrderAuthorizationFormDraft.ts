/**
 * Last order authorization form values + ID/card/signature images (per signed-in user).
 * Pre-fills `/shop/order-form` on repeat orders so clients don't re-type or re-attach the same proofs.
 */

import { getPerUserKey } from './perUserStorage';

const STORAGE_PREFIX = 'lastOrderAuthorizationFormDraft';

/** Fields that carry over across orders (excludes order #, date, CVV). */
export type OrderAuthorizationFormDraftFields = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  cardholderName?: string;
  cardNumber?: string;
  cardLastFour?: string;
  cardType?: string;
  expirationDate?: string;
  addressDifferenceReason?: string;
};

export type LastOrderAuthorizationFormDraft = {
  formFields: OrderAuthorizationFormDraftFields;
  photoIdDataUrl?: string;
  cardLastFourDataUrl?: string;
  signatureDataUrl?: string;
};

function storageKeyForEmail(email: string): string {
  return getPerUserKey(STORAGE_PREFIX, email);
}

function trimStr(s: unknown): string {
  return typeof s === 'string' ? s.trim() : '';
}

/**
 * Call after a successful form submit (same data persisted to signedOrderFormsByEmail).
 */
export function saveLastOrderAuthorizationFormDraft(
  email: string | null | undefined,
  payload: {
    formFields: Record<string, string>;
    photoIdDataUrl?: string;
    cardLastFourDataUrl?: string;
    signatureDataUrl?: string;
  }
): void {
  const e = (email ?? '').trim().toLowerCase();
  if (!e || typeof window === 'undefined') return;

  const f = payload.formFields;
  const draft: LastOrderAuthorizationFormDraft = {
    formFields: {
      firstName: trimStr(f.firstName),
      lastName: trimStr(f.lastName),
      email: trimStr(f.email),
      phone: trimStr(f.phone),
      address: trimStr(f.address),
      city: trimStr(f.city),
      state: trimStr(f.state),
      zip: trimStr(f.zip),
      country: trimStr(f.country),
      billingAddress: trimStr(f.billingAddress),
      billingCity: trimStr(f.billingCity),
      billingState: trimStr(f.billingState),
      billingZip: trimStr(f.billingZip),
      billingCountry: trimStr(f.billingCountry),
      cardholderName: trimStr(f.cardholderName),
      cardNumber: trimStr(f.cardNumber),
      cardLastFour: trimStr(f.cardLastFour),
      cardType: trimStr(f.cardType),
      expirationDate: trimStr(f.expirationDate),
      addressDifferenceReason: trimStr(f.addressDifferenceReason),
    },
    photoIdDataUrl: payload.photoIdDataUrl,
    cardLastFourDataUrl: payload.cardLastFourDataUrl,
    signatureDataUrl: payload.signatureDataUrl,
  };

  try {
    localStorage.setItem(storageKeyForEmail(e), JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function loadLastOrderAuthorizationFormDraft(
  email: string | null | undefined
): LastOrderAuthorizationFormDraft | null {
  const e = (email ?? '').trim().toLowerCase();
  if (!e || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKeyForEmail(e));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const o = parsed as Record<string, unknown>;
    const ff = o.formFields;
    if (!ff || typeof ff !== 'object' || Array.isArray(ff)) return null;
    const fields = ff as Record<string, unknown>;
    const draft: LastOrderAuthorizationFormDraft = {
      formFields: {
        firstName: trimStr(fields.firstName),
        lastName: trimStr(fields.lastName),
        email: trimStr(fields.email),
        phone: trimStr(fields.phone),
        address: trimStr(fields.address),
        city: trimStr(fields.city),
        state: trimStr(fields.state),
        zip: trimStr(fields.zip),
        country: trimStr(fields.country),
        billingAddress: trimStr(fields.billingAddress),
        billingCity: trimStr(fields.billingCity),
        billingState: trimStr(fields.billingState),
        billingZip: trimStr(fields.billingZip),
        billingCountry: trimStr(fields.billingCountry),
        cardholderName: trimStr(fields.cardholderName),
        cardNumber: trimStr(fields.cardNumber),
        cardLastFour: trimStr(fields.cardLastFour),
        cardType: trimStr(fields.cardType),
        expirationDate: trimStr(fields.expirationDate),
        addressDifferenceReason: trimStr(fields.addressDifferenceReason),
      },
      photoIdDataUrl: typeof o.photoIdDataUrl === 'string' ? o.photoIdDataUrl : undefined,
      cardLastFourDataUrl: typeof o.cardLastFourDataUrl === 'string' ? o.cardLastFourDataUrl : undefined,
      signatureDataUrl: typeof o.signatureDataUrl === 'string' ? o.signatureDataUrl : undefined,
    };
    const hasAny =
      Object.values(draft.formFields).some((v) => v) ||
      draft.photoIdDataUrl ||
      draft.cardLastFourDataUrl ||
      draft.signatureDataUrl;
    return hasAny ? draft : null;
  } catch {
    return null;
  }
}
