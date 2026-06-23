import type { PerspectivePanelPage } from '../types/perspectivePanel';

export function isPerspectivePanelDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.PANEL_DEBUG === true) return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('panelDebug') === '1') return true;
    if (params.get('shoppingBagDebug') === '1') return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function resolvePerspectivePanelPage(
  pathname: string,
  search: string,
): PerspectivePanelPage | null {
  if (pathname.startsWith('/desktop/shopping-bag')) return 'shopping-bag';
  if (pathname.startsWith('/desktop/acquisition')) return 'acquisition';
  if (pathname === '/sign-in' || pathname.startsWith('/sign-in/')) return 'sign-in';

  const zone = (() => {
    try {
      return new URLSearchParams(search).get('zone');
    } catch {
      return null;
    }
  })();

  if (zone === 'reception') return 'reception';
  if (zone === 'lounge' || pathname.startsWith('/desktop/lounge')) return 'lounge';
  if (zone === 'psa-suite') return 'psa-suite';

  if (pathname.startsWith('/desktop/penthouse')) {
    try {
      const room = new URLSearchParams(search).get('room');
      if (room === 'boutique') return 'penthouse-boutique';
    } catch {
      /* ignore */
    }
  }

  return null;
}

export async function copyPerspectivePanelDebugText(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
