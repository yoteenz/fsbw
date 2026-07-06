import { COACHING_CATEGORY_LABELS } from './constants';
import { summarizeFounderOperatingSystemProfile } from './founder-os-builder';
import { summarizeCoachingInsights } from './coaching-engine';
import { summarizeFocusActions } from './focus-management';
import { summarizePersonalDashboard } from './personal-dashboard';
import {
  ensureOrganizationFounderOperatingSystemProfile,
  getOrganizationFounderOperatingSystemProfile,
} from './store';
import type { FounderOperatingSystemDockAdvice } from './types';

export function resolveFounderOperatingSystemAdvice(
  input: string,
  organizationId: string
): FounderOperatingSystemDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationFounderOperatingSystemProfile(organizationId) ??
    ensureOrganizationFounderOperatingSystemProfile(organizationId);

  if (
    /founder operating system|operates the founder|founder effectiveness|personal dashboard|founder intelligence/i.test(
      trimmed
    )
  ) {
    return {
      response: summarizeFounderOperatingSystemProfile(profile),
      concierge: 'Chief Concierge',
      founderEffectivenessScore: profile.founderEffectivenessScore,
      focusScorePct: profile.personalDashboard.focusScorePct,
    };
  }

  if (/strategic|operations|78%|planning time/i.test(trimmed)) {
    const strategic = profile.founderIntelligence.find((s) => s.dimension === 'strategic-time');
    return {
      response: strategic
        ? `${strategic.insight} ${profile.coachingInsights.find((c) => c.category === 'strategic-reflection')?.recommendation ?? ''}`
        : profile.dockFounderLine,
      concierge: 'Chief Concierge',
    };
  }

  if (/decision|approvals|42|fatigue/i.test(trimmed)) {
    const coach = profile.coachingInsights.find((c) => c.category === 'decision-quality');
    return {
      response: coach
        ? `${coach.observation} ${coach.recommendation}`
        : "Decision load monitored — non-critical approvals batched when load rises.",
      concierge: 'Chief Concierge',
    };
  }

  if (/creative|9 pm|midnight|evening|focus/i.test(trimmed)) {
    const creative = profile.founderIntelligence.find((s) => s.dimension === 'creative-cycles');
    return {
      response: creative?.insight ?? profile.dockFounderLine,
      concierge: 'Chief Concierge',
      focusScorePct: profile.personalDashboard.focusScorePct,
    };
  }

  if (/coaching|leadership|develop|stronger leader/i.test(trimmed)) {
    return {
      response: summarizeCoachingInsights(profile.coachingInsights),
      concierge: 'Chief Concierge',
      founderEffectivenessScore: profile.founderEffectivenessScore,
    };
  }

  if (/delegat|batch|deep work|interrupt|calendar|meeting/i.test(trimmed)) {
    return {
      response: summarizeFocusActions(profile.focusActions),
      concierge: 'Chief Concierge',
    };
  }

  if (/burnout|stress|recovery|health|executive health/i.test(trimmed)) {
    const m = profile.personalDashboard;
    return {
      response: `Executive health ${m.executiveHealthPct}% · Burnout risk ${m.burnoutRiskPct}% · ${profile.founderIntelligence.find((s) => s.dimension === 'stress-indicators')?.insight ?? ''}`,
      concierge: 'Chief Concierge',
    };
  }

  if (/dashboard|focus score|decision load|learning|momentum/i.test(trimmed)) {
    return {
      response: summarizePersonalDashboard(profile.personalDashboard),
      concierge: 'Chief Concierge',
      focusScorePct: profile.personalDashboard.focusScorePct,
    };
  }

  if (/grow first|visionary|empower|calmer|wiser/i.test(trimmed)) {
    return {
      response: [
        'Founders grow first. Organizations follow.',
        profile.dockFounderLine,
        'PRESERVE EXPERTISE. BUILD LEGACY. EMPOWER VISIONARIES.',
      ].join(' '),
      concierge: 'Chief Concierge',
    };
  }

  const match = profile.coachingInsights.find((c) =>
    new RegExp(trimmed.split(/\s+/)[0] ?? '', 'i').test(c.headline + c.category)
  );
  if (match) {
    return {
      response: `${COACHING_CATEGORY_LABELS[match.category]}: ${match.recommendation}`,
      concierge: 'Chief Concierge',
    };
  }

  return null;
}

export function listFounderOperatingSystemDockSuggestions(organizationId: string): string[] {
  ensureOrganizationFounderOperatingSystemProfile(organizationId);
  return [
    'How is my Founder Operating System supporting my leadership?',
    'Should I schedule more strategic planning time?',
    'What coaching do you recommend for my focus this week?',
    'Am I at risk of decision fatigue or burnout?',
  ].slice(0, 4);
}

export function buildProactiveFounderOperatingSystemSuggestion(organizationId: string): string | null {
  const profile = getOrganizationFounderOperatingSystemProfile(organizationId);
  if (!profile) return null;
  return summarizeFounderOperatingSystemProfile(profile);
}

export function buildFounderOperatingOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationFounderOperatingSystemProfile(organizationId);
  return profile.dockFounderLine;
}
