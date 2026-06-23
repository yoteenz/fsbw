import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const DESKTOP_LOUNGE_TV_DEBUG_SESSION_KEY = 'baw_desktop_lounge_tv_debug';
export const DESKTOP_LOUNGE_TV_EDIT_SESSION_KEY = 'baw_desktop_lounge_tv_edit';

export function isDesktopLoungeTvDebugEnabledFromSearch(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    if (params.get('desktopLoungeTvDebug') === '0') {
      sessionStorage.removeItem(DESKTOP_LOUNGE_TV_DEBUG_SESSION_KEY);
      return false;
    }
    const flag = params.get('desktopLoungeTvDebug');
    if (flag === '1' || flag === 'true' || flag === 'yes') {
      sessionStorage.setItem(DESKTOP_LOUNGE_TV_DEBUG_SESSION_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(DESKTOP_LOUNGE_TV_DEBUG_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function isDesktopLoungeTvEditEnabledFromSearch(search: string): boolean {
  if (!isDesktopLoungeTvDebugEnabledFromSearch(search)) return false;
  try {
    const params = new URLSearchParams(search);
    if (params.get('desktopLoungeTvEdit') === '0') {
      sessionStorage.removeItem(DESKTOP_LOUNGE_TV_EDIT_SESSION_KEY);
      return false;
    }
    const flag = params.get('desktopLoungeTvEdit');
    if (flag === '1' || flag === 'true' || flag === 'yes') {
      sessionStorage.setItem(DESKTOP_LOUNGE_TV_EDIT_SESSION_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(DESKTOP_LOUNGE_TV_EDIT_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function useDesktopLoungeTvDebugEnabled(): boolean {
  const { search } = useLocation();
  return useMemo(() => isDesktopLoungeTvDebugEnabledFromSearch(search), [search]);
}

export function useDesktopLoungeTvEditEnabled(): boolean {
  const { search } = useLocation();
  return useMemo(() => isDesktopLoungeTvEditEnabledFromSearch(search), [search]);
}
