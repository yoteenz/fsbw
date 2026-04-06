/**
 * Consult head measurement inch fields: at most 4 digit characters.
 * If a decimal is used, it must come after the first two digits (e.g. 14.2, 14.22).
 * Integer-only entries allow 1–4 digits (e.g. 1422).
 */

export function sanitizeConsultHeadMeasurementInput(raw: string): string {
  const t = raw.replace(/[^\d.]/g, '');
  if (!t) return '';

  const dotIdx = t.indexOf('.');
  if (dotIdx === -1) {
    return t.replace(/\D/g, '').slice(0, 4);
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
