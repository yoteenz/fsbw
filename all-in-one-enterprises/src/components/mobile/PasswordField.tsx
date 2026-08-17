import { useId, useState } from 'react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  id?: string;
};

export function PasswordField({ label, value, onChange, autoComplete, required, minLength, id }: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <label className="aio-password-field" htmlFor={fieldId}>
      <span className="aio-password-field__label">{label}</span>
      <span className="aio-password-field__wrap">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="aio-password-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </span>
    </label>
  );
}
