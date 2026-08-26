import type { DemoStore } from '../../demo/demoTypes';
import type { Load } from '../../dispatch/dispatchTypes';
import { evaluateDocumentCompleteness } from './documentCompleteness';
import { deriveAutopilotSteps } from './freightAutopilotRules';
import type {
  FreightAutopilotEventType,
  FreightAutopilotProcessInput,
  FreightAutopilotProcessResult,
  FreightAutopilotState,
} from './freightAutopilotTypes';
import { autopilotAuditIdempotencyKey, type FreightAutopilotAuditEntry } from './freightAutopilotAudit';
import {
  billingPackageIdempotencyKey,
  type BillingPackage,
} from './billingPackageTypes';
import { EXCEPTION_SEVERITY, type FreightException } from './freightExceptionTypes';
import { buildDispatchPackage } from './dispatchPackage';

function uid(): string {
  return crypto.randomUUID();
}

export function ensureAutopilotStoreFields(store: DemoStore): DemoStore {
  return {
    ...store,
    freightAutopilotStates: store.freightAutopilotStates ?? [],
    freightAutopilotAuditLog: store.freightAutopilotAuditLog ?? [],
    billingPackages: store.billingPackages ?? [],
    freightExceptions: store.freightExceptions ?? [],
    driverSettlements: store.driverSettlements ?? [],
    pretripInspections: store.pretripInspections ?? [],
    freightLocations: store.freightLocations ?? [],
  };
}

function hasFreightInvoice(store: DemoStore, loadId: string): boolean {
  return store.freightInvoices.some((f) => f.loadId === loadId && f.status !== 'void');
}

function hasShipperInvoice(store: DemoStore, loadId: string): boolean {
  return store.brokerageShipperInvoices.some((i) => i.loadId === loadId && i.status !== 'void');
}

function getBillingPackage(store: DemoStore, loadId: string): BillingPackage | undefined {
  return (store.billingPackages ?? []).find((b) => b.loadId === loadId);
}

function appendAudit(
  store: DemoStore,
  entry: Omit<FreightAutopilotAuditEntry, 'id' | 'createdAt'>,
): FreightAutopilotAuditEntry {
  const full: FreightAutopilotAuditEntry = {
    ...entry,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  store.freightAutopilotAuditLog = [...(store.freightAutopilotAuditLog ?? []), full];
  return full;
}

function upsertException(
  store: DemoStore,
  load: Load,
  type: FreightException['type'],
  summary: string,
): string | undefined {
  const existing = (store.freightExceptions ?? []).find(
    (e) => e.loadId === load.id && e.type === type && e.status === 'open',
  );
  if (existing) return existing.id;

  const ex: FreightException = {
    id: uid(),
    loadId: load.id,
    organizationId: load.organizationId,
    type,
    severity: EXCEPTION_SEVERITY[type],
    status: 'open',
    summary,
    createdAt: new Date().toISOString(),
  };
  store.freightExceptions = [...(store.freightExceptions ?? []), ex];
  return ex.id;
}

function resolveException(store: DemoStore, loadId: string, type: FreightException['type']): void {
  store.freightExceptions = (store.freightExceptions ?? []).map((e) =>
    e.loadId === loadId && e.type === type && e.status === 'open'
      ? { ...e, status: 'resolved', resolvedAt: new Date().toISOString() }
      : e,
  );
}

export function buildAutopilotState(store: DemoStore, load: Load): FreightAutopilotState {
  const hasInvoice = hasFreightInvoice(store, load.id) || hasShipperInvoice(store, load.id);
  const pkg = getBillingPackage(store, load.id);
  const doc = evaluateDocumentCompleteness(load);

  return {
    loadId: load.id,
    organizationId: load.organizationId,
    steps: deriveAutopilotSteps(load, { hasInvoice, hasBillingPackage: Boolean(pkg) }),
    documentPackageStatus: doc.status,
    billingPackageId: pkg?.id,
    lastProcessedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Idempotent billing package creation — one per load. */
export function ensureBillingPackage(store: DemoStore, load: Load): BillingPackage | undefined {
  const key = billingPackageIdempotencyKey(load.id);
  const existing = (store.billingPackages ?? []).find((b) => b.idempotencyKey === key);
  if (existing) return existing;

  const doc = evaluateDocumentCompleteness(load);
  if (!doc.readyForBilling) return undefined;

  const documentIds = [load.rateConfirmationDocumentId, load.bolDocumentId, load.podDocumentId].filter(Boolean) as string[];

  const pkg: BillingPackage = {
    id: uid(),
    loadId: load.id,
    organizationId: load.organizationId,
    shipperOrganizationId: load.shipperOrganizationId,
    documentIds,
    status: doc.status === 'complete' ? 'ready' : 'missing_documents',
    receivableRoute: load.factoringHandoffStatus === 'ready' ? 'factoring' : 'undecided',
    factoringStatus: load.factoringHandoffStatus === 'ready' ? 'ready' : 'not_ready',
    settlementStatus: 'pending_documents',
    bookkeepingStatus: load.sourceType === 'brokerage' ? 'pending' : undefined,
    idempotencyKey: key,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.billingPackages = [...(store.billingPackages ?? []), pkg];
  return pkg;
}

export function processFreightAutopilotEvent(
  store: DemoStore,
  input: FreightAutopilotProcessInput,
): FreightAutopilotProcessResult {
  store = ensureAutopilotStoreFields(store);
  const { load, event, staffId } = input;
  const actionsTaken: string[] = [];
  const exceptionsCreated: string[] = [];
  let blocked = false;

  const audit = (action: string, outcome: FreightAutopilotAuditEntry['outcome'], details?: string) => {
    const key = autopilotAuditIdempotencyKey(load.id, event, action);
    const dup = (store.freightAutopilotAuditLog ?? []).some((a) => a.idempotencyKey === key);
    if (dup) return;
    appendAudit(store, {
      loadId: load.id,
      organizationId: load.organizationId,
      event,
      action,
      outcome,
      details,
      staffId,
      idempotencyKey: key,
    });
  };

  if (event === 'DRIVER_ASSIGNED' || event === 'CARRIER_BOOKED') {
    const truck = store.truckProfiles.find((t) => t.id === load.powerUnitId || t.powerUnitId === load.powerUnitId);
    const driver = store.drivers.find((d) => d.id === load.primaryDriverId);
    const trailer = store.trailers.find((t) => t.id === load.trailerId);
    const dispatcher = load.assignedDispatcherStaffId
      ? store.staff.find((s) => s.id === load.assignedDispatcherStaffId)
      : undefined;
    buildDispatchPackage({
      load,
      truckProfile: truck,
      driver,
      trailer,
      dispatcherName: dispatcher?.name,
    });
    actionsTaken.push('dispatch_package_generated');
    audit('generate_dispatch_package', 'success');
  }

  if (event === 'DOCUMENT_UPLOADED' || event === 'POD_RECEIVED') {
    const doc = evaluateDocumentCompleteness(load);
    if (load.podDocumentId) {
      resolveException(store, load.id, 'MISSING_POD');
    }
    if (load.bolDocumentId) {
      resolveException(store, load.id, 'MISSING_BOL');
    }
    if (doc.status === 'complete') {
      actionsTaken.push('document_package_complete');
      audit('document_completeness_check', 'success', 'complete');
    } else if (load.operationalStatus === 'complete' && !load.podDocumentId) {
      const exId = upsertException(store, load, 'MISSING_POD', `Load ${load.loadNumber} missing POD — billing blocked`);
      if (exId) exceptionsCreated.push(exId);
      blocked = true;
      audit('document_completeness_check', 'blocked', 'missing POD');
    }
  }

  if (event === 'DELIVERY_CONFIRMED' || load.operationalStatus === 'complete') {
    const doc = evaluateDocumentCompleteness(load);
    if (!doc.readyForBilling) {
      blocked = true;
      if (!load.podDocumentId) {
        const exId = upsertException(store, load, 'BILLING_BLOCKED', `Billing blocked — missing POD for ${load.loadNumber}`);
        if (exId) exceptionsCreated.push(exId);
      }
      audit('billing_package', 'blocked', doc.missingLabels.join(', '));
    } else {
      const pkg = ensureBillingPackage(store, load);
      if (pkg) {
        actionsTaken.push('billing_package_ready');
        audit('billing_package', 'success', pkg.id);
      }
    }
  }

  const state = buildAutopilotState(store, load);
  state.lastEvent = event;

  const idx = (store.freightAutopilotStates ?? []).findIndex((s) => s.loadId === load.id);
  if (idx >= 0) {
    store.freightAutopilotStates![idx] = state;
  } else {
    store.freightAutopilotStates = [...(store.freightAutopilotStates ?? []), state];
  }

  return { state, actionsTaken, exceptionsCreated, blocked };
}

export function getAutopilotStateForLoad(store: DemoStore, loadId: string): FreightAutopilotState | undefined {
  store = ensureAutopilotStoreFields(store);
  const load = store.loads.find((l) => l.id === loadId);
  if (!load) return undefined;
  return (store.freightAutopilotStates ?? []).find((s) => s.loadId === loadId) ?? buildAutopilotState(store, load);
}

export function getOpenExceptionsForLoad(store: DemoStore, loadId: string): FreightException[] {
  return (store.freightExceptions ?? []).filter((e) => e.loadId === loadId && e.status === 'open');
}

export function mapDocumentUploadToEvent(kind: 'rate_confirmation' | 'bol' | 'pod'): FreightAutopilotEventType {
  return kind === 'pod' ? 'POD_RECEIVED' : 'DOCUMENT_UPLOADED';
}
