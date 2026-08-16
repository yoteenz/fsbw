import type {
  ConnectionTestResult,
  ExternalDataProvenance,
  IntegrationCapability,
  IntegrationConnection,
  IntegrationOperationStatus,
} from './integrationTypes';

export interface AdapterVerifyResult {
  ok: boolean;
  testResult: ConnectionTestResult;
  capabilities: IntegrationCapability[];
  safeMessage?: string;
}

export interface AdapterExecuteContext {
  connection: IntegrationConnection;
  operationType: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  idempotencyKey: string;
  timeoutMs?: number;
}

export interface AdapterExecuteResult {
  status: IntegrationOperationStatus;
  result?: Record<string, unknown>;
  safeError?: string;
  externalReference?: string;
  retryEligible?: boolean;
  errorCode?: string;
}

export interface AdapterSyncContext {
  connection: IntegrationConnection;
  entityType: string;
  cursor?: string;
  updatedSince?: string;
}

export interface AdapterSyncResult {
  status: IntegrationOperationStatus;
  recordsProcessed: number;
  recordsFailed: number;
  nextCursor?: string;
  safeError?: string;
}

/** Base provider adapter contract */
export interface IntegrationAdapter {
  readonly providerSlug: string;
  readonly adapterVersion: string;
  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult>;
  getCapabilities(connection: IntegrationConnection): IntegrationCapability[];
  execute(ctx: AdapterExecuteContext): Promise<AdapterExecuteResult>;
  sync?(ctx: AdapterSyncContext): Promise<AdapterSyncResult>;
  disconnect?(connection: IntegrationConnection): Promise<{ ok: boolean; safeMessage?: string }>;
}

export interface RegulatoryLookupRequest {
  identifierType: 'USDOT' | 'MC';
  identifier: string;
}

export interface RegulatoryLookupResult {
  found: boolean;
  legalName?: string;
  operatingStatus?: string;
  authorityStatus?: string;
  boc3Status?: string;
  insuranceStatus?: string;
  provenance: ExternalDataProvenance;
  providerStatusRaw?: string;
}

export interface RegulatoryDataAdapter extends IntegrationAdapter {
  lookupCarrier(request: RegulatoryLookupRequest): Promise<RegulatoryLookupResult>;
}

export interface PaymentWebhookPayload {
  externalEventId: string;
  eventType: string;
  amountMinor: number;
  currency: string;
  invoiceId?: string;
  customerId?: string;
  signature?: string;
  timestamp?: string;
}

export interface PaymentProviderAdapter extends IntegrationAdapter {
  createCheckout?(payload: Record<string, unknown>): Promise<AdapterExecuteResult>;
  verifyPayment?(externalId: string): Promise<AdapterExecuteResult>;
  processWebhook?(payload: PaymentWebhookPayload): Promise<{ ok: boolean; duplicate: boolean; safeError?: string }>;
}

export interface EmailSendAdapterRequest {
  to: string;
  subject: string;
  body: string;
  messageId: string;
}

export interface EmailProviderAdapter extends IntegrationAdapter {
  sendEmail(request: EmailSendAdapterRequest): Promise<AdapterExecuteResult>;
}

export interface SmsSendAdapterRequest {
  to: string;
  body: string;
  messageId: string;
}

export interface SmsProviderAdapter extends IntegrationAdapter {
  sendSms(request: SmsSendAdapterRequest): Promise<AdapterExecuteResult>;
  processInbound?(body: string, from: string): Promise<{ optOut: boolean; reply?: string }>;
}

export interface RouteEstimateRequest {
  origin: string;
  destination: string;
  loadId?: string;
}

export interface RouteEstimateResult {
  distanceMiles: number;
  estimatedDurationMinutes: number;
  provenance: ExternalDataProvenance;
  label: 'ESTIMATED' | 'DEMO';
}

export interface MapsRoutingAdapter extends IntegrationAdapter {
  estimateRoute(request: RouteEstimateRequest): Promise<RouteEstimateResult>;
  geocode?(address: string): Promise<{ lat: number; lng: number; formatted: string } | null>;
}

export interface LoadBoardSearchRequest {
  origin?: string;
  destination?: string;
  equipment?: string;
}

export interface LoadBoardSearchResult {
  candidates: Array<{
    externalLoadId: string;
    origin: string;
    destination: string;
    rateMinor?: number;
    commodity?: string;
    equipment?: string;
    miles?: number;
    isDemo: boolean;
  }>;
}

export interface LoadBoardAdapter extends IntegrationAdapter {
  searchLoads(request: LoadBoardSearchRequest): Promise<LoadBoardSearchResult>;
}

export interface FactoringSubmitRequest {
  submissionId: string;
  organizationId: string;
  documents: string[];
  authorized: boolean;
}

export interface FactoringProviderAdapter extends IntegrationAdapter {
  submitPackage(request: FactoringSubmitRequest): Promise<AdapterExecuteResult>;
  mapProviderStatus(raw: string): { canonical: string; raw: string };
}

export interface InsuranceSubmitRequest {
  requestId: string;
  organizationId: string;
  fields: Record<string, string>;
  authorized: boolean;
}

export interface InsurancePartnerAdapter extends IntegrationAdapter {
  submitReferral(request: InsuranceSubmitRequest): Promise<AdapterExecuteResult>;
}

export interface AccountingExportRequest {
  invoiceId: string;
  mappingVersion: string;
}

export interface AccountingProviderAdapter extends IntegrationAdapter {
  exportInvoice(request: AccountingExportRequest): Promise<AdapterExecuteResult>;
}

export interface AddressValidationAdapter extends IntegrationAdapter {
  validateAddress(address: string): Promise<{
    valid: boolean;
    suggested?: string;
    provenance: ExternalDataProvenance;
  }>;
}

export interface CalendarProviderAdapter extends IntegrationAdapter {
  checkAvailability?(range: { start: string; end: string }): Promise<{ busy: boolean }>;
}

export interface TelematicsAdapter extends IntegrationAdapter {
  getVehiclePosition?(vehicleId: string): Promise<{
    lat: number;
    lng: number;
    updatedAt: string;
    freshnessLabel: string;
  } | null>;
}

export interface ESignatureAdapter extends IntegrationAdapter {
  createEnvelope?(payload: Record<string, unknown>): Promise<AdapterExecuteResult>;
}

export interface BusinessVerificationAdapter extends IntegrationAdapter {
  lookupEntity?(identifier: string): Promise<AdapterExecuteResult>;
}

export interface IdentityVerificationAdapter extends IntegrationAdapter {
  /** Boundary only — no raw document storage */
  initiateVerification?(): Promise<AdapterExecuteResult>;
}

export function mapUnknownProviderEnum(raw: string): string {
  return raw ? `UNKNOWN_EXTERNAL_STATUS:${raw}` : 'UNKNOWN_EXTERNAL_STATUS';
}

export function validateMoney(amountMinor: number, currency: string): { ok: boolean; error?: string } {
  if (!Number.isInteger(amountMinor)) return { ok: false, error: 'Amount must be integer minor units' };
  if (amountMinor < 0) return { ok: false, error: 'Amount cannot be negative' };
  if (!/^[A-Z]{3}$/.test(currency)) return { ok: false, error: 'Invalid currency code' };
  return { ok: true };
}

export function parseExternalDate(iso: string): { ok: boolean; date?: Date; error?: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { ok: false, error: 'Invalid date' };
  if (d.getFullYear() < 1970 || d.getFullYear() > 2100) return { ok: false, error: 'Date out of range' };
  return { ok: true, date: d };
}
