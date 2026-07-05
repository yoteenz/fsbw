import {useCallback, useMemo, useState} from 'react';
import { buildExecutiveOrganizationSeed } from '../studio-os-core/executive-organization/bootstrap';
import {
  bootstrapExecutiveOrganizationStore,
  readExecutiveOrganizationStore,
  selectExecutiveOrganizationDepartment,
  selectExecutiveOrganizationExecutive,
} from '../studio-os-core/executive-organization/store';
import type { ExecutiveId } from '../studio-os-core/executive-organization/types';

function ensureSeeded(): void {
  bootstrapExecutiveOrganizationStore(buildExecutiveOrganizationSeed());
}

export function useExecutiveOrganizationState() {
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
    return readExecutiveOrganizationStore();
  }, [version]);

  const selectedExecutive = useMemo(
    () => store.executives.find((e) => e.id === store.selectedExecutiveId) ?? store.executives[0] ?? null,
    [store.executives, store.selectedExecutiveId]
  );

  const selectedDepartment = useMemo(
    () => store.departments.find((d) => d.id === store.selectedDepartmentId) ?? null,
    [store.departments, store.selectedDepartmentId]
  );

  const selectExecutive = useCallback((id: ExecutiveId | null) => {
    selectExecutiveOrganizationExecutive(id);
    setVersion((v) => v + 1);
  }, []);

  const selectDepartment = useCallback((id: string | null) => {
    selectExecutiveOrganizationDepartment(id);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedExecutive,
    selectedDepartment,
    refresh,
    selectExecutive,
    selectDepartment,
  };
}
