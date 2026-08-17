import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { getAioLoginHeroImageUrl } from '../../config/aioPublicAssets';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AuthHeader } from './AuthHeader';

type Props = {
  children: ReactNode;
  /** Login-specific integrated hero composition on mobile */
  variant?: 'default' | 'login';
};

/** Full-screen premium authentication shell — mobile + desktop split layout. */
export function AuthShell({ children, variant = 'default' }: Props) {
  const isLogin = variant === 'login';
  const loginHeroUrl = isLogin ? getAioLoginHeroImageUrl() : '';

  useEffect(() => {
    if (!isLogin || !loginHeroUrl) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = loginHeroUrl;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [isLogin, loginHeroUrl]);

  const shellStyle = isLogin
    ? ({ ['--aio-auth-login-hero-url' as string]: `url("${loginHeroUrl}")` } as CSSProperties)
    : undefined;

  return (
    <div
      className={`aio-auth-premium${isLogin ? ' aio-auth-premium--login' : ''}`}
      style={shellStyle}
    >
      <div className="aio-auth-premium__bg" aria-hidden="true" />
      <div className="aio-auth-premium__layout">
        <AuthBrandPanel variant={variant} />
        <div className="aio-auth-premium__form-column">
          <AuthHeader showLogo={!isLogin} />
          <main className="aio-auth-premium__main">{children}</main>
          <footer className="aio-auth-premium__footer">
            <p>Your account information is protected using AIO&apos;s secure authentication system.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
