import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

/** Toggle between mobile-first `/origin` and fixed desktop artboard `/origin/desktop`. */
export function Site00OriginLayoutSwitch() {
  const { pathname } = useLocation();
  const onDesktopRoute =
    pathname === SITE00_ROUTES.originDesktop || pathname.startsWith(`${SITE00_ROUTES.originDesktop}/`);
  const onMobileRoute = pathname === SITE00_ROUTES.originAlias || pathname === SITE00_ROUTES.origin;

  if (!onDesktopRoute && !onMobileRoute) {
    return null;
  }

  const nav = (
    <nav className="site00-origin-layout-switch" aria-label="Origin layout preview">
      <Link to={SITE00_ROUTES.originAlias} aria-current={onMobileRoute ? 'page' : undefined}>
        Mobile
      </Link>
      <Link to={SITE00_ROUTES.originDesktop} aria-current={onDesktopRoute ? 'page' : undefined}>
        Desktop
      </Link>
    </nav>
  );

  if (typeof document === 'undefined') {
    return nav;
  }

  return createPortal(nav, document.body);
}
