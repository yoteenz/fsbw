import type { OrganizationQaSimulationEngineProfile } from './types';

export function queryQaSimulationEngine(
  query: string,
  profile: OrganizationQaSimulationEngineProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const s of profile.recentSimulations) {
    const hay = `${s.personaLabel} ${s.scenarioLabel} ${s.suggestedImprovements.join(' ')}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'simulation' as const,
        id: s.id,
        label: `${s.personaLabel} · ${s.scenarioLabel}`,
        score: s.successRatePct,
        matchReason: `${s.status} · ${s.successRatePct}% success`,
      });
    }
  }

  for (const g of profile.productionGates) {
    const hay = `${g.changeLabel} ${g.blockedReason ?? ''}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'gate' as const,
        id: g.changeType,
        label: g.changeLabel,
        score: g.simulationsPassed / Math.max(1, g.simulationsRequired) * 100,
        matchReason: `${g.gateStatus} · ${g.simulationsPassed}/${g.simulationsRequired} passed`,
      });
    }
  }

  return hits.slice(0, limit);
}
