import type { Load } from '../../dispatch/dispatchTypes';

/** Lifecycle events Freight Autopilot reacts to — deterministic, auditable. */
export type FreightAutopilotEventType =
  | 'LOAD_CREATED'
  | 'QUOTE_ACCEPTED'
  | 'LOAD_PUBLISHED'
  | 'CARRIER_OFFER_ACCEPTED'
  | 'CARRIER_BOOKED'
  | 'DRIVER_ASSIGNED'
  | 'PICKUP_CONFIRMED'
  | 'IN_TRANSIT'
  | 'DELIVERY_CONFIRMED'
  | 'DOCUMENT_UPLOADED'
  | 'POD_RECEIVED'
  | 'DOCUMENT_PACKAGE_COMPLETE'
  | 'INVOICE_READY'
  | 'FACTORING_READY'
  | 'CARRIER_SETTLEMENT_READY'
  | 'BOOKKEEPING_READY'
  | 'LOAD_FINANCIALLY_CLOSED';

export type FreightAutopilotStepStatus = 'pending' | 'ready' | 'complete' | 'blocked' | 'skipped' | 'manual_required';

export type FreightAutopilotStepKey =
  | 'carrier_booked'
  | 'driver_assigned'
  | 'dispatch_package_ready'
  | 'pickup_confirmed'
  | 'bol_received'
  | 'delivery_confirmed'
  | 'pod_received'
  | 'document_package_complete'
  | 'invoice_ready'
  | 'factoring_package_ready'
  | 'carrier_settlement_pending'
  | 'driver_settlement_pending'
  | 'bookkeeping_close_pending'
  | 'financially_closed';

export interface FreightAutopilotStep {
  key: FreightAutopilotStepKey;
  label: string;
  status: FreightAutopilotStepStatus;
  blockedReason?: string;
  completedAt?: string;
  automated: boolean;
}

export interface FreightAutopilotState {
  loadId: string;
  organizationId: string;
  steps: FreightAutopilotStep[];
  lastEvent?: FreightAutopilotEventType;
  lastProcessedAt: string;
  documentPackageStatus: 'incomplete' | 'complete' | 'override';
  billingPackageId?: string;
  updatedAt: string;
}

export interface FreightAutopilotProcessInput {
  load: Load;
  event: FreightAutopilotEventType;
  staffId?: string;
  documentKind?: 'rate_confirmation' | 'bol' | 'pod';
}

export interface FreightAutopilotProcessResult {
  state: FreightAutopilotState;
  actionsTaken: string[];
  exceptionsCreated: string[];
  blocked: boolean;
}
