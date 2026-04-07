/**
 * Last wig-consult head measurements submitted at checkout (per signed-in user).
 * Pre-fills the booking consult form so repeat clients don't re-enter the same numbers.
 */

import { getPerUserKey } from './perUserStorage';
import { finalizeConsultHeadMeasurementValue, sanitizeConsultHeadMeasurementInput } from './bookingConsultHeadMeasurementInput';

const STORAGE_PREFIX = 'lastBookingConsultHeadMeasurements';

export const BOOKING_CONSULT_HEAD_MEASUREMENT_KEYS = [
  'circumference',
  'frontToNape',
  'verticalTempleToTemple',
  'horizontalTempleToTemple',
  'earToEar',
  'napeOfNeck',
] as const;

export type BookingConsultHeadMeasurementKey = (typeof BOOKING_CONSULT_HEAD_MEASUREMENT_KEYS)[number];

export type BookingConsultHeadMeasurementsSaved = Record<BookingConsultHeadMeasurementKey, string>;

const EMPTY: BookingConsultHeadMeasurementsSaved = {
  circumference: '',
  frontToNape: '',
  verticalTempleToTemple: '',
  horizontalTempleToTemple: '',
  earToEar: '',
  napeOfNeck: '',
};

function storageKeyForEmail(email: string): string {
  return getPerUserKey(STORAGE_PREFIX, email);
}

function normalizeStoredInches(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return finalizeConsultHeadMeasurementValue(raw.trim());
}

/**
 * Persist measurements from a completed consult checkout line (cart item `bookingHeadMeasurements`).
 */
export function saveLastSubmittedBookingConsultHeadMeasurements(
  email: string | null | undefined,
  raw: Record<string, unknown> | null | undefined
): void {
  const e = (email ?? '').trim().toLowerCase();
  if (!e || typeof window === 'undefined') return;
  const next: BookingConsultHeadMeasurementsSaved = { ...EMPTY };
  for (const k of BOOKING_CONSULT_HEAD_MEASUREMENT_KEYS) {
    const v = normalizeStoredInches(raw?.[k]);
    if (v) next[k] = v;
  }
  if (!next.circumference && !next.frontToNape) return;
  try {
    localStorage.setItem(storageKeyForEmail(e), JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

/** Load saved measurements for prefill, or null if none / parse error. */
export function loadLastSubmittedBookingConsultHeadMeasurements(
  email: string | null | undefined
): BookingConsultHeadMeasurementsSaved | null {
  const e = (email ?? '').trim().toLowerCase();
  if (!e || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKeyForEmail(e));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const o = parsed as Record<string, unknown>;
    const out: BookingConsultHeadMeasurementsSaved = { ...EMPTY };
    for (const k of BOOKING_CONSULT_HEAD_MEASUREMENT_KEYS) {
      out[k] = sanitizeConsultHeadMeasurementInput(String(o[k] ?? ''));
    }
    if (!out.circumference && !out.frontToNape) return null;
    return out;
  } catch {
    return null;
  }
}
