import { useEffect, useMemo, type ReactNode } from 'react';
import { Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  DEBUG_MODE_SESSION_KEY,
  DEBUG_MODE_SUFFIX,
  isDebugModePath,
  stripDebugModeSuffix,
  withDebugModeSuffix,
} from '../../utils/debugMode';
import { DebugModeProvider } from './DebugModeProvider';
import { DebugModeDomController } from './DebugModeDomController';
import { DebugModeOverlay } from './DebugModeOverlay';

type Props = {
  children: ReactNode;
};

/**
 * Enables `/debug-mode` suffix on any route: same page renders, with visual edit overlay.
 * Example: `/account/rewards/debug-mode`
 */
export function DebugModeShell({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const isDebugMode = isDebugModePath(location.pathname);
  const pageKey = useMemo(() => stripDebugModeSuffix(location.pathname), [location.pathname]);

  const routeLocation = useMemo(() => {
    if (!isDebugMode) return location;
    return { ...location, pathname: pageKey };
  }, [isDebugMode, location, pageKey]);

  useEffect(() => {
    if (location.pathname === DEBUG_MODE_SUFFIX) {
      navigate('/home/shop/debug-mode' + location.search + location.hash, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (isDebugMode) {
      sessionStorage.setItem(DEBUG_MODE_SESSION_KEY, '1');
    }
  }, [isDebugMode]);

  useEffect(() => {
    const sessionActive = sessionStorage.getItem(DEBUG_MODE_SESSION_KEY) === '1';
    if (!sessionActive) return;
    if (isDebugModePath(location.pathname)) return;
    navigate(withDebugModeSuffix(location.pathname) + location.search + location.hash, { replace: true });
  }, [location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!isDebugMode) return;
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
        return;
      }
      if (href.includes('/debug-mode')) return;
      e.preventDefault();
      e.stopPropagation();
      const url = new URL(href, window.location.origin);
      const nextPath = withDebugModeSuffix(url.pathname) + url.search + url.hash;
      navigate(nextPath);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [isDebugMode, navigate]);

  return (
    <DebugModeProvider enabled={isDebugMode} pageKey={pageKey}>
      <Routes location={routeLocation}>{children}</Routes>
      {isDebugMode ? (
        <>
          <DebugModeDomController />
          <DebugModeOverlay />
        </>
      ) : null}
    </DebugModeProvider>
  );
}

/** Append `/debug-mode` to an internal path for shareable edit URLs. */
export function debugModeHref(path: string): string {
  return withDebugModeSuffix(path);
}
