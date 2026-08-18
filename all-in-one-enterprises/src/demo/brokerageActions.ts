import { buildNotification } from '../notifications/notificationEngine';
import {
  computeBrokerageGrossMargin,
  computeShipperInvoiceTotal,
  computeTotalCarrierPay,
} from '../brokerage/brokerageCalculations';
import {
  canTransitionOfferStatus,
  canTransitionQuoteStatus,
  isReadyToBill,
} from '../brokerage/brokerageRules';
import type {
  BrokerageFreightQuote,
  BrokerageShipperInvoice,
  CarrierOffer,
  ShipmentRequest,
} from '../brokerage/brokerageTypes';
import { computeGrossMinor } from '../dispatch/dispatchCalculations';
import type { Load } from '../dispatch/dispatchTypes';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import { aioPaths } from '../utils/paths';

function uid(): string {
  return crypto.randomUUID();
}

export function getShipperOrganizationId(store: DemoStore = loadDemoStore()): string {
  return store.shipperPortalOrgId ?? 'client-e';
}

/** Resolves carrier org for brokerage portal — defaults to Heartland demo when portal org has no network profile. */
export function getCarrierPortalOrganizationId(store: DemoStore = loadDemoStore()): string {
  const portalOrg = store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
  const hasNetwork = store.carrierNetworkProfiles.some((p) => p.organizationId === portalOrg);
  const hasOffers = store.carrierOffers.some((o) => o.carrierOrganizationId === portalOrg);
  if (hasNetwork || hasOffers) return portalOrg;
  return store.brokeragePortalClientId ?? 'client-b';
}

export function getBrokerageMetrics(store: DemoStore = loadDemoStore()) {
  const loads = store.loads.filter((l) => l.sourceType === 'brokerage');
  const pubs = store.loadBoardPublications ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const completeLoads = loads.filter((l) => l.operationalStatus === 'complete');
  let brokerageRevenueMinor = 0;
  let grossMarginMinor = 0;
  for (const l of completeLoads) {
    const fin = getLoadFinancials(l.id, store);
    if (fin) {
      brokerageRevenueMinor += fin.confirmedShipperChargeMinor;
      grossMarginMinor += fin.grossMarginMinor;
    }
  }

  const shipperArMinor = store.brokerageShipperInvoices
    .filter((i) => !['paid', 'void'].includes(i.status))
    .reduce((s, i) => s + i.totalMinor, 0);

  const carrierPayablesMinor = store.carrierPayables
    .filter((p) => p.status !== 'paid_future')
    .reduce((s, p) => s + p.totalPayableMinor, 0);

  return {
    activeLoads: loads.filter((l) => !['complete', 'cancelled'].includes(l.operationalStatus)).length,
    availableOnBoard: pubs.filter((p) => p.visibility === 'published').length,
    needsCoverage: loads.filter((l) => l.brokerageCoverageStatus === 'needs_coverage').length,
    needCarrier: loads.filter((l) => l.brokerageCoverageStatus === 'needs_coverage').length,
    draftLoads: pubs.filter((p) => p.visibility === 'draft').length,
    privateLoads: pubs.filter((p) => p.visibility === 'private' || p.visibility === 'hold').length,
    carrierOffersPending:
      store.carrierOffers.filter((o) => ['sent', 'viewed'].includes(o.status)).length
      + (store.carrierLoadBoardOffers ?? []).filter((o) => o.status === 'pending').length,
    bookedLoads: loads.filter((l) => l.brokerageCoverageStatus === 'booked' || l.operationalStatus === 'booked').length,
    quotesPending: store.shipmentRequests.filter((r) => ['submitted', 'under_review', 'quote_pending'].includes(r.status)).length,
    pickupsToday: loads.filter((l) => l.pickupDate === today).length,
    deliveriesToday: loads.filter((l) => l.deliveryDate === today).length,
    inTransit: loads.filter((l) => l.operationalStatus === 'in_transit').length,
    podNeeded: loads.filter((l) => l.operationalStatus === 'pod_needed' && !l.podDocumentId).length,
    podMissing: loads.filter((l) => l.operationalStatus === 'pod_needed' && !l.podDocumentId).length,
    readyToBill: loads.filter((l) => isReadyToBill(l, { coverageStatus: l.brokerageCoverageStatus ?? 'not_applicable' } as never)).length,
    readyToInvoice: loads.filter((l) => isReadyToBill(l, { coverageStatus: l.brokerageCoverageStatus ?? 'not_applicable' } as never)).length,
    issues: store.brokerageIssues.filter((i) => i.status === 'open').length,
    shipperArMinor,
    carrierPayablesMinor,
    brokerageRevenueMinor,
    grossMarginMinor,
  };
}

export function createAndSubmitShipmentRequest(
  orgId: string,
  partial: Pick<ShipmentRequest, 'pickupCity' | 'pickupState' | 'deliveryCity' | 'deliveryState' | 'pickupDate' | 'deliveryDate' | 'equipmentType' | 'commodity'>,
): string {
  let id = '';
  updateDemoStore((s) => {
    s.brokerageCounters.shipmentRequest += 1;
    id = uid();
    const req: ShipmentRequest = {
      id,
      requestNumber: `SR-2026-${String(s.brokerageCounters.shipmentRequest).padStart(4, '0')}`,
      shipperOrganizationId: orgId,
      status: 'under_review',
      documentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      assignedBrokerStaffId: 'staff-7',
      ...partial,
    };
    s.shipmentRequests.push(req);
    s.notifications.unshift(
      buildNotification({
        organizationId: orgId,
        recipientType: 'staff',
        eventType: 'SHIPMENT_REQUEST_SUBMITTED',
        category: 'brokerage',
        title: 'New shipment request',
        body: `${req.pickupCity}, ${req.pickupState} → ${req.deliveryCity}, ${req.deliveryState}`,
        link: aioPaths.officeBrokerage,
      }),
    );
    return s;
  });
  return id;
}

export function createBrokerageQuote(
  shipmentRequestId: string,
  freightChargeMinor: number,
  staffId: string,
): BrokerageFreightQuote | undefined {
  let created!: BrokerageFreightQuote;
  updateDemoStore((s) => {
    const req = s.shipmentRequests.find((r) => r.id === shipmentRequestId);
    if (!req) return s;
    s.brokerageCounters.freightQuote += 1;
    const id = uid();
    const revId = uid();
    const quote: BrokerageFreightQuote = {
      id,
      quoteNumber: `BQ-2026-${String(s.brokerageCounters.freightQuote).padStart(4, '0')}`,
      shipmentRequestId,
      shipperOrganizationId: req.shipperOrganizationId,
      status: 'draft',
      freightChargeMinor,
      currency: 'USD',
      currentRevision: 1,
      revisions: [
        {
          id: revId,
          quoteId: id,
          version: 1,
          freightChargeMinor,
          preparedByStaffId: staffId,
          createdAt: new Date().toISOString(),
        },
      ],
      preparedByStaffId: staffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    s.brokerageFreightQuotes.push(quote);
    req.status = 'quoted';
    created = quote;
    return s;
  });
  return created;
}

export function sendBrokerageQuote(quoteId: string): void {
  updateDemoStore((s) => {
    const q = s.brokerageFreightQuotes.find((x) => x.id === quoteId);
    if (!q || !canTransitionQuoteStatus(q.status, 'sent')) return s;
    q.status = 'sent';
    q.updatedAt = new Date().toISOString();
    s.notifications.unshift(
      buildNotification({
        organizationId: q.shipperOrganizationId,
        recipientType: 'customer',
        eventType: 'BROKERAGE_QUOTE_AVAILABLE',
        category: 'brokerage',
        title: 'Freight quote available',
        body: 'Review your brokerage freight quote.',
        link: aioPaths.shipperQuote(q.id),
      }),
    );
    return s;
  });
}

export function acceptBrokerageQuote(quoteId: string, shipperOrgId: string): string | undefined {
  let loadId: string | undefined;
  updateDemoStore((s) => {
    const q = s.brokerageFreightQuotes.find((x) => x.id === quoteId && x.shipperOrganizationId === shipperOrgId);
    if (!q || !canTransitionQuoteStatus(q.status, 'accepted')) return s;
    q.status = 'accepted';
    q.acceptedRevisionId = q.revisions[q.revisions.length - 1]?.id;
    q.updatedAt = new Date().toISOString();
    const req = s.shipmentRequests.find((r) => r.id === q.shipmentRequestId);
    if (!req) return s;
    loadId = convertQuoteToLoad(s, q, req);
    q.status = 'converted';
    q.convertedLoadId = loadId;
    req.status = 'converted_to_load';
    req.convertedLoadId = loadId;
    return s;
  });
  return loadId;
}

function convertQuoteToLoad(s: DemoStore, quote: BrokerageFreightQuote, req: ShipmentRequest): string {
  s.dispatchCounters.load += 1;
  const id = uid();
  const carrierPayEstimate = Math.round(quote.freightChargeMinor * 0.85);
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
    brokerName: 'All In One Brokerage (Demo)',
    equipmentType: req.equipmentType,
    originCity: req.pickupCity,
    originState: req.pickupState,
    destinationCity: req.deliveryCity,
    destinationState: req.deliveryState,
    pickupDate: req.pickupDate,
    deliveryDate: req.deliveryDate,
    loadedMiles: 500,
    deadheadMiles: 0,
    linehaulMinor: carrierPayEstimate,
    fuelSurchargeMinor: 0,
    accessorialMinor: 0,
    grossMinor: carrierPayEstimate,
    confirmedGrossMinor: carrierPayEstimate,
    currency: 'USD',
    offerStatus: 'draft',
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
  s.loads.push(load);
  s.brokerageLoadFinancials.push({
    loadId: id,
    shipperChargeMinor: quote.freightChargeMinor,
    carrierLinehaulMinor: carrierPayEstimate,
    carrierFuelSurchargeMinor: 0,
    carrierAccessorialMinor: 0,
    totalCarrierPayMinor: carrierPayEstimate,
    confirmedShipperChargeMinor: quote.freightChargeMinor,
    confirmedCarrierPayMinor: 0,
    currency: 'USD',
    version: 1,
    updatedAt: new Date().toISOString(),
  });
  return id;
}

export function sendCarrierOffer(
  loadId: string,
  carrierNetworkProfileId: string,
  carrierPayMinor: number,
  staffId: string,
): CarrierOffer | undefined {
  let created!: CarrierOffer;
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    const profile = s.carrierNetworkProfiles.find((c) => c.id === carrierNetworkProfileId);
    if (!load || !profile) return s;
    const id = uid();
    const offer: CarrierOffer = {
      id,
      loadId,
      carrierNetworkProfileId,
      carrierOrganizationId: profile.organizationId,
      status: 'sent',
      carrierPayMinor,
      currency: 'USD',
      currentRevision: 1,
      revisions: [{ id: uid(), offerId: id, version: 1, carrierPayMinor, createdAt: new Date().toISOString(), createdByStaffId: staffId }],
      sentAt: new Date().toISOString(),
      createdByStaffId: staffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    s.carrierOffers.push(offer);
    load.brokerageCoverageStatus = 'carrier_offered';
    s.coverageHistory.push({
      id: uid(),
      loadId,
      kind: 'offer_sent',
      carrierNetworkProfileId,
      carrierOfferId: id,
      summary: `Offer sent to ${profile.legalName}`,
      actorStaffId: staffId,
      createdAt: new Date().toISOString(),
    });
    created = offer;
    return s;
  });
  return created;
}

export function respondCarrierOffer(offerId: string, accept: boolean, orgId?: string): void {
  updateDemoStore((s) => {
    const offer = s.carrierOffers.find((o) => o.id === offerId);
    if (!offer) return s;
    const profile = s.carrierNetworkProfiles.find((c) => c.id === offer.carrierNetworkProfileId);
    if (orgId && profile?.organizationId && profile.organizationId !== orgId) return s;
    const next = accept ? 'accepted' : 'declined';
    if (!canTransitionOfferStatus(offer.status, next)) return s;
    offer.status = next;
    offer.respondedAt = new Date().toISOString();
    const load = s.loads.find((l) => l.id === offer.loadId);
    if (!load) return s;
    if (accept) {
      load.brokerageCoverageStatus = 'carrier_accepted';
      load.brokerageCarrierNetworkProfileId = offer.carrierNetworkProfileId;
      load.brokerageCarrierOrganizationId = offer.carrierOrganizationId;
      load.organizationId = offer.carrierOrganizationId ?? load.organizationId;
      load.linehaulMinor = offer.carrierPayMinor;
      load.grossMinor = computeGrossMinor(offer.carrierPayMinor, 0, 0);
      load.confirmedGrossMinor = load.grossMinor;
      const fin = s.brokerageLoadFinancials.find((f) => f.loadId === load.id);
      if (fin) {
        fin.carrierLinehaulMinor = offer.carrierPayMinor;
        fin.totalCarrierPayMinor = computeTotalCarrierPay(fin);
        fin.confirmedCarrierPayMinor = offer.carrierPayMinor;
      }
    } else {
      load.brokerageCoverageStatus = 'needs_coverage';
      s.coverageHistory.push({
        id: uid(),
        loadId: load.id,
        kind: 'declined',
        carrierNetworkProfileId: offer.carrierNetworkProfileId,
        carrierOfferId: offer.id,
        summary: 'Carrier declined offer',
        createdAt: new Date().toISOString(),
      });
    }
    return s;
  });
}

export function createShipperInvoiceFromLoad(loadId: string, staffId: string): BrokerageShipperInvoice | undefined {
  let inv!: BrokerageShipperInvoice;
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    const fin = s.brokerageLoadFinancials.find((f) => f.loadId === loadId);
    if (!load || !fin || !isReadyToBill(load, { coverageStatus: load.brokerageCoverageStatus ?? 'booked' } as never)) return s;
    if (s.brokerageShipperInvoices.some((i) => i.loadId === loadId && i.status !== 'void')) return s;
    s.brokerageCounters.shipperInvoice += 1;
    const total = computeShipperInvoiceTotal(fin.confirmedShipperChargeMinor, 0, 0);
    const invoice: BrokerageShipperInvoice = {
      id: uid(),
      organizationId: load.shipperOrganizationId!,
      loadId,
      shipperOrganizationId: load.shipperOrganizationId!,
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
    s.activity.unshift({
      id: uid(),
      kind: 'SHIPPER_INVOICE_CREATED',
      title: `Brokerage shipper invoice ${invoice.invoiceNumber}`,
      clientId: load.shipperOrganizationId,
      createdAt: invoice.createdAt,
      visibility: 'internal',
    });
    void staffId;
    inv = invoice;
    return s;
  });
  return inv;
}

export function getLoadFinancials(loadId: string, store: DemoStore = loadDemoStore()) {
  const fin = store.brokerageLoadFinancials.find((f) => f.loadId === loadId);
  if (!fin) return undefined;
  return {
    ...fin,
    grossMarginMinor: computeBrokerageGrossMargin(fin.confirmedShipperChargeMinor, fin.confirmedCarrierPayMinor),
  };
}

export function getShipperRequests(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.shipmentRequests.filter((r) => r.shipperOrganizationId === orgId);
}

export function getShipperQuotes(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.brokerageFreightQuotes.filter((q) => q.shipperOrganizationId === orgId);
}

export function getCarrierOffers(orgId: string, store: DemoStore = loadDemoStore()) {
  const profileIds = store.carrierNetworkProfiles.filter((p) => p.organizationId === orgId).map((p) => p.id);
  return store.carrierOffers.filter((o) => profileIds.includes(o.carrierNetworkProfileId) || o.carrierOrganizationId === orgId);
}

export function getCarrierPayablesFromStore(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.carrierPayables.filter((p) => p.carrierOrganizationId === orgId);
}
