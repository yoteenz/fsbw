import { FOUNDER_GATED_ACTION_KINDS } from './constants';

export type FounderGateEvaluation = {
  allowed: boolean;
  requiresFounderApproval: boolean;
  actionKind: string;
  reason: string;
};

export function evaluateFounderGate(actionKind: string, autonomyLevel: string): FounderGateEvaluation {
  const gated = (FOUNDER_GATED_ACTION_KINDS as readonly string[]).includes(actionKind);
  if (!gated) {
    return {
      allowed: true,
      requiresFounderApproval: false,
      actionKind,
      reason: 'Low-risk internal action — resident may proceed within role authority',
    };
  }
  if (autonomyLevel === 'FULL_WITHIN_AUTHORITY') {
    return {
      allowed: false,
      requiresFounderApproval: true,
      actionKind,
      reason: 'Founder-gated category always requires explicit founder authority',
    };
  }
  return {
    allowed: false,
    requiresFounderApproval: true,
    actionKind,
    reason: 'Founder-gated real-world side effect — simulation blocked',
  };
}
