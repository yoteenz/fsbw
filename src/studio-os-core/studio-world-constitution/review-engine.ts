/**
 * Studio World Constitution™ — Constitution Review™ engine.
 * Evaluates proposed features before they enter Studio World.
 */

import {
  assertFeatureBelongsToFlagship,
  FLAGSHIP_RESPONSIBILITY_LAWS,
  resolveFlagshipForResponsibility,
} from '../studio-world/responsibility-framework';
import type { StudioWorldFlagshipId } from '../studio-world/types';
import { STUDIO_WORLD_PHYSICAL_TYPES } from '../studio-world/types';
import { FOUNDATIONAL_LAWS } from './laws';
import {
  computeConstitutionScores,
  detectProposalSignals,
  isConstitutionCompliant,
  type ScoringContext,
} from './scoring';
import type {
  ConstitutionAlternativeForm,
  ConstitutionFeatureProposal,
  ConstitutionLawId,
  ConstitutionPhysicalType,
  ConstitutionReviewQuestion,
  ConstitutionReviewResult,
} from './types';

const FLAGSHIP_KEYWORDS: Record<StudioWorldFlagshipId, string[]> = {
  'creative-direction-studio': [
    'creative',
    'vision',
    'concept',
    'story',
    'mood',
    'parallel future',
    'tournament',
    'merge',
    'approval',
    'brief',
    'narrative',
    'art direction',
  ],
  'studio-warehouse': [
    'warehouse',
    'manufacture',
    'asset',
    'generation',
    'assembly',
    'lighting pack',
    'furniture',
    'material',
    'texture',
    'production',
    'scene stack',
    'deconstruction',
  ],
  'studio-archives': [
    'archive',
    'museum',
    'legacy',
    'golden build',
    'genome vault',
    'preserve',
    'history',
    'timeline',
    'innovation hall',
  ],
  marketplace: [
    'marketplace',
    'license',
    'royalt',
    'monetize',
    'distribute',
    'sell',
    'exchange',
    'template pack',
    'asset pack',
  ],
  headquarters: [
    'marketing',
    'sales',
    'finance',
    'operations',
    'legal',
    'hiring',
    'distribution',
    'customer',
    'department',
    'execute',
    'business',
  ],
  'studio-command-center': [
    'command',
    'orchestrat',
    'observatory',
    'atlas',
    'mission control',
    'coordinate',
    'system health',
    'notification',
    'executive',
    'constitution',
  ],
  'expedition-hub': [
    'expedition',
    'launch',
    'rebrand',
    'scale',
    'onboarding',
    'guided',
    'journey',
    'transformation',
    'simulation',
  ],
};

const DUPLICATE_PAIRS: Array<{ a: string; b: string; message: string }> = [
  { a: 'marketplace', b: 'warehouse', message: 'Marketplace distributes — Warehouse manufactures.' },
  { a: 'archive', b: 'warehouse', message: 'Archives preserve — Warehouse produces.' },
  { a: 'creative direction', b: 'warehouse', message: 'CDS imagines — Warehouse manufactures.' },
  { a: 'settings page', b: 'command', message: 'Settings pages violate architecture — use Command Center rooms.' },
];

function uid(): string {
  return `constitution-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function inferOwningFlagship(proposal: ConstitutionFeatureProposal): {
  flagshipId: StudioWorldFlagshipId | null;
  confidence: number;
} {
  if (proposal.proposedFlagshipId) {
    return { flagshipId: proposal.proposedFlagshipId, confidence: 92 };
  }
  const text = `${proposal.name} ${proposal.description}`.toLowerCase();
  const slug = slugify(proposal.name);
  const byResponsibility = resolveFlagshipForResponsibility(slug);
  if (byResponsibility) return { flagshipId: byResponsibility, confidence: 85 };

  let best: StudioWorldFlagshipId | null = null;
  let bestScore = 0;
  for (const [id, keywords] of Object.entries(FLAGSHIP_KEYWORDS) as [StudioWorldFlagshipId, string[]][]) {
    const score = keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  if (!best || bestScore === 0) return { flagshipId: null, confidence: 0 };
  return { flagshipId: best, confidence: Math.min(88, 40 + bestScore * 12) };
}

function inferPhysicalType(
  proposal: ConstitutionFeatureProposal,
  flagshipId: StudioWorldFlagshipId | null
): ConstitutionPhysicalType {
  if (proposal.proposedPhysicalType) return proposal.proposedPhysicalType;
  const text = `${proposal.name} ${proposal.description}`.toLowerCase();
  if (text.includes('observatory')) return 'observatory';
  if (text.includes('vault')) return 'vault';
  if (text.includes('theater')) return 'theater';
  if (text.includes('museum')) return 'museum';
  if (text.includes('pavilion') || text.includes('marketplace')) return 'pavilion';
  if (text.includes('workshop') || text.includes('factory') || text.includes('warehouse')) return 'workshop';
  if (text.includes('laboratory') || text.includes('lab')) return 'laboratory';
  if (text.includes('gallery')) return 'gallery';
  if (text.includes('atrium')) return 'atrium';
  if (text.includes('wing')) return 'wing';
  if (text.includes('district')) return 'district';
  if (text.includes('headquarters') || flagshipId === 'headquarters') return 'headquarters';
  if (text.includes('studio') || flagshipId === 'creative-direction-studio') return 'studio';
  if (text.includes('command') || flagshipId === 'studio-command-center') return 'command-center';
  return 'room';
}

function detectMissionConflict(
  proposal: ConstitutionFeatureProposal,
  flagshipId: StudioWorldFlagshipId | null
): boolean {
  if (!flagshipId) return false;
  const text = `${proposal.name} ${proposal.description}`.toLowerCase();
  const law = FLAGSHIP_RESPONSIBILITY_LAWS[flagshipId];
  for (const forbidden of law.forbiddenActions) {
    if (forbidden.includes('manufacture') && text.includes('manufacture') && flagshipId === 'creative-direction-studio') {
      return true;
    }
    if (forbidden.includes('sell') && (text.includes('sell') || text.includes('monetize')) && flagshipId !== 'marketplace') {
      return true;
    }
    if (forbidden.includes('archive') && text.includes('archive') && flagshipId === 'creative-direction-studio') {
      return true;
    }
    if (forbidden.includes('create') && text.includes('generate new') && flagshipId === 'marketplace') {
      return true;
    }
  }
  const slug = slugify(proposal.name);
  const check = assertFeatureBelongsToFlagship(slug, flagshipId);
  return !check.ok;
}

function detectDuplicateRisk(proposal: ConstitutionFeatureProposal): number {
  const text = `${proposal.name} ${proposal.description}`.toLowerCase();
  let risk = 0;
  for (const pair of DUPLICATE_PAIRS) {
    if (text.includes(pair.a) && text.includes(pair.b)) risk += 1;
  }
  return Math.min(3, risk);
}

function buildQuestions(
  proposal: ConstitutionFeatureProposal,
  flagshipId: StudioWorldFlagshipId | null,
  physicalType: ConstitutionPhysicalType,
  signals: ReturnType<typeof detectProposalSignals>,
  missionConflict: boolean
): ConstitutionReviewQuestion[] {
  const ownerName = flagshipId ? FLAGSHIP_RESPONSIBILITY_LAWS[flagshipId].displayName : 'None identified';
  return [
    {
      id: 'building-owner',
      question: 'Which building owns it?',
      answer: flagshipId
        ? `${ownerName} owns this feature under Law #1.`
        : 'No flagship destination claims ownership — Law #1 blocks implementation.',
      passed: Boolean(flagshipId),
    },
    {
      id: 'duplicate-system',
      question: 'Does it duplicate another system?',
      answer: missionConflict
        ? 'Responsibility overlap detected — may duplicate an existing flagship mission.'
        : 'No critical duplicate system detected.',
      passed: !missionConflict,
    },
    {
      id: 'destination-responsibility',
      question: 'Does it violate destination responsibilities?',
      answer: missionConflict
        ? `Violates ${ownerName} exclusive mission boundaries.`
        : `Aligns with ${ownerName} primary mission.`,
      passed: !missionConflict && Boolean(flagshipId),
    },
    {
      id: 'architectural-fit',
      question: 'Does it belong architecturally?',
      answer: signals.pageFirstSignals > 0
        ? `Page-first signals detected — must become a ${physicalType}, not a webpage.`
        : `Proposed as ${physicalType} inside Studio World™ campus.`,
      passed: signals.pageFirstSignals < 2,
    },
    {
      id: 'scene-stack-required',
      question: 'Does it require Scene Stack™?',
      answer: signals.sceneStackRequired
        ? 'Yes — immersive destinations assemble via Scene Stack™ layers.'
        : 'Orchestration feature — Scene Stack™ optional.',
      passed: !signals.sceneStackRequired || Boolean(physicalType),
    },
    {
      id: 'philosophy-strength',
      question: 'Does it strengthen the Studio World philosophy?',
      answer:
        signals.pageFirstSignals > 1
          ? 'Weakens civilization metaphor — risks SaaS drift.'
          : 'Strengthens architectural civilization — hands work to the pipeline.',
      passed: signals.pageFirstSignals < 2,
    },
    {
      id: 'room-instead',
      question: 'Should it become a room instead?',
      answer:
        signals.pageFirstSignals > 0
          ? `Recommend: ${physicalType} room under ${ownerName}.`
          : 'Current form is architecturally appropriate.',
      passed: signals.pageFirstSignals === 0,
    },
    {
      id: 'expedition-instead',
      question: 'Should it become an Expedition?',
      answer: proposal.description.toLowerCase().includes('launch') ||
        proposal.description.toLowerCase().includes('onboard')
        ? 'Multi-destination journey — consider Expedition Hub™.'
        : 'Single-destination feature — room or wing is sufficient.',
      passed: true,
    },
    {
      id: 'blueprint-instead',
      question: 'Should it become a Blueprint?',
      answer:
        proposal.description.toLowerCase().includes('workflow') ||
        proposal.description.toLowerCase().includes('reusable')
          ? 'Reusable system — archive as Blueprint after Golden Build™.'
          : 'Not primarily a reusable Blueprint candidate.',
      passed: true,
    },
  ];
}

function collectViolatedLaws(
  flagshipId: StudioWorldFlagshipId | null,
  signals: ReturnType<typeof detectProposalSignals>,
  missionConflict: boolean,
  scores: ReturnType<typeof computeConstitutionScores>
): ConstitutionLawId[] {
  const violated: ConstitutionLawId[] = [];
  if (!flagshipId) violated.push('everything-belongs-somewhere');
  if (missionConflict) violated.push('one-mission-per-destination');
  if (signals.pageFirstSignals > 1) violated.push('everything-is-architecture');
  if (scores.worldContinuity < 55) violated.push('everything-is-connected');
  if (!signals.reuseAware && scores.reuse < 60) violated.push('reuse-before-generation');
  if (!signals.planningAware && scores.creativeAlignment < 60) violated.push('plan-before-build');
  if (signals.founderAuthorityRisk) violated.push('founder-creative-director');
  return violated;
}

function buildRecommendations(
  violated: ConstitutionLawId[],
  flagshipId: StudioWorldFlagshipId | null,
  physicalType: ConstitutionPhysicalType,
  alternativeForms: ConstitutionAlternativeForm[]
): string[] {
  const recs: string[] = [];
  if (!flagshipId) {
    recs.push('Assign a flagship owner before any implementation begins.');
  }
  if (violated.includes('everything-is-architecture')) {
    recs.push(`Redesign as a ${physicalType} — reject page-first implementation.`);
  }
  if (violated.includes('reuse-before-generation')) {
    recs.push('Document Asset Registry™ and Blueprint Archive™ search before generation.');
  }
  if (violated.includes('plan-before-build')) {
    recs.push('Route through Founder Intent™ → Parallel Futures™ → Concept Approval™ before build.');
  }
  if (violated.includes('founder-creative-director')) {
    recs.push('Remove automatic override language — founder retains final authority.');
  }
  if (alternativeForms.includes('expedition')) {
    recs.push('Package as Expedition Hub™ guided journey across multiple flagships.');
  }
  if (alternativeForms.includes('blueprint')) {
    recs.push('After Golden Build™, preserve as Blueprint Archive™ for reuse.');
  }
  if (alternativeForms.includes('reject')) {
    recs.push('Constitution compliance below threshold — redesign before implementation.');
  }
  if (recs.length === 0) {
    recs.push('Proposal earns its place — proceed with Scene Stack™ assembly in assigned flagship.');
  }
  return recs;
}

function resolveAlternativeForms(
  proposal: ConstitutionFeatureProposal,
  approved: boolean,
  signals: ReturnType<typeof detectProposalSignals>
): ConstitutionAlternativeForm[] {
  const forms: ConstitutionAlternativeForm[] = [];
  const text = proposal.description.toLowerCase();
  if (!approved) forms.push('reject');
  if (signals.pageFirstSignals > 0) forms.push('room');
  if (text.includes('launch') || text.includes('onboard') || text.includes('rebrand')) forms.push('expedition');
  if (text.includes('workflow') || text.includes('reusable') || text.includes('blueprint')) forms.push('blueprint');
  return [...new Set(forms)];
}

/** Run Constitutional Review™ on a proposed feature. */
export function runConstitutionReview(proposal: ConstitutionFeatureProposal): ConstitutionReviewResult {
  const { flagshipId, confidence } = inferOwningFlagship(proposal);
  const physicalType = inferPhysicalType(proposal, flagshipId);
  const signals = detectProposalSignals(proposal);
  const missionConflict = detectMissionConflict(proposal, flagshipId);
  const duplicateRisk = detectDuplicateRisk(proposal);

  const architecturalFit = STUDIO_WORLD_PHYSICAL_TYPES.includes(
    physicalType as (typeof STUDIO_WORLD_PHYSICAL_TYPES)[number]
  )
    ? 82
    : 55;

  const scoringCtx: ScoringContext = {
    hasOwner: Boolean(flagshipId),
    ownerConfidence: confidence,
    missionConflict,
    pageFirstSignals: signals.pageFirstSignals,
    architecturalFit,
    connectivityScore: flagshipId ? 72 + (signals.sceneStackRequired ? 8 : 0) : 38,
    reuseAware: signals.reuseAware,
    planningAware: signals.planningAware,
    founderAuthorityRisk: signals.founderAuthorityRisk,
    sceneStackRequired: signals.sceneStackRequired,
    sceneStackPlanned: Boolean(physicalType),
    philosophyStrength: signals.pageFirstSignals < 2 ? 80 : 35,
    duplicateRisk,
  };

  const scores = computeConstitutionScores(scoringCtx);
  const questions = buildQuestions(proposal, flagshipId, physicalType, signals, missionConflict);
  const violatedLaws = collectViolatedLaws(flagshipId, signals, missionConflict, scores);
  const approved = isConstitutionCompliant(scores) && violatedLaws.length === 0 && Boolean(flagshipId);
  const alternativeForms = resolveAlternativeForms(proposal, approved, signals);
  const recommendations = buildRecommendations(violatedLaws, flagshipId, physicalType, alternativeForms);

  return {
    id: uid(),
    reviewedAt: new Date().toISOString(),
    proposalName: proposal.name,
    proposalDescription: proposal.description,
    owningFlagship: flagshipId,
    suggestedPhysicalType: physicalType,
    scores,
    questions,
    violatedLaws,
    recommendations,
    approved,
    alternativeForms,
  };
}

export function listConstitutionLaws() {
  return FOUNDATIONAL_LAWS;
}
