import {
  BRAND_ARCHITECT_STORAGE_KEY,
  BRAND_ARCHITECT_VERSION,
  BRAND_PHILOSOPHY,
} from './constants';
import type { BrandArchitectStore, BrandArchitectWorkspaceId } from './types';

function emptyStore(): BrandArchitectStore {
  return {
    version: BRAND_ARCHITECT_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      brandHealthPct: 0,
      blueprintCompletenessPct: 0,
      verbalIdentityPct: 0,
      visualIdentityPct: 0,
      systemsPct: 0,
      approvalStatus: 'draft',
    },
    brandPhilosophy: [...BRAND_PHILOSOPHY],
    blueprint: {
      purpose: '',
      promise: '',
      positioning: '',
      mission: '',
      vision: '',
      values: [],
      personality: [],
      archetype: '',
      voice: '',
      tone: '',
      communicationPrinciples: [],
      brandPhilosophy: '',
      competitivePositioning: '',
      emotionalPositioning: '',
    },
    verbalIdentity: {
      companyName: '',
      taglineOptions: [],
      selectedTagline: '',
      messagingPillars: [],
      elevatorPitch: '',
      brandStory: '',
      originStory: '',
      manifesto: '',
      brandVocabulary: [],
      communicationRules: [],
      writingStyle: '',
      headlineSystems: [],
      ctaSystems: [],
    },
    visualIdentity: [],
    brandSystems: [],
    competitiveIntel: [],
    competitiveOpportunities: [],
    brandSimulations: [],
    brandHealth: {
      overallPct: 0,
      coherencePct: 0,
      consistencyPct: 0,
      differentiationPct: 0,
      emotionalResonancePct: 0,
      systemCompletenessPct: 0,
      strengths: [],
      weaknesses: [],
    },
    brandEvolution: [],
    futureOpportunities: [],
    experienceHandoff: {
      status: 'pending',
      transferredAt: null,
      inheritedSystems: [],
      downstreamTargets: [],
    },
  };
}

function refreshDashboard(store: BrandArchitectStore): BrandArchitectStore['dashboard'] {
  const visualApproved = store.visualIdentity.filter((v) => v.status === 'approved').length;
  const visualPct = store.visualIdentity.length > 0
    ? Math.round((visualApproved / store.visualIdentity.length) * 100)
    : 0;
  const systemsActive = store.brandSystems.filter((s) => s.status === 'approved' || s.status === 'active').length;
  const systemsPct = store.brandSystems.length > 0
    ? Math.round((systemsActive / store.brandSystems.length) * 100)
    : 0;
  const blueprintFields = [
    store.blueprint.purpose,
    store.blueprint.promise,
    store.blueprint.mission,
    store.blueprint.vision,
    store.blueprint.archetype,
  ].filter(Boolean).length;
  const blueprintPct = Math.round((blueprintFields / 5) * 100);
  const verbalFields = [
    store.verbalIdentity.selectedTagline,
    store.verbalIdentity.elevatorPitch,
    store.verbalIdentity.manifesto,
  ].filter(Boolean).length;
  const verbalPct = Math.round((verbalFields / 3) * 100);

  return {
    ...store.dashboard,
    brandHealthPct: store.brandHealth.overallPct,
    blueprintCompletenessPct: blueprintPct,
    verbalIdentityPct: verbalPct,
    visualIdentityPct: visualPct,
    systemsPct,
  };
}

export function readBrandArchitectStore(): BrandArchitectStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(BRAND_ARCHITECT_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as BrandArchitectStore;
    return { ...emptyStore(), ...parsed, version: BRAND_ARCHITECT_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeBrandArchitectStore(store: BrandArchitectStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    BRAND_ARCHITECT_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: BRAND_ARCHITECT_VERSION })
  );
}

export function bootstrapBrandArchitectStore(seed?: Partial<BrandArchitectStore>): void {
  const existing = readBrandArchitectStore();
  if (existing.blueprint.purpose) return;
  const merged = { ...emptyStore(), ...seed };
  writeBrandArchitectStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectBrandArchitectWorkspace(id: BrandArchitectWorkspaceId): void {
  const store = readBrandArchitectStore();
  writeBrandArchitectStore({
    ...store,
    activeWorkspaceId: id,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}
