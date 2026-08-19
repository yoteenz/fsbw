/**
 * Idempotent handoff from closed brokerage loads → AIO internal bookkeeping.
 * Does NOT feed carrier-client trucking P&L — brokerage org books only.
 */
import { computeBrokerageGrossMargin } from './brokerageCalculations';
import type { BrokerageBookkeepingHandoff, CarrierPayable, BrokerageShipperInvoice } from './brokerageTypes';
import type { Load } from '../dispatch/dispatchTypes';
import { getAioSupabase } from '../data/supabase/client';
import { isSupabaseMode } from '../config/dataMode';
import { loadDemoStore, updateDemoStore } from '../demo/demoStore';
import type { DemoStore } from '../demo/demoTypes';
import { getLoadFinancials } from '../demo/brokerageActions';

export type BookkeepingHandoffResult =
  | { ok: true; handoffId: string; created: boolean; revisionNumber: number }
  | { ok: false; code: 'NOT_READY' | 'UNAVAILABLE' | 'QUERY_FAILED'; message: string };

export interface BookkeepingHandoffInput {
  load: Load;
  shipperInvoice?: BrokerageShipperInvoice;
  carrierPayable?: CarrierPayable;
  aioBrokerageOrgId: string;
  staffId?: string;
  forceRevision?: boolean;
  adjustmentNote?: string;
}

const AIO_BROKERAGE_ORG_DEMO = 'aio-internal';

function handoffIdempotencyKey(loadId: string, revision: number): string {
  return `BROKERAGE_LOAD:${loadId}:rev:${revision}`;
}

function mapShipperPaymentStatus(status?: BrokerageShipperInvoice['status']): string {
  switch (status) {
    case 'draft':
      return 'NOT_INVOICED';
    case 'issued':
      return 'INVOICED';
    case 'partially_paid':
      return 'PARTIAL';
    case 'paid':
      return 'PAID';
    case 'past_due':
      return 'OVERDUE';
    case 'disputed':
      return 'DISPUTED';
    case 'void':
      return 'VOID';
    default:
      return 'NOT_INVOICED';
  }
}

function mapCarrierPaymentStatus(status?: CarrierPayable['status']): string {
  switch (status) {
    case 'pending_documents':
    case 'pending_approval':
      return 'NOT_READY';
    case 'approved':
    case 'scheduled_future':
      return 'READY';
    case 'paid_future':
      return 'PAID';
    case 'disputed':
      return 'DISPUTED';
    case 'hold':
      return 'ON_HOLD';
    default:
      return 'NOT_READY';
  }
}

function isLoadReadyForHandoff(load: Load): boolean {
  return load.sourceType === 'brokerage' && load.operationalStatus === 'complete';
}

function buildHandoffRecord(
  input: BookkeepingHandoffInput,
  fin: { confirmedShipperChargeMinor: number; confirmedCarrierPayMinor: number },
  revisionNumber: number,
): Omit<BrokerageBookkeepingHandoff, 'id' | 'createdAt' | 'updatedAt'> {
  const margin = computeBrokerageGrossMargin(fin.confirmedShipperChargeMinor, fin.confirmedCarrierPayMinor);
  const marginPct =
    fin.confirmedShipperChargeMinor > 0
      ? (margin / fin.confirmedShipperChargeMinor) * 100
      : null;

  return {
    sourceType: 'BROKERAGE_LOAD',
    sourceId: input.load.id,
    idempotencyKey: handoffIdempotencyKey(input.load.id, revisionNumber),
    revisionNumber,
    loadNumber: input.load.loadNumber,
    aioBrokerageOrgId: input.aioBrokerageOrgId,
    shipperOrganizationId: input.load.shipperOrganizationId,
    carrierOrganizationId: input.load.brokerageCarrierOrganizationId,
    shipperInvoiceAmountMinor: fin.confirmedShipperChargeMinor,
    carrierPayableAmountMinor: fin.confirmedCarrierPayMinor,
    shipperAccessorialRevenueMinor: input.shipperInvoice?.accessorialsMinor ?? 0,
    carrierAccessorialExpenseMinor: input.carrierPayable?.accessorialAmountMinor ?? 0,
    grossMarginMinor: margin,
    grossMarginPercent: marginPct,
    shipperPaymentStatus: mapShipperPaymentStatus(input.shipperInvoice?.status),
    carrierPaymentStatus: mapCarrierPaymentStatus(input.carrierPayable?.status),
    deliveryDate: input.load.deliveryDate,
    closeDate: new Date().toISOString().slice(0, 10),
    invoiceDate: input.shipperInvoice?.invoiceDate,
    referenceIds: {
      loadId: input.load.id,
      shipperInvoiceId: input.shipperInvoice?.id,
      carrierPayableLoadId: input.carrierPayable?.loadId,
      shipmentRequestId: input.load.brokerageShipmentRequestId,
      quoteId: input.load.brokerageQuoteId,
    },
    adjustmentNote: input.adjustmentNote,
    status: 'handed_off',
  };
}

function resolveRevision(store: DemoStore, loadId: string, forceRevision?: boolean): number {
  const existing = (store.brokerageBookkeepingHandoffs ?? []).filter((h) => h.sourceId === loadId);
  if (existing.length === 0) return 1;
  if (forceRevision) return Math.max(...existing.map((h) => h.revisionNumber)) + 1;
  return existing[0].revisionNumber;
}

export async function handoffBrokerageLoadToBookkeeping(input: BookkeepingHandoffInput): Promise<BookkeepingHandoffResult> {
  if (!isLoadReadyForHandoff(input.load)) {
    return { ok: false, code: 'NOT_READY', message: 'Load must be complete before bookkeeping handoff.' };
  }

  const store = loadDemoStore();
  const fin = getLoadFinancials(input.load.id, store);
  if (!fin || fin.confirmedShipperChargeMinor <= 0) {
    return { ok: false, code: 'NOT_READY', message: 'Financial split incomplete — cannot hand off.' };
  }

  const shipperInvoice =
    input.shipperInvoice ??
    store.brokerageShipperInvoices.find((i) => i.loadId === input.load.id && i.status !== 'void');
  const carrierPayable =
    input.carrierPayable ??
    store.carrierPayables.find((p) => p.loadId === input.load.id);

  const revisionNumber = input.forceRevision
    ? resolveRevision(store, input.load.id, true)
    : 1;

  if (!input.forceRevision) {
    const dup = (store.brokerageBookkeepingHandoffs ?? []).find(
      (h) => h.sourceType === 'BROKERAGE_LOAD' && h.sourceId === input.load.id,
    );
    if (dup) {
      return { ok: true, handoffId: dup.id, created: false, revisionNumber: dup.revisionNumber };
    }
  } else {
    const dupRevision = (store.brokerageBookkeepingHandoffs ?? []).find(
      (h) => h.sourceType === 'BROKERAGE_LOAD' && h.sourceId === input.load.id && h.revisionNumber === revisionNumber,
    );
    if (dupRevision) {
      return { ok: true, handoffId: dupRevision.id, created: false, revisionNumber };
    }
  }

  if (isSupabaseMode()) {
    return handoffBrokerageLoadToBookkeepingSupabase(input, fin, revisionNumber, shipperInvoice, carrierPayable);
  }

  let handoffId = '';
  updateDemoStore((s) => {
    if (!s.brokerageBookkeepingHandoffs) s.brokerageBookkeepingHandoffs = [];
    const record = buildHandoffRecord(
      { ...input, shipperInvoice, carrierPayable, aioBrokerageOrgId: input.aioBrokerageOrgId || AIO_BROKERAGE_ORG_DEMO },
      fin,
      revisionNumber,
    );
    handoffId = crypto.randomUUID();
    s.brokerageBookkeepingHandoffs.push({
      ...record,
      id: handoffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return s;
  });

  return { ok: true, handoffId, created: true, revisionNumber };
}

async function handoffBrokerageLoadToBookkeepingSupabase(
  input: BookkeepingHandoffInput,
  fin: { confirmedShipperChargeMinor: number; confirmedCarrierPayMinor: number },
  revisionNumber: number,
  shipperInvoice?: BrokerageShipperInvoice,
  carrierPayable?: CarrierPayable,
): Promise<BookkeepingHandoffResult> {
  const supabase = getAioSupabase();
  if (!supabase) {
    return { ok: false, code: 'UNAVAILABLE', message: "We couldn't complete bookkeeping handoff. Backend is not configured." };
  }

  const record = buildHandoffRecord(
    { ...input, shipperInvoice, carrierPayable },
    fin,
    revisionNumber,
  );

  const { data: existing } = await supabase
    .from('aio_brokerage_bookkeeping_handoffs')
    .select('id, revision_number')
    .eq('source_type', 'BROKERAGE_LOAD')
    .eq('source_id', input.load.id)
    .eq('revision_number', revisionNumber)
    .maybeSingle();

  if (existing && !input.forceRevision) {
    return {
      ok: true,
      handoffId: existing.id,
      created: false,
      revisionNumber: existing.revision_number as number,
    };
  }

  const { data, error } = await supabase
    .from('aio_brokerage_bookkeeping_handoffs')
    .insert({
      source_type: record.sourceType,
      source_id: record.sourceId,
      idempotency_key: record.idempotencyKey,
      revision_number: record.revisionNumber,
      load_number: record.loadNumber,
      aio_brokerage_org_id: record.aioBrokerageOrgId,
      shipper_organization_id: record.shipperOrganizationId ?? null,
      carrier_organization_id: record.carrierOrganizationId ?? null,
      shipper_invoice_amount_minor: record.shipperInvoiceAmountMinor,
      carrier_payable_amount_minor: record.carrierPayableAmountMinor,
      shipper_accessorial_revenue_minor: record.shipperAccessorialRevenueMinor,
      carrier_accessorial_expense_minor: record.carrierAccessorialExpenseMinor,
      gross_margin_minor: record.grossMarginMinor,
      gross_margin_percent: record.grossMarginPercent,
      shipper_payment_status: record.shipperPaymentStatus,
      carrier_payment_status: record.carrierPaymentStatus,
      delivery_date: record.deliveryDate ?? null,
      close_date: record.closeDate ?? null,
      invoice_date: record.invoiceDate ?? null,
      reference_ids: record.referenceIds,
      adjustment_note: record.adjustmentNote ?? null,
      status: record.status,
    })
    .select('id')
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      const { data: dup } = await supabase
        .from('aio_brokerage_bookkeeping_handoffs')
        .select('id')
        .eq('idempotency_key', record.idempotencyKey)
        .maybeSingle();
      if (dup) {
        return { ok: true, handoffId: dup.id, created: false, revisionNumber };
      }
    }
    return { ok: false, code: 'QUERY_FAILED', message: "We couldn't complete bookkeeping handoff. Try again." };
  }

  return { ok: true, handoffId: data.id, created: true, revisionNumber };
}

/** Call when financial values change after initial handoff — creates adjustment revision, never overwrites. */
export async function handoffBrokerageLoadFinancialRevision(
  input: BookkeepingHandoffInput,
  adjustmentNote: string,
): Promise<BookkeepingHandoffResult> {
  return handoffBrokerageLoadToBookkeeping({
    ...input,
    forceRevision: true,
    adjustmentNote,
  });
}

export { AIO_BROKERAGE_ORG_DEMO, handoffIdempotencyKey, isLoadReadyForHandoff };
