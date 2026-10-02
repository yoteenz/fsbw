import type { ResidentId } from '../types';

export type PairingOutcomeRecord = {
  pairKey: string;
  residentAId: ResidentId;
  residentBId: ResidentId;
  taskType: string;
  outcomeKind:
    | 'COMPLEMENTARY_PAIR'
    | 'PRODUCTIVE_FRICTION'
    | 'HIGH_TRUST_EXECUTION'
    | 'DEVELOPMENTAL_PAIR'
    | 'STABILIZING_PAIR';
  notes: string;
};

export type PrivateDisclosureRecord = {
  disclosureId: string;
  fromResidentId: ResidentId;
  subject: string;
  disclosureScope: 'FOUNDER_ONLY';
  sharingPermission: 'FOUNDER_CONFIDENTIAL';
  confidentialityExpectation: string;
  trustImpactIfViolated: string;
  at: string;
};

export type ResidentRequestRecord = {
  requestId: string;
  fromResidentId: ResidentId;
  toResidentId: ResidentId;
  request: string;
  why: string;
  status: 'OPEN' | 'RESOLVED' | 'BLOCKED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  at: string;
};

export type WorldStoryRecord = {
  storyId: string;
  storyType: string;
  summary: string;
  groundedEventId: string;
  residentIds: ResidentId[];
  at: string;
};
