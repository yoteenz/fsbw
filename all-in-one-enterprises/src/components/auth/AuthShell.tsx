import type { ReactNode } from 'react';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AuthHeader } from './AuthHeader';

type Props = {
  children: ReactNode;
  /** Login-specific finite top hero on mobile; desktop split unchanged */
  variant?: 'default' | 'login';
};

/** Full-screen premium authentication shell — mobile + desktop split layout. */
export function AuthShell({ children, variant = 'default' }: Props) {
  const isLogin = variant === 'login';

  return (
    <div className={`aio-auth-premium${isLogin ? ' aio-auth-premium--login' : ''}`}>
      <div
        className={`aio-auth-premium__bg${isLogin ? ' aio-auth-premium__bg--login-solid' : ''}`}
        aria-hidden="true"
      />
      <div className={`aio-auth-premium__layout${isLogin ? ' aio-auth-premium__layout--login' : ''}`}>
        <AuthBrandPanel variant={variant} />
        <div className="aio-auth-premium__form-column">
          {!isLogin ? <AuthHeader showLogo /> : null}
          {isLogin ? (
            <div className="aio-auth-premium__login-desktop-header">
              <AuthHeader showLogo={false} />
            </div>
          ) : null}
          <main className={`aio-auth-premium__main${isLogin ? ' aio-auth-premium__main--login' : ''}`}>
            {children}
          </main>
          <footer className="aio-auth-premium__footer">
            <p>Your account information is protected using AIO&apos;s secure authentication system.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
