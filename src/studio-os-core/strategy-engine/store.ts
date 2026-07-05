import { STRATEGY_HIERARCHY_CHAIN, STRATEGY_ENGINE_STORAGE_KEY, STRATEGY_ENGINE_VERSION } from './constants';
import type { StrategyEngineStore, WorkspaceStrategyId } from './types';

function emptyStore(): StrategyEngineStore {
  return {
    version: STRATEGY_ENGINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      activeStrategies: 0,
      activeInitiatives: 0,
      strategicBets: 0,
      alignmentRatePct: 0,
      strategyHealthPct: 0,
    },
    hierarchyLevels: STRATEGY_HIERARCHY_CHAIN,
    profiles: [],
    strategies: [],
    initiatives: [],
    bets: [],
    health: {
      clarity: 0,
      alignment: 0,
      executionProgress: 0,
      kpiMovement: 0,
      riskLevel: 0,
      resourceFit: 0,
      timing: 0,
      confidence: 0,
      marketSignal: 0,
      learningVelocity: 0,
      overallPct: 0,
      weakAreas: [],
      recommendations: [],
    },
    decisions: [],
    reviews: [],
    alignmentChecks: [],
    intelligenceSignals: [],
    cosPrioritization: [],
    simulations: [],
    inheritanceOptions: [],
    board: {
      currentObjective: '',
      northStarMetric: '',
      northStarProgress: '',
      activeStrategies: [],
      activeInitiatives: [],
      keyRisks: [],
      keyOpportunities: [],
      strategicBets: [],
      recommendedNextMoves: [],
      recentDecisions: [],
      strategyHealthPct: 0,
    },
    builderStep: 0,
    selectedStrategyId: null,
    selectedInitiativeId: null,
  };
}

function refreshDashboard(store: StrategyEngineStore): StrategyEngineStore['dashboard'] {
  const activeStrategies = store.strategies.filter((s) => s.status === 'active').length;
  const activeInitiatives = store.initiatives.filter((i) => i.status === 'active').length;
  const aligned = store.alignmentChecks.filter((c) => c.aligned).length;
  const alignmentRatePct =
    store.alignmentChecks.length > 0 ? Math.round((aligned / store.alignmentChecks.length) * 100) : 100;

  return {
    ...store.dashboard,
    activeStrategies,
    activeInitiatives,
    strategicBets: store.bets.filter((b) => b.status === 'testing' || b.status === 'hypothesis').length,
    alignmentRatePct,
    strategyHealthPct: store.health.overallPct,
  };
}

export function readStrategyEngineStore(): StrategyEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STRATEGY_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StrategyEngineStore;
    return { ...emptyStore(), ...parsed, version: STRATEGY_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeStrategyEngineStore(store: StrategyEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    STRATEGY_ENGINE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: STRATEGY_ENGINE_VERSION })
  );
}

export function bootstrapStrategyEngineStore(seed?: Partial<StrategyEngineStore>): void {
  const existing = readStrategyEngineStore();
  if (existing.profiles.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeStrategyEngineStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectStrategyEngineWorkspace(id: WorkspaceStrategyId): void {
  const store = readStrategyEngineStore();
  const profile = store.profiles.find((p) => p.workspaceId === id);
  const strategies = store.strategies.filter((s) => s.workspaceId === id);
  const initiatives = store.initiatives.filter((i) => i.workspaceId === id);
  writeStrategyEngineStore({
    ...store,
    activeWorkspaceId: id,
    selectedStrategyId: strategies[0]?.id ?? null,
    selectedInitiativeId: initiatives[0]?.id ?? null,
    board: profile
      ? {
          ...store.board,
          currentObjective: profile.companyObjective,
          northStarMetric: profile.northStarMetric,
          northStarProgress: `${profile.northStarCurrent} → ${profile.northStarTarget}`,
          activeStrategies: strategies.filter((s) => s.status === 'active').map((s) => s.title),
          activeInitiatives: initiatives.filter((i) => i.status === 'active').map((i) => i.name),
        }
      : store.board,
  });
}

export function selectStrategyEngineStrategy(id: string | null): void {
  const store = readStrategyEngineStore();
  writeStrategyEngineStore({ ...store, selectedStrategyId: id });
}

export function selectStrategyEngineInitiative(id: string | null): void {
  const store = readStrategyEngineStore();
  writeStrategyEngineStore({ ...store, selectedInitiativeId: id });
}

export function setStrategyBuilderStep(step: number): void {
  const store = readStrategyEngineStore();
  writeStrategyEngineStore({ ...store, builderStep: Math.max(0, Math.min(9, step)) });
}

export function refreshStrategyEngineDashboard(): void {
  const store = readStrategyEngineStore();
  writeStrategyEngineStore({ ...store, dashboard: refreshDashboard(store) });
}
