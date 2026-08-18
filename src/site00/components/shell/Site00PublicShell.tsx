import type { ReactNode } from 'react';
import type { Site00MobileNavId } from '../../config/locations-directory';
import { Site00PageEnvironment } from './Site00PageEnvironment';
import { Site00PublicSidebar } from './Site00PublicSidebar';
import { Site00PublicTopNav } from './Site00PublicTopNav';
import { Site00PageFooter } from './Site00PageFooter';
import { Site00MobileShell } from '../mobile/Site00MobileShell';

type Site00PublicShellProps = {
  children: ReactNode;
  /** Mobile bottom nav active tab */
  mobileActiveNav?: Site00MobileNavId;
  /** Skip mobile environment — page shell provides approved mobile bg */
  className?: string;
};

/**
 * Shared responsive shell for SITE 00 public/marketing routes.
 * Desktop: left rail + top nav + approved background.
 * Mobile: header + bottom nav + approved mobile background.
 */
export function Site00PublicShell({
  children,
  mobileActiveNav = 'origin',
  className = '',
}: Site00PublicShellProps) {
  return (
    <div className={`site00-public-shell ${className}`.trim()}>
      <Site00PageEnvironment />

      <div className="site00-public-shell__desktop">
        <Site00PublicSidebar />
        <div className="site00-public-shell__workspace">
          <header className="site00-public-shell__top">
            <Site00PublicTopNav />
          </header>
          <main className="site00-public-shell__main">{children}</main>
          <Site00PageFooter />
        </div>
      </div>

      <div className="site00-public-shell__mobile">
        <Site00MobileShell activeNav={mobileActiveNav} showEnvironmentBackground={false} shellClassName="site00-public-mobile-shell">
          <div className="site00-public-mobile">
            <main className="site00-public-mobile__main">{children}</main>
            <Site00PageFooter />
          </div>
        </Site00MobileShell>
      </div>
    </div>
  );
}
