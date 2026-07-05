import {
  COMPANY_MATURITY_ENGINE_STORAGE_KEY,
  COMPANY_MATURITY_ENGINE_VERSION,
  MATURITY_PHILOSOPHY,
} from './constants';
import type { CompanyMaturityEngineStore, CompanyMaturityWorkspaceId } from './types';

function emptyStore(): CompanyMaturityEngineStore {
  return {
    version: COMPANY_MATURITY_ENGINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      overallMaturityPct: 0,
      assessmentConfidencePct: 0,
      domainsAssessed: 0,
      roadmapItems: 0,
      organizationalHealthPct: 0,
    },
    maturityPhilosophy: [...MATURITY_PHILOSOPHY],
    onboardingPath: 'import-existing',
    companyStage: 'operating',
    companyName: '',
    domainScores: [],
    existingAssets: [],
    integrations: [],
    diagnostic: {
      strengths: [],
      risks: [],
      knowledgeGaps: [],
      missingSystems: [],
      duplicateSystems: [],
      bottlenecks: [],
      growthConstraints: [],
      automationOpportunities: [],
      leadershipOpportunities: [],
      futureRecommendations: [],
    },
    architectRecs: [],
    roadmap: [],
    timeline: [],
    simulations: [],
    cosAlerts: [],
    historicalProgress: [],
    futureProjections: [],
  };
}

function refreshDashboard(store: CompanyMaturityEngineStore): CompanyMaturityEngineStore['dashboard'] {
  const avg = store.domainScores.length > 0
    ? Math.round(store.domainScores.reduce((s, d) => s + d.scorePct, 0) / store.domainScores.length)
    : 0;
  const conf = store.domainScores.length > 0
    ? Math.round(store.domainScores.reduce((s, d) => s + d.confidencePct, 0) / store.domainScores.length)
    : 0;

  return {
    ...store.dashboard,
    overallMaturityPct: avg,
    assessmentConfidencePct: conf,
    domainsAssessed: store.domainScores.length,
    roadmapItems: store.roadmap.length,
  };
}

export function readCompanyMaturityEngineStore(): CompanyMaturityEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(COMPANY_MATURITY_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as CompanyMaturityEngineStore;
    return { ...emptyStore(), ...parsed, version: COMPANY_MATURITY_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeCompanyMaturityEngineStore(store: CompanyMaturityEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    COMPANY_MATURITY_ENGINE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: COMPANY_MATURITY_ENGINE_VERSION })
  );
}

export function bootstrapCompanyMaturityEngineStore(seed?: Partial<CompanyMaturityEngineStore>): void {
  const existing = readCompanyMaturityEngineStore();
  if (existing.domainScores.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeCompanyMaturityEngineStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectCompanyMaturityWorkspace(id: CompanyMaturityWorkspaceId): void {
  const store = readCompanyMaturityEngineStore();
  writeCompanyMaturityEngineStore({
    ...store,
    activeWorkspaceId: id,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}
