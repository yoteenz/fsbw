import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  isSite00BldrAssessmentDesktopPath,
  isSite00BldrAssessmentPath,
  isSite00BldrStateDesktopPath,
  isSite00IdntyAssessmentDesktopPath,
  isSite00IdntyAssessmentPath,
  isSite00IdntyStateDesktopPath,
  isSite00OriginDesktopPath,
  SITE00_ROUTES,
  site00BldrAssessmentDesktopPath,
  site00BldrAssessmentMobilePath,
  site00IdntyAssessmentDesktopPath,
  site00IdntyAssessmentMobilePath,
} from '../../config/routes';
import {
  SITE00_ORIGIN_MOBILE_LAYOUT_QUERY,
  isSite00OriginWideViewport,
  site00OriginMobileLayoutPreviewActive,
} from './site00OriginViewport';

type PreviewSwitchConfig = {
  ariaLabel: string;
  mobileHref: string;
  desktopHref: string;
  onMobile: boolean;
  onDesktop: boolean;
};

/** Toggle mobile-first vs fixed desktop artboard on Origin + BLDR workflow preview routes. */
export function Site00OriginLayoutSwitch() {
  const { pathname, search } = useLocation();

  let config: PreviewSwitchConfig | null = null;

  if (
    pathname === SITE00_ROUTES.originAlias ||
    pathname === SITE00_ROUTES.origin ||
    isSite00OriginDesktopPath(pathname)
  ) {
    const mobileHref = isSite00OriginWideViewport()
      ? `${SITE00_ROUTES.originAlias}?${SITE00_ORIGIN_MOBILE_LAYOUT_QUERY}=1`
      : SITE00_ROUTES.originAlias;
    config = {
      ariaLabel: 'Origin layout preview',
      mobileHref,
      desktopHref: SITE00_ROUTES.originDesktop,
      onMobile:
        (pathname === SITE00_ROUTES.originAlias || pathname === SITE00_ROUTES.origin) &&
        (!isSite00OriginWideViewport() || site00OriginMobileLayoutPreviewActive(search)),
      onDesktop: isSite00OriginDesktopPath(pathname),
    };
  } else if (
    pathname === SITE00_ROUTES.bldrState ||
    isSite00BldrStateDesktopPath(pathname)
  ) {
    config = {
      ariaLabel: 'BLDR layout preview',
      mobileHref: SITE00_ROUTES.bldrState,
      desktopHref: SITE00_ROUTES.bldrStateDesktop,
      onMobile: pathname === SITE00_ROUTES.bldrState,
      onDesktop: isSite00BldrStateDesktopPath(pathname),
    };
  } else if (
    pathname === SITE00_ROUTES.idntyState ||
    isSite00IdntyStateDesktopPath(pathname)
  ) {
    config = {
      ariaLabel: 'IDNTY layout preview',
      mobileHref: SITE00_ROUTES.idntyState,
      desktopHref: SITE00_ROUTES.idntyStateDesktop,
      onMobile: pathname === SITE00_ROUTES.idntyState,
      onDesktop: isSite00IdntyStateDesktopPath(pathname),
    };
  } else if (isSite00IdntyAssessmentPath(pathname)) {
    const mobileBase = site00IdntyAssessmentMobilePath(pathname);
    config = {
      ariaLabel: 'IDNTY assessment layout preview',
      mobileHref: mobileBase,
      desktopHref: site00IdntyAssessmentDesktopPath(mobileBase),
      onMobile: !isSite00IdntyAssessmentDesktopPath(pathname),
      onDesktop: isSite00IdntyAssessmentDesktopPath(pathname),
    };
  } else if (isSite00BldrAssessmentPath(pathname)) {
    const mobileBase = site00BldrAssessmentMobilePath(pathname);
    config = {
      ariaLabel: 'BLDR assessment layout preview',
      mobileHref: mobileBase,
      desktopHref: site00BldrAssessmentDesktopPath(mobileBase),
      onMobile: !isSite00BldrAssessmentDesktopPath(pathname),
      onDesktop: isSite00BldrAssessmentDesktopPath(pathname),
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
