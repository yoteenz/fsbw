import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  isSite00BldrStateDesktopPath,
  isSite00IdntyStateDesktopPath,
  isSite00OriginDesktopPath,
  SITE00_ROUTES,
} from '../../config/routes';

type PreviewSwitchConfig = {
  ariaLabel: string;
  mobileHref: string;
  desktopHref: string;
  onMobile: boolean;
  onDesktop: boolean;
};

/** Toggle mobile-first vs fixed desktop artboard on Origin + BLDR workflow preview routes. */
export function Site00OriginLayoutSwitch() {
  const { pathname } = useLocation();

  let config: PreviewSwitchConfig | null = null;

  if (
    pathname === SITE00_ROUTES.originAlias ||
    pathname === SITE00_ROUTES.origin ||
    isSite00OriginDesktopPath(pathname)
  ) {
    config = {
      ariaLabel: 'Origin layout preview',
      mobileHref: SITE00_ROUTES.originAlias,
      desktopHref: SITE00_ROUTES.originDesktop,
      onMobile: pathname === SITE00_ROUTES.originAlias || pathname === SITE00_ROUTES.origin,
      onDesktop: isSite00OriginDesktopPath(pathname),
    };
  } else if (
    pathname === SITE00_ROUTES.bldr ||
    pathname === SITE00_ROUTES.bldrState ||
    isSite00BldrStateDesktopPath(pathname)
  ) {
    config = {
      ariaLabel: 'BLDR layout preview',
      mobileHref: SITE00_ROUTES.bldr,
      desktopHref: SITE00_ROUTES.bldrStateDesktop,
      onMobile: pathname === SITE00_ROUTES.bldr,
      onDesktop: isSite00BldrStateDesktopPath(pathname),
    };
  } else if (
    pathname === SITE00_ROUTES.idnty ||
    pathname === SITE00_ROUTES.idntyState ||
    isSite00IdntyStateDesktopPath(pathname)
  ) {
    config = {
      ariaLabel: 'IDNTY layout preview',
      mobileHref: SITE00_ROUTES.idntyState,
      desktopHref: SITE00_ROUTES.idntyStateDesktop,
      onMobile: pathname === SITE00_ROUTES.idntyState || pathname === SITE00_ROUTES.idnty,
      onDesktop: isSite00IdntyStateDesktopPath(pathname),
    };
  }

  if (!config) {
    return null;
  }

  const nav = (
    <nav className="site00-origin-layout-switch" aria-label={config.ariaLabel}>
      <Link to={config.mobileHref} aria-current={config.onMobile ? 'page' : undefined}>
        Mobile
      </Link>
      <Link to={config.desktopHref} aria-current={config.onDesktop ? 'page' : undefined}>
        Desktop
      </Link>
    </nav>
  );

  if (typeof document === 'undefined') {
    return nav;
  }

  return createPortal(nav, document.body);
}
