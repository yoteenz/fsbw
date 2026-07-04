/** Shared open state for the shop mobile menu toggle (single source of truth). */

import { useEffect } from 'react';

export const MENU_TOGGLE_OPEN_CHANGED_EVENT = 'menuToggleOpenChanged';

let menuToggleOpen = false;

export function isMenuToggleOpen(): boolean {
  return menuToggleOpen;
}

export function setMenuToggleOpenState(open: boolean): void {
  if (menuToggleOpen === open) return;
  menuToggleOpen = open;
  window.dispatchEvent(new CustomEvent(MENU_TOGGLE_OPEN_CHANGED_EVENT, { detail: open }));
}

export function subscribeMenuToggleOpenState(listener: (open: boolean) => void): () => void {
  listener(menuToggleOpen);
  const onEvent = (event: Event) => {
    listener(Boolean((event as CustomEvent<boolean>).detail));
  };
  window.addEventListener(MENU_TOGGLE_OPEN_CHANGED_EVENT, onEvent);
  return () => window.removeEventListener(MENU_TOGGLE_OPEN_CHANGED_EVENT, onEvent);
}

/** Sync page-local `showMobileMenu` into global PSA / overlay gate state. */
export function useSyncMenuToggleOpenState(showMobileMenu: boolean): void {
  useEffect(() => {
    setMenuToggleOpenState(showMobileMenu);
  }, [showMobileMenu]);

  useEffect(() => () => setMenuToggleOpenState(false), []);
}
