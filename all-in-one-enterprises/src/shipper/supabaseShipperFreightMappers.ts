import type {
  BrokerageFreightQuote,
  BrokerageQuoteRevision,
  BrokerageShipperInvoice,
  ShipmentRequest,
  ShipmentRequestTemplate,
} from '../brokerage/brokerageTypes';
import type { Load } from '../dispatch/dispatchTypes';
import type { ShipmentRequestInput } from '../brokerage/brokerageWorkflow';
import type { ShipperShipmentStatusEvent } from './shipperFreightRepositoryTypes';

type ShipmentRequestRow = {
  id: string;
  request_number: string;
  shipper_organization_id: string;
  status: string;
  pickup_city: string;
  pickup_state: string;
  pickup_zip: string | null;
  pickup_date: string;
  pickup_time_start: string | null;
  pickup_time_end: string | null;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string | null;
  delivery_date: string;
  delivery_time_start: string | null;
  delivery_time_end: string | null;
  equipment_type: string;
  trailer_length_ft: number | null;
  full_partial: string | null;
  commodity: string | null;
  weight: string | null;
  pallet_count: number | null;
  special_instructions: string | null;
  reference_numbers: string | null;
  assigned_broker_staff_id: string | null;
  converted_load_id: string | null;
  open_info_request_id: string | null;
  priority: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  version: number;
};

type QuoteRow = {
  id: string;
  quote_number: string;
  shipment_request_id: string;
  shipper_organization_id: string;
  status: string;
  freight_charge_minor: number;
  currency: string;
  current_revision: number;
  expires_at: string | null;
  accepted_revision_id: string | null;
  converted_load_id: string | null;
  prepared_by_staff_id: string | null;
  created_at: string;
  updated_at: string;
  version: number;
};

type QuoteRevisionRow = {
  id: string;
  quote_id: string;
  version: number;
  freight_charge_minor: number;
  accessorial_notes: string | null;
  expires_at: string | null;
  prepared_by_staff_id: string | null;
  created_at: string;
};

type LoadRow = {
  id: string;
  load_number: string;
  organization_id: string;
  shipper_organization_id: string | null;
  source_type: string | null;
  origin_city: string | null;
  origin_state: string | null;
  destination_city: string | null;
  destination_state: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  equipment_type: string | null;
  loaded_miles: number | null;
  deadhead_miles: number | null;
  operational_status: string | null;
  coverage_status: string | null;
  commodity: string | null;
  weight: string | null;
  currency: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

type InvoiceRow = {
  id: string;
  load_id: string;
  shipper_organization_id: string;
  invoice_number: string;
  base_freight_charge_minor: number;
  accessorials_minor: number;
  adjustments_minor: number;
  total_minor: number;
  paid_amount_minor: number;
  balance_minor: number;
  currency: string;
  status: string;
  invoice_date: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  version: number;
};

type StatusHistoryRow = {
  id: string;
  load_id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  actor_label: string | null;
  created_at: string;
};

export function mapShipmentRequestRow(row: ShipmentRequestRow): ShipmentRequest {
  const payload = row.payload ?? {};
  return {
    id: row.id,
    requestNumber: row.request_number,
    shipperOrganizationId: row.shipper_organization_id,
    status: row.status as ShipmentRequest['status'],
    pickupCity: row.pickup_city,
    pickupState: row.pickup_state,
    pickupZip: row.pickup_zip ?? undefined,
    pickupDate: row.pickup_date,
    pickupTimeStart: row.pickup_time_start ?? undefined,
    pickupTimeEnd: row.pickup_time_end ?? undefined,
    deliveryCity: row.delivery_city,
    deliveryState: row.delivery_state,
    deliveryZip: row.delivery_zip ?? undefined,
    deliveryDate: row.delivery_date,
    deliveryTimeStart: row.delivery_time_start ?? undefined,
    deliveryTimeEnd: row.delivery_time_end ?? undefined,
    equipmentType: row.equipment_type,
    trailerLengthFt: row.trailer_length_ft ?? undefined,
    fullPartial: (row.full_partial as ShipmentRequest['fullPartial']) ?? undefined,
    commodity: row.commodity ?? undefined,
    weight: row.weight ?? undefined,
    palletCount: row.pallet_count ?? undefined,
    specialInstructions: row.special_instructions ?? undefined,
    referenceNumbers: row.reference_numbers ?? undefined,
    assignedBrokerStaffId: row.assigned_broker_staff_id ?? undefined,
    convertedLoadId: row.converted_load_id ?? undefined,
    openInfoRequestId: row.open_info_request_id ?? undefined,
    priority: (row.priority as ShipmentRequest['priority']) ?? undefined,
    documentIds: [],
    hazmatSelfReported: Boolean(payload.hazmatSelfReported),
    pickupCompany: payload.pickupCompany as string | undefined,
    deliveryCompany: payload.deliveryCompany as string | undefined,
    contactName: payload.contactName as string | undefined,
    contactPhone: payload.contactPhone as string | undefined,
    contactEmail: payload.contactEmail as string | undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

export function mapShipmentRequestToInsert(
  orgId: string,
  partial: Partial<ShipmentRequestInput>,
  requestNumber: string,
): Record<string, unknown> {
  const {
    hazmatSelfReported,
    pickupCompany,
    deliveryCompany,
    contactName,
    contactPhone,
    contactEmail,
    pickupAddress,
    deliveryAddress,
    ...rest
  } = partial;

  return {
    request_number: requestNumber,
    shipper_organization_id: orgId,
    status: 'draft',
    pickup_city: rest.pickupCity ?? '',
    pickup_state: rest.pickupState ?? '',
    pickup_zip: rest.pickupZip ?? null,
    pickup_date: rest.pickupDate || new Date().toISOString().slice(0, 10),
    pickup_time_start: rest.pickupTimeStart ?? null,
    pickup_time_end: rest.pickupTimeEnd ?? null,
    delivery_city: rest.deliveryCity ?? '',
    delivery_state: rest.deliveryState ?? '',
    delivery_zip: rest.deliveryZip ?? null,
    delivery_date: rest.deliveryDate || new Date().toISOString().slice(0, 10),
    delivery_time_start: rest.deliveryTimeStart ?? null,
    delivery_time_end: rest.deliveryTimeEnd ?? null,
    equipment_type: rest.equipmentType ?? 'Dry Van',
    trailer_length_ft: rest.trailerLengthFt ?? null,
    full_partial: rest.fullPartial ?? null,
    commodity: rest.commodity ?? null,
    weight: rest.weight ?? null,
    pallet_count: rest.palletCount ?? null,
    special_instructions: rest.specialInstructions ?? null,
    reference_numbers: rest.referenceNumbers ?? null,
    priority: rest.priority ?? 'normal',
    payload: {
      hazmatSelfReported,
      pickupCompany,
      deliveryCompany,
      contactName,
      contactPhone,
      contactEmail,
      pickupAddress,
      deliveryAddress,
    },
  };
}

export function mapQuoteRow(row: QuoteRow, revisions: QuoteRevisionRow[]): BrokerageFreightQuote {
  return {
    id: row.id,
    quoteNumber: row.quote_number,
    shipmentRequestId: row.shipment_request_id,
    shipperOrganizationId: row.shipper_organization_id,
    status: row.status as BrokerageFreightQuote['status'],
    freightChargeMinor: Number(row.freight_charge_minor),
    currency: row.currency as BrokerageFreightQuote['currency'],
    currentRevision: row.current_revision,
    expiresAt: row.expires_at ?? undefined,
    acceptedRevisionId: row.accepted_revision_id ?? undefined,
    convertedLoadId: row.converted_load_id ?? undefined,
    preparedByStaffId: row.prepared_by_staff_id ?? undefined,
    revisions: revisions.map(mapQuoteRevisionRow),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

function mapQuoteRevisionRow(row: QuoteRevisionRow): BrokerageQuoteRevision {
  return {
    id: row.id,
    quoteId: row.quote_id,
    version: row.version,
    freightChargeMinor: Number(row.freight_charge_minor),
    accessorialNotes: row.accessorial_notes ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    preparedByStaffId: row.prepared_by_staff_id ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapLoadRow(row: LoadRow): Load {
  return {
    id: row.id,
    loadNumber: row.load_number,
    organizationId: row.organization_id,
    sourceType: 'brokerage',
    shipperOrganizationId: row.shipper_organization_id ?? undefined,
    equipmentType: row.equipment_type ?? 'Dry Van',
    originCity: row.origin_city ?? '',
    originState: row.origin_state ?? '',
    destinationCity: row.destination_city ?? '',
    destinationState: row.destination_state ?? '',
    pickupDate: row.pickup_date ?? '',
    deliveryDate: row.delivery_date ?? '',
    loadedMiles: row.loaded_miles ?? 0,
    deadheadMiles: row.deadhead_miles ?? 0,
    commodity: row.commodity ?? undefined,
    weight: row.weight ?? undefined,
    linehaulMinor: 0,
    fuelSurchargeMinor: 0,
    accessorialMinor: 0,
    grossMinor: 0,
    confirmedGrossMinor: 0,
    currency: (row.currency ?? 'USD') as Load['currency'],
    offerStatus: 'draft',
    operationalStatus: (row.operational_status ?? 'opportunity') as Load['operationalStatus'],
    brokerageCoverageStatus: row.coverage_status as Load['brokerageCoverageStatus'],
    brokerName: 'All In One Brokerage',
    rateConfirmationStatus: 'missing',
    rateDetailsReviewed: false,
    factoringHandoffStatus: 'not_ready',
    internalNotes: row.internal_notes ?? undefined,
    accessorials: [],
    rateRevisions: [],
    timeline: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: 1,
  };
}

export function mapInvoiceRow(row: InvoiceRow): BrokerageShipperInvoice {
  return {
    id: row.id,
    organizationId: row.shipper_organization_id,
    loadId: row.load_id,
    shipperOrganizationId: row.shipper_organization_id,
    invoiceNumber: row.invoice_number,
    baseFreightChargeMinor: Number(row.base_freight_charge_minor),
    accessorialsMinor: Number(row.accessorials_minor),
    adjustmentsMinor: Number(row.adjustments_minor),
    totalMinor: Number(row.total_minor),
    paidAmountMinor: Number(row.paid_amount_minor),
    balanceMinor: Number(row.balance_minor),
    currency: row.currency as BrokerageShipperInvoice['currency'],
    status: row.status as BrokerageShipperInvoice['status'],
    invoiceDate: row.invoice_date,
    dueDate: row.due_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

export function mapStatusHistoryRow(row: StatusHistoryRow): ShipperShipmentStatusEvent {
  return {
    id: row.id,
    loadId: row.load_id,
    fromStatus: row.from_status ?? undefined,
    toStatus: row.to_status,
    note: row.note ?? undefined,
    actorLabel: row.actor_label ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapTemplateRow(row: {
  id: string;
  shipper_organization_id: string;
  label: string;
  snapshot: ShipmentRequestTemplate['snapshot'];
  created_at: string;
  updated_at: string;
}): ShipmentRequestTemplate {
  return {
    id: row.id,
    shipperOrganizationId: row.shipper_organization_id,
    label: row.label,
    snapshot: row.snapshot ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type {
  ShipmentRequestRow,
  QuoteRow,
  QuoteRevisionRow,
  LoadRow,
  InvoiceRow,
  StatusHistoryRow,
};
