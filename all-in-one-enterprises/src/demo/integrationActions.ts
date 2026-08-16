import { updateDemoStore, loadDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import { demoRegulatoryAdapter } from '../integrations/adapters/demoRegulatoryAdapter';
import { demoPaymentAdapter, DEMO_PAYMENT_WEBHOOK_SECRET } from '../integrations/adapters/demoPaymentAdapter';
import { demoLoadBoardAdapter } from '../integrations/adapters/demoLoadBoardAdapter';
import { demoFactoringAdapter } from '../integrations/adapters/demoFactoringAdapter';
import { demoInsuranceAdapter } from '../integrations/adapters/demoInsuranceAdapter';
import { demoAccountingAdapter } from '../integrations/adapters/demoAccountingAdapter';
import { demoMapsAdapter } from '../integrations/adapters/demoMapsAdapter';
import {
  findExistingOperationByIdempotency,
  generateIdempotencyKey,
} from '../integrations/integrationEngine';
import { createAuditEvent, appendAuditEvent } from '../integrations/integrationAudit';
import { detectReconciliationIssues } from '../integrations/integrationReconciliation';
import { processWebhookSafely } from '../integrations/integrationWebhook';
import { evaluateConnectionHealth, summarizeIntegrationHealth } from '../integrations/integrationHealth';
import type {
  CarrierExternalVerification,
  IntegrationConnection,
  IntegrationConsent,
  IntegrationOperation,
  IntegrationWebhookEvent,
  LoadBoardCandidate,
} from '../integrations/integrationTypes';
import type { Load } from '../dispatch/dispatchTypes';

function uid(): string {
  return crypto.randomUUID();
}

export function getIntegrationConnections(store: DemoStore = loadDemoStore()): IntegrationConnection[] {
  return store.integrationConnections ?? [];
}

export function getConnectionById(connectionId: string, store: DemoStore = loadDemoStore()): IntegrationConnection | undefined {
  return store.integrationConnections?.find((c) => c.id === connectionId);
}

export function getIntegrationHealthSummary(store: DemoStore = loadDemoStore()) {
  const connections = store.integrationConnections ?? [];
  const states = connections.map((c) =>
    evaluateConnectionHealth(c, store.integrationOperations ?? [], store.integrationWebhookEvents ?? []),
  );
  return summarizeIntegrationHealth(states);
}

export function testIntegrationConnection(connectionId: string, staffId?: string): { ok: boolean; result: string; message?: string } {
  const store = loadDemoStore();
  const connection = store.integrationConnections?.find((c) => c.id === connectionId);
  if (!connection) return { ok: false, result: 'CONFIGURATION_INVALID', message: 'Connection not found' };

  const adapter = connection.providerId.includes('regulatory') ? demoRegulatoryAdapter
    : connection.providerId.includes('payment') ? demoPaymentAdapter
    : connection.providerId.includes('maps') ? demoMapsAdapter
    : connection.providerId.includes('email') ? null
    : connection.providerId.includes('sms') ? null
    : connection.providerId.includes('loadboard') ? demoLoadBoardAdapter
    : connection.providerId.includes('factoring') ? demoFactoringAdapter
    : connection.providerId.includes('insurance') ? demoInsuranceAdapter
    : connection.providerId.includes('accounting') ? demoAccountingAdapter
    : demoRegulatoryAdapter;

  const caps = adapter?.getCapabilities(connection) ?? [];
  const ok = connection.environment !== 'PRODUCTION' || connection.status === 'CONNECTED';

  updateDemoStore((s) => ({
    ...s,
    integrationConnections: (s.integrationConnections ?? []).map((c) =>
      c.id === connectionId
        ? {
            ...c,
            status: ok ? 'CONNECTED' as const : 'ERROR' as const,
            lastVerifiedAt: new Date().toISOString(),
            health: ok ? 'HEALTHY' as const : 'ACTION_REQUIRED' as const,
            updatedAt: new Date().toISOString(),
          }
        : c,
    ),
    integrationAuditEvents: appendAuditEvent(
      s.integrationAuditEvents ?? [],
      createAuditEvent('CONNECTION_VERIFIED', {
        connectionId,
        providerId: connection.providerId,
        staffId,
        safeDetail: ok ? `Verified — ${caps.join(', ')}` : 'Verification failed',
      }),
    ),
  }));

  return {
    ok,
    result: ok ? 'SUCCESS' : 'CONFIGURATION_INVALID',
    message: ok ? `Connection verified (${caps.length} capabilities)` : 'Production credentials not reachable in demo',
  };
}

export function runRegulatoryLookup(
  organizationId: string,
  identifier: string,
  identifierType: 'USDOT' | 'MC' = 'USDOT',
  staffId?: string,
): CarrierExternalVerification {
  const connectionId = 'conn-regulatory-demo';
  const idempotencyKey = generateIdempotencyKey(['regulatory', organizationId, identifier, identifierType]);
  const store = loadDemoStore();
  const existing = findExistingOperationByIdempotency(store.integrationOperations ?? [], idempotencyKey);
  if (existing) {
    const prior = store.carrierExternalVerifications?.find((v) => v.operationId === existing.id);
    if (prior) return prior;
  }

  const normalized = identifier.replace(/\D/g, '');
  const found = normalized === '1234567' || identifier === '1234567';
  const fetchedAt = new Date().toISOString();
  const provenance = {
    source: 'DEMO_DATA' as const,
    fetchedAt,
    verificationStatus: found ? 'demo' as const : 'unverified' as const,
    freshness: found ? 'CURRENT' as const : 'UNKNOWN' as const,
  };

  const opId = uid();
  const verification: CarrierExternalVerification = {
    id: uid(),
    organizationId,
    source: provenance.source,
    identifierType,
    identifier,
    verificationStatus: found ? 'record_found' : 'not_found',
    checkedAt: fetchedAt,
    legalName: found ? 'Roadline Transport LLC' : undefined,
    operatingStatus: found ? 'ACTIVE — DEMO DATA' : undefined,
    authorityStatus: found ? 'AUTHORIZED — DEMO DATA' : undefined,
    boc3Status: found ? 'FILED — DEMO DATA' : undefined,
    insuranceStatus: found ? 'ON FILE — DEMO DATA' : undefined,
    provenance,
    operationId: opId,
  };

  const op: IntegrationOperation = {
    id: opId,
    connectionId,
    providerId: 'prov-regulatory-demo',
    capability: 'REGULATORY',
    operationType: 'REGULATORY_LOOKUP',
    entityType: 'organization',
    entityId: organizationId,
    status: 'SUCCEEDED',
    idempotencyKey,
    correlationId: uid(),
    startedAt: fetchedAt,
    completedAt: fetchedAt,
    attemptCount: 1,
    resultSummary: found ? 'Record found' : 'No record',
  };

  updateDemoStore((s) => ({
    ...s,
    integrationOperations: [...(s.integrationOperations ?? []), op],
    carrierExternalVerifications: [...(s.carrierExternalVerifications ?? []), verification],
    integrationAuditEvents: appendAuditEvent(
      s.integrationAuditEvents ?? [],
      createAuditEvent('EXTERNAL_ACTION_COMPLETED', {
        connectionId,
        providerId: 'prov-regulatory-demo',
        staffId,
        organizationId,
        safeDetail: `Regulatory lookup ${identifier}`,
      }),
    ),
  }));

  return verification;
}

export function getCarrierVerifications(organizationId: string, store: DemoStore = loadDemoStore()): CarrierExternalVerification[] {
  return (store.carrierExternalVerifications ?? []).filter((v) => v.organizationId === organizationId);
}

export function processDemoPaymentWebhook(input: {
  externalEventId: string;
  eventType: string;
  amountMinor: number;
  currency: string;
  invoiceId?: string;
  customerId?: string;
  signature?: string;
}): { ok: boolean; duplicate: boolean; event?: IntegrationWebhookEvent; reconciliationCreated?: boolean } {
  let output: { ok: boolean; duplicate: boolean; event?: IntegrationWebhookEvent; reconciliationCreated?: boolean } = {
    ok: false,
    duplicate: false,
  };

  updateDemoStore((s) => {
    const connectionId = 'conn-payment-demo';
    const payloadStr = JSON.stringify(input);
    const webhookResult = processWebhookSafely(
      { payload: payloadStr, signature: input.signature, timestamp: String(Date.now()) },
      s.integrationWebhookEvents ?? [],
      connectionId,
      input.externalEventId,
      () => !input.signature || input.signature === DEMO_PAYMENT_WEBHOOK_SECRET,
    );

    const event: IntegrationWebhookEvent = {
      id: uid(),
      providerId: 'prov-payment-demo',
      connectionId,
      externalEventId: input.externalEventId,
      eventType: input.eventType,
      receivedAt: new Date().toISOString(),
      verifiedAt: webhookResult.status === 'VERIFIED' ? new Date().toISOString() : undefined,
      processedAt: webhookResult.accepted ? new Date().toISOString() : undefined,
      status: webhookResult.duplicate ? 'DUPLICATE' : webhookResult.status,
      attemptCount: 1,
      safeSummary: webhookResult.safeError ?? input.eventType,
    };

    let reconciliation = s.integrationReconciliationIssues ?? [];
    let payments = s.payments;
    let invoices = s.invoices;

    if (webhookResult.accepted && !webhookResult.duplicate && input.eventType === 'payment.succeeded' && input.invoiceId) {
      const invoice = s.invoices.find((i) => i.id === input.invoiceId);
      if (invoice && invoice.balanceDueMinor > 0) {
        const payAmount = Math.min(input.amountMinor, invoice.balanceDueMinor);
        if (payAmount !== invoice.balanceDueMinor) {
          reconciliation = [
            ...reconciliation,
            ...detectReconciliationIssues({
              providerId: 'prov-payment-demo',
              connectionId,
              entityType: 'payment',
              entityId: input.invoiceId,
              internalAmountMinor: invoice.balanceDueMinor,
              externalAmountMinor: input.amountMinor,
            }),
          ];
          output.reconciliationCreated = true;
        } else {
          const payment = {
            id: uid(),
            organizationId: invoice.organizationId,
            invoiceId: invoice.id,
            provider: 'demo' as const,
            amountMinor: payAmount,
            currency: input.currency as 'USD',
            status: 'succeeded' as const,
            externalReference: input.externalEventId,
            createdAt: new Date().toISOString(),
          };
          payments = [...s.payments, payment];
          invoices = s.invoices.map((i) =>
            i.id === invoice.id
              ? {
                  ...i,
                  amountPaidMinor: i.amountPaidMinor + payAmount,
                  balanceDueMinor: Math.max(0, i.balanceDueMinor - payAmount),
                  status: i.balanceDueMinor - payAmount <= 0 ? 'paid' as const : i.status,
                  updatedAt: new Date().toISOString(),
                }
              : i,
          );
        }
      }
    }

    output = { ok: webhookResult.accepted, duplicate: webhookResult.duplicate, event };

    return {
      ...s,
      integrationWebhookEvents: [...(s.integrationWebhookEvents ?? []), event],
      integrationReconciliationIssues: reconciliation,
      payments,
      invoices,
      integrationAuditEvents: appendAuditEvent(
        s.integrationAuditEvents ?? [],
        createAuditEvent(webhookResult.accepted ? 'WEBHOOK_RECEIVED' : 'WEBHOOK_REJECTED', {
          connectionId,
          providerId: 'prov-payment-demo',
          safeDetail: webhookResult.safeError ?? input.eventType,
        }),
      ),
    };
  });

  return output;
}

export async function searchLoadBoard(
  origin?: string,
  destination?: string,
): Promise<LoadBoardCandidate[]> {
  const connectionId = 'conn-loadboard-demo';
  const result = await demoLoadBoardAdapter.searchLoads({ origin, destination });

  updateDemoStore((s) => {
    const candidates: LoadBoardCandidate[] = result.candidates.map((c) => ({
      id: uid(),
      connectionId,
      providerId: 'prov-loadboard-demo',
      externalLoadId: c.externalLoadId,
      origin: c.origin,
      destination: c.destination,
      rateMinor: c.rateMinor,
      commodity: c.commodity,
      equipment: c.equipment,
      miles: c.miles,
      searchedAt: new Date().toISOString(),
      isDemo: true,
    }));
    return {
      ...s,
      loadBoardCandidates: [...(s.loadBoardCandidates ?? []), ...candidates],
    };
  });

  return loadDemoStore().loadBoardCandidates!.slice(-result.candidates.length);
}

export function importLoadBoardCandidate(candidateId: string, staffId?: string): Load | null {
  let imported: Load | null = null;

  updateDemoStore((s) => {
    const candidate = s.loadBoardCandidates?.find((c) => c.id === candidateId);
    if (!candidate) return s;

    const dup = s.integrationExternalIds?.find(
      (e) => e.externalId === candidate.externalLoadId && e.providerId === candidate.providerId,
    );
    if (dup) return s;

    const parseLoc = (loc: string) => {
      const [city, state] = loc.split(',').map((p) => p.trim());
      return { city: city ?? loc, state: state ?? '—' };
    };
    const origin = parseLoc(candidate.origin);
    const dest = parseLoc(candidate.destination);
    const gross = candidate.rateMinor ?? 0;
    const load: Load = {
      id: uid(),
      organizationId: s.portalClientId ?? s.clients[0]?.id ?? 'client-a',
      loadNumber: `LB-${candidate.externalLoadId}`,
      sourceType: 'load_board_future',
      sourceReference: candidate.externalLoadId,
      brokerName: 'Demo Load Board — DEMO LOAD',
      commodity: candidate.commodity,
      equipmentType: candidate.equipment ?? 'Dry Van',
      originCity: origin.city,
      originState: origin.state,
      destinationCity: dest.city,
      destinationState: dest.state,
      pickupDate: new Date().toISOString().slice(0, 10),
      deliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      loadedMiles: candidate.miles ?? 0,
      deadheadMiles: 0,
      linehaulMinor: gross,
      fuelSurchargeMinor: 0,
      accessorialMinor: 0,
      grossMinor: gross,
      confirmedGrossMinor: gross,
      currency: 'USD',
      offerStatus: 'awaiting_carrier',
      operationalStatus: 'opportunity',
      rateConfirmationStatus: 'missing',
      rateDetailsReviewed: false,
      factoringHandoffStatus: 'not_ready',
      accessorials: [],
      rateRevisions: [],
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    imported = load;

    return {
      ...s,
      loads: [...s.loads, load],
      loadBoardCandidates: (s.loadBoardCandidates ?? []).map((c) =>
        c.id === candidateId ? { ...c, importedLoadId: load.id } : c,
      ),
      integrationExternalIds: [
        ...(s.integrationExternalIds ?? []),
        {
          id: uid(),
          providerId: candidate.providerId,
          connectionId: candidate.connectionId,
          entityType: 'load',
          entityId: load.id,
          externalId: candidate.externalLoadId,
          externalType: 'load_board_load',
          createdAt: new Date().toISOString(),
        },
      ],
      integrationAuditEvents: appendAuditEvent(
        s.integrationAuditEvents ?? [],
        createAuditEvent('EXTERNAL_ACTION_COMPLETED', {
          connectionId: candidate.connectionId,
          providerId: candidate.providerId,
          staffId,
          safeDetail: `Imported demo load ${candidate.externalLoadId}`,
        }),
      ),
    };
  });

  return imported;
}

export function submitFactoringToProvider(
  submissionId: string,
  organizationId: string,
  documents: string[],
  authorized: boolean,
  staffId?: string,
): { ok: boolean; error?: string; externalReference?: string } {
  let result: { ok: boolean; error?: string; externalReference?: string } = { ok: false };

  updateDemoStore((s) => {
    const idempotencyKey = generateIdempotencyKey(['factoring-submit', submissionId]);
    const existing = findExistingOperationByIdempotency(s.integrationOperations ?? [], idempotencyKey);
    if (existing) {
      result = { ok: true, externalReference: existing.resultSummary };
      return s;
    }

    void demoFactoringAdapter.submitPackage({ submissionId, organizationId, documents, authorized }).then((r) => {
      result = r.status === 'SUCCEEDED'
        ? { ok: true, externalReference: r.externalReference }
        : { ok: false, error: r.safeError };
    });

    if (!authorized) {
      result = { ok: false, error: 'Customer authorization required before provider submission' };
      return {
        ...s,
        integrationAuditEvents: appendAuditEvent(
          s.integrationAuditEvents ?? [],
          createAuditEvent('EXTERNAL_ACTION_FAILED', {
            connectionId: 'conn-factoring-demo',
            providerId: 'prov-factoring-demo',
            staffId,
            organizationId,
            safeDetail: 'Blocked — authorization missing',
          }),
        ),
      };
    }

    const externalReference = `DEMO-FAC-${submissionId.slice(0, 8).toUpperCase()}`;
    result = { ok: true, externalReference };

    const op: IntegrationOperation = {
      id: uid(),
      connectionId: 'conn-factoring-demo',
      providerId: 'prov-factoring-demo',
      capability: 'WRITE',
      operationType: 'FACTORING_SUBMIT',
      entityType: 'factoring_submission',
      entityId: submissionId,
      status: 'SUCCEEDED',
      idempotencyKey,
      correlationId: uid(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      attemptCount: 1,
      resultSummary: externalReference,
    };

    const submissions = (s.factoringSubmissions ?? []).map((sub) =>
      sub.id === submissionId ? { ...sub, status: 'provider_review' as const, updatedAt: new Date().toISOString() } : sub,
    );

    return {
      ...s,
      factoringSubmissions: submissions,
      integrationOperations: [...(s.integrationOperations ?? []), op],
      integrationAuditEvents: appendAuditEvent(
        s.integrationAuditEvents ?? [],
        createAuditEvent('EXTERNAL_ACTION_COMPLETED', {
          connectionId: 'conn-factoring-demo',
          providerId: 'prov-factoring-demo',
          staffId,
          organizationId,
          safeDetail: externalReference,
        }),
      ),
    };
  });

  return result;
}

export function exportInvoiceToAccounting(invoiceId: string, mappingVersion: string, staffId?: string): { ok: boolean; error?: string } {
  let result: { ok: boolean; error?: string } = { ok: false };

  updateDemoStore((s) => {
    const idempotencyKey = generateIdempotencyKey(['accounting-export', invoiceId]);
    const existing = findExistingOperationByIdempotency(s.integrationOperations ?? [], idempotencyKey);
    if (existing) {
      result = { ok: true };
      return s;
    }

    if (!mappingVersion || mappingVersion === 'missing') {
      result = { ok: false, error: 'Accounting mapping missing' };
      return s;
    }

    const externalReference = `DEMO-ACCT-INV-${invoiceId.slice(0, 8).toUpperCase()}`;
    result = { ok: true };

    const op: IntegrationOperation = {
      id: uid(),
      connectionId: 'conn-accounting-demo',
      providerId: 'prov-accounting-demo',
      capability: 'FINANCIAL',
      operationType: 'ACCOUNTING_EXPORT',
      entityType: 'invoice',
      entityId: invoiceId,
      status: 'SUCCEEDED',
      idempotencyKey,
      correlationId: uid(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      attemptCount: 1,
      resultSummary: externalReference,
    };

    return {
      ...s,
      integrationOperations: [...(s.integrationOperations ?? []), op],
      integrationExternalIds: [
        ...(s.integrationExternalIds ?? []),
        {
          id: uid(),
          providerId: 'prov-accounting-demo',
          connectionId: 'conn-accounting-demo',
          entityType: 'invoice',
          entityId: invoiceId,
          externalId: externalReference,
          externalType: 'accounting_invoice',
          createdAt: new Date().toISOString(),
        },
      ],
      integrationAuditEvents: appendAuditEvent(
        s.integrationAuditEvents ?? [],
        createAuditEvent('EXTERNAL_ACTION_COMPLETED', {
          connectionId: 'conn-accounting-demo',
          providerId: 'prov-accounting-demo',
          staffId,
          safeDetail: externalReference,
        }),
      ),
    };
  });

  return result;
}

export function revokeIntegrationConsent(consentId: string, staffId?: string): IntegrationConsent | undefined {
  let revoked: IntegrationConsent | undefined;

  updateDemoStore((s) => {
    const consent = s.integrationConsents?.find((c) => c.id === consentId);
    if (!consent || consent.revokedAt) return s;

    revoked = { ...consent, revokedAt: new Date().toISOString() };

    return {
      ...s,
      integrationConsents: (s.integrationConsents ?? []).map((c) => (c.id === consentId ? revoked! : c)),
      integrationAuditEvents: appendAuditEvent(
        s.integrationAuditEvents ?? [],
        createAuditEvent('AUTHORIZATION_REVOKED', {
          providerId: consent.providerId,
          organizationId: consent.organizationId,
          staffId,
          safeDetail: consent.purpose,
        }),
      ),
    };
  });

  return revoked;
}

export function estimateLoadRoute(loadId: string): { distanceMiles: number; label: string } | null {
  const store = loadDemoStore();
  const load = store.loads.find((l) => l.id === loadId);
  if (!load) return null;

  const connection = store.integrationConnections?.find((c) => c.id === 'conn-maps-demo');
  if (!connection) return null;

  void demoMapsAdapter.estimateRoute({
    origin: `${load.originCity}, ${load.originState}`,
    destination: `${load.destinationCity}, ${load.destinationState}`,
    loadId,
  });

  updateDemoStore((s) => {
    const op: IntegrationOperation = {
      id: uid(),
      connectionId: 'conn-maps-demo',
      providerId: 'prov-maps-demo',
      capability: 'ROUTING',
      operationType: 'ROUTE_ESTIMATE',
      entityType: 'load',
      entityId: loadId,
      status: 'SUCCEEDED',
      idempotencyKey: generateIdempotencyKey(['route', loadId, load.updatedAt]),
      correlationId: uid(),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      attemptCount: 1,
      resultSummary: '781 mi — DEMO ESTIMATED',
    };
    return { ...s, integrationOperations: [...(s.integrationOperations ?? []), op] };
  });

  return { distanceMiles: 781, label: 'ESTIMATED — DEMO DATA' };
}

export function resolveReconciliationIssue(issueId: string, note: string, staffId?: string): void {
  updateDemoStore((s) => ({
    ...s,
    integrationReconciliationIssues: (s.integrationReconciliationIssues ?? []).map((issue) =>
      issue.id === issueId
        ? { ...issue, status: 'resolved' as const, resolvedAt: new Date().toISOString(), resolutionNote: note }
        : issue,
    ),
    integrationAuditEvents: appendAuditEvent(
      s.integrationAuditEvents ?? [],
      createAuditEvent('RECONCILIATION_RESOLVED', { staffId, safeDetail: note }),
    ),
  }));
}

export function getCustomerConsents(organizationId: string, store: DemoStore = loadDemoStore()): IntegrationConsent[] {
  return (store.integrationConsents ?? []).filter((c) => c.organizationId === organizationId);
}
