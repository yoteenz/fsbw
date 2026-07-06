import { summarizeCognitiveLoadProfile } from './cognitive-load-builder';
import {
  ensureOrganizationFounderCognitiveLoadProfile,
  getOrganizationFounderCognitiveLoadProfile,
} from './store';
import type { FounderCognitiveLoadDockAdvice } from './types';

export function resolveFounderCognitiveLoadAdvice(
  input: string,
  organizationId: string
): FounderCognitiveLoadDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationFounderCognitiveLoadProfile(organizationId) ??
    ensureOrganizationFounderCognitiveLoadProfile(organizationId);

  if (
    /cognitive load|mental workload|founder workload|attention|focus protection|how loaded|decision fatigue/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeCognitiveLoadProfile(profile),
      concierge: 'Chief Concierge',
      cognitiveDemandPct: profile.cognitiveDemandPct,
      focusProtectionPct: profile.focusProtectionPct,
      loadState: profile.loadState,
    };
  }

  if (/what did you postpone|postponed|delayed notification|batch|combined.*notification/i.test(trimmed)) {
    const action = profile.executiveAssistance.find((a) => a.category === 'postponed' || a.category === 'batched');
    return {
      response: action?.message ?? profile.dockHeadline,
      concierge: 'Chief Concierge',
      cognitiveDemandPct: profile.cognitiveDemandPct,
      focusProtectionPct: profile.focusProtectionPct,
      loadState: profile.loadState,
    };
  }

  if (/delegat|hidden activity|protect.*focus|interruption/i.test(trimmed)) {
    const action = profile.executiveAssistance.find((a) => a.category === 'delegated' || a.category === 'hidden');
    return {
      response: action?.message ?? 'Focus protection active — non-essential activity filtered.',
      concierge: 'Chief Concierge',
      focusProtectionPct: profile.focusProtectionPct,
      loadState: profile.loadState,
    };
  }

  if (/attention mode|creating|presenting|deep work|in meetings|traveling/i.test(trimmed)) {
    const mode = profile.attentionModes.find((m) => m.detected);
    return {
      response: mode
        ? `${mode.label} detected — ${mode.communicationStyle}`
        : `Attention mode: ${profile.activeAttentionMode.replace(/-/g, ' ')}`,
      concierge: 'Chief Concierge',
      loadState: profile.loadState,
    };
  }

  if (/pending approval|decision|priorit/i.test(trimmed)) {
    const top = profile.factorSnapshots
      .slice()
      .sort((a, b) => b.demandPct - a.demandPct)
      .slice(0, 3);
    return {
      response: top.map((f) => `${f.label}: ${f.demandPct}% — ${f.summary}`).join('\n'),
      concierge: 'Chief Concierge',
      cognitiveDemandPct: profile.cognitiveDemandPct,
      loadState: profile.loadState,
    };
  }

  return null;
}

export function listFounderCognitiveLoadDockSuggestions(organizationId: string): string[] {
  ensureOrganizationFounderCognitiveLoadProfile(organizationId);
  return [
    'What is my current cognitive load?',
    'How are you protecting my attention today?',
    'What notifications have you batched or postponed?',
    'What attention mode am I in right now?',
  ].slice(0, 4);
}

export function buildProactiveFounderCognitiveLoadSuggestion(organizationId: string): string | null {
  const profile = getOrganizationFounderCognitiveLoadProfile(organizationId);
  if (!profile) return null;
  return summarizeCognitiveLoadProfile(profile);
}
