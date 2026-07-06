import { ESCALATION_ACTIONS } from './constants';
import type { EscalationAction, EscalationRecommendation } from './types';
import type { BrainTrustDeclaration } from './types';

const ESCALATION_LABELS: Record<EscalationAction, string> = {
  'schedule-consultation': 'Schedule consultation with licensed professional',
  'request-review': 'Request professional review before proceeding',
  'assign-licensed-professional': 'Assign licensed professional to this matter',
  'book-appointment': 'Book appointment with qualified expert',
  'prepare-documents-before-review': 'Prepare documents before human review',
};

export function buildEscalationPlaybook(
  declarations: BrainTrustDeclaration[]
): EscalationRecommendation[] {
  return ESCALATION_ACTIONS.map((action, i) => {
    const brain = declarations[i % declarations.length];
    return {
      id: `escalation-${action}`,
      action,
      label: ESCALATION_LABELS[action],
      reason: brain
        ? `When ${brain.brainLabel} scope is exceeded — ${brain.scope.reviewRequired[0] ?? 'professional review required'}.`
        : 'When Digital Concierge authority is exceeded.',
      brainId: brain?.brainId,
    };
  });
}

export function recommendEscalationForAction(
  input: string,
  declarations: BrainTrustDeclaration[]
): EscalationRecommendation | null {
  const trimmed = input.toLowerCase();

  if (/file|submit|sign|return/i.test(trimmed)) {
    return findEscalation('request-review', declarations, 'Filing and submission require licensed review.');
  }
  if (/legal advice|opinion|represent/i.test(trimmed)) {
    return findEscalation('assign-licensed-professional', declarations, 'Legal opinions require licensed attorney.');
  }
  if (/diagnos|prescri|medical treatment/i.test(trimmed)) {
    return findEscalation('book-appointment', declarations, 'Medical decisions require licensed clinician.');
  }
  if (/consult|review|professional/i.test(trimmed)) {
    return findEscalation('schedule-consultation', declarations, 'Schedule consultation with qualified professional.');
  }
  if (/prepare|document|organize/i.test(trimmed)) {
    return findEscalation('prepare-documents-before-review', declarations, 'Prepare documentation before human review.');
  }

  return null;
}

function findEscalation(
  action: EscalationAction,
  declarations: BrainTrustDeclaration[],
  reason: string
): EscalationRecommendation {
  const regulated = declarations.find(
    (d) => d.confidence.professionalReviewStatus !== 'none'
  );
  return {
    id: `escalation-match-${action}`,
    action,
    label: ESCALATION_LABELS[action],
    reason,
    brainId: regulated?.brainId,
  };
}
