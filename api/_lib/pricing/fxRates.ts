import type { QuoteResult } from './resolveQuote.js';

/**
 * Server FX table — keep in sync with `src/utils/defaultCurrencyRates.ts`.
 * `rate` = foreign currency units per 1 USD.
 */
export type FxRateEntry = { symbol: string; rate: number; name: string };

export const SERVER_FX_RATES: Record<string, FxRateEntry> = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.85, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.73, name: 'British Pound' },
  CAD: { symbol: 'C$', rate: 1.25, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.35, name: 'Australian Dollar' },
  JPY: { symbol: '¥', rate: 110.0, name: 'Japanese Yen' },
  CNY: { symbol: '¥', rate: 6.45, name: 'Chinese Yuan' },
  INR: { symbol: '₹', rate: 75.0, name: 'Indian Rupee' },
  BRL: { symbol: 'R$', rate: 5.2, name: 'Brazilian Real' },
  MXN: { symbol: '$', rate: 20.0, name: 'Mexican Peso' },
  CHF: { symbol: 'CHF', rate: 0.92, name: 'Swiss Franc' },
  SEK: { symbol: 'kr', rate: 8.5, name: 'Swedish Krona' },
  NOK: { symbol: 'kr', rate: 8.8, name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', rate: 6.3, name: 'Danish Krone' },
  PLN: { symbol: 'zł', rate: 3.9, name: 'Polish Zloty' },
  CZK: { symbol: 'Kč', rate: 21.5, name: 'Czech Koruna' },
  HUF: { symbol: 'Ft', rate: 310.0, name: 'Hungarian Forint' },
  RUB: { symbol: '₽', rate: 75.0, name: 'Russian Ruble' },
  TRY: { symbol: '₺', rate: 8.5, name: 'Turkish Lira' },
  ZAR: { symbol: 'R', rate: 15.2, name: 'South African Rand' },
  KRW: { symbol: '₩', rate: 1200.0, name: 'South Korean Won' },
  THB: { symbol: '฿', rate: 32.5, name: 'Thai Baht' },
  SGD: { symbol: 'S$', rate: 1.35, name: 'Singapore Dollar' },
  HKD: { symbol: 'HK$', rate: 7.8, name: 'Hong Kong Dollar' },
  NZD: { symbol: 'NZ$', rate: 1.45, name: 'New Zealand Dollar' },
  ILS: { symbol: '₪', rate: 3.2, name: 'Israeli Shekel' },
  AED: { symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' },
  SAR: { symbol: '﷼', rate: 3.75, name: 'Saudi Riyal' },
  QAR: { symbol: '﷼', rate: 3.64, name: 'Qatari Riyal' },
  KWD: { symbol: 'د.ك', rate: 0.3, name: 'Kuwaiti Dinar' },
  ARS: { symbol: '$', rate: 180.0, name: 'Argentine Peso' },
  IDR: { symbol: 'Rp', rate: 14500.0, name: 'Indonesian Rupiah' },
  EGP: { symbol: '£', rate: 30.8, name: 'Egyptian Pound' },
  NGN: { symbol: '₦', rate: 410.0, name: 'Nigerian Naira' },
  CLP: { symbol: '$', rate: 850.0, name: 'Chilean Peso' },
  MYR: { symbol: 'RM', rate: 4.2, name: 'Malaysian Ringgit' },
  PHP: { symbol: '₱', rate: 55.0, name: 'Philippine Peso' },
  VND: { symbol: '₫', rate: 24000.0, name: 'Vietnamese Dong' },
  RON: { symbol: 'lei', rate: 4.5, name: 'Romanian Leu' },
  COP: { symbol: '$', rate: 4200.0, name: 'Colombian Peso' },
  JOD: { symbol: 'د.ا', rate: 0.71, name: 'Jordanian Dinar' },
  GTQ: { symbol: 'Q', rate: 7.8, name: 'Guatemalan Quetzal' },
  BGN: { symbol: 'лв', rate: 1.66, name: 'Bulgarian Lev' },
};

/** Stripe expects amounts in the smallest unit; these currencies have no fractional subunit. */
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

/** ISO date the static table was last reviewed (bump when rates change). */
export const SERVER_FX_AS_OF = '2026-06-20';

export function normalizeChargeCurrency(code: unknown): string {
  const c = String(code || 'USD')
    .trim()
    .toUpperCase();
  return SERVER_FX_RATES[c] ? c : 'USD';
}

export function isZeroDecimalCurrency(code: string): boolean {
  return STRIPE_ZERO_DECIMAL_CURRENCIES.has(code.toUpperCase());
}

export function stripeCurrencyCode(code: string): string {
  return code.trim().toLowerCase();
}

/**
 * Convert authoritative USD cents to Stripe charge minor units in `chargeCurrency`.
 * Matches shopper display rounding (whole major units before minor scaling).
 */
export function convertUsdCentsToChargeMinor(
  usdCents: number,
  chargeCurrencyInput: unknown
): {
  chargeCurrency: string;
  chargeAmountMinor: number;
  fxRate: number;
  fxAsOf: string;
} {
  const chargeCurrency = normalizeChargeCurrency(chargeCurrencyInput);
  const fxRate = SERVER_FX_RATES[chargeCurrency]?.rate ?? 1;
  const usdMajor = Math.max(0, usdCents) / 100;
  const foreignMajor = usdMajor * fxRate;
  const roundedMajor = Math.round(foreignMajor);

  let chargeAmountMinor: number;
  if (chargeCurrency === 'USD') {
    chargeAmountMinor = Math.max(0, Math.round(usdCents));
  } else if (isZeroDecimalCurrency(chargeCurrency)) {
    chargeAmountMinor = Math.max(0, roundedMajor);
  } else {
    chargeAmountMinor = Math.max(0, Math.round(foreignMajor * 100));
  }

  return {
    chargeCurrency,
    chargeAmountMinor,
    fxRate,
    fxAsOf: SERVER_FX_AS_OF,
  };
}

export type ChargeEnrichedQuote = QuoteResult & {
  chargeCurrency: string;
  chargeAmountMinor: number;
  fxRate: number;
  fxAsOf: string;
};

export function enrichQuoteWithChargeCurrency(
  quote: QuoteResult,
  chargeCurrencyInput?: unknown
): ChargeEnrichedQuote {
  const charge = convertUsdCentsToChargeMinor(quote.totalCents, chargeCurrencyInput);
  return {
    ...quote,
    ...charge,
  };
}

export function getPublicFxRatesPayload(): {
  asOf: string;
  base: 'USD';
  rates: Record<string, { symbol: string; rate: number; name: string }>;
} {
  return {
    asOf: SERVER_FX_AS_OF,
    base: 'USD',
    rates: { ...SERVER_FX_RATES },
  };
}
