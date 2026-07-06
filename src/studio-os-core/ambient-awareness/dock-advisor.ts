import {
  ensureOrganizationAmbientAwarenessProfile,
  getOrganizationAmbientAwarenessProfile,
} from './store';
import type { AmbientAwarenessDockAdvice } from './types';

export function resolveAmbientAwarenessAdvice(
  input: string,
  organizationId: string
): AmbientAwarenessDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationAmbientAwarenessProfile(organizationId) ?? ensureOrganizationAmbientAwarenessProfile(organizationId);

  if (
    /daily briefing|executive briefing|what('s| is) happening|brief me|morning briefing|what should i focus|current state/i.test(
      trimmed
    )
  ) {
    return {
      response: profile.dailyBriefing.fullBriefing,
      concierge: 'Chief Concierge',
      briefing: profile.dailyBriefing,
      awarenessScore: profile.awarenessScore,
    };
  }

  if (/ambient awareness|what am i working on|current context|what('s| is) waiting|unresolved decision/i.test(trimmed)) {
    const ctx = profile.intelligentContext;
    return {
      response: [
        `Active: ${ctx.activeOrganization} · Focus: ${ctx.founderFocus}`,
        ctx.waitingProjects.length ? `Waiting: ${ctx.waitingProjects[0]}` : 'No blocked projects flagged.',
        ctx.unresolvedDecisions.length ? `Decisions: ${ctx.unresolvedDecisions[0]}` : 'No unresolved council decisions.',
        `Awareness ${profile.awarenessScore}% — present, not reactive. Never ask unnecessary questions.`,
      ].join('\n'),
      concierge: 'Chief Concierge',
      awarenessScore: profile.awarenessScore,
    };
  }

  if (/department awareness|what are other departments|cross-department|who is doing what/i.test(trimmed)) {
    const dept = profile.departmentSnapshots[0];
    return {
      response: dept
        ? `${profile.departmentSnapshots.length} departments aware · ${dept.departmentName}: ${dept.currentFocus}. No Concierge operates in isolation.`
        : 'Department awareness syncing from executive roster.',
      concierge: 'Chief Concierge',
      awarenessScore: profile.awarenessScore,
    };
  }

  if (/top priority|highest priority|what matters today/i.test(trimmed)) {
    return {
      response: profile.dailyBriefing.topPriority,
      concierge: 'Chief Concierge',
      briefing: profile.dailyBriefing,
      awarenessScore: profile.awarenessScore,
    };
  }

  return null;
}

export function listAmbientAwarenessDockSuggestions(organizationId: string): string[] {
  ensureOrganizationAmbientAwarenessProfile(organizationId);
  return [
    'Give me today\'s executive briefing',
    'What is happening across the organization?',
    'What should I focus on today?',
    'What are other departments working on?',
  ].slice(0, 4);
}

export function buildProactiveAmbientAwarenessSuggestion(organizationId: string): string | null {
  const profile = getOrganizationAmbientAwarenessProfile(organizationId);
  if (!profile) return null;

  const lines = profile.dailyBriefing.briefingLines.slice(0, 4);
  return `${profile.dailyBriefing.greeting} ${lines.join(' ')} ${profile.dailyBriefing.topPriority}`;
}

export function buildHeadquartersOpeningBriefing(organizationId: string): string {
  const profile = ensureOrganizationAmbientAwarenessProfile(organizationId);
  return profile.dailyBriefing.fullBriefing;
}
