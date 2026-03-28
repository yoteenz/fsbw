/** Shared with CartDropdown / shop & tools pages — amounts are USD list prices before `rate` conversion. */
export type CurrencyRatesRecord = Record<string, { symbol: string; rate: number; name: string }>;

export function formatPriceUsd(
  priceUsd: number,
  selectedCurrency: string,
  currencyRates: CurrencyRatesRecord
): { __html: string } {
  const currency = currencyRates[selectedCurrency] ?? currencyRates.USD;
  if (!currency) {
    return { __html: String(priceUsd) + ' ' + selectedCurrency };
  }
  if (!priceUsd || isNaN(priceUsd)) {
    return { __html: currency.symbol + '0 ' + selectedCurrency };
  }
  const converted = priceUsd * currency.rate;
  return {
    __html:
      currency.symbol +
      converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) +
      ' ' +
      selectedCurrency
  };
}

/** Min/max in USD (e.g. bundle tiers). Renders symbol + converted bounds + ISO currency code (e.g. `… USD`). */
export function formatPriceRangeUsd(
  minUsd: number,
  maxUsd: number,
  selectedCurrency: string,
  currencyRates: CurrencyRatesRecord
): { __html: string } {
  const currency = currencyRates[selectedCurrency] ?? currencyRates.USD;
  if (!currency) {
    return { __html: `${minUsd}–${maxUsd} ${selectedCurrency}` };
  }
  const lo = minUsd * currency.rate;
  const hi = maxUsd * currency.rate;
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return {
    __html: `${currency.symbol}${fmt(lo)} – ${currency.symbol}${fmt(hi)} ${selectedCurrency}`
  };
}
