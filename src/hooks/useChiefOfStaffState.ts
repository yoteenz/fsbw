import {useCallback, useMemo, useState} from 'react';
import { buildChiefOfStaffSeed } from '../studio-os-core/chief-of-staff/bootstrap';
import {
  bootstrapChiefOfStaffStore,
  readChiefOfStaffStore,
  recordFounderDecision,
  refreshChiefOfStaffDashboard,
  setDelegationMode,
} from '../studio-os-core/chief-of-staff/store';
import type { DelegationMode } from '../studio-os-core/chief-of-staff/types';

function ensureSeeded(): void {
  bootstrapChiefOfStaffStore(buildChiefOfStaffSeed());
  refreshChiefOfStaffDashboard();
}

export function useChiefOfStaffState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const refresh = useCallback(() => {
    ensureSeeded();
    setVersion((v) => v + 1);
  }, []);


  const store = useMemo(() => {
    void version;
    return readChiefOfStaffStore();
  }, [version]);

  const founderApprove = useCallback((itemId: string, reason?: string) => {
    recordFounderDecision(itemId, 'approved', reason);
    setVersion((v) => v + 1);
  }, []);

  const founderReject = useCallback((itemId: string, reason?: string) => {
    recordFounderDecision(itemId, 'rejected', reason);
    setVersion((v) => v + 1);
  }, []);

  const founderReturn = useCallback((itemId: string, reason?: string) => {
    recordFounderDecision(itemId, 'edited', reason);
    setVersion((v) => v + 1);
  }, []);

  const updateDelegation = useCallback((departmentId: string, mode: DelegationMode) => {
    setDelegationMode(departmentId, mode);
    setVersion((v) => v + 1);
  }, []);

  const escalatedItems = useMemo(
    () => store.executiveInbox.filter((i) => i.status === 'escalated'),
    [store.executiveInbox]
  );

  const processedItems = useMemo(
    () =>
      store.executiveInbox.filter(
        (i) => i.status === 'auto-approved' || i.status === 'soft-approved' || i.status === 'founder-approved'
      ),
    [store.executiveInbox]
  );

  return {
    store,
    refresh,
    founderApprove,
    founderReject,
    founderReturn,
    updateDelegation,
    escalatedItems,
    processedItems,
  };
}
