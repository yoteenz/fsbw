import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isAdminEmail } from '../utils/adminAuth';
import { getCurrentUserEmailFromStorage } from '../utils/perUserStorage';
import {
  BAW_NOIR_LIVE_BANGS_VIEWS_EVENT,
  BAW_NOIR_LIVE_COLOR_VIEWS_EVENT,
  BAW_NOIR_LIVE_STYLING_VIEWS_EVENT,
  resolveAdminNoirHubLiveWigViewsFromStorage,
  type BawNoirLiveWigViewsTriple,
} from '../utils/bawNoirLivePreviewStorage';

/**
 * NOIR BAW sub-pages: same live triple resolution as the hub/shared storage resolver —
 * prefer the latest pending/current NOIR color preview first when appropriate, then styling/bangs.
 * Non-admin and non-NOIR routes get `null`.
 */
export function useBawSubpageLiveNoirCompositeWigViews(): BawNoirLiveWigViewsTriple | null {
  const { pathname } = useLocation();
  const [views, setViews] = useState<BawNoirLiveWigViewsTriple | null>(() => {
    if (!pathname.includes('/build-a-wig/noir')) return null;
    try {
      if (!isAdminEmail(getCurrentUserEmailFromStorage() || '')) return null;
    } catch {
      return null;
    }
    return resolveAdminNoirHubLiveWigViewsFromStorage(pathname);
  });

  useLayoutEffect(() => {
    const refresh = () => {
      if (!pathname.includes('/build-a-wig/noir')) {
        setViews(null);
        return;
      }
      try {
        if (!isAdminEmail(getCurrentUserEmailFromStorage() || '')) {
          setViews(null);
          return;
        }
      } catch {
        setViews(null);
        return;
      }
      setViews(resolveAdminNoirHubLiveWigViewsFromStorage(pathname));
    };

    refresh();
    window.addEventListener(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT, refresh);
    window.addEventListener(BAW_NOIR_LIVE_STYLING_VIEWS_EVENT, refresh);
    window.addEventListener(BAW_NOIR_LIVE_BANGS_VIEWS_EVENT, refresh);
    window.addEventListener('customStorageChange', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('signInStateChanged', refresh as EventListener);
    return () => {
      window.removeEventListener(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT, refresh);
      window.removeEventListener(BAW_NOIR_LIVE_STYLING_VIEWS_EVENT, refresh);
      window.removeEventListener(BAW_NOIR_LIVE_BANGS_VIEWS_EVENT, refresh);
      window.removeEventListener('customStorageChange', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('signInStateChanged', refresh as EventListener);
    };
  }, [pathname]);

  return views;
}
