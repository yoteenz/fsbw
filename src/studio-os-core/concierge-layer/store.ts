import { CONCIERGE_LAYER_STORAGE_KEY, CONCIERGE_LAYER_VERSION, CONCIERGE_PHILOSOPHY, CONCIERGE_TERMINOLOGY_MAP } from './constants';
import { CONCIERGE_ROSTER } from './mapping';
import type { ConciergeLayerStore, ConciergeLayerWorkspaceId } from './types';

function emptyStore(): ConciergeLayerStore {
  return {
    version: CONCIERGE_LAYER_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: 'COMPANY',
    dashboard: {
      summary: 'CONCIERGE LAYER — founder-facing guidance · executives govern · concierges guide.',
      conciergeTeamSize: CONCIERGE_ROSTER.length,
      activeGuidanceSessions: 0,
      founderSatisfactionPct: 0,
      recommendationsToday: 0,
      organizationalConfidencePct: 0,
    },
    conciergePhilosophy: [...CONCIERGE_PHILOSOPHY],
    conciergeIdentities: [...CONCIERGE_ROSTER],
    conciergeBehavior: [],
    chiefConciergeExperience: [],
    relationshipExamples: [],
    terminologyMap: [...CONCIERGE_TERMINOLOGY_MAP],
    futureOpportunities: [],
  };
}

export function readConciergeLayerStore(): ConciergeLayerStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CONCIERGE_LAYER_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ConciergeLayerStore;
    return { ...emptyStore(), ...parsed, conciergeIdentities: [...CONCIERGE_ROSTER] };
  } catch {
    return emptyStore();
  }
}

export function writeConciergeLayerStore(store: ConciergeLayerStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    CONCIERGE_LAYER_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString() })
  );
}

export function bootstrapConciergeLayerStore(seed?: Partial<ConciergeLayerStore>): void {
  const existing = readConciergeLayerStore();
  if (existing.relationshipExamples.length > 0 && !seed) return;
  writeConciergeLayerStore({ ...emptyStore(), ...seed });
}

export function selectConciergeLayerWorkspace(id: ConciergeLayerWorkspaceId): void {
  const store = readConciergeLayerStore();
  writeConciergeLayerStore({ ...store, activeWorkspaceId: id });
}
