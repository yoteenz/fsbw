/**
 * Supabase read path for Freight Autopilot panel — authoritative persisted state.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Load } from '../../dispatch/dispatchTypes';
import type { DocumentCompletenessResult } from './documentCompleteness';
import { deriveAutopilotSteps } from './freightAutopilotRules';
import type { FreightAutopilotState } from './freightAutopilotTypes';
import type { FreightException, FreightExceptionStatus } from './freightExceptionTypes';
import type { FreightLoadDocumentRef } from './freightDocumentTypes';

export interface PersistedAutopilotContext {
  hasInvoice: boolean;
  hasBillingPackage: boolean;
  hasDispatchSnapshot: boolean;
  driverSettlementStatus?: string;
  carrierSettlementStatus?: string;
  bookkeepingHandoffStatus?: string;
  lastEvent?: string;
  lastProcessedAt?: string;
}

function mapExceptionStatus(dbStatus: string): FreightExceptionStatus {
  switch (dbStatus) {
    case 'OPEN':
      return 'open';
    case 'ACKNOWLEDGED':
      return 'acknowledged';
    case 'RESOLVED':
      return 'resolved';
    case 'DISMISSED':
      return 'dismissed';
    default:
      return 'open';
  }
}

function mapLoadRow(row: Record<string, unknown>): Load {
  const origin = String(row.origin ?? '');
  const destination = String(row.destination ?? '');
  const [originCity = '', originState = ''] = origin.split(',').map((s) => s.trim());
  const [destinationCity = '', destinationState = ''] = destination.split(',').map((s) => s.trim());

  return {
    id: row.id as string,
    loadNumber: (row.load_number as string) ?? '',
    organizationId: row.organization_id as string,
    sourceType: (row.source_type as Load['sourceType']) ?? 'asset',
    shipperOrganizationId: row.shipper_organization_id as string | undefined,
    brokerageCarrierOrganizationId: row.carrier_organization_id as string | undefined,
    brokerName: 'AIO',
    equipmentType: (row.equipment_type as string) ?? 'Dry Van',
    originCity: originCity || 'Unknown',
    originState: originState || 'TX',
    destinationCity: destinationCity || 'Unknown',
    destinationState: destinationState || 'TX',
    pickupDate: (row.pickup_date as string) ?? new Date().toISOString().slice(0, 10),
    deliveryDate: (row.delivery_date as string) ?? new Date().toISOString().slice(0, 10),
    loadedMiles: Number(row.loaded_miles ?? 0),
    deadheadMiles: Number(row.deadhead_miles ?? 0),
    linehaulMinor: Number(row.linehaul_minor ?? row.gross_minor ?? 0),
    fuelSurchargeMinor: 0,
    accessorialMinor: 0,
    grossMinor: Number(row.gross_minor ?? 0),
    confirmedGrossMinor: Number(row.confirmed_gross_minor ?? row.gross_minor ?? 0),
    currency: 'USD',
    offerStatus: (row.offer_status as Load['offerStatus']) ?? 'accepted',
    operationalStatus: (row.operational_status as Load['operationalStatus']) ?? 'booked',
    rateConfirmationStatus: row.rate_confirmation_document_id ? 'uploaded' : 'missing',
    rateConfirmationDocumentId: row.rate_confirmation_document_id as string | undefined,
    bolDocumentId: row.bol_document_id as string | undefined,
    podDocumentId: row.pod_document_id as string | undefined,
    primaryDriverId: row.primary_driver_id as string | undefined,
    powerUnitId: row.power_unit_id as string | undefined,
    trailerId: row.trailer_id as string | undefined,
    rateDetailsReviewed: Boolean(row.rate_confirmation_document_id),
    factoringHandoffStatus: (row.factoring_handoff_status as Load['factoringHandoffStatus']) ?? 'not_ready',
    accessorials: [],
    rateRevisions: [],
    timeline: [],
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
    version: 1,
  };
}

export function documentCompletenessFromRow(row: Record<string, unknown>): DocumentCompletenessResult {
  const items = (row.requirements_json as FreightLoadDocumentRef[] | undefined) ?? [];
  return {
    status: (row.package_status as DocumentCompletenessResult['status']) ?? 'incomplete',
    items,
    missingLabels: (row.missing_labels as string[]) ?? [],
    readyForBilling: Boolean(row.ready_for_billing),
    readyForFactoring: Boolean(row.ready_for_factoring),
    readyForSettlement: Boolean(row.ready_for_settlement),
  };
}

export function buildAutopilotStateFromPersisted(
  load: Load,
  doc: DocumentCompletenessResult,
  ctx: PersistedAutopilotContext,
): FreightAutopilotState {
  const steps = deriveAutopilotSteps(load, {
    hasInvoice: ctx.hasInvoice,
    hasBillingPackage: ctx.hasBillingPackage,
  }).map((step) => {
    if (step.key === 'dispatch_package_ready' && ctx.hasDispatchSnapshot) {
      return { ...step, status: 'complete' as const };
    }
    if (step.key === 'invoice_ready' && ctx.hasInvoice) {
      return { ...step, status: 'complete' as const };
    }
    if (step.key === 'carrier_settlement_pending' && ctx.carrierSettlementStatus) {
      const approved = ['APPROVED', 'SCHEDULED', 'PAID'].includes(ctx.carrierSettlementStatus);
      return { ...step, status: approved ? ('complete' as const) : ('ready' as const) };
    }
    if (step.key === 'driver_settlement_pending' && ctx.driverSettlementStatus) {
      const approved = ['APPROVED', 'PAID'].includes(ctx.driverSettlementStatus);
      return { ...step, status: approved ? ('complete' as const) : ('ready' as const) };
    }
    if (step.key === 'bookkeeping_close_pending' && ctx.bookkeepingHandoffStatus) {
      return { ...step, status: 'complete' as const };
    }
    if (step.key === 'financially_closed' && ctx.hasInvoice && ctx.bookkeepingHandoffStatus) {
      return { ...step, status: 'ready' as const };
    }
    return step;
  });

  return {
    loadId: load.id,
    organizationId: load.organizationId,
    steps,
    documentPackageStatus: doc.status,
    lastEvent: ctx.lastEvent as FreightAutopilotState['lastEvent'],
    lastProcessedAt: ctx.lastProcessedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchPersistedAutopilotContext(
  client: SupabaseClient,
  loadId: string,
): Promise<PersistedAutopilotContext> {
  const [
    billingRes,
    invoiceRes,
    driverSetRes,
    carrierSetRes,
    handoffRes,
    snapshotRes,
    eventRes,
    docRes,
  ] = await Promise.all([
    client.from('aio_freight_billing_packages').select('id, status, bookkeeping_status').eq('load_id', loadId).maybeSingle(),
    client.from('aio_brokerage_shipper_invoices').select('id, status').eq('load_id', loadId).maybeSingle(),
    client.from('aio_driver_settlements').select('status').eq('load_id', loadId).maybeSingle(),
    client.from('aio_carrier_settlements').select('lifecycle_status').eq('load_id', loadId).maybeSingle(),
    client.from('aio_brokerage_bookkeeping_handoffs').select('id, status').eq('load_id', loadId).maybeSingle(),
    client.from('aio_dispatch_package_snapshots').select('id').eq('load_id', loadId).limit(1).maybeSingle(),
    client.from('aio_freight_autopilot_events').select('event_type, processed_at').eq('load_id', loadId).order('occurred_at', { ascending: false }).limit(1).maybeSingle(),
    client.from('aio_freight_document_completeness').select('updated_at').eq('load_id', loadId).maybeSingle(),
  ]);

  return {
    hasBillingPackage: Boolean(billingRes.data),
    hasInvoice: Boolean(invoiceRes.data && invoiceRes.data.status !== 'void'),
    hasDispatchSnapshot: Boolean(snapshotRes.data),
    driverSettlementStatus: driverSetRes.data?.status as string | undefined,
    carrierSettlementStatus: carrierSetRes.data?.lifecycle_status as string | undefined,
    bookkeepingHandoffStatus: handoffRes.data ? 'handed_off' : billingRes.data?.bookkeeping_status,
    lastEvent: eventRes.data?.event_type as string | undefined,
    lastProcessedAt: (eventRes.data?.processed_at as string) ?? (docRes.data?.updated_at as string),
  };
}

export async function fetchOpenExceptions(
  client: SupabaseClient,
  loadId: string,
): Promise<FreightException[]> {
  const { data, error } = await client
    .from('aio_freight_exceptions')
    .select('*')
    .eq('load_id', loadId)
    .eq('status', 'OPEN');

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id as string,
    loadId: row.load_id as string,
    organizationId: row.organization_id as string,
    type: row.exception_type as FreightException['type'],
    severity: row.severity as FreightException['severity'],
    status: mapExceptionStatus(row.status as string),
    summary: row.summary as string,
    details: row.details as string | undefined,
    createdAt: row.created_at as string,
    resolvedAt: row.resolved_at as string | undefined,
    resolvedByStaffId: row.resolved_by as string | undefined,
  }));
}

export async function fetchLoadForAutopilot(
  client: SupabaseClient,
  loadId: string,
): Promise<Load | undefined> {
  const { data, error } = await client.from('aio_dispatch_loads').select('*').eq('id', loadId).maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return mapLoadRow(data as Record<string, unknown>);
}

export async function fetchDocumentCompletenessRow(
  client: SupabaseClient,
  loadId: string,
): Promise<DocumentCompletenessResult | undefined> {
  const { data, error } = await client
    .from('aio_freight_document_completeness')
    .select('*')
    .eq('load_id', loadId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return documentCompletenessFromRow(data as Record<string, unknown>);
}
