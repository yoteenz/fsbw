import { useId, useState, type ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  id?: string;
  icon?: ReactNode;
};

export function AuthPasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  id,
  icon,
}: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="aio-auth-premium__field">
      <label className="aio-auth-premium__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="aio-auth-premium__input-wrap aio-auth-premium__input-wrap--icon aio-auth-premium__input-wrap--password">
        {icon ? <span className="aio-auth-premium__input-icon">{icon}</span> : null}
        <input
          id={fieldId}
          className="aio-auth-premium__input aio-auth-premium__input--password"
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="aio-auth-premium__password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}
