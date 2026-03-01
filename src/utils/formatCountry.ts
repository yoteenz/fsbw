/**
 * Normalize country for display – US/USA/UNITED STATES → UNITED STATES OF AMERICA.
 * Other countries are returned uppercase as-is.
 */
export function formatCountryDisplay(country: string | undefined | null): string {
  const c = (country || '').trim().toUpperCase();
  if (!c || c === 'US' || c === 'USA' || /^UNITED\s*STATES$/i.test(c)) return 'UNITED STATES OF AMERICA';
  return c;
}
