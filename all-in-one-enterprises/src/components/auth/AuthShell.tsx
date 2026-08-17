import type { ReactNode } from 'react';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AuthHeader } from './AuthHeader';

type Props = {
  children: ReactNode;
  /** Login-specific integrated hero composition on mobile */
  variant?: 'default' | 'login';
};

/** Full-screen premium authentication shell — mobile + desktop split layout. */
export function AuthShell({ children, variant = 'default' }: Props) {
  return (
    <div className={`aio-auth-premium${variant === 'login' ? ' aio-auth-premium--login' : ''}`}>
      <div className="aio-auth-premium__bg" aria-hidden="true" />
      <div className="aio-auth-premium__layout">
        <AuthBrandPanel />
        <div className="aio-auth-premium__form-column">
          <AuthHeader />
          <main className="aio-auth-premium__main">{children}</main>
          <footer className="aio-auth-premium__footer">
            <p>Your account information is protected using AIO&apos;s secure authentication system.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
