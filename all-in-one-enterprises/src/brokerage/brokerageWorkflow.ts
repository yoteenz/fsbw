/**
 * Shipper → brokerage → load orchestration.
 * Single data-flow gate: request fields flow to quote → canonical Load without re-entry.
 */
import { buildNotification } from '../notifications/notificationEngine';
import { computeBrokerageGrossMargin } from './brokerageCalculations';
import { canTransitionQuoteStatus, canTransitionShipmentRequest } from './brokerageRules';
import type {
  BrokerageAuditEvent,
  BrokerageFreightQuote,
  BrokerageInfoRequest,
  BrokerageQuotePricingDraft,
  BrokerageQuotePricingDraftRecord,
  LoadDistributionStrategy,
  ShipmentRequest,
  ShipmentRequestTemplate,
} from './brokerageTypes';
import type { Load } from '../dispatch/dispatchTypes';
import type { LoadBoardPublication } from '../freight/freightTypes';
import { publishLoadToBoard } from '../freight/loadBoardActions';
import { deliverFreightNotificationDemo } from '../freight/freightNotifications';
import { loadDemoStore, updateDemoStore } from '../demo/demoStore';
import type { DemoStore } from '../demo/demoTypes';
import { aioPaths } from '../utils/paths';

function uid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function recordAudit(
  s: DemoStore,
  entityType: BrokerageAuditEvent['entityType'],
  entityId: string,
  action: string,
  actorType: BrokerageAuditEvent['actorType'],
  actorId?: string,
  note?: string,
  payload?: Record<string, unknown>,
): void {
  if (!s.brokerageAuditEvents) s.brokerageAuditEvents = [];
  s.brokerageAuditEvents.unshift({
    id: uid(),
    entityType,
    entityId,
    action,
    actorType,
    actorId,
    note,
    payload,
    createdAt: now(),
  });
}

export type ShipmentRequestInput = Omit<
  ShipmentRequest,
  'id' | 'requestNumber' | 'status' | 'documentIds' | 'createdAt' | 'updatedAt' | 'version'
>;

export function saveShipmentRequestDraft(
  orgId: string,
  partial: Partial<ShipmentRequestInput>,
  existingId?: string,
): string {
  let id = existingId ?? '';
  updateDemoStore((s) => {
    if (existingId) {
      const req = s.shipmentRequests.find((r) => r.id === existingId && r.shipperOrganizationId === orgId);
      if (!req || req.status !== 'draft') return s;
      Object.assign(req, partial, { updatedAt: now(), version: req.version + 1 });
      recordAudit(s, 'shipment_request', req.id, 'draft_updated', 'shipper', orgId);
      id = req.id;
      return s;
    }
    s.brokerageCounters.shipmentRequest += 1;
    id = uid();
    const req: ShipmentRequest = {
      id,
      requestNumber: `SR-2026-${String(s.brokerageCounters.shipmentRequest).padStart(4, '0')}`,
      shipperOrganizationId: orgId,
      status: 'draft',
      pickupCity: partial.pickupCity ?? '',
      pickupState: partial.pickupState ?? '',
      pickupDate: partial.pickupDate ?? '',
      deliveryCity: partial.deliveryCity ?? '',
      deliveryState: partial.deliveryState ?? '',
      deliveryDate: partial.deliveryDate ?? '',
      equipmentType: partial.equipmentType ?? 'Dry Van',
      documentIds: [],
      createdAt: now(),
      updatedAt: now(),
      version: 1,
      ...partial,
    };
    s.shipmentRequests.push(req);
    recordAudit(s, 'shipment_request', id, 'draft_created', 'shipper', orgId);
    return s;
  });
  return id;
}

export function submitShipmentRequest(orgId: string, requestId: string): boolean {
  let ok = false;
  updateDemoStore((s) => {
    const req = s.shipmentRequests.find((r) => r.id === requestId && r.shipperOrganizationId === orgId);
    if (!req) return s;
    const from = req.status;
    const to: ShipmentRequest['status'] = from === 'info_required' ? 'submitted' : 'submitted';
    if (!canTransitionShipmentRequest(from === 'draft' ? 'draft' : from, to) && from !== 'info_required') return s;
    req.status = 'submitted';
    req.openInfoRequestId = undefined;
    req.updatedAt = now();
    req.version += 1;
    if (from === 'submitted') {
      req.status = 'under_review';
    } else if (from === 'draft' || from === 'info_required') {
      req.status = 'under_review';
    }
    recordAudit(s, 'shipment_request', req.id, 'submitted', 'shipper', orgId);
    s.notifications.unshift(
      buildNotification({
        recipientType: 'staff',
        eventType: 'SHIPMENT_REQUEST_SUBMITTED',
        category: 'brokerage',
        title: 'New shipper freight request',
        body: `${req.pickupCity}, ${req.pickupState} → ${req.deliveryCity}, ${req.deliveryState}`,
        link: aioPaths.officeBrokerageRequest(req.id),
        dedupeKey: `sr-submit:${req.id}`,
      }),
    );
    deliverFreightNotificationDemo({
      eventType: 'SHIPMENT_REQUEST_SUBMITTED',
      organizationId: orgId,
      title: 'Request submitted',
      body: 'AIO brokerage is reviewing your freight request.',
      dedupeKey: `shipper-sr-submit:${req.id}`,
      link: aioPaths.shipperRequest(req.id),
    });
    ok = true;
    return s;
  });
  return ok;
}

export function assignRequestToStaff(requestId: string, staffId: string): void {
  updateDemoStore((s) => {
    const req = s.shipmentRequests.find((r) => r.id === requestId);
    if (!req) return s;
    req.assignedBrokerStaffId = staffId;
    req.status = canTransitionShipmentRequest(req.status, 'under_review') ? 'under_review' : req.status;
    req.updatedAt = now();
    recordAudit(s, 'shipment_request', req.id, 'assigned', 'staff', staffId);
    return s;
  });
}

export function requestMoreInformation(
  requestId: string,
  staffId: string,
  missingFields: string[],
  message: string,
): BrokerageInfoRequest | undefined {
  let created!: BrokerageInfoRequest;
  updateDemoStore((s) => {
    const req = s.shipmentRequests.find((r) => r.id === requestId);
    if (!req) return s;
    const info: BrokerageInfoRequest = {
      id: uid(),
      shipmentRequestId: requestId,
      missingFields,
      message,
      status: 'open',
      createdByStaffId: staffId,
      createdAt: now(),
    };
    if (!s.brokerageInfoRequests) s.brokerageInfoRequests = [];
    s.brokerageInfoRequests.push(info);
    req.status = 'info_required';
    req.openInfoRequestId = info.id;
    req.updatedAt = now();
    recordAudit(s, 'shipment_request', req.id, 'info_requested', 'staff', staffId, message, { missingFields });
    deliverFreightNotificationDemo({
      eventType: 'DOCUMENT_REQUIRED',
      organizationId: req.shipperOrganizationId,
      title: 'More information needed',
      body: message,
      dedupeKey: `info-req:${info.id}`,
      link: aioPaths.shipperRequest(req.id),
    });
    created = info;
    return s;
  });
  return created;
}

export function resolveInfoRequest(requestId: string, orgId: string, updates: Partial<ShipmentRequestInput>): void {
  updateDemoStore((s) => {
    const req = s.shipmentRequests.find((r) => r.id === requestId && r.shipperOrganizationId === orgId);
    if (!req || req.status !== 'info_required') return s;
    Object.assign(req, updates, { updatedAt: now(), version: req.version + 1 });
    const info = s.brokerageInfoRequests?.find((i) => i.id === req.openInfoRequestId);
    if (info) {
      info.status = 'resolved';
      info.resolvedAt = now();
    }
    req.openInfoRequestId = undefined;
    req.status = 'submitted';
    recordAudit(s, 'shipment_request', req.id, 'info_resolved', 'shipper', orgId);
    return s;
  });
  submitShipmentRequest(orgId, requestId);
}

export function createQuoteFromRequest(
  requestId: string,
  pricing: BrokerageQuotePricingDraft,
  staffId: string,
): BrokerageFreightQuote | undefined {
  let created!: BrokerageFreightQuote;
  updateDemoStore((s) => {
    const req = s.shipmentRequests.find((r) => r.id === requestId);
    if (!req) return s;
    s.brokerageCounters.freightQuote += 1;
    const id = uid();
    const revId = uid();
    const quote: BrokerageFreightQuote = {
      id,
      quoteNumber: `BQ-2026-${String(s.brokerageCounters.freightQuote).padStart(4, '0')}`,
      shipmentRequestId: requestId,
      shipperOrganizationId: req.shipperOrganizationId,
      status: 'draft',
      freightChargeMinor: pricing.shipperRateMinor,
      currency: 'USD',
      accessorialNotes: pricing.termsNote,
      expiresAt: pricing.validUntil,
      currentRevision: 1,
      revisions: [
        {
          id: revId,
          quoteId: id,
          version: 1,
          freightChargeMinor: pricing.shipperRateMinor,
          preparedByStaffId: staffId,
          expiresAt: pricing.validUntil,
          createdAt: now(),
        },
      ],
      preparedByStaffId: staffId,
      createdAt: now(),
      updatedAt: now(),
      version: 1,
    };
    s.brokerageFreightQuotes.push(quote);
    if (!s.brokerageQuotePricingDrafts) s.brokerageQuotePricingDrafts = [];
    const draftRecord: BrokerageQuotePricingDraftRecord = {
      quoteId: id,
      requestId,
      shipperRateMinor: pricing.shipperRateMinor,
      targetCarrierRateMinor: pricing.targetCarrierRateMinor,
      estimatedMarginMinor: pricing.estimatedMarginMinor,
      estimatedMarginPercent: pricing.estimatedMarginPercent,
      termsNote: pricing.termsNote,
      validUntil: pricing.validUntil,
    };
    s.brokerageQuotePricingDrafts.push(draftRecord);
    req.status = 'quote_preparation';
    req.updatedAt = now();
    recordAudit(s, 'quote', id, 'quote_drafted', 'staff', staffId, undefined, {
      shipperRateMinor: pricing.shipperRateMinor,
      targetCarrierRateMinor: pricing.targetCarrierRateMinor,
    });
    created = quote;
    return s;
  });
  return created;
}

export function sendBrokerageQuoteWorkflow(quoteId: string): void {
  updateDemoStore((s) => {
    const q = s.brokerageFreightQuotes.find((x) => x.id === quoteId);
    if (!q || !canTransitionQuoteStatus(q.status, 'sent')) return s;
    q.status = 'sent';
    q.updatedAt = now();
    const req = s.shipmentRequests.find((r) => r.id === q.shipmentRequestId);
    if (req) {
      req.status = 'awaiting_shipper_approval';
      req.updatedAt = now();
    }
    recordAudit(s, 'quote', q.id, 'quote_sent', 'staff', q.preparedByStaffId);
    s.notifications.unshift(
      buildNotification({
        organizationId: q.shipperOrganizationId,
        recipientType: 'customer',
        eventType: 'BROKERAGE_QUOTE_AVAILABLE',
        category: 'brokerage',
        title: 'AIO freight quote ready',
        body: 'Review and accept your brokerage quote.',
        link: aioPaths.shipperQuote(q.id),
        dedupeKey: `quote-sent:${q.id}`,
      }),
    );
    return s;
  });
}

export function reviseBrokerageQuote(
  quoteId: string,
  shipperRateMinor: number,
  staffId: string,
  validUntil?: string,
): void {
  updateDemoStore((s) => {
    const q = s.brokerageFreightQuotes.find((x) => x.id === quoteId);
    if (!q || q.status === 'converted') return s;
    const nextVersion = q.currentRevision + 1;
    const revId = uid();
    q.revisions.push({
      id: revId,
      quoteId,
      version: nextVersion,
      freightChargeMinor: shipperRateMinor,
      preparedByStaffId: staffId,
      expiresAt: validUntil,
      createdAt: now(),
    });
    q.currentRevision = nextVersion;
    q.freightChargeMinor = shipperRateMinor;
    q.expiresAt = validUntil;
    q.status = 'revised';
    q.updatedAt = now();
    recordAudit(s, 'quote', q.id, 'quote_revised', 'staff', staffId, undefined, {
      version: nextVersion,
      shipperRateMinor,
    });
    return s;
  });
}

export function acceptBrokerageQuoteWorkflow(quoteId: string, shipperOrgId: string): string | undefined {
  let loadId: string | undefined;
  updateDemoStore((s) => {
    const q = s.brokerageFreightQuotes.find((x) => x.id === quoteId && x.shipperOrganizationId === shipperOrgId);
    if (!q || !canTransitionQuoteStatus(q.status, 'accepted')) return s;
    q.status = 'accepted';
    q.acceptedRevisionId = q.revisions[q.revisions.length - 1]?.id;
    q.updatedAt = now();
    const req = s.shipmentRequests.find((r) => r.id === q.shipmentRequestId);
    if (!req) return s;
    req.status = 'approved';
    loadId = convertRequestToLoad(s, q, req);
    q.status = 'converted';
    q.convertedLoadId = loadId;
    req.status = 'converted_to_load';
    req.convertedLoadId = loadId;
    recordAudit(s, 'quote', q.id, 'quote_accepted', 'shipper', shipperOrgId);
    recordAudit(s, 'load', loadId!, 'load_created_from_request', 'system', undefined, req.requestNumber);
    deliverFreightNotificationDemo({
      eventType: 'BROKERAGE_QUOTE_ACCEPTED',
      organizationId: shipperOrgId,
      loadId,
      title: 'Quote accepted',
      body: 'Your shipment is now an AIO brokered load.',
      dedupeKey: `quote-accepted:${q.id}`,
      link: loadId ? aioPaths.shipperShipment(loadId) : undefined,
    });
    return s;
  });
  return loadId;
}

function convertRequestToLoad(s: DemoStore, quote: BrokerageFreightQuote, req: ShipmentRequest): string {
  s.dispatchCounters.load += 1;
  const id = uid();
  const pricingDraft = s.brokerageQuotePricingDrafts?.find((p) => p.quoteId === quote.id);
  const carrierRate = pricingDraft?.targetCarrierRateMinor ?? Math.round(quote.freightChargeMinor * 0.85);

  const load: Load = {
    id,
    loadNumber: `BR-LD-2026-${String(s.dispatchCounters.load).padStart(4, '0')}`,
    organizationId: s.carrierNetworkProfiles.find((c) => c.status === 'active')?.organizationId ?? 'client-b',
    sourceType: 'brokerage',
    shipperOrganizationId: req.shipperOrganizationId,
    brokerageShipmentRequestId: req.id,
    brokerageQuoteId: quote.id,
    brokerageCoverageStatus: 'needs_coverage',
    assignedBrokerStaffId: req.assignedBrokerStaffId ?? 'staff-7',
    brokerName: 'All In One Brokerage',
    equipmentType: req.equipmentType,
    originCity: req.pickupCity,
    originState: req.pickupState,
    destinationCity: req.deliveryCity,
    destinationState: req.deliveryState,
    pickupDate: req.pickupDate,
    pickupTimeStart: req.pickupTimeStart,
    pickupTimeEnd: req.pickupTimeEnd,
    deliveryDate: req.deliveryDate,
    deliveryTimeStart: req.deliveryTimeStart,
    deliveryTimeEnd: req.deliveryTimeEnd,
    commodity: req.commodity,
    weight: req.weight,
    loadedMiles: estimateLaneMiles(req),
    deadheadMiles: 0,
    linehaulMinor: carrierRate,
    fuelSurchargeMinor: 0,
    accessorialMinor: 0,
    grossMinor: carrierRate,
    confirmedGrossMinor: carrierRate,
    currency: 'USD',
    offerStatus: 'draft',
    operationalStatus: 'opportunity',
    rateConfirmationStatus: 'missing',
    rateDetailsReviewed: false,
    factoringHandoffStatus: 'not_ready',
    internalNotes: req.specialInstructions,
    accessorials: [],
    rateRevisions: [],
    timeline: [],
    createdAt: now(),
    updatedAt: now(),
    version: 1,
  };
  s.loads.push(load);
  s.brokerageLoadFinancials.push({
    loadId: id,
    shipperChargeMinor: quote.freightChargeMinor,
    carrierLinehaulMinor: carrierRate,
    carrierFuelSurchargeMinor: 0,
    carrierAccessorialMinor: 0,
    totalCarrierPayMinor: carrierRate,
    confirmedShipperChargeMinor: quote.freightChargeMinor,
    confirmedCarrierPayMinor: carrierRate,
    currency: 'USD',
    version: 1,
    updatedAt: now(),
  });

  const pub: LoadBoardPublication = {
    loadId: id,
    sourceType: 'aio_shipper_freight',
    visibility: 'draft',
    bookingMode: 'submit_offer',
    trailerLengthFt: req.trailerLengthFt ?? 53,
    fullPartial: req.fullPartial ?? 'full',
    maxWeightLbs: req.weight ? parseInt(req.weight.replace(/\D/g, ''), 10) || undefined : undefined,
    createdAt: now(),
    updatedAt: now(),
  };
  if (!s.loadBoardPublications) s.loadBoardPublications = [];
  s.loadBoardPublications.push(pub);

  return id;
}

function estimateLaneMiles(req: ShipmentRequest): number {
  const key = `${req.pickupCity},${req.pickupState}-${req.deliveryCity},${req.deliveryState}`.toLowerCase();
  const table: Record<string, number> = {
    'chicago,il-atlanta,ga': 720,
    'detroit,mi-nashville,tn': 530,
    'columbus,oh-charlotte,nc': 650,
  };
  return table[key] ?? 500;
}

export function setLoadCarrierRate(loadId: string, carrierRateMinor: number, staffId: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    const fin = s.brokerageLoadFinancials.find((f) => f.loadId === loadId);
    if (!load || !fin) return s;
    const prev = fin.carrierLinehaulMinor;
    fin.carrierLinehaulMinor = carrierRateMinor;
    fin.totalCarrierPayMinor = carrierRateMinor;
    fin.confirmedCarrierPayMinor = carrierRateMinor;
    fin.updatedAt = now();
    load.linehaulMinor = carrierRateMinor;
    load.grossMinor = carrierRateMinor;
    load.confirmedGrossMinor = carrierRateMinor;
    load.updatedAt = now();
    recordAudit(s, 'load', loadId, 'carrier_rate_set', 'staff', staffId, undefined, {
      previous: prev,
      next: carrierRateMinor,
    });
    return s;
  });
}

export function applyLoadDistributionStrategy(
  loadId: string,
  strategy: LoadDistributionStrategy,
  staffId: string,
  options: {
    invitedCarrierOrgIds?: string[];
    instantBook?: boolean;
    offersEnabled?: boolean;
  } = {},
): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    if (!load) return s;
    recordAudit(s, 'load', loadId, 'distribution_strategy', 'staff', staffId, strategy, options);
    return s;
  });

  if (strategy === 'hold') {
    return;
  }

  const partial: Partial<LoadBoardPublication> = {
    bookingMode: options.instantBook ? 'instant_book' : options.offersEnabled === false ? 'request_only' : 'submit_offer',
    invitedCarrierOrganizationIds: options.invitedCarrierOrgIds,
  };

  if (strategy === 'private_invite') {
    publishLoadToBoard(loadId, staffId, {
      ...partial,
      visibility: 'private',
      bookingMode: 'private_invite',
      invitedCarrierOrganizationIds: options.invitedCarrierOrgIds ?? [],
    });
    for (const orgId of options.invitedCarrierOrgIds ?? []) {
      deliverFreightNotificationDemo({
        eventType: 'PRIVATE_LOAD_INVITE',
        organizationId: orgId,
        loadId,
        title: 'Private AIO load invite',
        body: 'AIO brokerage invited you to a private load.',
        dedupeKey: `private-invite:${loadId}:${orgId}`,
        link: aioPaths.portalLoadBoardLoad(loadId),
      });
    }
    return;
  }

  publishLoadToBoard(loadId, staffId, {
    ...partial,
    visibility: 'published',
  });
}

export function saveShipmentTemplate(orgId: string, label: string, snapshot: ShipmentRequestTemplate['snapshot']): ShipmentRequestTemplate {
  let created!: ShipmentRequestTemplate;
  updateDemoStore((s) => {
    if (!s.shipmentRequestTemplates) s.shipmentRequestTemplates = [];
    const t: ShipmentRequestTemplate = {
      id: uid(),
      shipperOrganizationId: orgId,
      label,
      snapshot,
      createdAt: now(),
      updatedAt: now(),
    };
    s.shipmentRequestTemplates.push(t);
    created = t;
    return s;
  });
  return created;
}

export function duplicateRequestFromTemplate(orgId: string, templateId: string): string {
  const store = loadDemoStore();
  const template = store.shipmentRequestTemplates?.find((t) => t.id === templateId && t.shipperOrganizationId === orgId);
  if (!template) return '';
  return saveShipmentRequestDraft(orgId, {
    ...template.snapshot,
    pickupDate: '',
    deliveryDate: '',
    templateId,
  });
}

export function createSimilarLoadFromShipment(orgId: string, loadId: string): string {
  const store = loadDemoStore();
  const load = store.loads.find((l) => l.id === loadId && l.shipperOrganizationId === orgId);
  if (!load) return '';
  return saveShipmentRequestDraft(orgId, {
    pickupCity: load.originCity,
    pickupState: load.originState,
    deliveryCity: load.destinationCity,
    deliveryState: load.destinationState,
    equipmentType: load.equipmentType,
    commodity: load.commodity,
    weight: load.weight,
    specialInstructions: load.internalNotes,
  });
}

export function getPendingShipperRequests(store: DemoStore = loadDemoStore()): ShipmentRequest[] {
  const open = new Set<ShipmentRequest['status']>([
    'submitted',
    'info_required',
    'under_review',
    'quote_preparation',
    'quote_pending',
    'quoted',
    'quote_sent',
    'awaiting_shipper_approval',
  ]);
  return store.shipmentRequests.filter((r) => open.has(r.status));
}

export function getRequestAudit(requestId: string, store: DemoStore = loadDemoStore()): BrokerageAuditEvent[] {
  return (store.brokerageAuditEvents ?? []).filter(
    (e) => e.entityId === requestId || e.payload?.requestId === requestId,
  );
}

export function computePricingDraft(shipperRateMinor: number, carrierRateMinor: number): BrokerageQuotePricingDraft {
  const margin = computeBrokerageGrossMargin(shipperRateMinor, carrierRateMinor);
  const pct = shipperRateMinor > 0 ? (margin / shipperRateMinor) * 100 : null;
  return {
    shipperRateMinor,
    targetCarrierRateMinor: carrierRateMinor,
    estimatedMarginMinor: margin,
    estimatedMarginPercent: pct,
  };
}
