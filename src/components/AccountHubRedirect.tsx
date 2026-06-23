import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  DESKTOP_ACCOUNT_HUB_PATH,
  shouldUseDesktopAccountHub,
} from '../utils/desktopCommerceRoutes';

/** Tablet / desktop clients land on Penthouse Suite instead of mobile `/account`. */
export function AccountHubRedirect({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (location.pathname === '/account' && shouldUseDesktopAccountHub(location.pathname)) {
    return <Navigate to={DESKTOP_ACCOUNT_HUB_PATH} replace />;
  }
  return <>{children}</>;
}
