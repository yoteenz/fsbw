import { useId, type InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  optional?: boolean;
};

export function AuthInput({ label, optional, id, ...inputProps }: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className="aio-auth-premium__field">
      <label className="aio-auth-premium__label" htmlFor={fieldId}>
        {label}
        {optional ? <span className="aio-auth-premium__optional"> (optional)</span> : null}
      </label>
      <input id={fieldId} className="aio-auth-premium__input" {...inputProps} />
    </div>
  );
}
