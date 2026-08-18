import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  isSite00OriginWideViewport,
  site00OriginMobileLayoutPreviewActive,
} from './site00OriginViewport';
import { site00PublicPageDesktopRedirectTarget } from '../../config/site00-public-pages';

/**
 * On wide viewports, public Composer base paths redirect to artboard routes (path suffix /desktop).
 * Append ?site00MobileLayout=1 to force mobile layout on a wide screen (QA).
 */
export function Site00PublicWideDesktopRedirect() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (site00OriginMobileLayoutPreviewActive(search)) return;
    if (!isSite00OriginWideViewport()) return;

    const target = site00PublicPageDesktopRedirectTarget(pathname);
    if (!target) return;

    const nextSearch = search.startsWith('?') ? search : search ? `?${search}` : '';
    navigate(`${target}${nextSearch}${hash}`, { replace: true });
  }, [pathname, search, hash, navigate]);

  return null;
}
