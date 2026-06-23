import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export const DESKTOP_PSA_SUITE_DEBUG_SESSION_KEY = 'baw_desktop_psa_suite_debug';
export const DESKTOP_PSA_SUITE_EDIT_SESSION_KEY = 'baw_desktop_psa_suite_edit';

export function isDesktopPsaSuiteDebugEnabledFromSearch(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    if (params.get('desktopPsaSuiteDebug') === '0') {
      sessionStorage.removeItem(DESKTOP_PSA_SUITE_DEBUG_SESSION_KEY);
      return false;
    }
    const flag = params.get('desktopPsaSuiteDebug');
    if (flag === '1' || flag === 'true' || flag === 'yes') {
      sessionStorage.setItem(DESKTOP_PSA_SUITE_DEBUG_SESSION_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(DESKTOP_PSA_SUITE_DEBUG_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function isDesktopPsaSuiteEditEnabledFromSearch(search: string): boolean {
  if (!isDesktopPsaSuiteDebugEnabledFromSearch(search)) return false;
  try {
    const params = new URLSearchParams(search);
    if (params.get('desktopPsaSuiteEdit') === '0') {
      sessionStorage.removeItem(DESKTOP_PSA_SUITE_EDIT_SESSION_KEY);
      return false;
    }
    const flag = params.get('desktopPsaSuiteEdit');
    if (flag === '1' || flag === 'true' || flag === 'yes') {
      sessionStorage.setItem(DESKTOP_PSA_SUITE_EDIT_SESSION_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(DESKTOP_PSA_SUITE_EDIT_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function useDesktopPsaSuiteDebugEnabled(): boolean {
  const { search } = useLocation();
  return useMemo(() => isDesktopPsaSuiteDebugEnabledFromSearch(search), [search]);
}

export function useDesktopPsaSuiteEditEnabled(): boolean {
  const { search } = useLocation();
  return useMemo(() => isDesktopPsaSuiteEditEnabledFromSearch(search), [search]);
}
