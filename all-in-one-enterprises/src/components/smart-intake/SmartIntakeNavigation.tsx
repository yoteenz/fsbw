import { useTranslation } from 'react-i18next';

type Props = {
  stepIndex: number;
  isLastStep: boolean;
  onBack: () => void;
  onSaveExit: () => void;
  onContinue: () => void;
  formId?: string;
  submitting?: boolean;
};

export function SmartIntakeNavigation({
  stepIndex,
  isLastStep,
  onBack,
  onSaveExit,
  onContinue,
  formId,
  submitting,
}: Props) {
  const { t } = useTranslation('intake');

  return (
    <footer className="si-nav">
      <div className="si-nav__actions">
        {stepIndex > 0 ? (
          <button type="button" className="si-btn si-btn--ghost" onClick={onBack}>
            ← {t('nav.back')}
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="si-btn si-btn--ghost si-btn--save" onClick={onSaveExit}>
          <BookmarkIcon />
          {t('nav.saveExit')}
        </button>
        <button
          type="submit"
          form={formId}
          className="si-btn si-btn--primary"
          disabled={submitting}
          onClick={(e) => {
            if (!formId) {
              e.preventDefault();
              onContinue();
            }
          }}
        >
          {submitting ? t('nav.working') : isLastStep ? t('nav.generateRoadmap') : `${t('nav.continue')} →`}
        </button>
      </div>
      <p className="si-nav__autosave">
        <LockIcon />
        {t('nav.autosave')}
      </p>
    </footer>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M6 4h12v16l-6-4-6 4V4z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}
