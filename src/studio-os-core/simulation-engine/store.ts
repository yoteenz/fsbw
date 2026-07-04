import { SIMULATION_ENGINE_STORAGE_KEY, SIMULATION_ENGINE_VERSION } from './constants';
import type { SimulationDashboardSnapshot, SimulationEngineStore } from './types';

function defaultDashboard(): SimulationDashboardSnapshot {
  return {
    activeSimulations: 0,
    completedSimulations: 0,
    savedScenarios: 0,
    highestConfidenceModel: 0,
    historicalComparisons: 0,
    recommendedSimulations: 0,
  };
}

function emptyStore(): SimulationEngineStore {
  return {
    simulations: [],
    scenarios: [],
    riskAnalyses: [],
    financialSims: [],
    marketingSims: [],
    contentSims: [],
    organizationSims: [],
    marketplaceSims: [],
    timelineProjections: [],
    decisionReports: [],
    executiveContributions: [],
    library: [],
    learningLoops: [],
    intelligenceRecommendations: [],
    dashboard: defaultDashboard(),
    version: SIMULATION_ENGINE_VERSION,
  };
}

export function readSimulationEngineStore(): SimulationEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(SIMULATION_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as SimulationEngineStore;
    return { ...emptyStore(), ...parsed, version: SIMULATION_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeSimulationEngineStore(store: SimulationEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SIMULATION_ENGINE_STORAGE_KEY, JSON.stringify(store));
}

export function mergeSimulationEnginePatch(patch: Partial<SimulationEngineStore>): void {
  const store = readSimulationEngineStore();
  writeSimulationEngineStore({ ...store, ...patch, version: SIMULATION_ENGINE_VERSION });
}

export function getSimulationsForWorkspace(workspaceId: string) {
  const store = readSimulationEngineStore();
  const sims = store.simulations.filter((s) => s.workspaceId === workspaceId);
  const simIds = new Set(sims.map((s) => s.id));
  return {
    simulations: sims,
    scenarios: store.scenarios.filter((s) => simIds.has(s.simulationId)),
    riskAnalyses: store.riskAnalyses.filter((r) => simIds.has(r.simulationId)),
    financialSims: store.financialSims.filter((f) => simIds.has(f.simulationId)),
    marketingSims: store.marketingSims.filter((m) => simIds.has(m.simulationId)),
    contentSims: store.contentSims.filter((c) => simIds.has(c.simulationId)),
    organizationSims: store.organizationSims.filter((o) => simIds.has(o.simulationId)),
    marketplaceSims: store.marketplaceSims.filter((m) => simIds.has(m.simulationId)),
    timelineProjections: store.timelineProjections.filter((t) => simIds.has(t.simulationId)),
    decisionReports: store.decisionReports.filter((d) => simIds.has(d.simulationId)),
    executiveContributions: store.executiveContributions.filter((e) => simIds.has(e.simulationId)),
    library: store.library.filter((l) => l.workspaceId === workspaceId),
    learningLoops: store.learningLoops.filter((l) => l.workspaceId === workspaceId),
    intelligenceRecommendations: store.intelligenceRecommendations.filter((r) => r.workspaceId === workspaceId),
    dashboard: store.dashboard,
  };
}

export function refreshSimulationDashboard(workspaceId: string): void {
  const store = readSimulationEngineStore();
  const sims = store.simulations.filter((s) => s.workspaceId === workspaceId);
  const completed = sims.filter((s) => s.status === 'completed');
  const active = sims.filter((s) => s.status === 'running' || s.status === 'draft');
  const simIds = new Set(sims.map((s) => s.id));
  const scenarios = store.scenarios.filter((s) => simIds.has(s.simulationId));
  const maxConfidence = completed.length > 0 ? Math.max(...completed.map((s) => s.confidence)) : 0;

  const dashboard: SimulationDashboardSnapshot = {
    activeSimulations: active.length,
    completedSimulations: completed.length,
    savedScenarios: scenarios.length,
    highestConfidenceModel: maxConfidence,
    historicalComparisons: store.learningLoops.filter((l) => l.workspaceId === workspaceId).length,
    recommendedSimulations: store.intelligenceRecommendations.filter((r) => r.workspaceId === workspaceId).length,
  };

  writeSimulationEngineStore({ ...store, dashboard });
}

export function bootstrapSimulationEngineStore(): SimulationEngineStore {
  return readSimulationEngineStore();
}
