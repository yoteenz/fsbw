import { Link, useLocation } from 'react-router-dom';
import { SITE00_GLOBAL_NAV } from '../../config/navigation';
import { SITE00_ROUTES, site00NavPathIsActive } from '../../config/routes';

type Site00MobileMenuDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/** Global SITE 00 mobile navigation — opened from header hamburger. */
export function Site00MobileMenuDrawer({ open, onClose }: Site00MobileMenuDrawerProps) {
  const { pathname } = useLocation();

  if (!open) return null;

  return (
    <>
      <button type="button" className="site00-mobile-menu__backdrop" aria-label="Close menu" onClick={onClose} />
      <aside
        id="site00-mobile-menu"
        className="site00-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="SITE 00 navigation"
      >
        <div className="site00-mobile-menu__header">
          <span className="site00-label">SITE 00</span>
          <button type="button" className="site00-mobile-menu__close" onClick={onClose} aria-label="Close menu">
            ×
          </button>
        </div>
        <nav aria-label="Global SITE 00 links">
          <ul className="site00-mobile-menu__list">
            <li>
              <Link
                to={SITE00_ROUTES.originAlias}
                onClick={onClose}
                aria-current={site00NavPathIsActive(pathname, SITE00_ROUTES.originAlias) ? 'page' : undefined}
              >
                ORIGIN
              </Link>
            </li>
            <li>
              <Link
                to={SITE00_ROUTES.locations}
                onClick={onClose}
                aria-current={pathname.startsWith(SITE00_ROUTES.locations) ? 'page' : undefined}
              >
                LOCATIONS
              </Link>
            </li>
            {SITE00_GLOBAL_NAV.map((item) => (
              <li key={item.id}>
                {item.enabled ? (
                  <Link
                    to={item.href}
                    onClick={onClose}
                    aria-current={site00NavPathIsActive(pathname, item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="site00-mobile-menu__disabled">{item.label}</span>
                )}
              </li>
            ))}
            <li>
              <Link
                to={SITE00_ROUTES.bldr}
                onClick={onClose}
                aria-current={pathname.startsWith(SITE00_ROUTES.bldr) ? 'page' : undefined}
              >
                BLDR / START BUILD
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
