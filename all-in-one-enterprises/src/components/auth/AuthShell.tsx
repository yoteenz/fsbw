import type { ReactNode } from 'react';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AuthHeader } from './AuthHeader';

type Props = {
  children: ReactNode;
};

/** Full-screen premium authentication shell — mobile + desktop split layout. */
export function AuthShell({ children }: Props) {
  return (
    <div className="aio-auth-premium">
      <div className="aio-auth-premium__bg" aria-hidden="true" />
      <div className="aio-auth-premium__layout">
        <AuthBrandPanel />
        <div className="aio-auth-premium__form-column">
          <AuthHeader />
          <main className="aio-auth-premium__main">{children}</main>
          <footer className="aio-auth-premium__footer">
            <p>Secure access for All In One Enterprises Inc.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
