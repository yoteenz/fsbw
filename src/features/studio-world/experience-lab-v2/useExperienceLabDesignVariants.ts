import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  ensureExperienceLabVariantPackages,
  resolveDesignVariantEnvironmentFromPackage,
  resolveDesignVariantPackageDrawer,
  resolveActiveVariantPackageId,
} from './experience-lab-environment-package-bridge';

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

type UseExperienceLabDesignVariantsOptions = {
  /** Mobile/tablet breakpoint — resolves mobile vs desktop package outputs. */
  isCompact?: boolean;
};

export function useExperienceLabDesignVariants(options?: UseExperienceLabDesignVariantsOptions) {
  const location = useLocation();
  const navigate = useNavigate();
  const persisted = readPersisted();
  const fromQuery = parseDesignVariantFromQuery(location.search);
  const isCompact = options?.isCompact ?? false;

  useEffect(() => {
    ensureExperienceLabVariantPackages();
  }, []);

  const [activeVariantId, setActiveVariantId] = useState<DesignVariantId>(
    () => fromQuery ?? persisted?.activeVariantId ?? DEFAULT_ACTIVE_DESIGN_VARIANT_ID
  );
  const [drawerVariantId, setDrawerVariantId] = useState<DesignVariantId | null>(null);

  const variants = EXPERIENCE_LAB_DESIGN_VARIANTS;

  const activeVariant = useMemo(
    () => resolveDesignVariantById(activeVariantId),
    [activeVariantId]
  );

  const activeEnvironmentUrl = useMemo(() => {
    const fromPackage = resolveDesignVariantEnvironmentFromPackage(activeVariantId, isCompact);
    if (fromPackage) return fromPackage;
    return resolveVariantEnvironmentUrl(activeVariant);
  }, [activeVariantId, activeVariant, isCompact]);

  const drawerVariant = useMemo(
    () => (drawerVariantId ? resolveDesignVariantById(drawerVariantId) : null),
    [drawerVariantId]
  );

  const drawerPackageModel = useMemo(
    () => (drawerVariantId ? resolveDesignVariantPackageDrawer(drawerVariantId) : null),
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
    environmentPackageId: resolveActiveVariantPackageId(activeVariantId),
    drawerVariantId,
    drawerVariant,
    drawerPackageModel,
    selectVariant,
    openDrawer,
    closeDrawer,
    activateFromDrawer,
    archiveVariant,
  };
}

export type ExperienceLabDesignVariants = ReturnType<typeof useExperienceLabDesignVariants>;
