import {
  OI_INTELLIGENCE_PHILOSOPHY,
  ORGANIZATIONAL_INTELLIGENCE_STORAGE_KEY,
  ORGANIZATIONAL_INTELLIGENCE_VERSION,
} from './constants';
import type { OrganizationalIntelligenceStore, OrganizationalIntelligenceWorkspaceId } from './types';

function emptyStore(): OrganizationalIntelligenceStore {
  return {
    version: ORGANIZATIONAL_INTELLIGENCE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      wisdomPct: 0,
      learningVelocityPct: 0,
      knowledgeMaturityPct: 0,
      eventsObserved: 0,
      activeQuestions: 0,
      forecastsActive: 0,
      memoryEntries: 0,
    },
    intelligencePhilosophy: [...OI_INTELLIGENCE_PHILOSOPHY],
    continuousLearning: [],
    organizationalReasoning: [],
    crossSystemIntelligence: [],
    organizationalCuriosity: [],
    decisionIntelligence: [],
    organizationalReflection: [],
    organizationalWisdom: [],
    institutionalMemory: [],
    organizationalForecasting: [],
    intelligenceCenter: [],
    executiveIntegration: [],
    founderIntelligence: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readOrganizationalIntelligenceStore(): OrganizationalIntelligenceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_INTELLIGENCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalIntelligenceStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_INTELLIGENCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalIntelligenceStore(store: OrganizationalIntelligenceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_INTELLIGENCE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: ORGANIZATIONAL_INTELLIGENCE_VERSION })
  );
}

export function bootstrapOrganizationalIntelligenceStore(seed?: Partial<OrganizationalIntelligenceStore>): void {
  const existing = readOrganizationalIntelligenceStore();
  if (existing.continuousLearning.length > 0) return;
  writeOrganizationalIntelligenceStore({ ...emptyStore(), ...seed });
}

export function selectOrganizationalIntelligenceWorkspace(id: OrganizationalIntelligenceWorkspaceId): void {
  const store = readOrganizationalIntelligenceStore();
  writeOrganizationalIntelligenceStore({ ...store, activeWorkspaceId: id });
}
