/**
 * Unit base prices for PSA catalog tools — keep in sync with `api/_lib/pricing/resolveQuote.ts` UNIT_BASE_USD_BY_NAME.
 */
export const PSA_UNIT_STARTING_PRICE_USD: Record<string, number> = {
  NOIR: 740,
  BLANCO: 820,
  'SOFT WAVE': 760,
  'BEACH WAVE': 760,
  'SOFT CURL': 780,
  'OCEAN CURL': 780,
};

export const PSA_UNIT_PRICE_NOTE =
  'Starting base USD before Build-a-Wig customization (length, density, lace, color, styling, add-ons).';

export function psaStartingPriceUsdForUnitName(name: string): number | null {
  const key = (name || '').trim().toUpperCase();
  return PSA_UNIT_STARTING_PRICE_USD[key] ?? null;
}

/** Sorted summary for system instructions / tool context. */
export function psaCatalogPricingSummaryLines(): string[] {
  return Object.entries(PSA_UNIT_STARTING_PRICE_USD)
    .sort((a, b) => a[1] - b[1])
    .map(([name, usd]) => `- ${name}: from $${usd} base`);
}
