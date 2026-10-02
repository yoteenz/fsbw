import type { ResidentId } from '../../types';
import { getResidentLifeTwin } from '../life-os-services';

export type ApproachIntent =
  | 'FORMAL_PROPOSAL'
  | 'CASUAL_MENTION'
  | 'PRIVATE_CONVERSATION'
  | 'URGENT_ESCALATION'
  | 'LEAVE_ON_TABLE'
  | 'SCHEDULE_MEETING'
  | 'MESSAGE_FIRST'
  | 'SHOW_DONT_TELL';

export function resolveApproachIntent(residentId: ResidentId, urgency: 'low' | 'medium' | 'high'): ApproachIntent {
  const twin = getResidentLifeTwin(residentId);
  const approach = twin.approach;
  if (urgency === 'high') {
    return approach.escalationStyle.includes('direct') ? 'URGENT_ESCALATION' : 'SCHEDULE_MEETING';
  }
  if (approach.preferPrivate) return 'PRIVATE_CONVERSATION';
  if (approach.solveFirstReportLater) return 'LEAVE_ON_TABLE';
  if (approach.contextPrepared === 'extensive') return 'FORMAL_PROPOSAL';
  if (twin.decisionWeights.founderCandor > 0.7) return 'MESSAGE_FIRST';
  return 'CASUAL_MENTION';
}
