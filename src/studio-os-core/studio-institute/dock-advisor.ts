import {
  ensureOrganizationStudioInstituteProfile,
  getOrganizationStudioInstituteProfile,
} from './org-store';
import type { StudioInstituteDockAdvice } from './types';

export function resolveStudioInstituteAdvice(
  input: string,
  organizationId: string
): StudioInstituteDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationStudioInstituteProfile(organizationId);
  if (!profile) return null;

  if (/new regulation|regulation affect/i.test(trimmed)) {
    return {
      response: `A new regulation affects your industry. I've prepared a five-minute lesson from your Profession Brain™ — ${profile.dashboard.recommendedLessons} lessons recommended today.`,
      concierge: 'Chief Concierge',
      lessonId: profile.artifacts.find((a) => a.type === 'micro-lesson')?.id,
    };
  }

  if (/certification|not completed|updated certification/i.test(trimmed)) {
    const pending = profile.certifications.filter((c) => c.status !== 'earned' && c.pendingEmployees > 0);
    if (pending.length > 0) {
      return {
        response: `${pending.length} certification${pending.length === 1 ? '' : 's'} have pending employees — ${pending[0].name}: ${pending[0].pendingEmployees} have not completed the updated track.`,
        concierge: 'Chief Concierge',
        certificationId: pending[0].id,
      };
    }
  }

  if (/workflow.*chang|training lesson|generate.*lesson/i.test(trimmed)) {
    const update = profile.knowledgeUpdates[0];
    if (update) {
      return {
        response: `This workflow recently changed. Would you like me to generate a training lesson? · ${update.title}`,
        concierge: 'Chief Concierge',
        suggestGenerateLesson: true,
      };
    }
  }

  if (/studio institute|learn|lesson|training|academy/i.test(trimmed)) {
    return {
      response: `Studio Institute™ · ${profile.dashboard.totalArtifacts} learning artifacts · ${profile.dashboard.completedCertifications} certifications · Learn from expertise. Carry the legacy forward.`,
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listStudioInstituteDockSuggestions(organizationId: string): string[] {
  ensureOrganizationStudioInstituteProfile(organizationId);
  const profile = getOrganizationStudioInstituteProfile(organizationId);
  if (!profile) {
    return [
      'Open Studio Institute from Profession Brain.',
      'Generate training from organizational expertise.',
    ];
  }

  const suggestions = [
    'A new regulation affects your industry — prepare a five-minute lesson.',
    'Show employee certification progress.',
  ];

  if (profile.knowledgeUpdates.length > 0) {
    suggestions.unshift('This workflow recently changed — generate a training lesson?');
  }

  if (profile.dashboard.recommendedLessons > 0) {
    suggestions.push(`${profile.dashboard.recommendedLessons} recommended lessons today.`);
  }

  return suggestions.slice(0, 4);
}

export function buildProactiveInstituteSuggestion(organizationId: string): string | null {
  const profile = getOrganizationStudioInstituteProfile(organizationId);
  if (!profile) return null;

  const pendingCerts = profile.certifications.filter((c) => c.pendingEmployees > 0);
  if (pendingCerts.length > 0) {
    return `Three employees have not completed the updated ${pendingCerts[0].name} certification.`;
  }

  const unresolved = profile.knowledgeUpdates.find((u) => u.title.includes('changed'));
  if (unresolved) {
    return `Profession Brain updated — ${profile.dashboard.recommendedLessons} lessons refreshed automatically.`;
  }

  return null;
}
