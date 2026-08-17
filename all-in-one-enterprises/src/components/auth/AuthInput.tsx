import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  optional?: boolean;
  icon?: ReactNode;
};

export function AuthInput({ label, optional, icon, id, ...inputProps }: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className="aio-auth-premium__field">
      <label className="aio-auth-premium__label" htmlFor={fieldId}>
        {label}
        {optional ? <span className="aio-auth-premium__optional"> (optional)</span> : null}
      </label>
      <div className={`aio-auth-premium__input-wrap${icon ? ' aio-auth-premium__input-wrap--icon' : ''}`}>
        {icon ? <span className="aio-auth-premium__input-icon">{icon}</span> : null}
        <input id={fieldId} className="aio-auth-premium__input" {...inputProps} />
      </div>
    </div>
  );
}
