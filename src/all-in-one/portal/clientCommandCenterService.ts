import { formatMoney } from '../billing/money';
import { daysUntil, formatDaysRemaining } from '../calendar/calendarService';
import { getBillingSummary } from '../demo/billingActions';
import { getPortalRequests } from '../demo/demoActions';
import { getDispatchMetrics, getEnrollment, getLoads } from '../demo/dispatchActions';
import { getFactoringProfile, getReadyLoads, getSubmissions } from '../demo/factoringActions';
import { getActivePolicy, getPoliciesForOrg, getRequestsForOrg as getInsuranceRequests } from '../demo/insuranceActions';
import {
  getFleetUnits,
  getRoadReadySummary,
  getTrailers,
} from '../demo/roadReadyActions';
import {
  getCalendarEvents,
  getPortalNotifications,
  getRenewals,
  getVaultDocuments,
} from '../demo/vaultActions';
import { getCarrierPayablesFromStore } from '../demo/brokerageActions';
import {
  conversationContextLabel,
  getCustomerUnreadCount,
  getOrgConversations,
} from '../demo/communicationActions';
import type { DemoStore } from '../demo/demoTypes';
import { ROAD_READY_PRODUCT_NAME } from '../road-ready/roadReadyConfig';
import { aioPaths } from '../utils/paths';
import {
  aggregateAttentionItems,
  type RawAttentionCandidate,
} from './clientAttentionEngine';
import { selectNextAction } from './clientNextActionEngine';
import type {
  ActiveServiceView,
  BusinessHealthView,
  BusinessStatusTone,
  ClientCommandCenterView,
  CommunicationSummaryView,
  CurrentLoadHeroView,
  DocumentSummaryView,
  FleetSummaryView,
  MoneySummaryView,
  OperationsSummaryView,
  OrganizationMemberView,
  PortalContext,
  QuickActionView,
  RoadReadySummaryView,
  TodayItemView,
  UpcomingItemView,
} from './clientCommandCenterTypes';
import { clientTypeLabel, formatCustomerStatus, greetingForHour } from './customerStatusLanguage';
import { resolvePortalContext } from './organizationContext';
import { getPortalWorkflowActions } from '../demo/workflowActions';

function priorityFromDays(days: number): RawAttentionCandidate['priority'] {
  if (days < 0) return 'urgent';
  if (days <= 7) return 'urgent';
  if (days <= 18) return 'high';
  if (days <= 30) return 'normal';
  return 'low';
}

function collectAttentionCandidates(
  ctx: PortalContext,
  store: DemoStore,
): RawAttentionCandidate[] {
  const orgId = ctx.organizationId;
  const out: RawAttentionCandidate[] = [];

  if (ctx.isShipper) {
    const pendingQuotes = store.brokerageFreightQuotes.filter(
      (q) => q.shipperOrganizationId === orgId && ['sent', 'viewed'].includes(q.status),
    );
    for (const q of pendingQuotes) {
      out.push({
        dedupeKey: `shipper-quote:${q.id}`,
        category: 'brokerage',
        priority: 'high',
        title: 'Review freight quote',
        explanation: `${q.quoteNumber ?? 'Quote'} is awaiting your review.`,
        statusLabel: 'QUOTE AWAITING ACCEPTANCE',
        ctaLabel: 'REVIEW QUOTE',
        ctaHref: aioPaths.shipperQuote(q.id),
        sortScore: 280,
        entityType: 'quote',
        entityId: q.id,
      });
    }
    return out;
  }

  const rr = getRoadReadySummary(orgId);
  if (rr) {
    for (const item of rr.attention.slice(0, 8)) {
      const pri: RawAttentionCandidate['priority'] = item.priority >= 90 ? 'urgent' : item.priority >= 70 ? 'high' : 'normal';
      out.push({
        dedupeKey: `rr:${item.itemId}`,
        category: 'road_ready',
        priority: pri,
        title: item.title,
        explanation: item.reason ?? 'Road Ready item needs your attention.',
        statusLabel: 'ACTION NEEDED',
        ctaLabel: 'VIEW ROAD READY',
        ctaHref: aioPaths.roadReady,
        affectedAreas: [ROAD_READY_PRODUCT_NAME],
        sortScore: item.priority,
        entityType: 'road_ready_item',
        entityId: item.itemId,
      });
    }
  }

  const docs = getVaultDocuments(orgId, store);
  for (const doc of docs.filter((d) => d.status === 'requested')) {
    out.push({
      dedupeKey: `doc-needed:${doc.id}`,
      category: 'documents',
      priority: 'high',
      title: `Upload ${doc.title}`,
      explanation: 'All In One is waiting for this document.',
      statusLabel: 'DOCUMENT NEEDED',
      ctaLabel: 'UPLOAD DOCUMENT',
      ctaHref: aioPaths.portalVaultDocument(doc.id),
      affectedAreas: ['Documents', 'Road Ready'],
      sortScore: 350,
      entityType: 'document',
      entityId: doc.id,
    });
  }

  for (const doc of docs.filter((d) => d.expiresAt && d.isCurrent)) {
    const exp = doc.expiresAt!.slice(0, 10);
    const days = daysUntil(exp);
    if (days > 45) continue;
    const pri = priorityFromDays(days);
    out.push({
      dedupeKey: `doc-expiry:${doc.id}`,
      category: 'documents',
      priority: pri,
      title: `${doc.title} expiring`,
      explanation: `Document expires ${formatDaysRemaining(exp).toLowerCase()}.`,
      statusLabel: days < 0 ? 'EXPIRED' : 'EXPIRING SOON',
      deadline: exp,
      deadlineLabel: formatDaysRemaining(exp),
      ctaLabel: 'REVIEW DOCUMENT',
      ctaHref: aioPaths.portalVaultDocument(doc.id),
      affectedAreas: ['Documents', 'Compliance Calendar'],
      sortScore: days <= 7 ? 480 : 220,
      entityType: 'document',
      entityId: doc.id,
    });
  }

  for (const r of getRenewals(orgId, store).filter((x) => !['completed', 'declined', 'not_applicable'].includes(x.status))) {
    const days = daysUntil(r.expirationDate);
    if (days > 60) continue;
    const dedupe = r.category?.toLowerCase().includes('insurance') || r.title.toLowerCase().includes('insurance')
      ? `insurance-expiry:${orgId}:${r.expirationDate}`
      : `renewal:${r.id}`;
    out.push({
      dedupeKey: dedupe,
      category: 'renewals',
      priority: priorityFromDays(days),
      title: r.title,
      explanation: `Renewal ${formatDaysRemaining(r.expirationDate).toLowerCase()}.`,
      statusLabel: formatCustomerStatus(r.status),
      deadline: r.expirationDate,
      deadlineLabel: formatDaysRemaining(r.expirationDate),
      ctaLabel: 'START RENEWAL',
      ctaHref: aioPaths.portalRenewals,
      affectedAreas: ['Renewals', 'Compliance Calendar'],
      sortScore: days <= 7 ? 460 : 210,
      entityType: 'renewal',
      entityId: r.id,
    });
  }

  const policy = getActivePolicy(orgId, store);
  if (policy?.expirationDate) {
    const days = daysUntil(policy.expirationDate);
    if (days <= 45) {
      out.push({
        dedupeKey: `insurance-expiry:${orgId}:${policy.expirationDate}`,
        category: 'insurance',
        priority: priorityFromDays(days),
        title: days <= 7 ? 'Insurance expiring soon' : 'Insurance renewal approaching',
        explanation: `Policy with ${policy.carrierName} ${formatDaysRemaining(policy.expirationDate).toLowerCase()}.`,
        statusLabel: policy.status === 'expiring_soon' ? 'EXPIRING SOON' : formatCustomerStatus(policy.status),
        deadline: policy.expirationDate,
        deadlineLabel: formatDaysRemaining(policy.expirationDate),
        ctaLabel: 'REVIEW INSURANCE',
        ctaHref: aioPaths.portalInsurancePolicy(policy.id),
        affectedAreas: ['Insurance', 'Road Ready', 'Renewals'],
        sortScore: days <= 7 ? 490 : 240,
        entityType: 'policy',
        entityId: policy.id,
      });
    }
  } else if (!getPoliciesForOrg(orgId, store).length) {
    const insReq = getInsuranceRequests(orgId, store).find((r) => !['completed', 'cancelled', 'declined'].includes(r.status));
    if (insReq) {
      out.push({
        dedupeKey: `insurance-request:${insReq.id}`,
        category: 'insurance',
        priority: 'normal',
        title: 'Insurance request in progress',
        explanation: 'Your insurance assistance request is being coordinated.',
        statusLabel: formatCustomerStatus(insReq.status),
        ctaLabel: 'VIEW REQUEST',
        ctaHref: aioPaths.portalInsuranceRequestDetail(insReq.id),
        sortScore: 200,
        entityType: 'insurance_request',
        entityId: insReq.id,
      });
    } else {
      out.push({
        dedupeKey: `insurance-missing:${orgId}`,
        category: 'insurance',
        priority: 'high',
        title: 'Add insurance information',
        explanation: 'Commercial insurance information helps Road Ready and operations.',
        statusLabel: 'INFORMATION NEEDED',
        ctaLabel: 'REQUEST INSURANCE HELP',
        ctaHref: aioPaths.portalInsuranceRequest,
        affectedAreas: ['Insurance', 'Road Ready'],
        sortScore: 320,
      });
    }
  }

  const loads = getLoads(orgId, store);
  for (const load of loads) {
    if (load.operationalStatus === 'pod_needed' && !load.podDocumentId) {
      out.push({
        dedupeKey: `load-pod:${load.id}`,
        category: 'dispatch',
        priority: 'urgent',
        title: 'Submit proof of delivery',
        explanation: `${load.loadNumber}: delivery documentation needed.`,
        statusLabel: 'POD NEEDED',
        ctaLabel: 'SUBMIT POD',
        ctaHref: aioPaths.portalDispatchLoad(load.id),
        sortScore: 520,
        entityType: 'load',
        entityId: load.id,
      });
    }
    if (load.offerStatus === 'awaiting_carrier') {
      out.push({
        dedupeKey: `load-offer:${load.id}`,
        category: 'dispatch',
        priority: 'high',
        title: 'Review load offer',
        explanation: `${load.originCity} → ${load.destinationCity} requires your response.`,
        statusLabel: 'OFFER AWAITING RESPONSE',
        ctaLabel: 'VIEW LOAD',
        ctaHref: aioPaths.portalDispatchLoad(load.id),
        sortScore: 340,
        entityType: 'load',
        entityId: load.id,
      });
    }
    if (load.factoringHandoffStatus === 'ready') {
      out.push({
        dedupeKey: `factoring-ready:${load.id}`,
        category: 'factoring',
        priority: 'normal',
        title: 'Ready for factoring review',
        explanation: `${load.loadNumber} may be submitted for factoring assistance.`,
        statusLabel: 'READY FOR FACTORING',
        ctaLabel: 'START FACTORING REVIEW',
        ctaHref: aioPaths.portalFactoringReady,
        affectedAreas: ['Factoring', 'Operations'],
        sortScore: 230,
        entityType: 'load',
        entityId: load.id,
      });
    }
  }

  for (const sub of getSubmissions(orgId, store).filter((s) => s.status === 'documents_needed')) {
    out.push({
      dedupeKey: `factoring-doc:${sub.id}`,
      category: 'factoring',
      priority: 'high',
      title: 'Complete factoring package',
      explanation: 'Additional documents are needed for your factoring submission.',
      statusLabel: 'DOCUMENT NEEDED',
      ctaLabel: 'VIEW SUBMISSION',
      ctaHref: aioPaths.portalFactoringSubmission(sub.id),
      sortScore: 360,
      entityType: 'factoring_submission',
      entityId: sub.id,
    });
  }

  if (ctx.canViewBilling) {
    const billing = getBillingSummary(orgId, store);
    for (const inv of billing.openInvoices) {
      const days = inv.dueAt ? daysUntil(inv.dueAt.slice(0, 10)) : 30;
      if (days > 14) continue;
      out.push({
        dedupeKey: `invoice:${inv.id}`,
        category: 'billing',
        priority: days < 0 ? 'high' : 'normal',
        title: days < 0 ? 'Invoice past due' : 'Invoice due soon',
        explanation: `${inv.invoiceNumber} — ${formatMoney(inv.balanceDueMinor)} due.`,
        statusLabel: formatCustomerStatus(inv.status),
        deadline: inv.dueAt?.slice(0, 10),
        deadlineLabel: inv.dueAt ? formatDaysRemaining(inv.dueAt.slice(0, 10)) : undefined,
        ctaLabel: 'REVIEW INVOICE',
        ctaHref: aioPaths.portalInvoice(inv.id),
        sortScore: days < 0 ? 300 : 180,
        entityType: 'invoice',
        entityId: inv.id,
      });
    }
  }

  for (const req of getPortalRequests(orgId).filter((r) => r.status === 'documents_needed')) {
    out.push({
      dedupeKey: `service-request:${req.id}`,
      category: 'services',
      priority: 'high',
      title: 'Service request needs information',
      explanation: `${req.requestNumber} is waiting on you.`,
      statusLabel: 'WAITING ON YOU',
      ctaLabel: 'VIEW REQUEST',
      ctaHref: aioPaths.portalRequest(req.id),
      sortScore: 400,
      entityType: 'service_request',
      entityId: req.id,
    });
  }

  const profile = getFactoringProfile(orgId, store);
  if (profile?.enrollmentStatus === 'interested' && !getSubmissions(orgId, store).length) {
    out.push({
      dedupeKey: `factoring-explore:${orgId}`,
      category: 'services',
      priority: 'low',
      title: 'Explore factoring assistance',
      explanation: 'Optional — learn how factoring assistance may help your receivables.',
      statusLabel: 'AVAILABLE',
      ctaLabel: 'LEARN MORE',
      ctaHref: aioPaths.portalFactoring,
      sortScore: 50,
    });
  }

  for (const action of getPortalWorkflowActions(orgId, store)) {
    out.push({
      dedupeKey: action.dedupeKey,
      category: 'services',
      priority: action.priority,
      title: action.title,
      explanation: action.description,
      statusLabel: 'WORKFLOW ACTION',
      ctaLabel: action.ctaLabel,
      ctaHref: action.ctaHref,
      sortScore: action.priority === 'urgent' ? 420 : action.priority === 'high' ? 380 : 300,
      entityType: 'workflow_step',
    });
  }

  return out;
}

function buildRoadReadySummary(orgId: string): RoadReadySummaryView | undefined {
  const rr = getRoadReadySummary(orgId);
  if (!rr) return undefined;
  const next = rr.attention[0];
  return {
    setupProgress: rr.scores.setupProgress,
    verifiedProgress: rr.scores.verifiedProgress,
    attentionCount: rr.scores.needsAttentionCount,
    nextActionTitle: next?.title,
    ctaHref: aioPaths.roadReady,
  };
}

function buildFleetSummary(orgId: string, store: DemoStore): FleetSummaryView {
  const units = getFleetUnits(orgId, store).filter((u) => u.status !== 'inactive');
  const trailers = getTrailers(orgId, store);
  const drivers = store.drivers.filter((d) => d.organizationId === orgId && d.status !== 'inactive');
  const trucks = store.truckProfiles.filter((t) => t.organizationId === orgId);
  const policy = getActivePolicy(orgId, store);

  const vehicles = units.slice(0, 4).map((u) => {
    const truck = trucks.find((t) => t.powerUnitId === u.id);
    const needsAttention = u.readiness === 'needs_attention' || u.readiness === 'incomplete';
    return {
      id: u.id,
      label: u.nickname,
      subtitle: [u.year, u.make, u.model].filter(Boolean).join(' '),
      roadReadyTone: needsAttention ? ('needed' as const) : ('complete' as const),
      roadReadyLabel: needsAttention ? 'Attention Needed' : 'Ready',
      dispatchLabel: truck?.availability === 'in_transit' ? 'In Transit' : truck?.availability === 'available' ? 'Available' : undefined,
      insuranceLabel: policy ? 'Active' : 'Review',
      registrationLabel: undefined,
      href: aioPaths.portalVehicle(u.id),
    };
  });

  return {
    activePowerUnits: units.length,
    trailers: trailers.length,
    drivers: drivers.length,
    unitsNeedingAttention: units.filter((u) => u.readiness === 'needs_attention' || u.readiness === 'incomplete').length,
    availableTrucks: trucks.filter((t) => t.availability === 'available').length,
    inTransit: trucks.filter((t) => t.availability === 'in_transit').length,
    vehicles,
  };
}

function buildOperationsSummary(orgId: string, store: DemoStore): OperationsSummaryView {
  const enrollment = getEnrollment(orgId, store);
  const loads = getLoads(orgId, store).filter((l) => !['complete', 'cancelled'].includes(l.operationalStatus));
  const metrics = getDispatchMetrics(orgId, store);
  const activeLoad = loads.find((l) => ['in_transit', 'loaded', 'pod_needed'].includes(l.operationalStatus))
    ?? loads[0];

  let currentLoad: CurrentLoadHeroView | undefined;
  if (activeLoad) {
    currentLoad = {
      id: activeLoad.id,
      origin: `${activeLoad.originCity}, ${activeLoad.originState}`,
      destination: `${activeLoad.destinationCity}, ${activeLoad.destinationState}`,
      statusLabel: formatCustomerStatus(activeLoad.operationalStatus),
      deliveryLabel: activeLoad.deliveryDate ?? 'Scheduled',
      nextActionLabel: activeLoad.operationalStatus === 'pod_needed' ? 'Submit POD' : 'View load details',
      bolComplete: Boolean(activeLoad.bolDocumentId),
      podComplete: Boolean(activeLoad.podDocumentId),
      href: aioPaths.portalDispatchLoad(activeLoad.id),
    };
  }

  return {
    hasDispatch: Boolean(enrollment?.status === 'active' || loads.length > 0),
    activeLoadCount: metrics.activeLoads,
    loadsNeedingAttention: loads.filter((l) => l.operationalStatus === 'pod_needed' || l.offerStatus === 'awaiting_carrier').length,
    currentLoad,
    recentDeliveries: getLoads(orgId, store).filter((l) => l.operationalStatus === 'complete').length,
    documentsNeeded: loads.filter((l) => l.operationalStatus === 'pod_needed' && !l.podDocumentId).length,
    factoringHandoffReady: loads.filter((l) => l.factoringHandoffStatus === 'ready').length,
  };
}

function buildMoneySummary(ctx: PortalContext, orgId: string, store: DemoStore): MoneySummaryView | undefined {
  if (!ctx.canViewFullMoney && ctx.memberRole === 'driver') return undefined;

  const view: MoneySummaryView = {
    showAioBilling: ctx.canViewBilling,
    showFreightReceivables: ctx.canViewFullMoney,
    showBrokeragePayables: ctx.canViewFullMoney,
    showFactoring: ctx.canViewFullMoney,
  };

  if (ctx.canViewBilling) {
    const billing = getBillingSummary(orgId, store);
    view.aioBalanceDueMinor = billing.balanceDueMinor;
  }

  if (ctx.canViewFullMoney) {
    const ready = getReadyLoads(orgId, store).filter((r) => r.readiness.state === 'ready' || r.readiness.state === 'submitted');
    view.freightReceivablesInProcessMinor = ready.reduce((s, r) => s + (r.freightInvoice?.amountMinor ?? r.load.confirmedGrossMinor ?? 0), 0);

    const payables = getCarrierPayablesFromStore(orgId, store);
    view.brokeragePayablesMinor = payables.filter((p) => p.status !== 'paid_future' && p.status !== 'cancelled').reduce((s, p) => s + p.totalPayableMinor, 0);

    const subs = getSubmissions(orgId, store).filter((x) => ['submitted', 'provider_review', 'funded'].includes(x.status));
    view.factoringInProcessMinor = subs.reduce((s, x) => s + (x.submittedAmountMinor ?? 0), 0);
  }

  return view;
}

function buildDocumentSummary(orgId: string, store: DemoStore): DocumentSummaryView {
  const docs = getVaultDocuments(orgId, store);
  const needed = docs.filter((d) => d.status === 'requested');
  const underReview = docs.filter((d) => ['uploaded', 'under_review'].includes(d.status));
  const verified = docs.filter((d) => d.verificationStatus === 'verified' && d.isCurrent);
  const expiring = docs.filter((d) => d.expiresAt && d.isCurrent && daysUntil(d.expiresAt.slice(0, 10)) <= 45);

  return {
    needed: needed.length,
    underReview: underReview.length,
    verified: verified.length,
    expiring: expiring.length,
    recentCount: docs.filter((d) => d.status !== 'archived').slice(0, 5).length,
    requestedItems: needed.slice(0, 6).map((d) => ({
      id: d.id,
      title: d.title,
      neededFor: ['Road Ready', d.category].filter(Boolean),
      href: aioPaths.portalVaultDocument(d.id),
    })),
  };
}

function buildCommunicationSummary(orgId: string, store: DemoStore): CommunicationSummaryView {
  const notifs = getPortalNotifications(orgId, store);
  const unread = notifs.filter((n) => !n.read);
  const unreadMsgs = getCustomerUnreadCount(orgId, store);

  const threads = getOrgConversations(orgId, store)
    .filter((c) => !['closed', 'archived'].includes(c.status))
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      title: c.subject,
      context: conversationContextLabel(c, store),
      href: aioPaths.portalMessage(c.id),
    }));

  return {
    unreadMessages: unreadMsgs,
    unreadNotifications: unread.length,
    urgentNotifications: unread.filter((n) => n.category === 'documents' || n.eventType.includes('EXPIR')).length,
    documentRequests: unread.filter((n) => n.eventType.includes('DOCUMENT')).length,
    recentThreads: threads,
  };
}

function buildActiveServices(orgId: string, store: DemoStore, ctx: PortalContext): ActiveServiceView[] {
  if (ctx.isShipper) {
    return [
      { id: 'brokerage', name: 'Freight Brokerage', statusLabel: 'ACTIVE', tone: 'active', href: aioPaths.shipperShipments },
      { id: 'billing', name: 'Freight Billing', statusLabel: 'ACTIVE', tone: 'active', href: aioPaths.shipperBilling },
    ];
  }

  const client = store.clients.find((c) => c.id === orgId);
  const services: ActiveServiceView[] = [
    { id: 'permitting', name: 'Permitting & Compliance', statusLabel: 'ACTIVE', tone: 'active', href: aioPaths.servicePlan },
  ];

  const dispatch = getEnrollment(orgId, store);
  services.push({
    id: 'dispatch',
    name: 'Dispatch',
    statusLabel: dispatch?.status === 'active' ? 'ACTIVE' : 'AVAILABLE',
    tone: dispatch?.status === 'active' ? 'active' : 'available',
    href: aioPaths.portalDispatch,
  });

  const insReq = getInsuranceRequests(orgId, store).find((r) => !['completed', 'cancelled'].includes(r.status));
  const policy = getActivePolicy(orgId, store);
  services.push({
    id: 'insurance',
    name: 'Insurance Assistance',
    statusLabel: policy ? 'ACTIVE' : insReq ? 'REQUEST IN PROGRESS' : 'AVAILABLE',
    tone: policy ? 'active' : insReq ? 'progress' : 'available',
    href: aioPaths.portalInsurance,
  });

  const factoring = getFactoringProfile(orgId, store);
  services.push({
    id: 'factoring',
    name: 'Factoring',
    statusLabel: factoring?.enrollmentStatus === 'active' || factoring?.enrollmentStatus === 'approved' ? 'EXTERNAL PROVIDER / ACTIVE' : factoring?.enrollmentStatus === 'interested' ? 'REQUEST IN PROGRESS' : 'AVAILABLE',
    tone: factoring?.enrollmentStatus === 'active' || factoring?.enrollmentStatus === 'approved' ? 'active' : factoring?.enrollmentStatus === 'interested' ? 'progress' : 'available',
    href: aioPaths.portalFactoring,
  });

  const network = store.carrierNetworkProfiles.find((p) => p.organizationId === orgId);
  services.push({
    id: 'brokerage',
    name: 'Brokerage Carrier Network',
    statusLabel: network ? 'ACTIVE' : 'AVAILABLE',
    tone: network ? 'active' : 'available',
    href: aioPaths.portalBrokerage,
  });

  void client;
  return services;
}

function buildQuickActions(ctx: PortalContext): QuickActionView[] {
  if (ctx.isShipper) {
    return [
      { id: 'shipment', label: 'New Shipment Request', href: aioPaths.shipperShipmentNew },
      { id: 'quotes', label: 'Review Quotes', href: aioPaths.shipperQuotes },
      { id: 'messages', label: 'Messages', href: aioPaths.portalCommunication },
    ];
  }

  const actions: QuickActionView[] = [
    { id: 'upload', label: 'Upload Document', href: aioPaths.portalDocuments },
    { id: 'service', label: 'Request Service', href: aioPaths.servicePlan },
    { id: 'coi', label: 'Request COI', href: aioPaths.portalInsuranceCertificateNew },
    { id: 'renewal', label: 'Start Renewal', href: aioPaths.portalRenewals },
    { id: 'message', label: 'Message All In One', href: aioPaths.portalCommunication },
  ];

  if (ctx.memberRole !== 'driver') {
    actions.splice(2, 0, { id: 'vehicle', label: 'Add Vehicle', href: aioPaths.portalOnboarding });
  }

  if (['owner', 'admin', 'operations'].includes(ctx.memberRole)) {
    actions.push({ id: 'dispatch', label: 'Mark Truck Available', href: aioPaths.portalDispatch });
    actions.push({ id: 'pod', label: 'Submit POD', href: aioPaths.portalDispatchLoads });
  }

  return actions;
}

function buildBusinessStatus(attentionCount: number): { tone: BusinessStatusTone; label: string; detail: string } {
  if (attentionCount === 0) return { tone: 'good', label: 'GOOD', detail: 'No currently tracked items require action.' };
  if (attentionCount <= 2) return { tone: 'attention', label: `${attentionCount} ITEM${attentionCount === 1 ? '' : 'S'} NEED ATTENTION`, detail: 'Review the items below when you can.' };
  return { tone: 'review', label: 'REVIEW NEEDED', detail: `${attentionCount} items need your attention.` };
}

export function getClientCommandCenterView(
  store: DemoStore,
  portalKind: 'carrier' | 'shipper' = 'carrier',
  options?: { moduleErrors?: Partial<Record<string, string>> },
): ClientCommandCenterView {
  const ctx = resolvePortalContext(store, portalKind);
  const orgId = ctx.organizationId;
  const hour = new Date().getHours();
  const firstName = ctx.contactName?.split(' ')[0];
  const greeting = `${greetingForHour(hour)}${firstName ? `, ${firstName}` : ''}.`;

  const candidates = collectAttentionCandidates(ctx, store);
  const attentionItems = aggregateAttentionItems(candidates);
  const nextAction = selectNextAction(candidates, attentionItems);
  const allCaughtUp = attentionItems.length === 0;

  const calendar = getCalendarEvents(orgId, store).filter((e) => !e.complete);
  const upcoming: UpcomingItemView[] = calendar
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 8)
    .map((e) => ({
      id: e.id,
      title: e.title,
      dueDate: e.dueDate,
      daysLabel: formatDaysRemaining(e.dueDate),
      category: e.category?.includes('insurance') ? 'insurance' : e.deadlineType === 'renewal_window' || e.deadlineType === 'insurance_renewal' ? 'renewals' : 'documents',
      href: aioPaths.portalCalendar,
    }));

  const todayStr = new Date().toISOString().slice(0, 10);
  const today: TodayItemView[] = [];
  const loads = getLoads(orgId, store);
  for (const l of loads) {
    if (l.pickupDate === todayStr) {
      today.push({ id: `today-pickup-${l.id}`, title: `Pickup — ${l.loadNumber}`, category: 'dispatch', href: aioPaths.portalDispatchLoad(l.id) });
    }
    if (l.deliveryDate === todayStr) {
      today.push({ id: `today-delivery-${l.id}`, title: `Delivery — ${l.loadNumber}`, category: 'dispatch', href: aioPaths.portalDispatchLoad(l.id) });
    }
  }

  const roadReady = ctx.isShipper ? undefined : buildRoadReadySummary(orgId);
  const documents = buildDocumentSummary(orgId, store);
  const communication = buildCommunicationSummary(orgId, store);
  const businessHealth: BusinessHealthView = {
    roadReady,
    documents: { verified: documents.verified, needsAttention: documents.needed + documents.expiring },
    renewalsUpcoming: getRenewals(orgId, store).filter((r) => daysUntil(r.expirationDate) <= 60 && r.status !== 'completed').length,
    insuranceStatus: getActivePolicy(orgId, store)?.status,
    fleet: ctx.isShipper ? undefined : { active: getFleetUnits(orgId, store).length, needsAttention: buildFleetSummary(orgId, store).unitsNeedingAttention },
    billing: ctx.canViewBilling ? { balanceDueMinor: getBillingSummary(orgId, store).balanceDueMinor, openInvoices: getBillingSummary(orgId, store).openInvoices.length } : undefined,
  };

  let fleet: FleetSummaryView | undefined;
  let operations: OperationsSummaryView | undefined;
  let money: MoneySummaryView | undefined;

  const moduleErrors: Partial<Record<string, string>> = { ...(options?.moduleErrors ?? {}) };

  try {
    if (!ctx.isShipper) fleet = buildFleetSummary(orgId, store);
  } catch {
    moduleErrors.fleet = 'Fleet summary unavailable';
  }
  try {
    if (!ctx.isShipper) operations = buildOperationsSummary(orgId, store);
  } catch {
    moduleErrors.operations = 'Operations summary unavailable';
  }
  try {
    money = buildMoneySummary(ctx, orgId, store);
  } catch {
    moduleErrors.money = 'Money summary unavailable';
  }

  const activeRequestCount = getPortalRequests(orgId).filter((r) => r.status !== 'completed').length;

  return {
    context: ctx,
    greeting,
    businessStatus: buildBusinessStatus(attentionItems.length),
    nextAction,
    attentionItems: attentionItems.slice(0, 12),
    allCaughtUp,
    nextUpcoming: upcoming[0],
    roadReady,
    businessHealth,
    fleet,
    operations,
    money,
    documents,
    communication,
    today,
    upcoming,
    activeServices: buildActiveServices(orgId, store, ctx),
    activeRequestCount,
    notificationDigest: {
      unread: communication.unreadNotifications,
      urgent: communication.urgentNotifications,
      documentRequests: communication.documentRequests,
    },
    quickActions: buildQuickActions(ctx),
    activityPreview: store.activity
      .filter((a) => a.visibility === 'customer' || a.clientId === orgId)
      .slice(0, 8)
      .map((a) => ({ id: a.id, title: a.title, createdAt: a.createdAt })),
    moduleErrors,
  };
}

export function getOrganizationMembers(orgId: string, store: DemoStore): OrganizationMemberView[] {
  return (store.organizationMembers ?? [])
    .filter((m) => m.organizationId === orgId)
    .map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      roleLabel: m.role.charAt(0).toUpperCase() + m.role.slice(1),
      status: m.status,
      lastActivityAt: m.lastActivityAt,
    }));
}

export function clientTypeDisplay(ctx: PortalContext): string {
  return clientTypeLabel(ctx.clientType);
}
