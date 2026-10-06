/**
 * IFTA quarter case — the record behind the Quarterly Filing Room (client) and the Fuel Tax case file (staff).
 * One object per client-quarter; both actors read the same record through different view models.
 */
import type { JurisdictionMileageEntry } from '../fleet/ifta/iftaReadiness';
import type { IftaMileageSourceDef, IftaStateId } from './experience/iftaExperience';

/** Contract receipt classes + UNDER_AIO_REVIEW (sprint §6 — receipt the client is done with, AIO still classifying). */
export type IftaReceiptClass = 'READY' | 'NEEDS_YOU' | 'DUPLICATE' | 'POSSIBLE_MISSING' | 'UNREADABLE' | 'UNDER_AIO_REVIEW';

export type IftaCaptureMethod = 'TAKE_PHOTO' | 'UPLOAD_FILES' | 'IMPORT_FROM_VAULT' | 'CONTINUOUS_CAPTURE';

export interface IftaReceiptFlag {
  reason: string;
  question?: string;
  options?: string[];
  requestedByStaffId?: string;
}

export interface IftaReceipt {
  id: string;
  vendor: string | null;
  location: string | null;
  jurisdiction: string;
  purchaseDate: string | null;
  gallons: number | null;
  amount: number | null;
  vehicleId: string | null;
  fuelUse: 'ROAD' | 'REEFER' | null;
  /** SYSTEM_GAP marks a POSSIBLE_MISSING slot raised from mileage, not a captured file. */
  source: IftaCaptureMethod | 'SYSTEM_GAP';
  receiptClass: IftaReceiptClass;
  flag?: IftaReceiptFlag;
  duplicateOfId?: string;
  fileLabel?: string;
  /** Set when the receipt was imported from a Vault document (IMPORT FROM VAULT). */
  vaultDocumentId?: string;
  addedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export type IftaMileageSourceId = IftaMileageSourceDef['id'];

export interface IftaMileageRecord {
  id: string;
  vehicleId: string;
  sourceId: IftaMileageSourceId;
  entries: JurisdictionMileageEntry[];
  fileLabel?: string;
  addedAt: string;
  /** Manual / spreadsheet / AIO-assisted miles count as verified only after staff review (contract mileage sources). */
  staffVerifiedAt?: string;
  supersededById?: string;
}

export interface IftaVehicle {
  id: string;
  unit: string;
  description: string;
  operated: boolean | null;
  notOperatedNote?: string;
  /** Prior quarter MPG — basis for the staff MPG band check. */
  priorMpg?: number;
}

export type IftaPaymentStatus = 'NOT_RECORDED' | 'PAYMENT_PENDING' | 'PAID' | 'CREDIT_CARRIED' | 'NO_TAX_DUE';

export interface IftaReturnLine {
  jurisdiction: string;
  miles: number;
  taxPaidGallons: number;
  /** Staff-entered from the filing worksheet: positive = tax due, negative = credit. No rate tables in code. */
  netTax: number;
}

export interface IftaReturnSummary {
  preparedByStaffId: string;
  preparedAt: string;
  sentForApprovalAt?: string;
  lines: IftaReturnLine[];
  totalMiles: number;
  totalGallons: number;
  fleetMpg: number;
  netPosition: number;
  approvedAt?: string;
  approvedBy?: string;
  clientQuestion?: { at: string; text: string };
}

export interface IftaFiling {
  filedAt: string;
  confirmationNumber: string;
  filedByStaffId: string;
  destination: string;
}

export interface IftaPayment {
  status: IftaPaymentStatus;
  amount: number;
  recordedAt?: string;
  note?: string;
}

export interface IftaVaultPacket {
  sealedAt: string;
  path: string[];
  documentId: string;
  contents: string[];
}

export type IftaDiscrepancyKind = 'MILES_WITHOUT_FUEL' | 'MPG_OUTLIER' | 'UNVERIFIED_MILEAGE' | 'RECEIPT_CLASSIFICATION';

export interface IftaDiscrepancy {
  id: string;
  kind: IftaDiscrepancyKind;
  jurisdiction: string | null;
  vehicleId: string | null;
  detail: string;
  status: 'OPEN' | 'RESOLVED';
  resolution?: { at: string; byStaffId: string; note: string; override: boolean };
}

export interface IftaCorrectionRequest {
  id: string;
  requestedAt: string;
  requestedByStaffId: string;
  receiptIds: string[];
  vehicleIds: string[];
  message: string;
  resolvedAt?: string;
}

export interface IftaAuditEvent {
  id: string;
  at: string;
  actor: 'CLIENT' | 'FOUNDER_STAFF' | 'SYSTEM';
  actorName: string;
  action: string;
  note?: string;
}

export interface IftaQuarterCase {
  id: string;
  organizationId: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  baseJurisdiction: string;
  baseJurisdictionName: string;
  iftaAccount: string;
  state: IftaStateId;
  assignedStaffId: string;
  vehicles: IftaVehicle[];
  vehiclesConfirmedAt?: string;
  receipts: IftaReceipt[];
  mileage: IftaMileageRecord[];
  continuousCapture: boolean;
  submittedAt?: string;
  reviewStartedAt?: string;
  discrepancies: IftaDiscrepancy[];
  corrections: IftaCorrectionRequest[];
  /** Staff filing worksheet (net tax per jurisdiction) — the return summary's tax column comes only from here. */
  staffWorksheet?: { jurisdiction: string; netTax: number }[];
  returnSummary?: IftaReturnSummary;
  filing?: IftaFiling;
  payment: IftaPayment;
  vault?: IftaVaultPacket;
  conversationId?: string;
  serviceFeeLabel: string;
  audit: IftaAuditEvent[];
}
