import type { ReactNode } from 'react';
import { Site00LogoBlock } from './Site00LogoBlock';
import { GlobalNav } from './GlobalNav';
import { EntryToggle } from './EntryToggle';

type Site00AppShellProps = {
  children: ReactNode;
  locationLabel?: string;
  showStatusStrip?: boolean;
  statusStrip?: ReactNode;
  /** Origin homepage mobile — hide logo/location, center global nav */
  mobileOriginHeader?: boolean;
};

export function Site00AppShell({
  children,
  locationLabel,
  showStatusStrip = false,
  statusStrip,
  mobileOriginHeader = false,
}: Site00AppShellProps) {
  return (
    <>
      <header
        className={`site00-safe-ui site00-app-shell-header ${mobileOriginHeader ? 'site00-app-shell-header--origin-mobile' : ''}`.trim()}
      >
        <div className="site00-app-shell-header__logo">
          <Site00LogoBlock locationLabel={locationLabel} />
        </div>
        <div className="site00-app-shell-header__nav">
          <GlobalNav />
        </div>
        <div className="site00-app-shell-header__entry">
          <EntryToggle />
        </div>
      </header>
      <main>{children}</main>
      {showStatusStrip && statusStrip ? (
        <footer
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 'var(--site-z-nav)',
          }}
        >
          {statusStrip}
        </footer>
      ) : null}
    </>
  );
}
