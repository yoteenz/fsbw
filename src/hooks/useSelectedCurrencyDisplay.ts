import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatPriceUsdPlain, type CurrencyRatesRecord } from '../utils/currencyFormat';
import { DEFAULT_CURRENCY_RATES } from '../utils/defaultCurrencyRates';
import { getCurrentUserEmailFromStorage, getPerUserKey, PER_USER_KEYS } from '../utils/perUserStorage';

function readCurrencyFromStorage(): string {
  try {
    const key = getPerUserKey(PER_USER_KEYS.selectedCurrency, getCurrentUserEmailFromStorage());
    const saved = localStorage.getItem(key);
    if (saved && DEFAULT_CURRENCY_RATES[saved]) return saved;
  } catch {
    /* ignore */
  }
  return 'USD';
}

/**
 * Per-user selected currency + formatter aligned with cart/shop (`currencyChanged`, per-user `selectedCurrency` key).
 */
export function useSelectedCurrencyDisplay() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(readCurrencyFromStorage);

  useEffect(() => {
    const sync = () => {
      const next = readCurrencyFromStorage();
      setSelectedCurrency((prev) => (prev === next ? prev : next));
    };

    const onCurrencyChanged = (e: Event) => {
      const code = (e as CustomEvent<string>).detail;
      if (code && DEFAULT_CURRENCY_RATES[code]) setSelectedCurrency(code);
      sync();
    };

    sync();
    window.addEventListener('currencyChanged', onCurrencyChanged as EventListener);
    window.addEventListener('storage', sync);
    window.addEventListener('signInStateChanged', sync as EventListener);
    const interval = setInterval(sync, 500);
    return () => {
      clearInterval(interval);
      window.removeEventListener('currencyChanged', onCurrencyChanged as EventListener);
      window.removeEventListener('storage', sync);
      window.removeEventListener('signInStateChanged', sync as EventListener);
    };
  }, []);

  const currencyRates: CurrencyRatesRecord = DEFAULT_CURRENCY_RATES;

  const formatUsd = useCallback(
    (usd: number) => formatPriceUsdPlain(usd, selectedCurrency, currencyRates),
    [selectedCurrency, currencyRates]
  );

  return useMemo(
    () => ({ selectedCurrency, formatUsd, currencyRates }),
    [selectedCurrency, formatUsd, currencyRates]
  );
}
