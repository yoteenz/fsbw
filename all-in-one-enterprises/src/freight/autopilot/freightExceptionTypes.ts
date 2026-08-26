export type FreightExceptionType =
  | 'LATE_PICKUP'
  | 'LATE_DELIVERY'
  | 'MISSING_POD'
  | 'MISSING_BOL'
  | 'MISSING_RATE_CONFIRMATION'
  | 'DOCUMENT_REJECTED'
  | 'DRIVER_NOT_ASSIGNED'
  | 'TRUCK_UNAVAILABLE'
  | 'TRAILER_INCOMPATIBLE'
  | 'MAINTENANCE_BLOCK'
  | 'CARRIER_DOCUMENT_EXPIRED'
  | 'FACTORING_REJECTED'
  | 'SETTLEMENT_DISPUTED'
  | 'TRACKING_LOST'
  | 'ACCESSORIAL_REVIEW_REQUIRED'
  | 'BILLING_BLOCKED'
  | 'BOOKKEEPING_BLOCKED';

export type FreightExceptionSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type FreightExceptionStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface FreightException {
  id: string;
  loadId: string;
  organizationId: string;
  type: FreightExceptionType;
  severity: FreightExceptionSeverity;
  status: FreightExceptionStatus;
  summary: string;
  details?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedByStaffId?: string;
}

export const EXCEPTION_SEVERITY: Record<FreightExceptionType, FreightExceptionSeverity> = {
  LATE_PICKUP: 'P2',
  LATE_DELIVERY: 'P2',
  MISSING_POD: 'P1',
  MISSING_BOL: 'P2',
  MISSING_RATE_CONFIRMATION: 'P2',
  DOCUMENT_REJECTED: 'P2',
  DRIVER_NOT_ASSIGNED: 'P2',
  TRUCK_UNAVAILABLE: 'P2',
  TRAILER_INCOMPATIBLE: 'P3',
  MAINTENANCE_BLOCK: 'P1',
  CARRIER_DOCUMENT_EXPIRED: 'P2',
  FACTORING_REJECTED: 'P2',
  SETTLEMENT_DISPUTED: 'P1',
  TRACKING_LOST: 'P3',
  ACCESSORIAL_REVIEW_REQUIRED: 'P2',
  BILLING_BLOCKED: 'P1',
  BOOKKEEPING_BLOCKED: 'P2',
};
