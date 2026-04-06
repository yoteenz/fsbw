/**
 * Consult head measurement inch fields: at most 4 digit characters.
 * Decimal (if any) must come after the first two digits (e.g. 14.2, 14.22).
 * Typing a third digit without "." inserts it automatically: `142` → `14.2`, `1422` → `14.22`.
 */

export function sanitizeConsultHeadMeasurementInput(raw: string): string {
  const t = raw.replace(/[^\d.]/g, '');
  if (!t) return '';

  const dotIdx = t.indexOf('.');
  if (dotIdx === -1) {
    const digitsOnly = t.replace(/\D/g, '').slice(0, 4);
    if (digitsOnly.length <= 2) return digitsOnly;
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
  }

  const intRaw = t.slice(0, dotIdx).replace(/\D/g, '');
  const fracRaw = t.slice(dotIdx + 1).replace(/\D/g, '');

  // Period only after two integer digits; otherwise treat as plain digits (max 4).
  if (intRaw.length < 2) {
    return (intRaw + fracRaw).slice(0, 4);
  }

  const intTwo = intRaw.slice(0, 2);
  const overflow = intRaw.slice(2) + fracRaw;
  const maxFrac = Math.max(0, 4 - intTwo.length);
  const frac = overflow.slice(0, maxFrac);

  if (frac.length > 0) {
    return `${intTwo}.${frac}`;
  }
  const endsWithDotOnly = t.endsWith('.') && fracRaw.length === 0;
  if (endsWithDotOnly) {
    return `${intTwo}.`;
  }
  return intTwo;
}

/** Strip trailing "." for cart / persistence (user may still be typing "14." in the field). */
export function finalizeConsultHeadMeasurementValue(raw: string): string {
  let s = sanitizeConsultHeadMeasurementInput(raw);
  if (s.endsWith('.')) s = s.slice(0, -1);
  return s;
}
