import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppLocale } from '../../i18n';
import { LOCALE_LABELS, changeAppLocale } from '../../i18n';
import { setStoredLocale } from '../../i18n/localeStorage';

type Props = {
  className?: string;
  compact?: boolean;
};

export function LanguageSelector({ className = '', compact = false }: Props) {
  const { i18n, t } = useTranslation('common');
  const current = (i18n.language === 'es-US' ? 'es-US' : 'en-US') as AppLocale;

  useEffect(() => {
    document.documentElement.lang = current.startsWith('es') ? 'es' : 'en';
  }, [current]);

  const onChange = (locale: AppLocale) => {
    setStoredLocale(locale);
    changeAppLocale(locale);
  };

  return (
    <div className={`aio-lang-selector ${className}`.trim()}>
      <label className="aio-lang-selector__label visually-hidden" htmlFor="aio-lang-select">
        {t('selectLanguage')}
      </label>
      <select
        id="aio-lang-select"
        className="aio-lang-selector__select"
        value={current}
        onChange={(e) => onChange(e.target.value as AppLocale)}
        aria-label={t('selectLanguage')}
      >
        {(Object.keys(LOCALE_LABELS) as AppLocale[]).map((locale) => (
          <option key={locale} value={locale}>
            {compact ? LOCALE_LABELS[locale].short : LOCALE_LABELS[locale].full}
          </option>
        ))}
      </select>
    </div>
  );
}
