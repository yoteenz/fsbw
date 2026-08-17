import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IntakeAnswers, BusinessStructure } from '../../intake/intakeTypes';
import { getFieldValue, setFieldValue } from '../../intake/intakeRules';
import { requestBusinessNameCheck } from '../../business-formation/businessNameRegistry/nameCheckClient';
import {
  effectiveDisplayStatus,
  invalidateNameCheckOnInputChange,
} from '../../business-formation/businessNameRegistry/staleLogic';
import type { BusinessNameCheckStatus } from '../../business-formation/businessNameRegistry/types';
import { getStateRegistryCapability } from '../../business-formation/businessNameRegistry/stateCapabilities';
import { createBusinessNameReviewTask } from '../../demo/businessNameCheckActions';
import { formatAppDate } from '../../i18n/format';

type Props = {
  answers: IntakeAnswers;
  onChange: (answers: IntakeAnswers) => void;
  field: string;
  inputId: string;
  label: string;
  description?: string;
  error?: string;
  variant?: 'legacy' | 'smart';
};

export function BusinessNameCheckField({
  answers,
  onChange,
  field,
  inputId,
  label,
  description,
  error,
  variant = 'legacy',
}: Props) {
  const { t, i18n } = useTranslation('intake');
  const [checking, setChecking] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);
  const isSmart = variant === 'smart';

  const businessName = (getFieldValue(answers, field) as string | undefined) ?? '';
  const formationState = answers.business?.formationState ?? '';
  const entityStructure = answers.business?.structure;
  const nameCheck = answers.business?.nameCheck;

  const displayStatus: BusinessNameCheckStatus = checking
    ? 'checking'
    : effectiveDisplayStatus(nameCheck, {
        businessNameRaw: businessName,
        formationState,
        entityStructure,
      });

  const stateLabel = useMemo(() => {
    if (!formationState) return '';
    return getStateRegistryCapability(formationState).stateName;
  }, [formationState]);

  const updateName = (value: string) => {
    const nextAnswers = setFieldValue(answers, field, value || undefined);
    const invalidated = invalidateNameCheckOnInputChange(nextAnswers.business?.nameCheck, {
      businessNameRaw: value,
      formationState: nextAnswers.business?.formationState,
      entityStructure: nextAnswers.business?.structure,
    });
    onChange({
      ...nextAnswers,
      business: {
        ...nextAnswers.business,
        nameCheck: invalidated,
      },
    });
    setLocalError(null);
    setDetailsOpen(false);
  };

  const runCheck = useCallback(async () => {
    if (!businessName.trim()) {
      setLocalError(t('nameCheck.errors.emptyName'));
      return;
    }
    if (!formationState) {
      setLocalError(t('nameCheck.errors.missingState'));
      return;
    }

    setChecking(true);
    setLocalError(null);
    liveRef.current?.focus();

    try {
      const result = await requestBusinessNameCheck({
        state: formationState,
        businessName,
        entityType: entityStructure as BusinessStructure | undefined,
      });

      onChange({
        ...answers,
        business: {
          ...answers.business,
          nameCheck: result,
        },
      });

      if (result.manualReviewRequired) {
        createBusinessNameReviewTask({
          businessName: result.businessNameRaw,
          formationState: result.formationState,
          entityStructure: result.entityStructure,
          status: result.status,
        });
      }
    } catch {
      setLocalError(t('nameCheck.errors.generic'));
    } finally {
      setChecking(false);
    }
  }, [answers, businessName, entityStructure, formationState, onChange, t]);

  const rootClass = isSmart ? 'si-name-check' : 'aio-intake-field aio-name-check';

  return (
    <div className={rootClass}>
      {label && (
        <label htmlFor={inputId} className={isSmart ? 'si-field__desc' : 'aio-intake-label'}>
          {label}
        </label>
      )}
      {description && <p className={isSmart ? 'si-name-check__desc' : 'aio-intake-desc'}>{description}</p>}

      <div className={isSmart ? 'si-name-check__row' : undefined}>
        <input
          id={inputId}
          type="text"
          className={isSmart ? 'si-input si-name-check__input' : 'aio-intake-input'}
          value={businessName}
          onChange={(e) => updateName(e.target.value)}
          autoComplete="organization"
          aria-describedby={`${inputId}-status`}
          placeholder={isSmart ? t('business.namePlaceholder') : undefined}
        />

        <button
          type="button"
          className={isSmart ? 'si-btn si-btn--primary si-name-check__btn' : 'aio-btn aio-btn--gold'}
          onClick={() => void runCheck()}
          disabled={checking}
          aria-busy={checking}
        >
          {checking ? t('nameCheck.checkingButton') : isSmart ? t('nameCheck.checkButtonShort') : t('nameCheck.checkButton')}
        </button>
      </div>

      <div
        id={`${inputId}-status`}
        ref={liveRef}
        className={`${isSmart ? 'si-name-check__result' : 'aio-name-check__status'} si-name-check__result--${displayStatus}`}
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        {displayStatus === 'checking' && (
          <p className="si-name-check__line">{t('nameCheck.checkingRegistry', { state: stateLabel || formationState })}</p>
        )}

        {displayStatus === 'stale_result' && (
          <div className="si-name-check__banner si-name-check__banner--warn">
            <p>{t('nameCheck.stale')}</p>
          </div>
        )}

        {displayStatus === 'likely_available' && nameCheck && (
          <div className="si-name-check__banner si-name-check__banner--success">
            <p className="si-name-check__banner-title">
              {t('nameCheck.greatNews', { name: businessName, state: stateLabel })}
            </p>
            <p className="si-name-check__banner-detail">{nameCheck.message}</p>
            <button type="button" className="si-name-check__details-toggle" onClick={() => setDetailsOpen((o) => !o)}>
              {detailsOpen ? t('nameCheck.hideDetails') : t('nameCheck.viewDetails')}
            </button>
            {detailsOpen && (
              <p className="si-name-check__legal">{t('nameCheck.legalDisclaimer')}</p>
            )}
          </div>
        )}

        {displayStatus === 'possible_conflict' && nameCheck && (
          <div className="si-name-check__banner si-name-check__banner--warn">
            <p className="si-name-check__banner-title">{t('nameCheck.conflictFound')}</p>
            <p>{nameCheck.message}</p>
            {nameCheck.topMatches.length > 0 && (
              <ul className="si-name-check__matches">
                {nameCheck.topMatches.slice(0, 5).map((m) => (
                  <li key={`${m.name}-${m.controlNumber ?? ''}`}>{m.name}</li>
                ))}
              </ul>
            )}
            <div className="si-name-check__inline-actions">
              <button type="button" className="si-link" onClick={() => setDetailsOpen((o) => !o)}>
                {t('nameCheck.viewMatches')}
              </button>
              <button type="button" className="si-link" onClick={() => document.getElementById(inputId)?.focus()}>
                {t('nameCheck.tryAnotherName')}
              </button>
            </div>
          </div>
        )}

        {displayStatus === 'unavailable' && nameCheck && (
          <div className="si-name-check__banner si-name-check__banner--error">
            <p className="si-name-check__banner-title">{t('nameCheck.unavailable')}</p>
            <p>{nameCheck.message}</p>
            <div className="si-name-check__inline-actions">
              <button type="button" className="si-link" onClick={() => document.getElementById(inputId)?.focus()}>
                {t('nameCheck.tryAnotherName')}
              </button>
            </div>
          </div>
        )}

        {(displayStatus === 'lookup_unavailable' || displayStatus === 'manual_review_required') && nameCheck && (
          <div className="si-name-check__banner si-name-check__banner--warn">
            <p className="si-name-check__banner-title">{t('nameCheck.unableToVerify')}</p>
            <p>{t('nameCheck.manualDetail', { state: stateLabel || formationState })}</p>
          </div>
        )}

        {displayStatus === 'error' && nameCheck && (
          <div className="si-name-check__banner si-name-check__banner--error">
            <p className="si-name-check__banner-title">{t('nameCheck.errorTitle')}</p>
            <p>{nameCheck.message ?? t('nameCheck.errorBody')}</p>
            <button type="button" className="si-link" onClick={() => void runCheck()} disabled={checking}>
              {t('nameCheck.tryAgain')}
            </button>
          </div>
        )}

        {nameCheck?.checkedAt && displayStatus !== 'idle' && displayStatus !== 'checking' && displayStatus !== 'stale_result' && !isSmart && (
          <p className="aio-name-check__checked-at">
            {t('nameCheck.checkedAt', { date: formatAppDate(nameCheck.checkedAt, i18n.language) })}
          </p>
        )}
      </div>

      {(error || localError) && (
        <p className={isSmart ? 'si-field-error' : 'aio-intake-error'} role="alert">
          {error ?? localError}
        </p>
      )}
    </div>
  );
}
