import { useState } from 'react';
import type { IntakeAnswers, IntakeQuestion } from '../intake/intakeTypes';
import { getFieldValue, setFieldValue, validateField } from '../intake/intakeRules';
import { BusinessNameCheckField } from './intake/BusinessNameCheckField';

type Props = {
  question: IntakeQuestion;
  answers: IntakeAnswers;
  onChange: (answers: IntakeAnswers) => void;
  error?: string;
};

export function IntakeQuestionField({ question, answers, onChange, error }: Props) {
  const value = getFieldValue(answers, question.field);
  const inputId = `intake-${question.id}`;

  const update = (val: unknown) => {
    onChange(setFieldValue(answers, question.field, val));
  };

  if (question.type === 'single_select' && question.options) {
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
    return (
      <fieldset className="aio-intake-fieldset">
        <legend className="aio-intake-legend">{question.question}</legend>
        {question.description && <p className="aio-intake-desc">{question.description}</p>}
        <div className="aio-intake-checkboxes">
          {question.options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label key={opt.value} className={`aio-intake-checkbox ${checked ? 'aio-intake-checkbox--checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? selected.filter((v) => v !== opt.value) : [...selected, opt.value];
                    update(next);
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
        {error && (
          <p className="aio-intake-error" role="alert">
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
        label={question.question}
        description={question.description}
        error={error}
      />
    );
  }

  if (question.type === 'select' && question.options) {
    return (
      <div className="aio-intake-field">
        <label htmlFor={inputId} className="aio-intake-label">
          {question.question}
        </label>
        <select
          id={inputId}
          className="aio-intake-input"
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
          <p className="aio-intake-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (question.type === 'number') {
    return (
      <div className="aio-intake-field">
        <label htmlFor={inputId} className="aio-intake-label">
          {question.question}
        </label>
        <input
          id={inputId}
          type="number"
          min={0}
          className="aio-intake-input"
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => update(e.target.value === '' ? undefined : Number(e.target.value))}
        />
        {error && (
          <p className="aio-intake-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (question.type === 'date') {
    return (
      <div className="aio-intake-field">
        <label htmlFor={inputId} className="aio-intake-label">
          {question.question}
        </label>
        <input
          id={inputId}
          type="date"
          className="aio-intake-input"
          value={(value as string) ?? ''}
          onChange={(e) => update(e.target.value || undefined)}
        />
        {error && (
          <p className="aio-intake-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (question.type === 'textarea') {
    return (
      <div className="aio-intake-field">
        <label htmlFor={inputId} className="aio-intake-label">
          {question.question}
        </label>
        <textarea
          id={inputId}
          className="aio-intake-input aio-intake-textarea"
          rows={4}
          value={(value as string) ?? ''}
          onChange={(e) => update(e.target.value || undefined)}
        />
        {error && (
          <p className="aio-intake-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // text default
  return (
    <div className="aio-intake-field">
      <label htmlFor={inputId} className="aio-intake-label">
        {question.question}
      </label>
      <input
        id={inputId}
        type="text"
        className="aio-intake-input"
        value={(value as string) ?? ''}
        onChange={(e) => update(e.target.value || undefined)}
      />
      {error && (
        <p className="aio-intake-error" role="alert">
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
