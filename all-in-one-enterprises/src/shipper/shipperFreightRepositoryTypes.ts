import type {
  BrokerageFreightQuote,
  BrokerageShipperInvoice,
  ShipmentRequest,
  ShipmentRequestTemplate,
} from '../brokerage/brokerageTypes';
import type { Load } from '../dispatch/dispatchTypes';
import type { ShipmentRequestInput } from '../brokerage/brokerageWorkflow';

export type ShipperFreightRepositoryMode = 'demo' | 'supabase';

export interface ShipperFreightRepositoryError {
  code: 'UNAVAILABLE' | 'QUERY_FAILED' | 'FORBIDDEN' | 'VALIDATION';
  message: string;
}

export type ShipperFreightResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ShipperFreightRepositoryError };

export interface ShipperShipmentStatusEvent {
  id: string;
  loadId: string;
  fromStatus?: string;
  toStatus: string;
  note?: string;
  actorLabel?: string;
  createdAt: string;
}

export interface ShipperFreightDocument {
  id: string;
  loadId?: string;
  requestId?: string;
  kind: string;
  label: string;
  createdAt: string;
}

export interface ShipperFreightRepository {
  readonly mode: ShipperFreightRepositoryMode;

  saveDraft(
    orgId: string,
    partial: Partial<ShipmentRequestInput>,
    existingId?: string,
  ): Promise<ShipperFreightResult<string>>;

  submitRequest(orgId: string, requestId: string): Promise<ShipperFreightResult<void>>;

  listRequests(orgId: string): Promise<ShipperFreightResult<ShipmentRequest[]>>;

  getRequest(orgId: string, requestId: string): Promise<ShipperFreightResult<ShipmentRequest | null>>;

  listQuotes(orgId: string): Promise<ShipperFreightResult<BrokerageFreightQuote[]>>;

  getQuote(orgId: string, quoteId: string): Promise<ShipperFreightResult<BrokerageFreightQuote | null>>;

  acceptQuote(orgId: string, quoteId: string): Promise<ShipperFreightResult<string | undefined>>;

  declineQuote(orgId: string, quoteId: string): Promise<ShipperFreightResult<void>>;

  listShipments(orgId: string): Promise<ShipperFreightResult<Load[]>>;

  getShipment(orgId: string, loadId: string): Promise<ShipperFreightResult<Load | null>>;

  getShipmentHistory(orgId: string, loadId: string): Promise<ShipperFreightResult<ShipperShipmentStatusEvent[]>>;

  listInvoices(orgId: string): Promise<ShipperFreightResult<BrokerageShipperInvoice[]>>;

  getInvoice(orgId: string, invoiceId: string): Promise<ShipperFreightResult<BrokerageShipperInvoice | null>>;

  listAuthorizedDocuments(
    orgId: string,
    context: { loadId?: string; requestId?: string },
  ): Promise<ShipperFreightResult<ShipperFreightDocument[]>>;

  saveTemplate(
    orgId: string,
    label: string,
    snapshot: ShipmentRequestTemplate['snapshot'],
  ): Promise<ShipperFreightResult<ShipmentRequestTemplate>>;

  listTemplates(orgId: string): Promise<ShipperFreightResult<ShipmentRequestTemplate[]>>;

  duplicateFromTemplate(orgId: string, templateId: string): Promise<ShipperFreightResult<string>>;
}

export const SHIPPER_FREIGHT_UNAVAILABLE_MESSAGE =
  "We couldn't load your freight data. Try again.";
