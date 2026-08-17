import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type LinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export function AuthSecondaryButton({ to, children, className = '', ...rest }: LinkProps) {
  return (
    <Link to={to} className={`aio-auth-premium__btn aio-auth-premium__btn--secondary ${className}`.trim()} {...rest}>
      {children}
    </Link>
  );
}
