/**
 * Studio World Three Eras Roadmap™ — implementation evaluation helper.
 * Every major system must be evaluated against era sequencing before shipping.
 */

export const STUDIO_WORLD_ERAS = ['knowledge', 'world', 'intelligence'] as const;

export type StudioWorldEra = (typeof STUDIO_WORLD_ERAS)[number];

/** Active civilization era — update only when founder ratifies era transition. */
export const CURRENT_STUDIO_WORLD_ERA: StudioWorldEra = 'knowledge';

export type EraEvaluationInput = {
  systemName: string;
  proposedEra: StudioWorldEra;
  /** Does this add durable graph memory or projections future eras can traverse? */
  establishesFoundationForNext: boolean;
  /** True when the work front-runs a later era (e.g. proactive AI before graph density). */
  unnecessaryComplexityTooEarly: boolean;
  /** True when design uses graph nodes/edges/projections — not parallel truth. */
  evolvesWithoutRewrite: boolean;
  notes?: string;
};

export type EraEvaluationVerdict = 'proceed' | 'defer' | 'redesign';

export type EraEvaluationResult = {
  systemName: string;
  proposedEra: StudioWorldEra;
  currentEra: StudioWorldEra;
  questions: {
    whichEra: StudioWorldEra;
    establishesFoundationForNext: boolean;
    unnecessaryComplexityTooEarly: boolean;
    evolvesWithoutRewrite: boolean;
  };
  verdict: EraEvaluationVerdict;
  rationale: string[];
  notes?: string;
};

const ERA_ORDER: Record<StudioWorldEra, number> = {
  knowledge: 1,
  world: 2,
  intelligence: 3,
};

function eraGap(proposed: StudioWorldEra, current: StudioWorldEra): number {
  return ERA_ORDER[proposed] - ERA_ORDER[current];
}

/**
 * Evaluate a proposed implementation against the Three Eras Roadmap™.
 * Returns structured answers to the four constitutional questions.
 */
export function evaluateImplementationEra(input: EraEvaluationInput): EraEvaluationResult {
  const rationale: string[] = [];
  let verdict: EraEvaluationVerdict = 'proceed';

  const gap = eraGap(input.proposedEra, CURRENT_STUDIO_WORLD_ERA);

  if (gap > 1) {
    verdict = 'defer';
    rationale.push(
      `Proposed era (${input.proposedEra}) skips ahead of ${CURRENT_STUDIO_WORLD_ERA} by more than one era.`,
    );
  } else if (gap === 1 && !input.establishesFoundationForNext) {
    verdict = 'defer';
    rationale.push('Next-era work requires explicit foundation for the prior era.');
  }

  if (input.unnecessaryComplexityTooEarly) {
    verdict = verdict === 'proceed' ? 'redesign' : 'defer';
    rationale.push('Introduces complexity before the current era memory substrate is ready.');
  }

  if (!input.evolvesWithoutRewrite) {
    verdict = verdict === 'proceed' ? 'redesign' : verdict;
    rationale.push('Design stores truth outside the World Graph™ or will require rewrite to evolve.');
  }

  if (!input.establishesFoundationForNext && input.proposedEra === CURRENT_STUDIO_WORLD_ERA) {
    rationale.push('Era 1 work should add nodes, edges, or projections — not isolated features.');
  }

  if (verdict === 'proceed' && rationale.length === 0) {
    rationale.push('Aligned with current era sequencing and graph-first architecture.');
  }

  return {
    systemName: input.systemName,
    proposedEra: input.proposedEra,
    currentEra: CURRENT_STUDIO_WORLD_ERA,
    questions: {
      whichEra: input.proposedEra,
      establishesFoundationForNext: input.establishesFoundationForNext,
      unnecessaryComplexityTooEarly: input.unnecessaryComplexityTooEarly,
      evolvesWithoutRewrite: input.evolvesWithoutRewrite,
    },
    verdict,
    rationale,
    notes: input.notes,
  };
}

/** Map engine slugs to primary era for graph metadata and reviews. */
export const ENGINE_ERA_MAP: Record<string, StudioWorldEra> = {
  'world-graph': 'knowledge',
  'knowledge-registry': 'knowledge',
  'asset-registry': 'knowledge',
  'studio-foundry': 'knowledge',
  'asset-compiler': 'knowledge',
  'knowledge-retention-engine': 'knowledge',
  'orb-archivist': 'knowledge',
  'scene-stack': 'knowledge',
  'company-genome': 'knowledge',
  'studio-world-atlas': 'world',
  'profession-simulation-engine': 'world',
  'career-worlds': 'world',
  'architecture-auditor': 'intelligence',
  'experience-intelligence-engine': 'intelligence',
  'profession-brain': 'intelligence',
};

export function eraForEngineSlug(slug: string): StudioWorldEra {
  return ENGINE_ERA_MAP[slug] ?? 'knowledge';
}
