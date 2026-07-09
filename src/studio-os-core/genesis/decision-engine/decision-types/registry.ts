import {
  CANONICAL_DECISION_TYPES,
  type CanonicalDecisionTypeId,
} from '../constants';

export type DecisionTypeMeta = {
  id: CanonicalDecisionTypeId;
  label: string;
  category: 'reasoning' | 'authority' | 'intelligence' | 'meaning';
  description: string;
};

const CATEGORY_MAP: Record<CanonicalDecisionTypeId, DecisionTypeMeta['category']> = {
  decision: 'reasoning',
  recommendation: 'reasoning',
  suggestion: 'reasoning',
  priority: 'reasoning',
  mission: 'reasoning',
  goal: 'reasoning',
  strategy: 'reasoning',
  automation: 'authority',
  delegation: 'authority',
  approval: 'authority',
  escalation: 'authority',
  review: 'authority',
  observation: 'intelligence',
  prediction: 'intelligence',
  risk: 'intelligence',
  opportunity: 'intelligence',
  constraint: 'meaning',
  intent: 'meaning',
  context: 'meaning',
  confidence: 'meaning',
  evidence: 'meaning',
  tradeoff: 'meaning',
};

function labelFromId(id: CanonicalDecisionTypeId): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .concat('™');
}

export function listCanonicalDecisionTypes(): DecisionTypeMeta[] {
  return CANONICAL_DECISION_TYPES.map((id) => ({
    id,
    label: labelFromId(id),
    category: CATEGORY_MAP[id],
    description: `Canonical ${labelFromId(id)} decision primitive.`,
  }));
}

export function isCanonicalDecisionType(value: string): value is CanonicalDecisionTypeId {
  return (CANONICAL_DECISION_TYPES as readonly string[]).includes(value);
}

export function getCanonicalDecisionTypeMeta(
  id: CanonicalDecisionTypeId
): DecisionTypeMeta | undefined {
  return listCanonicalDecisionTypes().find((t) => t.id === id);
}
