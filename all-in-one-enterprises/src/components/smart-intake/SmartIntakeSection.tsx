import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  label?: string;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function SmartIntakeSection({ label, title, children, className = '' }: Props) {
  return (
    <section className={`si-section ${className}`.trim()}>
      {label && <p className="si-section__label">{label}</p>}
      {title && <h2 className="si-section__title">{title}</h2>}
      <div className="si-section__body">{children}</div>
    </section>
  );
}

type InsightProps = {
  children: ReactNode;
};

export function SmartIntakeInsight({ children }: InsightProps) {
  const { t } = useTranslation('intake');
  return (
    <aside className="si-insight" aria-label={t('insight.label')}>
      <span className="si-insight__icon" aria-hidden="true">
        <BulbIcon />
      </span>
      <div>
        <p className="si-insight__label">{t('insight.label')}</p>
        <p className="si-insight__copy">{children}</p>
      </div>
    </aside>
  );
}

function BulbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
    </svg>
  );
}
