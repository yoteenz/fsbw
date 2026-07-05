import {
  COMPANY_GENOME_STORAGE_KEY,
  COMPANY_GENOME_VERSION,
  GENOME_PHILOSOPHY,
  ZOOM_LEVELS,
} from './constants';
import type { CompanyGenomeStore, CompanyGenomeWorkspaceId } from './types';

function emptyStore(): CompanyGenomeStore {
  return {
    version: COMPANY_GENOME_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      unifiedHealthPct: 0,
      resiliencePct: 0,
      maturityPct: 0,
      innovationPct: 0,
      growthPct: 0,
      activeZoomLevel: 'company',
    },
    genomePhilosophy: [...GENOME_PHILOSOPHY],
    geneticLayers: [],
    geneticRelationships: [],
    evolutionTimeline: [],
    healthDimensions: [],
    intelligenceAlerts: [],
    resilienceMetrics: [],
    fingerprint: {
      uniquenessScore: 0,
      competitiveDifferentiation: [],
      geneticStrengths: [],
      rareCapabilities: [],
      institutionalAdvantages: [],
    },
    simulations: [],
    crossCompanyGenetics: [],
    knowledgeFlow: [],
    zoomLevels: [...ZOOM_LEVELS],
    futureOpportunities: [],
  };
}

export function readCompanyGenomeStore(): CompanyGenomeStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(COMPANY_GENOME_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CompanyGenomeStore;
    return { ...emptyStore(), ...parsed, version: COMPANY_GENOME_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCompanyGenomeStore(store: CompanyGenomeStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    COMPANY_GENOME_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: COMPANY_GENOME_VERSION })
  );
}

export function bootstrapCompanyGenomeStore(seed?: Partial<CompanyGenomeStore>): void {
  const existing = readCompanyGenomeStore();
  if (existing.geneticLayers.length > 0) return;
  writeCompanyGenomeStore({ ...emptyStore(), ...seed });
}

export function selectCompanyGenomeWorkspace(id: CompanyGenomeWorkspaceId): void {
  const store = readCompanyGenomeStore();
  writeCompanyGenomeStore({ ...store, activeWorkspaceId: id });
}

export function setGenomeZoomLevel(level: CompanyGenomeStore['dashboard']['activeZoomLevel']): void {
  const store = readCompanyGenomeStore();
  writeCompanyGenomeStore({
    ...store,
    dashboard: { ...store.dashboard, activeZoomLevel: level },
  });
}
