import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isAdminEmail } from '../utils/adminAuth';
import { getCurrentUserEmailFromStorage } from '../utils/perUserStorage';
import {
  BAW_NOIR_LIVE_COLOR_VIEWS_EVENT,
  readPendingBawNoirLiveColorWigViews,
  readBawNoirLiveColorWigViews,
  type BawNoirLiveWigViewsTriple,
} from '../utils/bawNoirLivePreviewStorage';

/**
 * On NOIR build-a-wig sub-pages, surface the latest admin live color triple.
 * Prefer the pending/current color preview first so other routes do not lag behind
 * the newest color selection while the user is still moving between sub-pages.
 */
export function useBawSubpageLiveNoirColorWigViews(): BawNoirLiveWigViewsTriple | null {
  const { pathname } = useLocation();
  const [views, setViews] = useState<BawNoirLiveWigViewsTriple | null>(null);

  useEffect(() => {
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
      setViews(readPendingBawNoirLiveColorWigViews() ?? readBawNoirLiveColorWigViews());
    };

    refresh();
    window.addEventListener(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('customStorageChange', refresh);
    window.addEventListener('signInStateChanged', refresh as EventListener);
    return () => {
      window.removeEventListener(BAW_NOIR_LIVE_COLOR_VIEWS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('customStorageChange', refresh);
      window.removeEventListener('signInStateChanged', refresh as EventListener);
    };
  }, [pathname]);

  return views;
}
