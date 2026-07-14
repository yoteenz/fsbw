import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_ACTIVE_DESIGN_VARIANT_ID,
  DESIGN_VARIANT_STORAGE_KEY,
  EXPERIENCE_LAB_DESIGN_VARIANTS,
  designVariantToQuery,
  parseDesignVariantFromQuery,
  resolveDesignVariantById,
  resolveVariantEnvironmentUrl,
  type DesignVariantId,
  type DesignVariantRecord,
} from './experience-lab-design-variants';

type PersistedVariantState = {
  activeVariantId: DesignVariantId;
  drawerVariantId?: DesignVariantId | null;
};

function readPersisted(): PersistedVariantState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DESIGN_VARIANT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedVariantState;
  } catch {
    return null;
  }
}

function writePersisted(state: PersistedVariantState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DESIGN_VARIANT_STORAGE_KEY, JSON.stringify(state));
}

export function useExperienceLabDesignVariants() {
  const location = useLocation();
  const navigate = useNavigate();
  const persisted = readPersisted();
  const fromQuery = parseDesignVariantFromQuery(location.search);

  const [activeVariantId, setActiveVariantId] = useState<DesignVariantId>(
    () => fromQuery ?? persisted?.activeVariantId ?? DEFAULT_ACTIVE_DESIGN_VARIANT_ID
  );
  const [drawerVariantId, setDrawerVariantId] = useState<DesignVariantId | null>(null);

  const variants = EXPERIENCE_LAB_DESIGN_VARIANTS;

  const activeVariant = useMemo(
    () => resolveDesignVariantById(activeVariantId),
    [activeVariantId]
  );

  const activeEnvironmentUrl = useMemo(
    () => resolveVariantEnvironmentUrl(activeVariant),
    [activeVariant]
  );

  const drawerVariant = useMemo(
    () => (drawerVariantId ? resolveDesignVariantById(drawerVariantId) : null),
    [drawerVariantId]
  );

  const syncQuery = useCallback(
    (id: DesignVariantId) => {
      const params = new URLSearchParams(location.search);
      params.set('variant', designVariantToQuery(id));
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    },
    [location.pathname, location.search, navigate]
  );

  const selectVariant = useCallback(
    (id: DesignVariantId) => {
      setActiveVariantId(id);
      writePersisted({ activeVariantId: id, drawerVariantId });
      syncQuery(id);
    },
    [syncQuery]
  );

  const openDrawer = useCallback((id: DesignVariantId) => {
    setDrawerVariantId(id);
    writePersisted({ activeVariantId, drawerVariantId: id });
  }, [activeVariantId]);

  const closeDrawer = useCallback(() => {
    setDrawerVariantId(null);
    writePersisted({ activeVariantId, drawerVariantId: null });
  }, [activeVariantId]);

  const activateFromDrawer = useCallback(
    (id: DesignVariantId) => {
      selectVariant(id);
      closeDrawer();
    },
    [closeDrawer, selectVariant]
  );

  const archiveVariant = useCallback((variant: DesignVariantRecord) => {
    // Stage 1 — local status only; vault preserves record for marketplace/theme reuse.
    void variant;
    closeDrawer();
  }, [closeDrawer]);

  return {
    variants,
    activeVariantId,
    activeVariant,
    activeEnvironmentUrl,
    drawerVariantId,
    drawerVariant,
    selectVariant,
    openDrawer,
    closeDrawer,
    activateFromDrawer,
    archiveVariant,
  };
}

export type ExperienceLabDesignVariants = ReturnType<typeof useExperienceLabDesignVariants>;
