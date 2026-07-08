/**
 * Studio World Constitution™ — Constitution Score™ computation.
 */

import type { ConstitutionFeatureProposal, ConstitutionScores } from './types';
import { CONSTITUTION_COMPLIANCE_THRESHOLD } from './types';

export type ScoringContext = {
  hasOwner: boolean;
  ownerConfidence: number;
  missionConflict: boolean;
  pageFirstSignals: number;
  architecturalFit: number;
  connectivityScore: number;
  reuseAware: boolean;
  planningAware: boolean;
  founderAuthorityRisk: boolean;
  sceneStackRequired: boolean;
  sceneStackPlanned: boolean;
  philosophyStrength: number;
  duplicateRisk: number;
};

const PAGE_FIRST_PATTERNS = [
  'dashboard',
  'settings page',
  'admin panel',
  'webpage',
  'saas',
  'table layout',
  'card grid',
  'report page',
  'standalone page',
  'new page',
];

const REUSE_PATTERNS = ['asset registry', 'blueprint', 'golden build', 'marketplace', 'genome', 'reuse', 'existing'];
const PLAN_PATTERNS = [
  'parallel futures',
  'tournament',
  'merge',
  'approval',
  'founder intent',
  'concept approval',
  'planning',
  'blueprint',
];
const AUTO_OVERRIDE_PATTERNS = ['auto approve', 'automatic override', 'without founder', 'bypass approval', 'auto-deploy'];

export function detectProposalSignals(proposal: ConstitutionFeatureProposal): {
  pageFirstSignals: number;
  reuseAware: boolean;
  planningAware: boolean;
  founderAuthorityRisk: boolean;
  sceneStackRequired: boolean;
} {
  const text = `${proposal.name} ${proposal.description}`.toLowerCase();
  const pageFirstSignals = PAGE_FIRST_PATTERNS.filter((p) => text.includes(p)).length;
  if (proposal.pageFirstHint) pageFirstSignals + 2;
  return {
    pageFirstSignals: proposal.pageFirstHint ? pageFirstSignals + 2 : pageFirstSignals,
    reuseAware: REUSE_PATTERNS.some((p) => text.includes(p)),
    planningAware: PLAN_PATTERNS.some((p) => text.includes(p)),
    founderAuthorityRisk: AUTO_OVERRIDE_PATTERNS.some((p) => text.includes(p)),
    sceneStackRequired:
      !text.includes('orchestrat') &&
      !text.includes('coordinate only') &&
      (text.includes('room') ||
        text.includes('studio') ||
        text.includes('headquarters') ||
        text.includes('immersive') ||
        text.includes('workspace') ||
        text.includes('destination')),
  };
}

export function computeConstitutionScores(ctx: ScoringContext): ConstitutionScores {
  const architecture = clamp(
    88 -
      ctx.pageFirstSignals * 14 -
      (ctx.architecturalFit < 50 ? 20 : 0) +
      ctx.architecturalFit * 0.15
  );
  const missionAlignment = clamp(
    ctx.hasOwner ? 55 + ctx.ownerConfidence * 0.45 : 18
  ) - (ctx.missionConflict ? 28 : 0) - ctx.duplicateRisk * 12;
  const worldContinuity = clamp(ctx.connectivityScore);
  const reuse = clamp(ctx.reuseAware ? 78 : 42);
  const creativeAlignment = clamp(ctx.planningAware ? 82 : 48);
  const scalability = clamp(70 + (ctx.hasOwner ? 12 : -8) - ctx.pageFirstSignals * 5);
  const maintainability = clamp(68 - ctx.duplicateRisk * 15 + (ctx.hasOwner ? 10 : 0));
  const immersion = clamp(80 - ctx.pageFirstSignals * 16 + (ctx.architecturalFit > 60 ? 8 : 0));
  const experience = clamp((immersion + worldContinuity + creativeAlignment) / 3);

  const overallCompliance = Math.round(
    architecture * 0.12 +
      missionAlignment * 0.14 +
      worldContinuity * 0.1 +
      reuse * 0.08 +
      creativeAlignment * 0.1 +
      scalability * 0.08 +
      maintainability * 0.08 +
      immersion * 0.15 +
      experience * 0.15
  );

  return {
    architecture: round(architecture),
    missionAlignment: round(missionAlignment),
    worldContinuity: round(worldContinuity),
    reuse: round(reuse),
    creativeAlignment: round(creativeAlignment),
    scalability: round(scalability),
    maintainability: round(maintainability),
    immersion: round(immersion),
    experience: round(experience),
    overallCompliance: round(overallCompliance),
  };
}

export function isConstitutionCompliant(scores: ConstitutionScores): boolean {
  return scores.overallCompliance >= CONSTITUTION_COMPLIANCE_THRESHOLD;
}

export const CONSTITUTION_SCORE_LABELS: Record<keyof Omit<ConstitutionScores, 'overallCompliance'>, string> = {
  architecture: 'Architecture Score™',
  missionAlignment: 'Mission Alignment™',
  worldContinuity: 'World Continuity™',
  reuse: 'Reuse Score™',
  creativeAlignment: 'Creative Alignment™',
  scalability: 'Scalability™',
  maintainability: 'Maintainability™',
  immersion: 'Immersion™',
  experience: 'Experience™',
};

function clamp(n: number): number {
  return Math.max(8, Math.min(98, n));
}

function round(n: number): number {
  return Math.round(n);
}
