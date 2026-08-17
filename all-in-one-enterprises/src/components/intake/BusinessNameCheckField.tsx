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
import { AIOButton } from '../AIOButton';
import { formatAppDate } from '../../i18n/format';

type Props = {
  answers: IntakeAnswers;
  onChange: (answers: IntakeAnswers) => void;
  field: string;
  inputId: string;
  label: string;
  description?: string;
  error?: string;
};

export function BusinessNameCheckField({
  answers,
  onChange,
  field,
  inputId,
  label,
  description,
  error,
}: Props) {
  const { t, i18n } = useTranslation('intake');
  const [checking, setChecking] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);

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

  const statusClass = displayStatus !== 'idle' ? `aio-name-check__status--${displayStatus}` : '';

  return (
    <div className="aio-intake-field aio-name-check">
      <label htmlFor={inputId} className="aio-intake-label">
        {label}
      </label>
      {description && <p className="aio-intake-desc">{description}</p>}

      <input
        id={inputId}
        type="text"
        className="aio-intake-input"
        value={businessName}
        onChange={(e) => updateName(e.target.value)}
        autoComplete="organization"
        aria-describedby={`${inputId}-status`}
      />

      <div className="aio-name-check__actions">
        <AIOButton
          type="button"
          variant="gold"
          onClick={() => void runCheck()}
          disabled={checking}
          aria-busy={checking}
        >
          {checking ? t('nameCheck.checkingButton') : t('nameCheck.checkButton')}
        </AIOButton>
      </div>

      <div
        id={`${inputId}-status`}
        ref={liveRef}
        className={`aio-name-check__status ${statusClass}`}
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        {displayStatus === 'checking' && (
          <p className="aio-name-check__status-line">
            {t('nameCheck.checkingRegistry', { state: stateLabel || formationState })}
          </p>
        )}

        {displayStatus === 'stale_result' && (
          <p className="aio-name-check__status-line aio-name-check__status-line--warn">
            {t('nameCheck.stale')}
          </p>
        )}

        {displayStatus === 'likely_available' && nameCheck && (
          <>
            <p className="aio-name-check__status-line aio-name-check__status-line--ok">
              {t('nameCheck.likelyAvailable')}
            </p>
            <p className="aio-name-check__status-detail">{nameCheck.message}</p>
            <p className="aio-name-check__disclaimer">{t('nameCheck.disclaimer', { state: stateLabel })}</p>
          </>
        )}

        {displayStatus === 'possible_conflict' && nameCheck && (
          <>
            <p className="aio-name-check__status-line aio-name-check__status-line--warn">
              {t('nameCheck.possibleConflict')}
            </p>
            <p className="aio-name-check__status-detail">{nameCheck.message}</p>
            {nameCheck.topMatches.length > 0 && (
              <ul className="aio-name-check__matches">
                {nameCheck.topMatches.slice(0, 5).map((m) => (
                  <li key={`${m.name}-${m.controlNumber ?? ''}`}>{m.name}</li>
                ))}
              </ul>
            )}
            <div className="aio-name-check__inline-actions">
              <button type="button" className="aio-name-check__link" onClick={() => document.getElementById(inputId)?.focus()}>
                {t('nameCheck.editName')}
              </button>
              <button type="button" className="aio-name-check__link" onClick={() => void runCheck()} disabled={checking}>
                {t('nameCheck.checkAgain')}
              </button>
            </div>
          </>
        )}

        {displayStatus === 'unavailable' && nameCheck && (
          <>
            <p className="aio-name-check__status-line aio-name-check__status-line--bad">
              {t('nameCheck.unavailable')}
            </p>
            <p className="aio-name-check__status-detail">{nameCheck.message}</p>
            {nameCheck.topMatches[0] && (
              <p className="aio-name-check__match-highlight">{nameCheck.topMatches[0].name}</p>
            )}
            <div className="aio-name-check__inline-actions">
              <button type="button" className="aio-name-check__link" onClick={() => document.getElementById(inputId)?.focus()}>
                {t('nameCheck.editName')}
              </button>
              <button type="button" className="aio-name-check__link" onClick={() => void runCheck()} disabled={checking}>
                {t('nameCheck.checkAnother')}
              </button>
            </div>
          </>
        )}

        {(displayStatus === 'lookup_unavailable' || displayStatus === 'manual_review_required') && nameCheck && (
          <>
            <p className="aio-name-check__status-line aio-name-check__status-line--warn">
              {t('nameCheck.manualRequired')}
            </p>
            <p className="aio-name-check__status-detail">
              {t('nameCheck.manualDetail', { state: stateLabel || formationState })}
            </p>
            <div className="aio-name-check__inline-actions">
              <button type="button" className="aio-name-check__link" onClick={() => void runCheck()} disabled={checking}>
                {t('nameCheck.tryAgain')}
              </button>
            </div>
          </>
        )}

        {displayStatus === 'error' && nameCheck && (
          <>
            <p className="aio-name-check__status-line aio-name-check__status-line--bad">
              {t('nameCheck.errorTitle')}
            </p>
            <p className="aio-name-check__status-detail">{nameCheck.message ?? t('nameCheck.errorBody')}</p>
            <div className="aio-name-check__inline-actions">
              <button type="button" className="aio-name-check__link" onClick={() => void runCheck()} disabled={checking}>
                {t('nameCheck.tryAgain')}
              </button>
            </div>
          </>
        )}

        {nameCheck?.checkedAt && displayStatus !== 'idle' && displayStatus !== 'checking' && displayStatus !== 'stale_result' && (
          <p className="aio-name-check__checked-at">
            {t('nameCheck.checkedAt', { date: formatAppDate(nameCheck.checkedAt, i18n.language) })}
          </p>
        )}
      </div>

      {(error || localError) && (
        <p className="aio-intake-error" role="alert">
          {error ?? localError}
        </p>
      )}
    </div>
  );
}
