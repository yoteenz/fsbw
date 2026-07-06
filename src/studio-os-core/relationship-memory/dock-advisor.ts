import { summarizeRelationshipMemoryProfile } from './memory-builder';
import {
  ensureOrganizationRelationshipMemoryProfile,
  getOrganizationRelationshipMemoryProfile,
} from './store';
import type { RelationshipMemoryDockAdvice } from './types';

export function resolveRelationshipMemoryAdvice(
  input: string,
  organizationId: string
): RelationshipMemoryDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationRelationshipMemoryProfile(organizationId) ??
    ensureOrganizationRelationshipMemoryProfile(organizationId);

  if (
    /relationship memory|how do i work|working preferences|professional preferences|familiarity/i.test(trimmed)
  ) {
    return {
      response: summarizeRelationshipMemoryProfile(profile),
      concierge: 'Chief Concierge',
      familiarityScore: profile.familiarityScore,
      preferencesLearned: profile.preferencesLearned,
    };
  }

  if (/communication style|how do i prefer to communicate|approval habit|approve/i.test(trimmed)) {
    const pref = profile.founderPreferences.filter((p) =>
      ['communication-style', 'approval-habits'].includes(p.type)
    );
    return {
      response: pref.map((p) => `${p.label}: ${p.learnedPreference}`).join('\n'),
      concierge: 'Chief Concierge',
      preferencesLearned: profile.preferencesLearned,
    };
  }

  if (/visual|mockup|design review|creative workflow/i.test(trimmed)) {
    const creative = profile.founderPreferences.find((p) => p.type === 'creative-workflow');
    const insight = profile.adaptationInsights.find((i) => i.id.includes('visual-review'));
    return {
      response: [
        creative?.learnedPreference ?? 'Learning your creative review preferences.',
        insight?.dockApplication ?? 'Visual mockups prepared when design review is anticipated.',
      ].join(' '),
      concierge: 'Chief Concierge',
    };
  }

  if (/executive summary|report|detailed report|reporting format/i.test(trimmed)) {
    const review = profile.founderPreferences.find((p) => p.type === 'review-preferences');
    const reporting = profile.founderPreferences.find((p) => p.type === 'reporting-formats');
    return {
      response: [review, reporting]
        .filter(Boolean)
        .map((p) => `${p!.label}: ${p!.learnedPreference}`)
        .join('\n'),
      concierge: 'Chief Concierge',
    };
  }

  if (/meeting|schedule|morning|working hours|strategic work/i.test(trimmed)) {
    const meeting = profile.founderPreferences.find((p) => p.type === 'meeting-preferences');
    const hours = profile.founderPreferences.find((p) => p.type === 'working-hours');
    const insight = profile.adaptationInsights.find((i) => i.id.includes('morning-focus'));
    return {
      response: [
        meeting?.learnedPreference,
        hours?.learnedPreference,
        insight?.dockApplication,
      ]
        .filter(Boolean)
        .join(' '),
      concierge: 'Chief Concierge',
    };
  }

  if (/client|partner|supplier|employee|department|organization relationship/i.test(trimmed)) {
    const matches = profile.organizationalRelationships.slice(0, 4);
    return {
      response: matches.length
        ? matches
            .map(
              (r) =>
                `${r.entityName} (${r.entityType}): ${r.preferredCommunication.slice(0, 70)}… · ${r.meetingCadence}`
            )
            .join('\n')
        : 'Organizational relationships building through observation — no manual CRM setup required.',
      concierge: 'Chief Concierge',
      familiarityScore: profile.familiarityScore,
    };
  }

  if (/adapt|pattern|notice|typically|normally|usually/i.test(trimmed)) {
    return {
      response: profile.adaptationInsights.length
        ? profile.adaptationInsights.map((i) => i.insight).join('\n')
        : 'Patterns emerging — Relationship Memory learns through observation, never intrusive forms.',
      concierge: 'Chief Concierge',
      familiarityScore: profile.familiarityScore,
    };
  }

  if (/decision|marketing|operations|financial approval/i.test(trimmed)) {
    const insight = profile.adaptationInsights.find((i) => i.id.includes('approval-order'));
    const decision = profile.founderPreferences.find((p) => p.type === 'decision-making');
    return {
      response: [decision?.learnedPreference, insight?.insight].filter(Boolean).join(' '),
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listRelationshipMemoryDockSuggestions(organizationId: string): string[] {
  ensureOrganizationRelationshipMemoryProfile(organizationId);
  return [
    'What has Relationship Memory learned about how I work?',
    'How do I prefer to review creative work?',
    'What organizational relationships are tracked?',
    'What patterns has Studio OS noticed about my preferences?',
  ].slice(0, 4);
}

export function buildProactiveRelationshipMemorySuggestion(organizationId: string): string | null {
  const profile = getOrganizationRelationshipMemoryProfile(organizationId);
  if (!profile) return null;
  return summarizeRelationshipMemoryProfile(profile);
}

export function buildFamiliarityOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationRelationshipMemoryProfile(organizationId);
  return profile.dockAdaptationLine;
}
