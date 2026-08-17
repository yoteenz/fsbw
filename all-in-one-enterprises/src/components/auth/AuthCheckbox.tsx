import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  label: ReactNode;
};
// label accepts string or rich content (e.g. Terms links)

export function AuthCheckbox({ label, id, ...inputProps }: Props) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <label className="aio-auth-premium__checkbox" htmlFor={fieldId}>
      <input id={fieldId} type="checkbox" className="aio-auth-premium__checkbox-input" {...inputProps} />
      <span className="aio-auth-premium__checkbox-box" aria-hidden="true" />
      <span className="aio-auth-premium__checkbox-label">{label}</span>
    </label>
  );
}
