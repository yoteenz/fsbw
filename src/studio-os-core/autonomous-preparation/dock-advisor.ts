import { describeApprovalWorkflow } from './approval-workflow';
import { summarizeAutonomousPreparationProfile } from './preparation-builder';
import { summarizePendingQueue } from './preparation-engine';
import { summarizeLearningLoop } from './learning-loop';
import {
  ensureOrganizationAutonomousPreparationProfile,
  getOrganizationAutonomousPreparationProfile,
} from './store';
import type { AutonomousPreparationDockAdvice } from './types';

export function resolveAutonomousPreparationAdvice(
  input: string,
  organizationId: string
): AutonomousPreparationDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationAutonomousPreparationProfile(organizationId) ??
    ensureOrganizationAutonomousPreparationProfile(organizationId);

  if (/autonomous preparation|pending preparation|preparation queue|prepared work/i.test(trimmed)) {
    return {
      response: summarizeAutonomousPreparationProfile(profile),
      concierge: 'Chief Concierge',
      preparationScore: profile.preparationScore,
      awaitingApprovalCount: profile.awaitingApprovalCount,
    };
  }

  if (/briefing|executive briefing|tomorrow/i.test(trimmed)) {
    const prep = profile.pendingPreparations.find((p) => p.type === 'executive-summary');
    return {
      response: prep
        ? `${prep.title}: ${prep.summary} ${prep.whyPrepared} (${prep.confidencePct}% confidence — awaiting approval).`
        : profile.dockPreparationLine,
      concierge: 'Chief Concierge',
    };
  }

  if (/quarterly|review|presentation|supporting report/i.test(trimmed)) {
    const prep = profile.pendingPreparations.find((p) => p.type === 'presentation' || p.type === 'report');
    return {
      response: prep
        ? `${prep.title} — ${prep.expectedBenefit} Trigger: ${prep.trigger}`
        : 'Quarterly materials not yet in queue — monitoring calendar patterns.',
      concierge: 'Chief Concierge',
    };
  }

  if (/launch|promotional|social|campaign|asset/i.test(trimmed)) {
    const preps = profile.pendingPreparations.filter((p) =>
      ['launch-checklist', 'email-campaign', 'social-calendar'].includes(p.type)
    );
    return {
      response: preps.length
        ? preps.map((p) => `${p.title}: ${p.summary.slice(0, 70)}…`).join('\n')
        : 'No launch preparations queued — monitoring predictive signals.',
      concierge: 'Chief Concierge',
    };
  }

  if (/approve|reject|edit|schedule|delegate|archive|workflow/i.test(trimmed)) {
    const pending = profile.pendingPreparations.find((p) => p.status === 'pending');
    return {
      response: pending
        ? describeApprovalWorkflow(pending)
        : 'All preparations processed — approve · edit · reject · schedule · delegate · archive available on each queue item.',
      concierge: 'Chief Concierge',
    };
  }

  if (/learning|quality|approval rate|profession brain/i.test(trimmed)) {
    return {
      response: summarizeLearningLoop(profile.learningLoop),
      concierge: 'Chief Concierge',
      preparationScore: profile.preparationScore,
    };
  }

  if (/agenda|meeting|report|contract|onboarding|proposal|research/i.test(trimmed)) {
    const match = profile.pendingPreparations.find((p) =>
      new RegExp(trimmed.split(/\s+/)[0] ?? '', 'i').test(p.type + p.title)
    );
    return {
      response: match
        ? describeApprovalWorkflow(match)
        : summarizePendingQueue(profile.pendingPreparations),
      concierge: 'Chief Concierge',
    };
  }

  if (/waiting|approval|inactive|auto.?execut/i.test(trimmed)) {
    return {
      response: `${profile.awaitingApprovalCount} preparation(s) inactive until approved. Nothing executes automatically — preparation creates leverage.`,
      concierge: 'Chief Concierge',
      awaitingApprovalCount: profile.awaitingApprovalCount,
    };
  }

  return null;
}

export function listAutonomousPreparationDockSuggestions(organizationId: string): string[] {
  ensureOrganizationAutonomousPreparationProfile(organizationId);
  return [
    'What has Autonomous Preparation queued for my approval?',
    "Show tomorrow's prepared executive briefing",
    'What launch or promotional assets are ready for review?',
    'How is preparation quality improving from my approvals?',
  ].slice(0, 4);
}

export function buildProactiveAutonomousPreparationSuggestion(organizationId: string): string | null {
  const profile = getOrganizationAutonomousPreparationProfile(organizationId);
  if (!profile) return null;
  return summarizeAutonomousPreparationProfile(profile);
}

export function buildQuietPreparationLine(organizationId: string): string {
  const profile = ensureOrganizationAutonomousPreparationProfile(organizationId);
  return profile.dockPreparationLine;
}
