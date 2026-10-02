import type { ResidentId } from '../../types';

export type CareerRequestKind =
  | 'PROMOTION_DISCUSSION'
  | 'ROLE_CHANGE'
  | 'TRANSFER'
  | 'ROTATION'
  | 'WORKLOAD_CONCERN'
  | 'AUTHORITY_REQUEST'
  | 'TRAINING_REQUEST'
  | 'MENTORSHIP_REQUEST'
  | 'SABBATICAL'
  | 'STEP_DOWN'
  | 'EXIT_DISCUSSION';

export type CareerRequestRecord = {
  careerRequestId: string;
  residentId: ResidentId;
  requestKind: CareerRequestKind;
  summary: string;
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED';
  founderApprovalRequired: boolean;
  at: string;
  payload: Record<string, unknown>;
};
