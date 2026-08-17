import type { ComponentType } from 'react';
import type { IntakeOption } from '../../intake/intakeTypes';
import type { SmartIntakeChoiceLayout } from '../../intake/smartIntakeMeta';

type Props = {
  name: string;
  legend: string;
  description?: string;
  options: IntakeOption[];
  value: unknown;
  onChange: (value: string) => void;
  layout: SmartIntakeChoiceLayout;
  error?: string;
};

const STRUCTURE_ICONS: Record<string, ComponentType> = {
  not_formed: SparkleIcon,
  llc: PeopleIcon,
  corporation: BuildingIcon,
  sole_proprietor: PersonIcon,
  other: MoreIcon,
};

export function SmartIntakeChoiceGrid({
  name,
  legend,
  description,
  options,
  value,
  onChange,
  layout,
  error,
}: Props) {
  const gridClass =
    layout === 'structure'
      ? 'si-choice-grid si-choice-grid--structure'
      : layout === 'goal'
        ? 'si-choice-grid si-choice-grid--goal'
        : layout === 'compact'
          ? 'si-choice-grid si-choice-grid--compact'
          : 'si-choice-grid';

  return (
    <fieldset className="si-fieldset">
      <legend className="si-fieldset__legend">{legend}</legend>
      {description && <p className="si-fieldset__desc">{description}</p>}
      <div className={gridClass} role="radiogroup" aria-label={legend}>
        {options.map((opt) => {
          const selected = value === opt.value;
          const Icon = layout === 'structure' ? STRUCTURE_ICONS[opt.value] : undefined;
          return (
            <label
              key={opt.value}
              className={`si-choice-card ${selected ? 'si-choice-card--selected' : ''} ${layout === 'structure' && opt.value === 'other' ? 'si-choice-card--span' : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="aio-sr-only"
              />
              {selected && (
                <span className="si-choice-card__check" aria-hidden="true">
                  ✓
                </span>
              )}
              {Icon && (
                <span className="si-choice-card__icon" aria-hidden="true">
                  <Icon />
                </span>
              )}
              <span className="si-choice-card__title">{opt.label}</span>
              {opt.description && layout !== 'compact' && (
                <span className="si-choice-card__desc">{opt.description}</span>
              )}
            </label>
          );
        })}
      </div>
      {error && (
        <p className="si-field-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M14 20c0-2 1.5-3.5 4-3.5" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h1M9 11h1M9 15h1M14 7h1M14 11h1M14 15h1" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}
