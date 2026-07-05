import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildOrganizationalInheritanceSeed } from '../studio-os-core/organizational-inheritance/bootstrap';
import {
  bootstrapOrganizationalInheritanceStore,
  readOrganizationalInheritanceStore,
  selectOrganizationalInheritanceBlendPlan,
  selectOrganizationalInheritanceLibraryItem,
  setInheritanceWizardPrimarySource,
  updateInheritanceCategoryAction,
} from '../studio-os-core/organizational-inheritance/store';
import type { InheritanceCategoryAction, InheritanceCategoryId, InheritanceSourceId } from '../studio-os-core/organizational-inheritance/types';

function ensureSeeded(): void {
  bootstrapOrganizationalInheritanceStore(buildOrganizationalInheritanceSeed());
}

export function useOrganizationalInheritanceState() {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    ensureSeeded();
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readOrganizationalInheritanceStore();
  }, [version]);

  const selectedLibraryItem = useMemo(
    () => store.library.find((l) => l.id === store.selectedLibraryItemId) ?? store.library[0] ?? null,
    [store.library, store.selectedLibraryItemId]
  );

  const selectedBlendPlan = useMemo(
    () => store.blendPlans.find((b) => b.id === store.selectedBlendPlanId) ?? store.blendPlans[0] ?? null,
    [store.blendPlans, store.selectedBlendPlanId]
  );

  const selectLibraryItem = useCallback((id: string | null) => {
    selectOrganizationalInheritanceLibraryItem(id);
    setVersion((v) => v + 1);
  }, []);

  const selectBlendPlan = useCallback((id: string | null) => {
    selectOrganizationalInheritanceBlendPlan(id);
    setVersion((v) => v + 1);
  }, []);

  const setCategoryAction = useCallback(
    (categoryId: InheritanceCategoryId, action: InheritanceCategoryAction, sourceId?: InheritanceSourceId | null) => {
      updateInheritanceCategoryAction(categoryId, action, sourceId);
      setVersion((v) => v + 1);
    },
    []
  );

  const setWizardSource = useCallback((sourceId: InheritanceSourceId) => {
    setInheritanceWizardPrimarySource(sourceId);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedLibraryItem,
    selectedBlendPlan,
    refresh,
    selectLibraryItem,
    selectBlendPlan,
    setCategoryAction,
    setWizardSource,
  };
}
