import { useEffect, type ReactNode } from 'react';
import { getAioLoginHeroImageUrl } from '../../config/aioPublicAssets';
import { AuthHeader } from './AuthHeader';

type Props = {
  children: ReactNode;
};

/** Finite top hero for mobile login — truck image ends before the form section. */
export function AuthLoginHero({ children }: Props) {
  const heroUrl = getAioLoginHeroImageUrl();

  useEffect(() => {
    if (!heroUrl) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroUrl;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [heroUrl]);

  return (
    <section className="aio-auth-login-hero" aria-label="Welcome">
      <img
        className="aio-auth-login-hero__image"
        src={heroUrl}
        alt=""
        decoding="async"
        fetchPriority="high"
      />
      <div className="aio-auth-login-hero__overlay" aria-hidden="true" />
      <div className="aio-auth-login-hero__content">
        <AuthHeader showLogo={false} />
        {children}
      </div>
    </section>
  );
}
