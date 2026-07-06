import { explainExperienceMode, queryExperienceEngine } from './discovery-engine';
import { summarizeExperienceEngine } from './engine-profile-builder';
import {
  ensureOrganizationExperienceEngineProfile,
  getOrganizationExperienceEngineProfile,
  setExperienceMode,
} from './store';
import type { ExperienceEngineDockAdvice } from './types';

export function resolveExperienceEngineAdvice(input: string, organizationId: string): ExperienceEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationExperienceEngineProfile(organizationId) ??
    ensureOrganizationExperienceEngineProfile(organizationId);

  if (/experience engine|adaptive atmosphere|experiential|how.*feel|infrastructure chapter/i.test(trimmed)) {
    return {
      response: summarizeExperienceEngine(profile),
      concierge: 'Chief Concierge',
      atmosphereScore: profile.atmosphereScore,
    };
  }

  if (/entered focus mode|focus mode|deep work|reduced distractions/i.test(trimmed)) {
    setExperienceMode(organizationId, 'focus-mode');
    return {
      response: "I've entered Focus Mode — reduced distractions, muted accents, urgent notifications only.",
      concierge: 'Chief Concierge',
    };
  }

  if (/presentation mode.*ready|presentation mode|stakeholder/i.test(trimmed)) {
    return {
      response: 'Presentation Mode is ready — polished dashboard, hidden internal metrics, presentation lighting.',
      concierge: 'Chief Concierge',
    };
  }

  if (/congratulations.*launch|today.*launch|celebration|milestone/i.test(trimmed)) {
    return {
      response: "Congratulations on today's launch — tasteful Celebration Mode available. Infrastructure Chapter complete.",
      concierge: 'Chief Concierge',
      atmosphereScore: profile.atmosphereScore,
    };
  }

  if (/reduced distractions|while you work|protect focus/i.test(trimmed)) {
    return {
      response: "I've reduced distractions while you work — Focus Mode active, Command Dock concise, notifications filtered.",
      concierge: 'Chief Concierge',
    };
  }

  if (/emergency mode|critical issue/i.test(trimmed)) {
    return {
      response: 'Emergency Mode available — high-contrast clarity, essential panels only, calm urgency without panic.',
      concierge: 'Chief Concierge',
    };
  }

  if (/night mode|after hours|eye strain/i.test(trimmed)) {
    return {
      response: 'Night Mode dims lighting and softens glass — suggested after 8 PM based on time-of-day signal.',
      concierge: 'Chief Concierge',
    };
  }

  if (/context|calendar|pulse|cognitive load|adapt/i.test(trimmed)) {
    const signals = profile.contextSignals.filter((s) => s.active).slice(0, 3).map((s) => s.label);
    return {
      response: `Context-aware (${profile.contextAwarenessPct}%): ${signals.join(' · ')} — atmosphere adapts to your moment.`,
      concierge: 'Chief Concierge',
    };
  }

  const explainMatch = trimmed.match(/explain (?:mode|experience)\s+(.+)/i);
  if (explainMatch) {
    const hits = queryExperienceEngine(explainMatch[1], profile.activeMode, 1);
    if (hits[0]?.type === 'mode') {
      return { response: explainExperienceMode(hits[0].id) ?? hits[0].label, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryExperienceEngine(trimmed, profile.activeMode, 3);
  if (hits.length > 0 && /find|search|show|list|which/i.test(trimmed)) {
    return {
      response: hits.map((h) => h.label).join(' · '),
      concierge: 'Chief Concierge',
      atmosphereScore: profile.atmosphereScore,
    };
  }

  return null;
}

export function listExperienceEngineDockSuggestions(_organizationId: string): string[] {
  return [
    "I've entered Focus Mode.",
    'Presentation Mode is ready.',
    "Congratulations on today's launch.",
    "I've reduced distractions while you work.",
  ].slice(0, 4);
}

export function buildProactiveExperienceEngineSuggestion(organizationId: string): string | null {
  const profile = getOrganizationExperienceEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeExperienceEngine(profile);
}

export function buildExperienceEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationExperienceEngineProfile(organizationId);
  return profile.dockExperienceLine;
}
