import {
  GROWTH_ARCHITECT_STORAGE_KEY,
  GROWTH_ARCHITECT_VERSION,
  GROWTH_PHILOSOPHY,
} from './constants';
import type { GrowthArchitectStore, GrowthArchitectWorkspaceId } from './types';

function emptyStore(): GrowthArchitectStore {
  return {
    version: GROWTH_ARCHITECT_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      growthHealthPct: 0,
      acquisitionPct: 0,
      retentionPct: 0,
      revenueGrowthPct: 0,
      relationshipGrowthPct: 0,
      knowledgeGrowthPct: 0,
      lifecycleStage: 'traction',
    },
    growthPhilosophy: [...GROWTH_PHILOSOPHY],
    blueprintPillars: [],
    lifecycleStages: [],
    initiatives: [],
    gtmPlans: [],
    intelligenceAlerts: [],
    simulations: [],
    orchestration: [],
    experiments: [],
    marketIntelligence: [],
    expansionOpportunities: [],
    launchCalendar: [],
    futureOpportunities: [],
  };
}

export function readGrowthArchitectStore(): GrowthArchitectStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(GROWTH_ARCHITECT_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as GrowthArchitectStore;
    return { ...emptyStore(), ...parsed, version: GROWTH_ARCHITECT_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeGrowthArchitectStore(store: GrowthArchitectStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    GROWTH_ARCHITECT_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: GROWTH_ARCHITECT_VERSION })
  );
}

export function bootstrapGrowthArchitectStore(seed?: Partial<GrowthArchitectStore>): void {
  const existing = readGrowthArchitectStore();
  if (existing.blueprintPillars.length > 0) return;
  writeGrowthArchitectStore({ ...emptyStore(), ...seed });
}

export function selectGrowthArchitectWorkspace(id: GrowthArchitectWorkspaceId): void {
  const store = readGrowthArchitectStore();
  writeGrowthArchitectStore({ ...store, activeWorkspaceId: id });
}
