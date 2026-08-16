/** All authoritative money values use integer minor units (USD cents). */

export type CurrencyCode = 'USD';

export function dollarsToMinor(dollars: number): number {
  return Math.round(dollars * 100);
}

export function minorToDollars(minor: number): number {
  return minor / 100;
}

export function formatMoney(minor: number, currency: CurrencyCode = 'USD'): string {
  const abs = Math.abs(minor);
  const formatted = (abs / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = minor < 0 ? '-' : '';
  if (currency === 'USD') return `${sign}$${formatted}`;
  return `${sign}${formatted} ${currency}`;
}

export function addMinor(...amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + a, 0);
}

export function multiplyMinor(unitMinor: number, quantity: number): number {
  return Math.round(unitMinor * quantity);
}

export function clampMinor(value: number, min = 0): number {
  return Math.max(min, value);
}
