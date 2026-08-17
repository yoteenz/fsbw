import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
};

export function AuthPrimaryButton({ children, loading, loadingLabel, disabled, ...rest }: Props) {
  return (
    <button
      type="submit"
      className="aio-auth-premium__btn aio-auth-premium__btn--primary"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <>
          <span className="aio-auth-premium__btn-spinner" aria-hidden="true" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
