import { SIMULATION_SCENARIO_LABELS, SIMULATION_SCENARIOS } from './constants';
import { MODULE_SEEDS } from './monitor-engine';
import type { ModulePerformanceReport, ScenarioSimulationResult, SimulationScenario } from './types';

const SCENARIO_MODIFIERS: Record<
  SimulationScenario,
  { scoreDelta: number; latency: number; note: string }
> = {
  'mobile-devices': { scoreDelta: -12, latency: 420, note: 'Mid-tier mobile · 4G connection' },
  tablets: { scoreDelta: -6, latency: 280, note: 'Tablet viewport · moderate hardware' },
  desktop: { scoreDelta: 4, latency: 120, note: 'Modern desktop · fiber connection' },
  'low-bandwidth': { scoreDelta: -18, latency: 1200, note: '3G throttled · high payload modules' },
  'high-latency': { scoreDelta: -14, latency: 800, note: '200ms RTT · API-heavy workflows' },
  'older-hardware': { scoreDelta: -16, latency: 650, note: '2019 hardware · limited CPU/RAM' },
  'large-organizations': { scoreDelta: -10, latency: 520, note: 'Enterprise data volume · many modules synced' },
  'heavy-ai-workloads': { scoreDelta: -8, latency: 3200, note: 'Concurrent AI routing · Concierge + Intelligence' },
};

export function buildScenarioSimulations(reports: ModulePerformanceReport[]): ScenarioSimulationResult[] {
  const simulations: ScenarioSimulationResult[] = [];
  const modules = reports.length > 0 ? reports : MODULE_SEEDS.map((m) => ({
    moduleId: m.moduleId,
    moduleLabel: m.moduleLabel,
    performanceScore: 80,
  }));

  for (const mod of modules.slice(0, 6)) {
    for (const scenario of SIMULATION_SCENARIOS) {
      const mod_ = SCENARIO_MODIFIERS[scenario];
      const base = 'performanceScore' in mod ? mod.performanceScore : 80;
      const performanceScore = Math.max(35, Math.min(99, base + mod_.scoreDelta));
      const passed = performanceScore >= 75 && mod_.latency < 600;

      simulations.push({
        id: `sim-${scenario}-${mod.moduleId}`,
        scenario,
        scenarioLabel: SIMULATION_SCENARIO_LABELS[scenario],
        moduleId: mod.moduleId,
        moduleLabel: mod.moduleLabel,
        performanceScore,
        latencyMs: mod_.latency,
        summary: `${SIMULATION_SCENARIO_LABELS[scenario]} · ${mod.moduleLabel}: ${mod_.note}. ${passed ? 'Performance budget maintained.' : 'Performance degradation detected.'}`,
        passed,
      });
    }
  }

  return simulations;
}
