/**
 * Production persistence orchestration — mirrors demo autopilot outcomes to Supabase.
 */
import { isSupabaseMode } from '../../config/dataMode';
import { evaluateDocumentCompleteness } from './documentCompleteness';
import type { Load } from '../../dispatch/dispatchTypes';
import type { FreightAutopilotEventType } from './freightAutopilotTypes';
import { EXCEPTION_SEVERITY } from './freightExceptionTypes';
import {
  createFreightAutopilotAdminClient,
  ensureBillingPackageRow,
  ensureCarrierSettlementRow,
  ensureDriverSettlementRow,
  ensureShipperInvoiceRow,
  recordAutopilotEvent,
  resolveFreightException,
  upsertDocumentCompleteness,
  upsertFreightException,
  eventIdempotencyKey,
} from './supabaseFreightAutopilotPersistence';

export async function persistAutopilotOutcomeToSupabase(
  load: Load,
  event: FreightAutopilotEventType,
  actionsTaken: string[],
): Promise<void> {
  if (!isSupabaseMode()) return;
  const client = createFreightAutopilotAdminClient();
  if (!client) return;

  const orgId = load.organizationId;
  const loadUuid = load.id;

  await recordAutopilotEvent(client, {
    organizationId: orgId,
    loadId: loadUuid,
    eventType: event,
    idempotencyKey: `${loadUuid}:${event}:${actionsTaken.join(',') || 'noop'}`,
    payload: { actionsTaken },
  });

  const doc = evaluateDocumentCompleteness(load);
  await upsertDocumentCompleteness(client, orgId, loadUuid, doc);

  if (!load.podDocumentId && load.operationalStatus === 'complete') {
    await upsertFreightException(client, {
      loadId: loadUuid,
      organizationId: orgId,
      exceptionType: 'MISSING_POD',
      severity: EXCEPTION_SEVERITY.MISSING_POD,
      summary: `Load ${load.loadNumber} missing POD`,
    });
  } else if (load.podDocumentId) {
    await resolveFreightException(client, loadUuid, 'MISSING_POD');
  }

  if (doc.readyForBilling) {
    const pkg = await ensureBillingPackageRow(client, orgId, loadUuid, load.shipperOrganizationId);
    if (load.shipperOrganizationId && load.sourceType === 'brokerage') {
      const inv = await ensureShipperInvoiceRow(
        client,
        loadUuid,
        load.shipperOrganizationId,
        `BSI-QA-${load.loadNumber}`,
        load.confirmedGrossMinor || load.grossMinor,
      );
      if (inv.created) {
        await client
          .from('aio_freight_billing_packages')
          .update({
            shipper_invoice_id: inv.id,
            status: 'invoice_generated',
            receivable_status: 'invoiced',
            updated_at: new Date().toISOString(),
          })
          .eq('load_id', loadUuid);
      }
    }

    if (load.primaryDriverId) {
      await ensureDriverSettlementRow(client, {
        loadId: loadUuid,
        organizationId: orgId,
        driverId: load.primaryDriverId,
        totalMinor: Math.round((load.loadedMiles + load.deadheadMiles) * 5500),
        loadedMiles: load.loadedMiles,
        emptyMiles: load.deadheadMiles,
      });
    }

    if (load.brokerageCarrierOrganizationId || load.sourceType === 'brokerage') {
      await ensureCarrierSettlementRow(client, {
        loadId: loadUuid,
        organizationId: orgId,
        carrierOrganizationId: load.brokerageCarrierOrganizationId,
        totalPayableMinor: load.confirmedGrossMinor || load.grossMinor,
      });
    }

    void pkg;
  }
}

export async function processDuplicateEventTorture(
  client: ReturnType<typeof createFreightAutopilotAdminClient>,
  organizationId: string,
  loadId: string,
): Promise<{ eventCount: number; billingCount: number; invoiceCount: number }> {
  if (!client) throw new Error('no client');

  const eventKey = eventIdempotencyKey(loadId, 'DOCUMENT_PACKAGE_COMPLETE', 'torture');
  for (let i = 0; i < 3; i++) {
    await recordAutopilotEvent(client, {
      organizationId,
      loadId,
      eventType: 'DOCUMENT_PACKAGE_COMPLETE',
      idempotencyKey: eventKey,
    });
  }

  for (let i = 0; i < 3; i++) {
    await ensureBillingPackageRow(client, organizationId, loadId);
  }

  const { count: eventCount } = await client
    .from('aio_freight_autopilot_events')
    .select('*', { count: 'exact', head: true })
    .eq('idempotency_key', eventKey);

  const { count: billingCount } = await client
    .from('aio_freight_billing_packages')
    .select('*', { count: 'exact', head: true })
    .eq('load_id', loadId);

  const { count: invoiceCount } = await client
    .from('aio_brokerage_shipper_invoices')
    .select('*', { count: 'exact', head: true })
    .eq('load_id', loadId);

  return {
    eventCount: eventCount ?? 0,
    billingCount: billingCount ?? 0,
    invoiceCount: invoiceCount ?? 0,
  };
}
