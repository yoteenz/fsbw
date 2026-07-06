import { PHASE_DESCRIPTIONS } from './constants';
import {
  ensureOrganizationShadowModeProfile,
  getOrganizationShadowModeProfile,
  getConciergeShadowStatus,
} from './store';
import type { ShadowModeDockAdvice } from './types';

export function resolveShadowModeAdvice(
  input: string,
  organizationId: string
): ShadowModeDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationShadowModeProfile(organizationId) ?? ensureOrganizationShadowModeProfile(organizationId);

  if (/shadow mode|learning phase|observe before|automation readiness|digital staff trust/i.test(trimmed)) {
    const observing = profile.conciergeProfiles.filter((c) => c.currentPhase === 'observe').length;
    const ready = profile.conciergesReadyToAutomate;
    return {
      response: `Shadow Mode: ${profile.conciergeProfiles.length} concierges · ${observing} observing · ${ready} ready to automate · trust ${profile.overallTrustScore}%. Observation before execution — nothing invisible.`,
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  if (/what was observed|transparency|what did.*learn|confidence increased/i.test(trimmed)) {
    const entry = profile.transparencyLog[0];
    return {
      response: entry
        ? `${entry.conciergeName}: Observed — ${entry.observed.slice(0, 80)}. Learned — ${entry.learned.slice(0, 80)}. ${entry.confidenceReason}`
        : 'Transparency log building — concierges are observing workflows before participating.',
      concierge: 'Chief Concierge',
      phase: entry?.phase,
      overallTrustScore: profile.overallTrustScore,
    };
  }

  const conciergeMatch = profile.conciergeProfiles.find((c) =>
    trimmed.toLowerCase().includes(c.conciergeName.toLowerCase().split(' ')[0])
  );
  if (conciergeMatch && /phase|confidence|shadow|automate/i.test(trimmed)) {
    const phaseDesc = PHASE_DESCRIPTIONS[conciergeMatch.currentPhase];
    return {
      response: `${conciergeMatch.conciergeName}: ${phaseDesc.label} — ${phaseDesc.summary} Confidence ${conciergeMatch.confidence.overallConfidence}%. ${conciergeMatch.phaseRationale}`,
      concierge: conciergeMatch.conciergeName,
      phase: conciergeMatch.currentPhase,
      overallTrustScore: profile.overallTrustScore,
    };
  }

  if (/can.*automate|ready to automate|when will.*automate/i.test(trimmed)) {
    const ready = profile.conciergeProfiles.filter((c) => c.canAutomate);
    const pending = profile.conciergeProfiles.filter((c) => !c.canAutomate && c.currentPhase !== 'observe');
    return {
      response: ready.length
        ? `${ready.length} concierge(s) meet automation threshold: ${ready.map((c) => c.conciergeName).join(', ')}.`
        : `${pending.length || profile.conciergeProfiles.length} still building confidence — Studio OS never automates below founder thresholds.`,
      concierge: 'Chief Concierge',
      overallTrustScore: profile.overallTrustScore,
    };
  }

  return null;
}

export function listShadowModeDockSuggestions(organizationId: string): string[] {
  ensureOrganizationShadowModeProfile(organizationId);
  const profile = getOrganizationShadowModeProfile(organizationId);

  const suggestions = [
    'What phase are our Digital Concierges in?',
    'Show Shadow Mode transparency — what was observed?',
    'Which concierges are ready to automate?',
  ];

  const chief = getConciergeShadowStatus(organizationId, 'chief-concierge');
  if (chief && chief.currentPhase === 'observe') {
    suggestions.unshift('Chief Concierge is still observing — no automation yet.');
  }

  if (profile?.conciergesReadyToAutomate) {
    suggestions.unshift(`${profile.conciergesReadyToAutomate} concierge(s) reached automation readiness.`);
  }

  return suggestions.slice(0, 4);
}

export function buildProactiveShadowSuggestion(organizationId: string): string | null {
  const profile = getOrganizationShadowModeProfile(organizationId);
  if (!profile) return null;

  const observing = profile.conciergeProfiles.filter((c) => c.currentPhase === 'observe');
  if (observing.length === profile.conciergeProfiles.length) {
    return `Shadow Mode: All ${observing.length} concierges observing — learning workflows before any automation. Trust through observation.`;
  }

  const ready = profile.conciergeProfiles.find((c) => c.canAutomate);
  if (ready) {
    return `${ready.conciergeName} reached automation readiness (${ready.confidence.automationReadiness}%) — review transparency log before enabling Phase 4.`;
  }

  const recommending = profile.conciergeProfiles.find((c) => c.currentPhase === 'recommend');
  if (recommending) {
    return `${recommending.conciergeName} in Recommend phase — suggesting improvements, founder approval still required.`;
  }

  return `Shadow Mode trust ${profile.overallTrustScore}% — Digital Staff learn before they automate. Observe first. Automate later.`;
}
