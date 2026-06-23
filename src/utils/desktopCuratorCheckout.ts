import { createContext, useContext } from 'react';

/** When true, checkout renders inside the Curator's Tablet (no commerce hero / mobile chrome). */
export const DesktopCuratorCheckoutContext = createContext(false);

export function useDesktopCuratorCheckout(): boolean {
  return useContext(DesktopCuratorCheckoutContext);
}

export function isDesktopAcquisitionPath(pathname: string): boolean {
  return pathname.startsWith('/desktop/acquisition');
}
