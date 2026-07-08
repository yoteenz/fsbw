import type { DesignPrincipleId } from './principles';

/**
 * Studio World Design Review Filter™ — standard flagship evaluation sequence.
 * Layer 1 → Layer 4, then technical soundness and experience quality.
 */

export type DesignReviewInput = {
  featureName: string;
  /** Layer 1 — aligns with Design Principles™ */
  alignsWithDesignPrinciples: boolean;
  /** Layer 2 — obeys World Physics™ */
  obeysWorldPhysics: boolean;
  /** Layer 3 — complies with Constitutional Law™ */
  compliesWithConstitution: boolean;
  /** Layer 4 — follows Implementation Standards™ */
  followsImplementationStandards: boolean;
  /** Step 5 — implementation technically sound */
  technicallySound: boolean;
  /** Step 6 — immersive, premium, coherent experience */
  immersivePremiumCoherent: boolean;
  /** Primary principles this feature embodies */
  primaryPrinciples?: DesignPrincipleId[];
  notes?: string;
};

export type DesignReviewVerdict = 'proceed' | 'redesign' | 'defer';

export type DesignReviewResult = {
  featureName: string;
  verdict: DesignReviewVerdict;
  sequence: {
    designPrinciples: boolean;
    worldPhysics: boolean;
    constitution: boolean;
    implementationStandards: boolean;
    technicalSoundness: boolean;
    experienceQuality: boolean;
  };
  rationale: string[];
  primaryPrinciples?: DesignPrincipleId[];
  notes?: string;
};

export const DESIGN_REVIEW_SEQUENCE = [
  'Does it align with Studio World Design Principles™?',
  'Does it obey World Physics™?',
  'Does it comply with the Constitution™?',
  'Does it follow Implementation Standards™?',
  'Is the implementation technically sound?',
  'Does the resulting experience feel immersive, premium, and coherent?',
] as const;

/**
 * Evaluate a proposed flagship feature through the six-step Design Review Filter™.
 */
export function runDesignReviewFilter(input: DesignReviewInput): DesignReviewResult {
  const rationale: string[] = [];
  let verdict: DesignReviewVerdict = 'proceed';

  const sequence = {
    designPrinciples: input.alignsWithDesignPrinciples,
    worldPhysics: input.obeysWorldPhysics,
    constitution: input.compliesWithConstitution,
    implementationStandards: input.followsImplementationStandards,
    technicalSoundness: input.technicallySound,
    experienceQuality: input.immersivePremiumCoherent,
  };

  if (!sequence.designPrinciples) {
    verdict = 'redesign';
    rationale.push('Fails Layer 1 — does not align with Design Principles™ (north star).');
  }
  if (!sequence.worldPhysics) {
    verdict = verdict === 'proceed' ? 'defer' : verdict;
    rationale.push('Fails Layer 2 — violates World Physics™ (cannot be waived).');
  }
  if (!sequence.constitution) {
    verdict = verdict === 'proceed' ? 'redesign' : verdict;
    rationale.push('Fails Layer 3 — does not comply with Constitutional Law™.');
  }
  if (!sequence.implementationStandards) {
    verdict = verdict === 'proceed' ? 'redesign' : verdict;
    rationale.push('Fails Layer 4 — does not follow current Implementation Standards™.');
  }
  if (!sequence.technicalSoundness) {
    verdict = verdict === 'proceed' ? 'defer' : verdict;
    rationale.push('Fails step 5 — implementation not technically sound.');
  }
  if (!sequence.experienceQuality) {
    verdict = verdict === 'proceed' ? 'redesign' : verdict;
    rationale.push('Fails step 6 — experience does not feel immersive, premium, and coherent.');
  }

  if (verdict === 'proceed' && rationale.length === 0) {
    rationale.push('Passes all six Design Review Filter™ steps — aligned with governance hierarchy.');
  }

  return {
    featureName: input.featureName,
    verdict,
    sequence,
    rationale,
    primaryPrinciples: input.primaryPrinciples,
    notes: input.notes,
  };
}
