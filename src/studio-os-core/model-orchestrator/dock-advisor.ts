import { summarizeModelOrchestratorProfile } from './orchestrator-builder';
import { summarizeAiSwapEngine } from './ai-swap-engine';
import { summarizeFailover } from './failover-engine';
import { summarizeLocalOffline } from './local-offline-engine';
import { summarizeBenchmarking } from './model-benchmarking';
import { summarizeMultiModelRouting } from './multi-model-router';
import {
  ensureOrganizationModelOrchestratorProfile,
  getOrganizationModelOrchestratorProfile,
} from './store';
import type { ModelOrchestratorDockAdvice } from './types';

export function resolveModelOrchestratorAdvice(
  input: string,
  organizationId: string
): ModelOrchestratorDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationModelOrchestratorProfile(organizationId) ??
    ensureOrganizationModelOrchestratorProfile(organizationId);

  if (/model orchestrator|orchestrator|ai swap|swap engine|provider swap|model agnostic/i.test(trimmed)) {
    return {
      response: summarizeModelOrchestratorProfile(profile),
      concierge: 'Chief Concierge',
      orchestratorScore: profile.orchestratorScore,
      failoverHealthPct: profile.failoverHealthPct,
    };
  }

  if (/multi.model|task routing|which model|different models/i.test(trimmed)) {
    return {
      response: summarizeMultiModelRouting(profile.taskRoutes),
      concierge: 'Chief Concierge',
    };
  }

  if (/swap|switch provider|openai|anthropic|google|xai|replaceable/i.test(trimmed)) {
    return {
      response: summarizeAiSwapEngine(profile.swapProtectedFeatures),
      concierge: 'Chief Concierge',
      orchestratorScore: profile.orchestratorScore,
    };
  }

  if (/failover|retry|backup|provider fail|never collapse|graceful/i.test(trimmed)) {
    return {
      response: summarizeFailover(profile.failoverPlan),
      concierge: 'Chief Concierge',
      failoverHealthPct: profile.failoverHealthPct,
    };
  }

  if (/local model|offline|enterprise.sensitive|private reasoning/i.test(trimmed)) {
    return {
      response: summarizeLocalOffline(profile.localOfflineCapabilities, profile.offlineCapable),
      concierge: 'Chief Concierge',
    };
  }

  if (/benchmark|accuracy|speed|cost|organization fit|founder preference/i.test(trimmed)) {
    return {
      response: summarizeBenchmarking(profile.benchmarkScores),
      concierge: 'Chief Concierge',
    };
  }

  if (/studio intelligence remains|interchangeable|not fragile|pricing|shut down/i.test(trimmed)) {
    return {
      response: `Model Orchestrator™ ensures Studio OS is not fragile — ${profile.swapProtectedFeatures.length} features protected by AI Swap Engine™. Models can change. Studio Intelligence™ remains.`,
      concierge: 'Chief Concierge',
      orchestratorScore: profile.orchestratorScore,
    };
  }

  return null;
}

export function listModelOrchestratorDockSuggestions(organizationId: string): string[] {
  ensureOrganizationModelOrchestratorProfile(organizationId);
  return [
    'Explain Model Orchestrator and AI Swap Engine.',
    'What happens if our AI provider fails?',
    'Show multi-model routing for our organization.',
    'Which features continue working after a provider swap?',
  ].slice(0, 4);
}

export function buildProactiveModelOrchestratorSuggestion(organizationId: string): string | null {
  const profile = getOrganizationModelOrchestratorProfile(organizationId);
  if (!profile) return null;
  return summarizeModelOrchestratorProfile(profile);
}

export function buildModelOrchestratorOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationModelOrchestratorProfile(organizationId);
  return profile.dockOrchestratorLine;
}
