/**
 * Demo-store actions for Freight Autopilot — wires lifecycle hooks from dispatch/brokerage.
 */

import { loadDemoStore, updateDemoStore } from '../../demo/demoStore';
import { handoffBrokerageLoadToBookkeeping } from '../../brokerage/brokerageBookkeepingHandoff';
import { canCreateFreightInvoice } from '../../factoring/factoringRules';
import { isReadyToBill } from '../../brokerage/brokerageRules';
import { computeShipperInvoiceTotal } from '../../brokerage/brokerageCalculations';
import { AIO_BROKERAGE_ORG_DEMO } from '../../brokerage/brokerageBookkeepingHandoff';
import type { Load } from '../../dispatch/dispatchTypes';
import type { DemoStore } from '../../demo/demoTypes';
import type { FreightInvoice } from '../../factoring/factoringTypes';
import type { BrokerageShipperInvoice } from '../../brokerage/brokerageTypes';
import {
  ensureAutopilotStoreFields,
  getAutopilotStateForLoad,
  mapDocumentUploadToEvent,
  processFreightAutopilotEvent,
} from './freightAutopilotService';
import type { FreightAutopilotEventType } from './freightAutopilotTypes';
import { evaluateDocumentCompleteness, type DocumentCompletenessOverride } from './documentCompleteness';
import { billingPackageIdempotencyKey } from './billingPackageTypes';
import { ensureDriverSettlementForLoad } from '../../settlements/driverSettlementEngine';
import { isSupabaseMode } from '../../config/dataMode';
import { persistAutopilotOutcomeToSupabase } from './freightAutopilotPersistence';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function uid(): string {
  return crypto.randomUUID();
}

function nextFreightInvoiceNumber(s: DemoStore): string {
  s.factoringCounters.freightInvoice += 1;
  return `HF-${new Date().getFullYear()}-${String(s.factoringCounters.freightInvoice).padStart(4, '0')}`;
}

function tryAutoInvoiceInStore(s: DemoStore, load: Load, staffId?: string): void {
  const doc = evaluateDocumentCompleteness(load);
  if (!doc.readyForBilling) return;

  const pkgKey = billingPackageIdempotencyKey(load.id);
  const pkg = (s.billingPackages ?? []).find((b) => b.idempotencyKey === pkgKey);
  if (!pkg || pkg.status === 'invoice_generated' || pkg.status === 'closed') return;

  if (load.sourceType === 'brokerage' && load.shipperOrganizationId) {
    const fin = s.brokerageLoadFinancials.find((f) => f.loadId === load.id);
    if (!fin || !isReadyToBill(load, { coverageStatus: load.brokerageCoverageStatus ?? 'booked' } as never)) return;
    if (s.brokerageShipperInvoices.some((i) => i.loadId === load.id && i.status !== 'void')) {
      pkg.status = 'invoice_generated';
      return;
    }
    s.brokerageCounters.shipperInvoice += 1;
    const total = computeShipperInvoiceTotal(fin.confirmedShipperChargeMinor, 0, 0);
    const invoice: BrokerageShipperInvoice = {
      id: uid(),
      organizationId: load.shipperOrganizationId,
      loadId: load.id,
      shipperOrganizationId: load.shipperOrganizationId,
      invoiceNumber: `BSI-2026-${String(s.brokerageCounters.shipperInvoice).padStart(4, '0')}`,
      baseFreightChargeMinor: fin.confirmedShipperChargeMinor,
      accessorialsMinor: 0,
      adjustmentsMinor: 0,
      totalMinor: total,
      paidAmountMinor: 0,
      balanceMinor: total,
      currency: 'USD',
      status: 'issued',
      invoiceDate: new Date().toISOString().slice(0, 10),
      podDocumentId: load.podDocumentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    s.brokerageShipperInvoices.push(invoice);
    pkg.shipperInvoiceId = invoice.id;
    pkg.status = 'invoice_generated';
    pkg.receivableStatus = 'invoiced';
    pkg.updatedAt = new Date().toISOString();
  } else if (!s.freightInvoices.some((f) => f.loadId === load.id && f.status !== 'void')) {
    if (!canCreateFreightInvoice(load)) return;
    const inv: FreightInvoice = {
      id: uid(),
      organizationId: load.organizationId,
      loadId: load.id,
      invoiceNumber: nextFreightInvoiceNumber(s),
      debtorName: load.brokerName,
      amountMinor: load.confirmedGrossMinor,
      currency: load.currency,
      invoiceDate: new Date().toISOString().slice(0, 10),
      status: 'issued',
      rateConfirmationDocumentId: load.rateConfirmationDocumentId,
      bolDocumentId: load.bolDocumentId,
      podDocumentId: load.podDocumentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    s.freightInvoices.push(inv);
    pkg.freightInvoiceId = inv.id;
    pkg.status = 'invoice_generated';
    pkg.receivableStatus = 'invoiced';
    pkg.updatedAt = new Date().toISOString();
  }

  if (load.sourceType === 'brokerage') {
    pkg.bookkeepingStatus = 'handed_off';
    pkg.updatedAt = new Date().toISOString();
  }

  if (load.primaryDriverId) {
    const settlement = ensureDriverSettlementForLoad(s.driverSettlements ?? [], load, load.primaryDriverId);
    if (settlement) {
      s.driverSettlements = [...(s.driverSettlements ?? []), settlement];
    }
  }

  void staffId;
}

export function runFreightAutopilot(
  loadId: string,
  event: FreightAutopilotEventType,
  staffId?: string,
  documentKind?: 'rate_confirmation' | 'bol' | 'pod',
): void {
  let bookkeepingLoad: Load | undefined;
  let persistLoad: Load | undefined;
  let persistActions: string[] = [];
  let dispatchBuildInput: import('./dispatchPackage').BuildDispatchPackageInput | undefined;

  updateDemoStore((s) => {
    ensureAutopilotStoreFields(s);
    const load = s.loads.find((l) => l.id === loadId);
    if (!load) return s;

    const result = processFreightAutopilotEvent(s, { load, event, staffId, documentKind });
    persistActions = result.actionsTaken;

    if (result.actionsTaken.includes('dispatch_package_generated')) {
      const truck = s.truckProfiles.find((t) => t.id === load.powerUnitId || t.powerUnitId === load.powerUnitId);
      const driver = s.drivers.find((d) => d.id === load.primaryDriverId);
      const trailer = s.trailers.find((t) => t.id === load.trailerId);
      const dispatcher = load.assignedDispatcherStaffId
        ? s.staff.find((st) => st.id === load.assignedDispatcherStaffId)
        : undefined;
      dispatchBuildInput = {
        load,
        truckProfile: truck,
        driver,
        trailer,
        dispatcherName: dispatcher?.name,
      };
    }

    if (event === 'DELIVERY_CONFIRMED' || load.operationalStatus === 'complete') {
      tryAutoInvoiceInStore(s, load, staffId);
    }

    if (load.sourceType === 'brokerage' && load.operationalStatus === 'complete') {
      bookkeepingLoad = { ...load };
    }

    persistLoad = { ...load };
    return s;
  });

  if (bookkeepingLoad) {
    void handoffBrokerageLoadToBookkeeping({
      load: bookkeepingLoad,
      aioBrokerageOrgId: AIO_BROKERAGE_ORG_DEMO,
      staffId: staffId ?? 'system-autopilot',
    });
  }

  if (isSupabaseMode() && persistLoad && isUuid(persistLoad.id)) {
    void persistAutopilotOutcomeToSupabase(persistLoad, event, persistActions, dispatchBuildInput);
  }
}

export function overrideDocumentCompleteness(
  loadId: string,
  staffId: string,
  reason: string,
): void {
  updateDemoStore((s) => {
    ensureAutopilotStoreFields(s);
    const load = s.loads.find((l) => l.id === loadId);
    if (!load) return s;

    const override: DocumentCompletenessOverride = {
      loadId,
      staffId,
      reason,
      timestamp: new Date().toISOString(),
    };
    evaluateDocumentCompleteness(load, override);

    s.freightAutopilotAuditLog = [
      ...(s.freightAutopilotAuditLog ?? []),
      {
        id: uid(),
        loadId,
        organizationId: load.organizationId,
        event: 'DOCUMENT_PACKAGE_COMPLETE',
        action: 'staff_override',
        outcome: 'success',
        details: reason,
        staffId,
        idempotencyKey: `${loadId}:override:${staffId}:${override.timestamp}`,
        createdAt: override.timestamp,
      },
    ];

    processFreightAutopilotEvent(s, { load, event: 'DOCUMENT_PACKAGE_COMPLETE', staffId });
    tryAutoInvoiceInStore(s, load, staffId);
    return s;
  });
}

export function getFreightAutopilotPanelData(loadId: string) {
  const store = ensureAutopilotStoreFields(loadDemoStore());
  const load = store.loads.find((l) => l.id === loadId);
  if (!load) return undefined;
  const state = getAutopilotStateForLoad(store, loadId);
  if (!state) return undefined;
  const exceptions = (store.freightExceptions ?? []).filter((e) => e.loadId === loadId && e.status === 'open');
  const documentCompleteness = evaluateDocumentCompleteness(load);
  return { load, state, exceptions, documentCompleteness };
}

export { mapDocumentUploadToEvent };
