import {
  CANONICAL_INTERACTION_TYPES,
  type CanonicalInteractionTypeId,
} from '../constants';

export type InteractionTypeMeta = {
  id: CanonicalInteractionTypeId;
  label: string;
  category: 'communication' | 'guidance' | 'governance' | 'publication' | 'work' | 'simulation';
  description: string;
};

const CATEGORY_MAP: Record<CanonicalInteractionTypeId, InteractionTypeMeta['category']> = {
  interaction: 'communication',
  conversation: 'communication',
  request: 'communication',
  response: 'communication',
  command: 'communication',
  recommendation: 'guidance',
  notification: 'guidance',
  'executive-advisory': 'guidance',
  briefing: 'guidance',
  decision: 'governance',
  approval: 'governance',
  review: 'governance',
  validation: 'governance',
  promotion: 'governance',
  deprecation: 'governance',
  publication: 'publication',
  learning: 'publication',
  teaching: 'publication',
  'knowledge-update': 'publication',
  'memory-update': 'publication',
  mission: 'work',
  workflow: 'work',
  automation: 'work',
  'status-change': 'work',
  synchronization: 'work',
  compilation: 'work',
  simulation: 'simulation',
  'relationship-update': 'simulation',
};

function labelFromId(id: CanonicalInteractionTypeId): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .concat('™');
}

export function listCanonicalInteractionTypes(): InteractionTypeMeta[] {
  return CANONICAL_INTERACTION_TYPES.map((id) => ({
    id,
    label: labelFromId(id),
    category: CATEGORY_MAP[id],
    description: `Canonical ${labelFromId(id)} interaction primitive.`,
  }));
}

export function isCanonicalInteractionType(value: string): value is CanonicalInteractionTypeId {
  return (CANONICAL_INTERACTION_TYPES as readonly string[]).includes(value);
}

export function getCanonicalInteractionTypeMeta(
  id: CanonicalInteractionTypeId
): InteractionTypeMeta | undefined {
  return listCanonicalInteractionTypes().find((t) => t.id === id);
}
