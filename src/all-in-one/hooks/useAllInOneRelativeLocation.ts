import { useLocation, type Location } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';

const BASE = aioAppConfig.routes.base.replace(/\/$/, '');

/** Strip `/all-in-one` prefix so nested `<Routes>` match relative segments. */
export function stripAllInOneBase(pathname: string): string {
  if (pathname === BASE) return '/';
  if (pathname.startsWith(`${BASE}/`)) {
    const rest = pathname.slice(BASE.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return pathname;
}

export function useAllInOneRelativeLocation(): Location {
  const location = useLocation();
  return {
    ...location,
    pathname: stripAllInOneBase(location.pathname),
  };
}
