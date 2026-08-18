import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileEnvironmentBackground } from './MobileEnvironmentBackground';
import { Site00MobileHeader } from './Site00MobileHeader';
import { Site00MobileNav } from './Site00MobileNav';
import { Site00MobileMenuDrawer } from './Site00MobileMenuDrawer';
import type { Site00MobileNavId } from '../../config/locations-directory';
import { isLocationsCompositionDebugEnabled } from '../../config/locations-composition-map';
import { LocationsCompositionDebug } from '../locations/LocationsCompositionDebug';

type Site00MobileShellProps = {
  activeNav: Site00MobileNavId;
  children: ReactNode;
  enterClassName?: string;
};

/**
 * Mobile-only SITE 00 shell — Screen 01 Locations and related surfaces.
 * Desktop routes must not use this component.
 */
export function Site00MobileShell({ activeNav, children, enterClassName = '' }: Site00MobileShellProps) {
  const { search } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const debug = isLocationsCompositionDebugEnabled(search);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className={`site00-mobile-shell ${enterClassName}`.trim()}>
      <MobileEnvironmentBackground />
      <div className="site00-mobile-shell__content">
        <Site00MobileHeader onMenuOpen={() => setMenuOpen(true)} menuExpanded={menuOpen} />
        <main className="site00-mobile-shell__main">{children}</main>
        <Site00MobileNav active={activeNav} />
      </div>
      <Site00MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      {debug ? <LocationsCompositionDebug /> : null}
    </div>
  );
}
