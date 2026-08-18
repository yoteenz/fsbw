import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  isSite00PublicDesktopPath,
  isSite00PublicPageBasePath,
  site00PublicDesktopPath,
  site00PublicMobilePath,
} from '../../config/site00-public-pages';
import {
  SITE00_ORIGIN_MOBILE_LAYOUT_QUERY,
  isSite00OriginWideViewport,
  site00OriginMobileLayoutPreviewActive,
} from './site00OriginViewport';

/** Mobile ↔ desktop artboard toggle for Composer public routes. */
export function Site00PublicLayoutSwitch() {
  const { pathname, search } = useLocation();

  const basePath = site00PublicMobilePath(pathname);
  if (!isSite00PublicPageBasePath(basePath) && !isSite00PublicDesktopPath(pathname)) {
    return null;
  }

  const mobileHref =
    isSite00OriginWideViewport() && isSite00PublicDesktopPath(pathname)
      ? `${basePath}?${SITE00_ORIGIN_MOBILE_LAYOUT_QUERY}=1`
      : basePath;

  const desktopHref = site00PublicDesktopPath(basePath);
  const onMobile =
    isSite00PublicPageBasePath(pathname) &&
    (!isSite00OriginWideViewport() || site00OriginMobileLayoutPreviewActive(search));
  const onDesktop = isSite00PublicDesktopPath(pathname);

  const nav = (
    <nav className="site00-origin-layout-switch" aria-label="Public page layout preview">
      <Link to={mobileHref} aria-current={onMobile ? 'page' : undefined}>
        Mobile
      </Link>
      <Link to={desktopHref} aria-current={onDesktop ? 'page' : undefined}>
        Desktop
      </Link>
    </nav>
  );

  if (typeof document === 'undefined') {
    return nav;
  }

  return createPortal(nav, document.body);
}
