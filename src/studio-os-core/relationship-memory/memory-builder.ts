import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildIntelligentAdaptationInsights, summarizeAdaptationInsights } from './adaptation-engine';
import { buildFounderPreferenceMemories } from './founder-memory';
import { buildOrganizationalRelationshipMemories } from './organizational-relationships';
import type { OrganizationRelationshipMemoryProfile } from './types';

export function computeFamiliarityScore(
  preferencesLearned: number,
  relationshipsTracked: number,
  avgConfidence: number
): number {
  return Math.min(
    96,
    Math.round(preferencesLearned * 4 + relationshipsTracked * 2 + avgConfidence * 0.35)
  );
}

export function buildDockAdaptationLine(profile: OrganizationRelationshipMemoryProfile): string {
  const top = profile.adaptationInsights[0];
  if (top) return top.dockApplication;
  const pref = profile.founderPreferences.find((p) => p.confidencePct >= 75);
  if (pref) return `Familiar with your ${pref.label.toLowerCase()} — ${pref.learnedPreference.slice(0, 80)}…`;
  return 'Learning how you work — familiarity through observation, never intrusive setup.';
}

export function buildOrganizationRelationshipMemoryProfile(
  organizationId: string
): OrganizationRelationshipMemoryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const founderPreferences = buildFounderPreferenceMemories(organizationId);
  const organizationalRelationships = buildOrganizationalRelationshipMemories(organizationId);
  const adaptationInsights = buildIntelligentAdaptationInsights(
    organizationId,
    founderPreferences,
    organizationalRelationships
  );

  const avgConfidence =
    founderPreferences.reduce((sum, p) => sum + p.confidencePct, 0) /
    Math.max(1, founderPreferences.length);

  const profile: OrganizationRelationshipMemoryProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    familiarityScore: 0,
    preferencesLearned: founderPreferences.filter((p) => p.confidencePct >= 65).length,
    relationshipsTracked: organizationalRelationships.length,
    founderPreferences,
    organizationalRelationships,
    adaptationInsights,
    dockAdaptationLine: '',
    neverIntrusive: true,
    syncedSources: [
      'founder-cognitive-load',
      'presence-engine',
      'cross-organization-intelligence',
      'executive-council',
      'ambient-awareness',
      'profession-brain',
      'organization-pulse',
      'anticipation-engine',
      'business-discovery-blueprint',
      'command-dock',
    ],
  };

  profile.familiarityScore = computeFamiliarityScore(
    profile.preferencesLearned,
    profile.relationshipsTracked,
    avgConfidence
  );
  profile.dockAdaptationLine = buildDockAdaptationLine(profile);
  return profile;
}

export function summarizeRelationshipMemoryProfile(profile: OrganizationRelationshipMemoryProfile): string {
  return [
    profile.dockAdaptationLine,
    `${profile.preferencesLearned} founder preferences learned · ${profile.relationshipsTracked} relationships tracked · familiarity ${profile.familiarityScore}%.`,
    summarizeAdaptationInsights(profile.adaptationInsights),
    'Relationship Memory™ — familiar, never intrusive. No extensive manual setup required.',
  ].join(' ');
}
