import { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BAW_NOIR_LIVE_BANGS_VIEWS_EVENT,
  BAW_NOIR_LIVE_COLOR_VIEWS_EVENT,
  BAW_NOIR_LIVE_STYLING_VIEWS_EVENT,
  resolveAdminNoirHubLiveWigViewsFromStorage,
  type BawNoirLiveWigViewsTriple,
} from '../utils/bawNoirLivePreviewStorage';

/**
 * NOIR BAW **step** sub-routes (`/noir/customize/<step>`, `/noir/edit/<step>`): live triple from storage.
 * `/build-a-wig/noir`, `/noir/customize`, `/noir/edit` hubs get `null` (static mannequins on `BuildAWigPage`).
 */
export function useBawSubpageLiveNoirCompositeWigViews(): BawNoirLiveWigViewsTriple | null {
  const { pathname } = useLocation();
  const [views, setViews] = useState<BawNoirLiveWigViewsTriple | null>(() => {
    if (!pathname.includes('/build-a-wig/noir')) return null;
    return resolveAdminNoirHubLiveWigViewsFromStorage(pathname);
  });

  useLayoutEffect(() => {
    const refresh = () => {
      if (!pathname.includes('/build-a-wig/noir')) {
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
