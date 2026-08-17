import type { AppLocale } from './index';

export function formatDate(value: Date | string, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, options ?? { dateStyle: 'medium' }).format(date);
}

/** Accepts i18n language string (e.g. en-US, es-US) for display formatting. */
export function formatAppDate(value: Date | string, language: string): string {
  const locale = (language.startsWith('es') ? 'es-US' : 'en-US') as AppLocale;
  return formatDate(value, locale);
}

export function formatNumber(value: number, locale: AppLocale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrencyMinor(minor: number, locale: AppLocale, currency = 'USD'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
}
