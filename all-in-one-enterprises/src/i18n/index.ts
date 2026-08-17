import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resolveInitialLocale } from './localeStorage';

import enCommon from '../locales/en/common.json';
import enNav from '../locales/en/nav.json';
import enAuth from '../locales/en/auth.json';
import enHomepage from '../locales/en/homepage.json';
import enDriverLink from '../locales/en/driverLink.json';
import enFleetCare from '../locales/en/fleetCare.json';
import enPortal from '../locales/en/portal.json';
import enValidation from '../locales/en/validation.json';
import enIntake from '../locales/en/intake.json';

import esCommon from '../locales/es/common.json';
import esNav from '../locales/es/nav.json';
import esAuth from '../locales/es/auth.json';
import esHomepage from '../locales/es/homepage.json';
import esDriverLink from '../locales/es/driverLink.json';
import esFleetCare from '../locales/es/fleetCare.json';
import esPortal from '../locales/es/portal.json';
import esValidation from '../locales/es/validation.json';
import esIntake from '../locales/es/intake.json';

export const SUPPORTED_LOCALES = ['en-US', 'es-US'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<AppLocale, { short: string; full: string }> = {
  'en-US': { short: 'EN', full: 'English' },
  'es-US': { short: 'ES', full: 'Español' },
};

const resources = {
  'en-US': {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    homepage: enHomepage,
    driverLink: enDriverLink,
    fleetCare: enFleetCare,
    portal: enPortal,
    validation: enValidation,
    intake: enIntake,
  },
  'es-US': {
    common: esCommon,
    nav: esNav,
    auth: esAuth,
    homepage: esHomepage,
    driverLink: esDriverLink,
    fleetCare: esFleetCare,
    portal: esPortal,
    validation: esValidation,
    intake: esIntake,
  },
};

let initialized = false;

export function initI18n(): typeof i18n {
  if (initialized) return i18n;

  const lng = resolveInitialLocale();

  i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en-US',
    defaultNS: 'common',
    ns: ['common', 'nav', 'auth', 'homepage', 'driverLink', 'fleetCare', 'portal', 'validation', 'intake'],
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    parseMissingKeyHandler: (key) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation: ${key}`);
      }
      return key.split('.').pop() ?? key;
    },
  });

  document.documentElement.lang = lng.startsWith('es') ? 'es' : 'en';
  initialized = true;
  return i18n;
}

export function changeAppLocale(locale: AppLocale): void {
  void i18n.changeLanguage(locale);
  document.documentElement.lang = locale.startsWith('es') ? 'es' : 'en';
}

export default i18n;
