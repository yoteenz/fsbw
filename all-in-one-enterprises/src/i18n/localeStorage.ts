import type { AppLocale } from './index';

export const LOCALE_STORAGE_KEY = 'aio_preferred_locale';

export function getStoredLocale(): AppLocale | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (raw === 'en-US' || raw === 'es-US') return raw;
  return null;
}

export function setStoredLocale(locale: AppLocale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'en-US';
  const lang = navigator.language?.toLowerCase() ?? '';
  if (lang.startsWith('es')) return 'es-US';
  return 'en-US';
}

export function resolveInitialLocale(): AppLocale {
  return getStoredLocale() ?? detectBrowserLocale();
}
