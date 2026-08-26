import type { CurrencyCode } from '../billing/money';

export type DriverCompensationModel =
  | 'PER_MILE'
  | 'PERCENTAGE'
  | 'FLAT_LOAD'
  | 'HOURLY'
  | 'SALARY_REFERENCE'
  | 'CUSTOM';

export type DriverSettlementStatus =
  | 'DRAFT'
  | 'CALCULATED'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'PAID'
  | 'VOID';

export type SettlementAdjustmentType =
  | 'stop_pay'
  | 'detention'
  | 'layover'
  | 'bonus'
  | 'reimbursement'
  | 'advance'
  | 'deduction'
  | 'other';

export interface SettlementAdjustment {
  id: string;
  type: SettlementAdjustmentType;
  amountMinor: number;
  reason: string;
  source: 'load' | 'manual' | 'system';
  createdBy?: string;
  createdAt: string;
}

export interface DriverSettlement {
  id: string;
  loadId: string;
  organizationId: string;
  driverId: string;
  compensationModel: DriverCompensationModel;
  loadedMiles: number;
  emptyMiles: number;
  baseCompensationMinor: number;
  adjustments: SettlementAdjustment[];
  totalMinor: number;
  currency: CurrencyCode;
  status: DriverSettlementStatus;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  paidAt?: string;
}

export interface DriverSettlementInput {
  loadId: string;
  organizationId: string;
  driverId: string;
  compensationModel: DriverCompensationModel;
  loadedMiles: number;
  emptyMiles: number;
  ratePerMileMinor?: number;
  percentageBasisPoints?: number;
  flatLoadMinor?: number;
  adjustments?: Omit<SettlementAdjustment, 'id' | 'createdAt'>[];
}
