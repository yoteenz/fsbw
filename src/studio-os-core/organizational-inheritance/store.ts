import {
  INHERITANCE_CATEGORIES,
  ORGANIZATIONAL_INHERITANCE_STORAGE_KEY,
  ORGANIZATIONAL_INHERITANCE_VERSION,
} from './constants';
import type {
  InheritanceCategoryAction,
  InheritanceCategoryId,
  InheritanceSourceId,
  OrganizationalInheritanceStore,
} from './types';

function defaultCategoryConfigs() {
  return INHERITANCE_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    genetics: c.genetics,
    action: 'inherit' as InheritanceCategoryAction,
    sourceId: null as InheritanceSourceId | null,
    notes: '',
  }));
}

function emptyStore(): OrganizationalInheritanceStore {
  return {
    version: ORGANIZATIONAL_INHERITANCE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    dashboard: {
      summary: '',
      libraryItemCount: 0,
      activeBlends: 0,
      companiesWithInheritance: 0,
      reusableAssets: 0,
      avgConfidencePct: 0,
      evolutionEvents: 0,
    },
    sources: [],
    categoryConfigs: defaultCategoryConfigs(),
    blendPlans: [],
    simulator: {
      organizationalCompatibilityPct: 0,
      workflowConflicts: [],
      departmentOverlap: [],
      approvalConflicts: [],
      leadershipConsistencyPct: 0,
      brandCompatibilityPct: 0,
      riskLevel: 'low',
      confidencePct: 0,
      recommendedAdjustments: [],
      readyToActivate: false,
    },
    library: [],
    departmentPackages: [],
    executivePackages: [],
    ancestry: [],
    timeline: [],
    recommendations: [],
    evolution: [],
    crossCompanyLearning: [],
    marketplacePrepared: [],
    wizardDraft: {
      targetCompanyName: '',
      primarySourceId: 'scratch',
      secondarySourceIds: [],
      categoryConfigs: defaultCategoryConfigs(),
      blendPlanId: null,
      simulatorPassed: false,
    },
    selectedLibraryItemId: null,
    selectedBlendPlanId: null,
  };
}

function refreshDashboard(store: OrganizationalInheritanceStore): OrganizationalInheritanceStore['dashboard'] {
  const avgConf =
    store.recommendations.length > 0
      ? Math.round(store.recommendations.reduce((s, r) => s + r.confidencePct, 0) / store.recommendations.length)
      : 0;

  return {
    ...store.dashboard,
    libraryItemCount: store.library.length,
    activeBlends: store.blendPlans.length,
    companiesWithInheritance: store.sources.filter((s) => s.id !== 'scratch').length,
    reusableAssets: store.crossCompanyLearning.filter((c) => c.availableToOthers).length,
    avgConfidencePct: avgConf,
    evolutionEvents: store.evolution.length,
  };
}

export function readOrganizationalInheritanceStore(): OrganizationalInheritanceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_INHERITANCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalInheritanceStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_INHERITANCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalInheritanceStore(store: OrganizationalInheritanceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_INHERITANCE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: ORGANIZATIONAL_INHERITANCE_VERSION })
  );
}

export function bootstrapOrganizationalInheritanceStore(seed?: Partial<OrganizationalInheritanceStore>): void {
  const existing = readOrganizationalInheritanceStore();
  if (existing.library.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeOrganizationalInheritanceStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectOrganizationalInheritanceLibraryItem(id: string | null): void {
  const store = readOrganizationalInheritanceStore();
  writeOrganizationalInheritanceStore({ ...store, selectedLibraryItemId: id });
}

export function selectOrganizationalInheritanceBlendPlan(id: string | null): void {
  const store = readOrganizationalInheritanceStore();
  writeOrganizationalInheritanceStore({ ...store, selectedBlendPlanId: id });
}

export function updateInheritanceCategoryAction(
  categoryId: InheritanceCategoryId,
  action: InheritanceCategoryAction,
  sourceId?: InheritanceSourceId | null
): void {
  const store = readOrganizationalInheritanceStore();
  const categoryConfigs = store.categoryConfigs.map((c) =>
    c.id === categoryId ? { ...c, action, sourceId: sourceId ?? c.sourceId } : c
  );
  writeOrganizationalInheritanceStore({
    ...store,
    categoryConfigs,
    wizardDraft: { ...store.wizardDraft, categoryConfigs },
  });
}

export function setInheritanceWizardPrimarySource(sourceId: InheritanceSourceId): void {
  const store = readOrganizationalInheritanceStore();
  writeOrganizationalInheritanceStore({
    ...store,
    wizardDraft: { ...store.wizardDraft, primarySourceId: sourceId },
  });
}

export function refreshOrganizationalInheritanceDashboard(): void {
  const store = readOrganizationalInheritanceStore();
  writeOrganizationalInheritanceStore({ ...store, dashboard: refreshDashboard(store) });
}
