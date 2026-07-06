import { resolveBrainForKeyword } from './brain-catalog';
import { buildLivingBrainResponse, detectLivingBrainPhrase } from './living-knowledge';
import { formatJudgmentForConcierge } from './decision-intelligence';
import { resolveConciergeForBrain } from './concierge-bridge';
import {
  ensureOrganizationProfessionBrainProfile,
  getOrganizationProfessionBrainProfile,
  recordLivingBrainSignal,
} from './store';
import type { ProfessionBrainDockAdvice } from './types';

const FILING_PATTERNS: RegExp[] = [
  /prepare.*(?:quarterly|filing|return)/i,
  /(?:john|client|customer).*(?:filing|tax|quarterly)/i,
  /bookkeeping.*(?:for|quarter)/i,
  /dispatch.*(?:crew|today)/i,
  /schedule.*(?:appointment|consultation)/i,
];

export function resolveProfessionBrainAdvice(
  input: string,
  organizationId: string
): ProfessionBrainDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = ensureOrganizationProfessionBrainProfile(organizationId);
  if (!profile) return null;

  if (detectLivingBrainPhrase(trimmed)) {
    recordLivingBrainSignal(organizationId, trimmed);
    const matched = resolveBrainForKeyword(trimmed);
    return {
      response: buildLivingBrainResponse(matched?.label),
      concierge: 'Chief Concierge',
      brainId: matched?.id ?? profile.brains[0]?.id ?? 'marketing',
      suggestedCommand: 'Open Profession Brain to apply this correction.',
    };
  }

  if (/profession brain|institutional memory|organizational intelligence/i.test(trimmed)) {
    return {
      response: `${profile.companyName} · ${profile.brains.length} Profession Brain${profile.brains.length === 1 ? '' : 's'} · ${profile.overallMaturityPct}% maturity. Knowledge powers every concierge, Academy lesson, and automation.`,
      concierge: 'Chief Concierge',
      brainId: profile.brains[0]?.id ?? 'marketing',
      suggestedCommand: 'Review Profession Brain memory graph.',
    };
  }

  const keywordBrain = resolveBrainForKeyword(trimmed);
  if (keywordBrain) {
    const orgBrain = profile.brains.find((b) => b.id === keywordBrain.id);
    const judgment = orgBrain?.judgmentPatterns[0];
    const concierge = resolveConciergeForBrain(profile, keywordBrain.id);
    const staffName = concierge.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      response: judgment
        ? `${keywordBrain.label} judgment:\n${formatJudgmentForConcierge(judgment)}`
        : `${keywordBrain.label} is active — ${orgBrain?.knowledgeEntries.length ?? 0} knowledge entries preserved.`,
      concierge: staffName,
      brainId: keywordBrain.id,
      suggestedCommand: `Route through ${keywordBrain.label}.`,
    };
  }

  for (const pattern of FILING_PATTERNS) {
    if (pattern.test(trimmed)) {
      const taxBrain = profile.brains.find((b) => b.id === 'fuel-tax' || b.id === 'bookkeeping');
      const brain = taxBrain ?? profile.brains[0];
      if (!brain) return null;

      const concierge = resolveConciergeForBrain(profile, brain.id);
      return {
        response: `Routing to ${brain.label}. I will prepare this using your organization's documented judgment — not generic tax software rules.\n\nExample: When documentation is missing, I first verify against your preserved exception patterns before rejecting.`,
        concierge: concierge.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        brainId: brain.id,
        suggestedCommand: trimmed,
      };
    }
  }

  return null;
}

export function buildProactiveBrainSuggestion(organizationId: string): ProfessionBrainDockAdvice | null {
  const profile = getOrganizationProfessionBrainProfile(organizationId);
  if (!profile || profile.overallMaturityPct >= 80) return null;

  const brain = profile.brains[0];
  if (!brain) return null;

  return {
    response: `${brain.label} is at ${brain.maturityPct}% maturity. Continue teaching Studio OS through Discovery Blueprint corrections and living knowledge updates.`,
    concierge: 'Chief Concierge',
    brainId: brain.id,
    suggestedCommand: 'Open Profession Brain.',
  };
}

export function listProfessionBrainDockSuggestions(organizationId: string): string[] {
  const profile = getOrganizationProfessionBrainProfile(organizationId);
  if (!profile) return ['Open Profession Brain.'];

  return [
    'Prepare John\'s quarterly filing.',
    `What does ${profile.brains[0]?.label ?? 'our Brain'} know about exceptions?`,
    'We changed how we handle receipts.',
  ];
}
