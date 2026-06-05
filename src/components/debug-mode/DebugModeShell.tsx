import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Routes, useLocation, useNavigate } from 'react-router-dom';
import { canAccessPageDebugMode } from '../../utils/adminAuth';
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
import { DebugModeApplier } from './DebugModeApplier';
import { DebugModeFounderBootstrap } from './DebugModeFounderBootstrap';
import { GlobalOverlayDebugProvider } from './GlobalOverlayDebugContext';

const DEBUG_MODE_HOME = '/home/shop';

type Props = {
  children: ReactNode;
};

/**
 * Enables `/debug-mode` suffix on any route: same page renders, with visual edit overlay.
 * Founder admin only (`kateenaarmstrong@gmail.com`). All others → homepage.
 */
export function DebugModeShell({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [founderAccess, setFounderAccess] = useState(canAccessPageDebugMode);

  const isDebugMode = isDebugModePath(location.pathname);
  const pageKey = useMemo(() => stripDebugModeSuffix(location.pathname), [location.pathname]);
  const debugModeActive = isDebugMode && founderAccess;

  const routeLocation = useMemo(() => {
    if (!debugModeActive) return location;
    return { ...location, pathname: pageKey };
  }, [debugModeActive, location, pageKey]);

  useEffect(() => {
    const sync = () => setFounderAccess(canAccessPageDebugMode());
    sync();
    window.addEventListener('signInStateChanged', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('signInStateChanged', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!isDebugMode) return;
    if (founderAccess) return;
    sessionStorage.removeItem(DEBUG_MODE_SESSION_KEY);
    navigate(DEBUG_MODE_HOME + location.search + location.hash, { replace: true });
  }, [founderAccess, isDebugMode, location.hash, location.search, navigate]);

  useEffect(() => {
    if (location.pathname !== DEBUG_MODE_SUFFIX) return;
    if (founderAccess) {
      navigate('/home/shop/debug-mode' + location.search + location.hash, { replace: true });
      return;
    }
    navigate(DEBUG_MODE_HOME + location.search + location.hash, { replace: true });
  }, [founderAccess, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (debugModeActive) {
      sessionStorage.setItem(DEBUG_MODE_SESSION_KEY, '1');
    }
  }, [debugModeActive]);

  useEffect(() => {
    if (!founderAccess) {
      sessionStorage.removeItem(DEBUG_MODE_SESSION_KEY);
      return;
    }
    const sessionActive = sessionStorage.getItem(DEBUG_MODE_SESSION_KEY) === '1';
    if (!sessionActive) return;
    if (isDebugModePath(location.pathname)) return;
    navigate(withDebugModeSuffix(location.pathname) + location.search + location.hash, { replace: true });
  }, [founderAccess, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!debugModeActive) return;
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
  }, [debugModeActive, navigate]);

  return (
    <>
      <DebugModeFounderBootstrap />
      <GlobalOverlayDebugProvider editEnabled={debugModeActive}>
        {founderAccess && !debugModeActive ? <DebugModeApplier /> : null}
        <DebugModeProvider enabled={debugModeActive} pageKey={pageKey}>
          <Routes location={routeLocation}>{children}</Routes>
          {debugModeActive ? (
            <>
              <DebugModeDomController />
              <DebugModeOverlay />
            </>
          ) : null}
        </DebugModeProvider>
      </GlobalOverlayDebugProvider>
    </>
  );
}

/** Append `/debug-mode` to an internal path for shareable edit URLs (founder session only). */
export function debugModeHref(path: string): string {
  if (!canAccessPageDebugMode()) return path;
  return withDebugModeSuffix(path);
}
