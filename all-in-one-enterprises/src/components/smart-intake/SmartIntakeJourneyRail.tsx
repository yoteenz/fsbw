import { useTranslation } from 'react-i18next';
import { AIOLogo } from '../AIOLogo';
import { aioAppConfig } from '../../config/appConfig';

export type JourneyStepState = 'complete' | 'current' | 'future';

export interface JourneyStepItem {
  id: string;
  index: number;
  label: string;
  subtitle: string;
  state: JourneyStepState;
}

type Props = {
  steps: JourneyStepItem[];
};

export function SmartIntakeJourneyRail({ steps }: Props) {
  const { t } = useTranslation('intake');

  return (
    <aside className="si-journey" aria-label={t('shell.journeyAria')}>
      <div className="si-journey__inner">
        <div className="si-journey__brand">
          <AIOLogo variant="footer" />
        </div>

        <p className="si-journey__eyebrow">{t('smartIntake')}</p>
        <h2 className="si-journey__headline">
          {t('shell.headlineLine1')}
          <br />
          {t('shell.headlineLine2')}
        </h2>
        <p className="si-journey__lede">{t('shell.lede')}</p>

        <ol className="si-journey__steps">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`si-journey-step si-journey-step--${step.state}`}
              aria-current={step.state === 'current' ? 'step' : undefined}
            >
              <div className="si-journey-step__marker" aria-hidden="true">
                {step.state === 'complete' ? (
                  <span className="si-journey-step__check">✓</span>
                ) : (
                  <span className="si-journey-step__num">{String(step.index + 1).padStart(2, '0')}</span>
                )}
              </div>
              <div className="si-journey-step__text">
                <span className="si-journey-step__label">{step.label}</span>
                <span className="si-journey-step__subtitle">{step.subtitle}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="si-journey__security">
          <span className="si-journey__shield" aria-hidden="true">
            <ShieldIcon />
          </span>
          <div>
            <p className="si-journey__security-title">{t('shell.securityTitle')}</p>
            <p className="si-journey__security-copy">{t('shell.securityCopy')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 9-8 9s-8-4-8-9V6l8-3z" />
    </svg>
  );
}

export function SmartIntakeMobileHeader({ onOpenJourney }: { onOpenJourney: () => void }) {
  const { t } = useTranslation('intake');
  const phone = aioAppConfig.contact.phoneHref;

  return (
    <header className="si-mobile-header">
      <button type="button" className="si-mobile-header__menu" onClick={onOpenJourney} aria-label={t('shell.openJourney')}>
        <MenuIcon />
      </button>
      <div className="si-mobile-header__brand">
        <AIOLogo variant="footer" />
      </div>
      <a href={phone} className="si-mobile-header__help" aria-label={t('shell.needHelp')}>
        <PhoneIcon />
      </a>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </svg>
  );
}
