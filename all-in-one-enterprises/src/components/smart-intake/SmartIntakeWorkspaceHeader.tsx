import { useTranslation } from 'react-i18next';
import { aioAppConfig } from '../../config/appConfig';

type Props = {
  title: string;
  description?: string;
  stepIndex: number;
  totalSteps: number;
};

export function SmartIntakeWorkspaceHeader({ title, description, stepIndex, totalSteps }: Props) {
  const { t } = useTranslation('intake');
  const progress = ((stepIndex + 1) / totalSteps) * 100;
  const phone = aioAppConfig.contact.phone;

  return (
    <header className="si-workspace-header">
      <div className="si-workspace-header__top">
        <p className="si-workspace-header__eyebrow">{t('smartIntake')}</p>
        <a href={aioAppConfig.contact.phoneHref} className="si-workspace-header__help si-workspace-header__help--desktop">
          {t('shell.needHelp')} · {phone}
        </a>
      </div>
      <h1 className="si-workspace-header__title">{title}</h1>
      {description && <p className="si-workspace-header__desc">{description}</p>}
      <div className="si-workspace-header__progress">
        <span className="si-workspace-header__step-label">
          {t('shell.stepOf', { current: stepIndex + 1, total: totalSteps })}
        </span>
        <div
          className="si-workspace-header__track"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="si-workspace-header__fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </header>
  );
}
