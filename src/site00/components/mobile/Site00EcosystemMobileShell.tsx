import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Site00MobileHeader } from './Site00MobileHeader';
import { Site00MobileMenuDrawer } from './Site00MobileMenuDrawer';
import { Site00EcosystemMobileNav } from '../ecosystem/Site00EcosystemMobileNav';
import type { EcosystemNavId } from '../../config/ecosystem-nav';

type Site00EcosystemMobileShellProps = {
  activeNav: EcosystemNavId;
  children: ReactNode;
  shellClassName?: string;
};

/** Mobile shell for authenticated SITE 00 ecosystem pages. */
export function Site00EcosystemMobileShell({ activeNav, children, shellClassName = '' }: Site00EcosystemMobileShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className={`site00-mobile-shell site00-ecosystem-mobile-shell ${shellClassName}`.trim()}>
      <div className="site00-mobile-shell__content">
        <Site00MobileHeader
          onMenuOpen={() => setMenuOpen(true)}
          menuExpanded={menuOpen}
          menuButtonRef={menuTriggerRef}
        />
        <main className="site00-mobile-shell__main site00-ecosystem-mobile-shell__main">{children}</main>
        <Site00EcosystemMobileNav active={activeNav} />
      </div>
      <Site00MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusRef={menuTriggerRef} />
    </div>
  );
}
