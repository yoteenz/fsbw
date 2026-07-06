import { queryQaSimulationEngine } from './discovery-engine';
import { summarizeQaSimulationEngine, canReachProduction } from './engine-profile-builder';
import {
  ensureOrganizationQaSimulationEngineProfile,
  getOrganizationQaSimulationEngineProfile,
  runSimulation,
} from './store';
import type { QaSimulationEngineDockAdvice } from './types';

export function resolveQaSimulationEngineAdvice(input: string, organizationId: string): QaSimulationEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationQaSimulationEngineProfile(organizationId) ??
    ensureOrganizationQaSimulationEngineProfile(organizationId);

  if (/qa simulation|simulation engine|practice field|pre.?production|rehears/i.test(trimmed)) {
    return {
      response: summarizeQaSimulationEngine(profile),
      concierge: 'Chief Concierge',
      simulationScore: profile.simulationScore,
    };
  }

  if (/production gate|can.*reach production|ready for production/i.test(trimmed)) {
    const cleared = canReachProduction(profile);
    return {
      response: cleared
        ? 'Production gate cleared — all required simulations passed.'
        : `Production gate ${profile.productionGateStatus} — resolve simulations and inspector findings first.`,
      concierge: 'Chief Concierge',
      simulationScore: profile.simulationScore,
    };
  }

  if (/run simulation|simulate customer|simulate employee/i.test(trimmed)) {
    runSimulation(organizationId, 'customer', 'book-appointment');
    return {
      response: 'Customer booking simulation queued — results will include success rate, drop-off risk, and improvements.',
      concierge: 'Chief Concierge',
      simulationScore: profile.simulationScore,
    };
  }

  if (/drop.?off|confusing screens|broken flows/i.test(trimmed)) {
    const issues = profile.recentSimulations
      .filter((s) => s.brokenFlows.length > 0 || s.confusingScreens.length > 0)
      .slice(0, 2)
      .map((s) => `${s.scenarioLabel}: ${[...s.brokenFlows, ...s.confusingScreens].slice(0, 2).join('; ')}`)
      .join(' · ');
    return {
      response: issues || 'No broken flows in recent simulations — practice field monitoring.',
      concierge: 'Chief Concierge',
    };
  }

  const hits = queryQaSimulationEngine(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      simulationScore: profile.simulationScore,
    };
  }

  return null;
}

export function buildProactiveQaSimulationEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationQaSimulationEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeQaSimulationEngine(profile);
}

export function buildQaSimulationEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationQaSimulationEngineProfile(organizationId);
  return profile.dockSimulationLine;
}
