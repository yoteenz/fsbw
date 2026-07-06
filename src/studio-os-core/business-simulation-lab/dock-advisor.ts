import { listSuggestedLabSimulations } from './simulation-engine';
import {
  ensureOrganizationSimulationLabProfile,
  getOrganizationSimulationLabProfile,
  runLabSimulation,
} from './store';
import type { SimulationLabDockAdvice } from './types';

const LAB_PATTERN =
  /simulate|simulation lab|business simulation|model|forecast|test strategy|practice tomorrow|what if we|run a simulation|strategic experiment/i;

export function resolveSimulationLabAdvice(
  input: string,
  organizationId: string
): SimulationLabDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationSimulationLabProfile(organizationId) ?? ensureOrganizationSimulationLabProfile(organizationId);

  if (LAB_PATTERN.test(trimmed) && trimmed.length > 15) {
    const report = runLabSimulation(organizationId, trimmed);
    const council = report.councilReview;
    return {
      response: [
        `BUSINESS SIMULATION LAB™ REPORT (SANDBOX)`,
        report.executiveSummary,
        ``,
        `Revenue: ${report.revenueImpact.slice(0, 100)}`,
        `Confidence: ${report.confidenceScore}%`,
        `Executive Council: ${council.participants.slice(0, 3).join(', ')} reviewed — ${council.summary.slice(0, 120)}`,
        ``,
        `⚠ Sandbox only — no real business changes.`,
      ].join('\n'),
      concierge: 'Chief Concierge',
      report,
      labReadinessScore: profile.labReadinessScore,
    };
  }

  if (/simulation lab|business simulation|scenario library|strategic lab/i.test(trimmed)) {
    const pending = profile.scenariosPendingDecision;
    return {
      response: `Business Simulation Lab™ — readiness ${profile.labReadinessScore}% · ${profile.totalSimulationsRun} simulations run · ${pending} pending founder decision. Practice tomorrow before living it.`,
      concierge: 'Chief Concierge',
      labReadinessScore: profile.labReadinessScore,
    };
  }

  if (/last simulation|recent report|scenario library/i.test(trimmed)) {
    const latest = profile.reports[0];
    return {
      response: latest
        ? `Latest: ${latest.scenarioTitle} — ${latest.executiveSummary.slice(0, 120)} Council confidence ${latest.councilReview.confidencePct}%.`
        : 'No simulations yet — ask "Simulate a 20% marketing increase" to begin strategic experimentation.',
      concierge: 'Chief Concierge',
      report: latest,
      labReadinessScore: profile.labReadinessScore,
    };
  }

  return null;
}

export function listSimulationLabDockSuggestions(organizationId: string): string[] {
  const profile = ensureOrganizationSimulationLabProfile(organizationId);
  const suggested = listSuggestedLabSimulations(profile);
  return [
    'Simulate doubling next year\'s hiring plan',
    ...suggested.slice(0, 2),
    'Show Scenario Library — pending strategic decisions',
  ].slice(0, 4);
}

export function buildProactiveSimulationLabSuggestion(organizationId: string): string | null {
  const profile = getOrganizationSimulationLabProfile(organizationId);
  if (!profile) return null;

  if (profile.scenariosPendingDecision > 0) {
    return `${profile.scenariosPendingDecision} simulated scenario(s) awaiting founder decision — review in Business Simulation Lab before acting.`;
  }

  if (profile.totalSimulationsRun === 0) {
    return `Business Simulation Lab™ ready — test strategies and long-term decisions in sandbox before implementing. Practice tomorrow before living it.`;
  }

  return `Lab readiness ${profile.labReadinessScore}% · ${profile.totalSimulationsRun} strategic simulations completed. Better decisions come from better preparation.`;
}
