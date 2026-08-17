import { useState } from 'react';
import type { IntakeAnswers, IntakeQuestion } from '../intake/intakeTypes';
import { getFieldValue, setFieldValue, validateField } from '../intake/intakeRules';
import { BusinessNameCheckField } from './intake/BusinessNameCheckField';
import { SmartIntakeChoiceGrid } from './smart-intake/SmartIntakeChoiceGrid';
import { choiceLayoutForQuestion } from '../intake/smartIntakeMeta';

type Props = {
  question: IntakeQuestion;
  answers: IntakeAnswers;
  onChange: (answers: IntakeAnswers) => void;
  error?: string;
  variant?: 'legacy' | 'smart';
};

export function IntakeQuestionField({ question, answers, onChange, error, variant = 'legacy' }: Props) {
  const value = getFieldValue(answers, question.field);
  const inputId = `intake-${question.id}`;
  const isSmart = variant === 'smart';

  const update = (val: unknown) => {
    onChange(setFieldValue(answers, question.field, val));
  };

  const fieldClass = isSmart ? 'si-field' : 'aio-intake-field';
  const labelClass = isSmart ? 'si-field__label' : 'aio-intake-label';
  const inputClass = isSmart ? 'si-input' : 'aio-intake-input';
  const errorClass = isSmart ? 'si-field-error' : 'aio-intake-error';
  const descClass = isSmart ? 'si-field__desc' : 'aio-intake-desc';

  if (question.type === 'single_select' && question.options) {
    if (isSmart) {
      return (
        <SmartIntakeChoiceGrid
          name={inputId}
          legend={question.question}
          description={question.description}
          options={question.options}
          value={value}
          onChange={update}
          layout={choiceLayoutForQuestion(question.id, question.field)}
          error={error}
        />
      );
    }
    return (
      <fieldset className="aio-intake-fieldset">
        <legend className="aio-intake-legend">{question.question}</legend>
        {question.description && <p className="aio-intake-desc">{question.description}</p>}
        <div className="aio-intake-cards" role="radiogroup" aria-label={question.question}>
          {question.options.map((opt) => (
            <label
              key={opt.value}
              className={`aio-intake-card ${value === opt.value ? 'aio-intake-card--selected' : ''}`}
            >
              <input
                type="radio"
                name={inputId}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => update(opt.value)}
                className="aio-sr-only"
              />
              <span className="aio-intake-card__title">{opt.label}</span>
              {opt.description && <span className="aio-intake-card__desc">{opt.description}</span>}
            </label>
          ))}
        </div>
        {error && (
          <p className="aio-intake-error" role="alert">
            {error}
          </p>
        )}
      </fieldset>
    );
  }

  if (question.type === 'multi_select' && question.options) {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const gridClass = isSmart ? 'si-choice-grid si-choice-grid--multi' : 'aio-intake-checkboxes';
    return (
      <fieldset className={isSmart ? 'si-fieldset' : 'aio-intake-fieldset'}>
        <legend className={isSmart ? 'si-fieldset__legend' : 'aio-intake-legend'}>{question.question}</legend>
        {question.description && <p className={descClass}>{question.description}</p>}
        <div className={gridClass}>
          {question.options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={
                  isSmart
                    ? `si-choice-card si-choice-card--checkbox ${checked ? 'si-choice-card--selected' : ''}`
                    : `aio-intake-checkbox ${checked ? 'aio-intake-checkbox--checked' : ''}`
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? selected.filter((v) => v !== opt.value) : [...selected, opt.value];
                    update(next);
                  }}
                />
                <span className={isSmart ? 'si-choice-card__title' : undefined}>{opt.label}</span>
              </label>
            );
          })}
        </div>
        {error && (
          <p className={errorClass} role="alert">
            {error}
          </p>
        )}
      </fieldset>
    );
  }

  if (question.type === 'business_name_check') {
    return (
      <BusinessNameCheckField
        answers={answers}
        onChange={onChange}
        field={question.field}
        inputId={inputId}
        label={isSmart ? '' : question.question}
        description={isSmart ? question.description : question.description}
        error={error}
        variant={variant}
      />
    );
  }

  if (question.type === 'select' && question.options) {
    return (
      <div className={fieldClass}>
        <label htmlFor={inputId} className={labelClass}>
          {question.question}
        </label>
        <select
          id={inputId}
          className={`${inputClass} ${isSmart ? 'si-select' : ''}`}
          value={(value as string) ?? ''}
          onChange={(e) => update(e.target.value || undefined)}
        >
          <option value="">Select…</option>
          {question.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className={errorClass} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (question.type === 'number') {
    return (
      <div className={fieldClass}>
        <label htmlFor={inputId} className={labelClass}>
          {question.question}
        </label>
        <input
          id={inputId}
          type="number"
          min={0}
          className={inputClass}
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => update(e.target.value === '' ? undefined : Number(e.target.value))}
        />
        {error && (
          <p className={errorClass} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (question.type === 'date') {
    return (
      <div className={fieldClass}>
        <label htmlFor={inputId} className={labelClass}>
          {question.question}
        </label>
        <input
          id={inputId}
          type="date"
          className={inputClass}
          value={(value as string) ?? ''}
          onChange={(e) => update(e.target.value || undefined)}
        />
        {error && (
          <p className={errorClass} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (question.type === 'textarea') {
    return (
      <div className={fieldClass}>
        <label htmlFor={inputId} className={labelClass}>
          {question.question}
        </label>
        <textarea
          id={inputId}
          className={`${inputClass} ${isSmart ? 'si-textarea' : 'aio-intake-textarea'}`}
          rows={4}
          value={(value as string) ?? ''}
          onChange={(e) => update(e.target.value || undefined)}
        />
        {error && (
          <p className={errorClass} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  const inputType =
    question.field === 'contact.email' ? 'email' : question.field === 'contact.phone' ? 'tel' : 'text';

  return (
    <div className={fieldClass}>
      <label htmlFor={inputId} className={labelClass}>
        {question.question}
      </label>
      <input
        id={inputId}
        type={inputType}
        className={inputClass}
        value={(value as string) ?? ''}
        onChange={(e) => update(e.target.value || undefined)}
      />
      {error && (
        <p className={errorClass} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function useIntakeValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (questions: IntakeQuestion[], answers: IntakeAnswers): boolean => {
    const next: Record<string, string> = {};
    for (const q of questions) {
      if (q.required) {
        const val = getFieldValue(answers, q.field);
        const empty =
          val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
        if (empty) next[q.field] = `Please answer: ${q.question}`;
      }
      const val = getFieldValue(answers, q.field);
      const fieldError = validateField(q.field, val);
      if (fieldError) next[q.field] = fieldError;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return { errors, validate, setErrors };
}
