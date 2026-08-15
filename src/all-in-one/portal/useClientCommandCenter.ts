import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useDemoStore } from '../demo/useDemoStore';
import { getClientCommandCenterView } from './clientCommandCenterService';
import { resolvePortalKind } from './organizationContext';

export function useClientCommandCenter() {
  const store = useDemoStore();
  const location = useLocation();
  const portalKind = resolvePortalKind(location.pathname);

  return useMemo(
    () => getClientCommandCenterView(store, portalKind),
    [store, portalKind],
  );
}
