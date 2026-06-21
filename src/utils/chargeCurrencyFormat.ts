/** Stripe zero-decimal currencies — keep in sync with `api/_lib/pricing/fxRates.ts`. */
export const STRIPE_ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'JPY',
  'KMF',
  'KRW',
  'MGA',
  'PYG',
  'RWF',
  'UGX',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
]);

export function isZeroDecimalCurrency(code: string): boolean {
  return STRIPE_ZERO_DECIMAL_CURRENCIES.has(code.trim().toUpperCase());
}

/** Format server `chargeAmountMinor` for shopper-facing copy. */
export function formatChargeAmountMinor(
  chargeAmountMinor: number,
  chargeCurrency: string,
  symbol = ''
): string {
  const code = chargeCurrency.trim().toUpperCase();
  const minor = Math.max(0, Math.round(chargeAmountMinor));
  const major = isZeroDecimalCurrency(code) ? minor : minor / 100;
  const formatted = major.toLocaleString('en-US', {
    minimumFractionDigits: isZeroDecimalCurrency(code) ? 0 : 2,
    maximumFractionDigits: isZeroDecimalCurrency(code) ? 0 : 2,
  });
  return `${symbol}${formatted} ${code}`.trim();
}
