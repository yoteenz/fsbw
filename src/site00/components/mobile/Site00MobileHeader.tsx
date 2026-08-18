import { Site00LogoBlock } from '../shell/Site00LogoBlock';
import { Site00HamburgerIcon } from './Site00MobileIcons';

type Site00MobileHeaderProps = {
  onMenuOpen: () => void;
  menuExpanded?: boolean;
};

/** Screen 01 mobile header — SITE 00 mark + hamburger (no location bracket). */
export function Site00MobileHeader({ onMenuOpen, menuExpanded = false }: Site00MobileHeaderProps) {
  return (
    <header className="site00-mobile-header">
      <Site00LogoBlock showBracket={false} />
      <button
        type="button"
        className="site00-mobile-header__menu"
        aria-label="Open SITE 00 navigation menu"
        aria-expanded={menuExpanded}
        aria-controls="site00-mobile-menu"
        onClick={onMenuOpen}
      >
        <Site00HamburgerIcon size={20} />
      </button>
    </header>
  );
}
