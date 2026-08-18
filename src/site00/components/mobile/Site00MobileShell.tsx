import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileEnvironmentBackground } from './MobileEnvironmentBackground';
import { Site00MobileHeader } from './Site00MobileHeader';
import { Site00MobileNav } from './Site00MobileNav';
import { Site00MobileMenuDrawer } from './Site00MobileMenuDrawer';
import type { Site00MobileNavId } from '../../config/locations-directory';
import { isLocationsCompositionDebugEnabled } from '../../config/locations-composition-map';
import { isBldrCompositionDebugEnabled } from '../../config/bldr-composition-map';
import { LocationsCompositionDebug } from '../locations/LocationsCompositionDebug';
import { BldrCompositionDebug } from '../bldr/BldrCompositionDebug';

type Site00MobileShellProps = {
  activeNav: Site00MobileNavId;
  children: ReactNode;
  enterClassName?: string;
  /** When false, page supplies its own pale shell background (Screen 02 BLDR entry). */
  showEnvironmentBackground?: boolean;
  shellClassName?: string;
};

/**
 * Mobile-only SITE 00 shell — Screen 01 Locations, Screen 02 BLDR entry, and related surfaces.
 * Desktop routes must not use this component.
 */
export function Site00MobileShell({
  activeNav,
  children,
  enterClassName = '',
  showEnvironmentBackground = true,
  shellClassName = '',
}: Site00MobileShellProps) {
  const { search, pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const locationsDebug = isLocationsCompositionDebugEnabled(search) && pathname.startsWith('/origin/locations');
  const bldrDebug = isBldrCompositionDebugEnabled(search) && pathname.startsWith('/bldr');

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className={`site00-mobile-shell ${shellClassName} ${enterClassName}`.trim()}>
      {showEnvironmentBackground ? <MobileEnvironmentBackground /> : null}
      <div className="site00-mobile-shell__content">
        <Site00MobileHeader
          onMenuOpen={() => setMenuOpen(true)}
          menuExpanded={menuOpen}
          menuButtonRef={menuTriggerRef}
        />
        <main className="site00-mobile-shell__main">{children}</main>
        <Site00MobileNav active={activeNav} />
      </div>
      <Site00MobileMenuDrawer open={menuOpen} onClose={closeMenu} returnFocusRef={menuTriggerRef} />
      {locationsDebug ? <LocationsCompositionDebug /> : null}
      {bldrDebug ? <BldrCompositionDebug /> : null}
    </div>
  );
}
