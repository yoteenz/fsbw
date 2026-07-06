import { listSuggestedWhatIfScenarios } from './scenario-engine';
import {
  ensureOrganizationDigitalTwinProfile,
  getOrganizationDigitalTwinProfile,
  runSandboxWhatIfSimulation,
} from './store';
import type { DigitalTwinDockAdvice } from './types';

const WHAT_IF_PATTERN =
  /what happens if|what if we|show me what our organization|digital twin|what would happen|what our organization looks like if/i;

export function resolveDigitalTwinAdvice(
  input: string,
  organizationId: string
): DigitalTwinDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationDigitalTwinProfile(organizationId) ?? ensureOrganizationDigitalTwinProfile(organizationId);

  if (WHAT_IF_PATTERN.test(trimmed)) {
    const result = runSandboxWhatIfSimulation(organizationId, trimmed);
    return {
      response: result.executiveBriefing,
      concierge: 'Chief Concierge',
      briefing: result,
      twinFidelityScore: profile.twinFidelityScore,
    };
  }

  if (/digital twin|organization mirror|living simulation|twin fidelity|sandbox mode|sandbox replica/i.test(trimmed)) {
    const snap = profile.snapshot;
    const replicas = profile.sandboxReplicas.length;
    return {
      response: `Digital Twin™ — ${replicas} sandbox replicas active · ${snap.departmentCount} departments · ${snap.totalHeadcount} headcount · fidelity ${profile.twinFidelityScore}%. Studio Intelligence tests safely before recommending. Practice before perform.`,
      concierge: 'Chief Concierge',
      twinFidelityScore: profile.twinFidelityScore,
    };
  }

  if (/practice before|production gate|twin test|test before production/i.test(trimmed)) {
    return {
      response: profile.dockTwinLine,
      concierge: 'Chief Concierge',
      twinFidelityScore: profile.twinFidelityScore,
    };
  }

  if (/last simulation|recent what-if|simulation history|previous scenario/i.test(trimmed)) {
    const latest = profile.simulationHistory[0];
    return {
      response: latest
        ? `Latest sandbox: ${latest.scenarioLabel} — Risk ${latest.riskLevel.toUpperCase()} · ${latest.confidenceLevel}% confidence. ${latest.expectedOutcome.slice(0, 80)}… Rollback: ${latest.rollbackPlan.slice(0, 60)}…`
        : 'No simulations yet — ask "What happens if we remove this approval step?" to explore safely.',
      concierge: 'Chief Concierge',
      briefing: latest,
      twinFidelityScore: profile.twinFidelityScore,
    };
  }

  return null;
}

export function listDigitalTwinDockSuggestions(organizationId: string): string[] {
  const profile = ensureOrganizationDigitalTwinProfile(organizationId);
  const suggested = listSuggestedWhatIfScenarios(profile);
  return [
    'Show me what our organization looks like if we double next year\'s hiring.',
    ...suggested.slice(0, 2),
    'Open Digital Twin — review sandbox simulation history.',
  ].slice(0, 4);
}

export function buildProactiveDigitalTwinSuggestion(organizationId: string): string | null {
  const profile = getOrganizationDigitalTwinProfile(organizationId);
  if (!profile) return null;

  if (profile.twinFidelityScore >= 80) {
    return profile.dockTwinLine;
  }

  if (profile.simulationHistory.length === 0) {
    return `Digital Twin™ ready — ${profile.snapshot.departmentCount} departments mirrored. Try a what-if simulation in sandbox — no real data changes.`;
  }

  const latest = profile.simulationHistory[0];
  return `Last sandbox: ${latest.scenarioLabel} (${latest.confidenceLevel}% confidence). Explore more what-if scenarios before committing resources.`;
}
