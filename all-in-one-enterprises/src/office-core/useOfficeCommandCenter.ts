import { useMemo } from 'react';
import { useDemoStore } from '../demo/useDemoStore';
import { getOfficeCommandCenterView } from './officeCommandCenterService';

export function useOfficeCommandCenter() {
  const store = useDemoStore();
  return useMemo(() => getOfficeCommandCenterView(store), [store]);
}
