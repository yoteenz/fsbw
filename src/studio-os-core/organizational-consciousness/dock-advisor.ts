import { summarizeOrganizationalConsciousnessProfile } from './consciousness-builder';
import { summarizeContinuousLearning } from './learning-engine';
import { summarizeReasoningContext } from './reasoning-engine';
import { summarizeConnectedSystems } from './system-integration';
import {
  ensureOrganizationConsciousnessProfile,
  getOrganizationConsciousnessProfile,
} from './store';
import type { OrganizationalConsciousnessDockAdvice } from './types';

export function resolveOrganizationalConsciousnessAdvice(
  input: string,
  organizationId: string
): OrganizationalConsciousnessDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationConsciousnessProfile(organizationId) ??
    ensureOrganizationConsciousnessProfile(organizationId);

  if (
    /organizational consciousness|unified intelligence|master intelligence|executive consciousness|living consciousness/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeOrganizationalConsciousnessProfile(profile),
      concierge: 'Chief Concierge',
      consciousnessScore: profile.consciousnessScore,
      systemsConnected: profile.systemsConnected,
    };
  }

  if (/connected system|integrate|share context|unify/i.test(trimmed)) {
    return {
      response: profile.connectedSystems
        .slice(0, 8)
        .map((s) => `${s.label}: ${s.contextShared}`)
        .join('\n'),
      concierge: 'Chief Concierge',
      systemsConnected: profile.systemsConnected,
    };
  }

  if (/holistic|reasoning|consider|before recommend/i.test(trimmed)) {
    const top = profile.holisticRecommendations[0];
    return {
      response: [
        summarizeReasoningContext(profile.reasoningContext),
        top ? `Top recommendation: ${top.recommendation} — ${top.reasoning}` : '',
      ]
        .filter(Boolean)
        .join(' '),
      concierge: 'Chief Concierge',
      consciousnessScore: profile.consciousnessScore,
    };
  }

  if (/learn|continuous learning|strengthen|interaction/i.test(trimmed)) {
    return {
      response: summarizeContinuousLearning(profile.continuousLearning),
      concierge: 'Chief Concierge',
    };
  }

  if (/preserve expertise|build legacy|purpose|identity|executive identity/i.test(trimmed)) {
    return {
      response: [
        profile.executiveIdentityLine,
        'PRESERVE EXPERTISE. BUILD LEGACY.',
        'Organizations are defined by intelligence — Studio OS preserves, strengthens, and extends it for generations.',
      ].join(' '),
      concierge: 'Chief Concierge',
      consciousnessScore: profile.consciousnessScore,
    };
  }

  if (/remember|predict|prepare|collaborate|adapt|protect|teach|grow/i.test(trimmed)) {
    return {
      response: profile.executiveIdentityLine,
      concierge: 'Chief Concierge',
    };
  }

  if (/blueprint|profession brain|genome|memory engine|presence|relationship|pulse|health|predictive|preparation|confidence|legacy|command dock/i.test(
    trimmed
  )) {
    const match = profile.connectedSystems.find((s) =>
      new RegExp(trimmed.split(/\s+/)[0] ?? '', 'i').test(s.label + s.systemId)
    );
    return {
      response: match
        ? `${match.label} — ${match.contextShared} (${match.vitalityPct}% vitality)`
        : summarizeConnectedSystems(profile.connectedSystems),
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listOrganizationalConsciousnessDockSuggestions(organizationId: string): string[] {
  ensureOrganizationConsciousnessProfile(organizationId);
  return [
    'How unified is our Organizational Consciousness?',
    'What holistic recommendations consider all our intelligence systems?',
    'Which systems are sharing context right now?',
    'How does Studio OS preserve expertise and build legacy?',
  ].slice(0, 4);
}

export function buildProactiveOrganizationalConsciousnessSuggestion(organizationId: string): string | null {
  const profile = getOrganizationConsciousnessProfile(organizationId);
  if (!profile) return null;
  return summarizeOrganizationalConsciousnessProfile(profile);
}

export function buildConsciousnessOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationConsciousnessProfile(organizationId);
  return profile.dockConsciousnessLine;
}
