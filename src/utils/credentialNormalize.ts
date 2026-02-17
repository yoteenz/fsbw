/**
 * Normalize email and password for sign-in so Chrome, Safari, and other browsers
 * behave the same (autofill can add invisible characters or different whitespace).
 */

const ZERO_WIDTH_AND_INVISIBLE = /[\u200B-\u200D\uFEFF\u00AD\u2060]/g;

/** Strip zero-width and other invisible characters that break matching (e.g. from autofill). */
function stripInvisible(s: string): string {
  return (s || '').replace(ZERO_WIDTH_AND_INVISIBLE, '');
}

/** Normalize string to NFC so accents and composed chars match across browsers. */
function nfc(s: string): string {
  if (typeof s !== 'string') return '';
  try {
    return s.normalize('NFC');
  } catch {
    return s;
  }
}

/** Use for comparing email: trim, lowercase, strip invisible, NFC. */
export function normalizeEmail(email: string): string {
  return nfc(stripInvisible((email || '').trim().toLowerCase()));
}

/** Use for comparing password: trim, strip invisible, NFC. Do not change case. */
export function normalizePassword(password: string): string {
  return nfc(stripInvisible((password || '').trim()));
}
