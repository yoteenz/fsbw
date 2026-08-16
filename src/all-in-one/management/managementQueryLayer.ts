import type { DemoStore } from '../demo/demoTypes';
import { getCrmMetrics, getCrmLeads } from '../demo/crmActions';
import { getOfficeDispatchMetrics } from '../demo/dispatchActions';
import { getBrokerageMetrics } from '../demo/brokerageActions';
import { getOfficeFactoringMetrics } from '../demo/factoringActions';
import { getInsuranceMetrics } from '../demo/insuranceActions';
import { getInboxMetrics } from '../demo/communicationActions';
import { getWorkflowHealthCounts } from '../workflow/workflowOrchestrator';
import { computeBrokerageGrossMargin, computeGrossMarginPercent } from '../brokerage/brokerageCalculations';
import { getOutboxMessages } from '../demo/communicationActions';
import { getManagementAttentionItems } from './managementAttentionEngine';
import { getDataQualityCount } from './managementDataQuality';
import { aioPaths } from '../utils/paths';
import { formatComparison, resolveManagementDateRange, isDateInRange } from './managementDateRange';
import { getFinancialSummary, getReceivablesAging } from './managementFinancial';
import type {
  HealthState,
  ManagementDateRange,
  ManagementPeriodId,
  PeriodComparison,
  ReceivablesBucket,
} from './managementTypes';

export interface ExecutiveSnapshot {
  collectedServiceRevenueMinor: number;
  outstandingReceivablesMinor: number;
  activeCustomers: number;
  activeServiceRequests: number;
  openSalesOpportunities: number;
  activeLoads: number;
  managementAttentionCount: number;
  hasIncompleteFinancialData: boolean;
}

export interface SalesFunnelCounts {
  leads: number;
  contacted: number;
  qualified: number;
  opportunities: number;
  quotesSent: number;
  accepted: number;
  converted: number;
  lost: number;
}

export interface BrokerageEconomicsSummary {
  shipperRevenueMinor: number;
  carrierPayMinor: number;
  grossMarginMinor: number;
  grossMarginPercent: number | null;
  completedLoads: number;
}

export interface TeamWorkloadSummary {
  openWorkItems: number;
  dueToday: number;
  overdue: number;
  unassigned: number;
  approvalsWaiting: number;
  handoffsWaiting: number;
  byTeam: { teamId: string; teamName: string; count: number }[];
}

export interface ServiceVolumeSummary {
  newRequests: number;
  active: number;
  waitingCustomer: number;
  waitingExternal: number;
  completed: number;
  cancelled: number;
}

export interface DeadlineWindowCounts {
  overdue: number;
  next7: number;
  next30: number;
  next60: number;
  next90: number;
  later: number;
}

export function resolveRange(
  periodId: ManagementPeriodId = 'month',
  comparePrevious = false,
): ManagementDateRange {
  return resolveManagementDateRange(periodId, new Date(), undefined, undefined, comparePrevious);
}

export function getExecutiveSnapshot(store: DemoStore, range: ManagementDateRange): ExecutiveSnapshot {
  const financial = getFinancialSummary(store, range);
  const activeRequests = store.requests.filter((r) => !['completed', 'cancelled'].includes(r.status));
  const activeCustomers = store.clients.filter((c) =>
    store.requests.some((r) => r.clientId === c.id && !['completed', 'cancelled'].includes(r.status)),
  ).length;
  const opps = (store.crmOpportunities ?? []).filter((o) => o.status === 'open');
  const dispatch = getOfficeDispatchMetrics(store);
  const attention = getManagementAttentionCount(store);

  return {
    collectedServiceRevenueMinor: financial.serviceFeesCollectedMinor,
    outstandingReceivablesMinor: financial.totalOutstandingMinor,
    activeCustomers: activeCustomers || store.clients.length,
    activeServiceRequests: activeRequests.length,
    openSalesOpportunities: opps.length,
    activeLoads: dispatch.activeLoads,
    managementAttentionCount: attention,
    hasIncompleteFinancialData: financial.hasIncompleteAllocation,
  };
}

function getManagementAttentionCount(store: DemoStore): number {
  return getManagementAttentionItems(store).filter((i) => i.severity === 'action' || i.severity === 'urgent').length;
}

export function getSalesFunnel(store: DemoStore, range: ManagementDateRange): SalesFunnelCounts {
  const leads = getCrmLeads(store).filter((l) => isDateInRange(l.createdAt, range));
  const opps = (store.crmOpportunities ?? []).filter((o) => isDateInRange(o.createdAt, range));
  const contacted = leads.filter((l) => !['new'].includes(l.status)).length;
  const qualified = leads.filter((l) => ['qualified', 'converted', 'lost'].includes(l.status)).length;
  const quotesSent = opps.filter((o) =>
    ['cs-quote-sent', 'cs-decision', 'cs-won'].includes(o.pipelineStageId ?? ''),
  ).length;
  const accepted = opps.filter((o) => o.pipelineStageId === 'cs-won' || o.status === 'won').length;
  return {
    leads: leads.length,
    contacted,
    qualified,
    opportunities: opps.filter((o) => o.status === 'open').length,
    quotesSent,
    accepted,
    converted: leads.filter((l) => l.status === 'converted').length,
    lost: leads.filter((l) => l.status === 'lost').length,
  };
}

export function conversionRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

export function getEstimatedPipelineValue(store: DemoStore): number {
  return (store.crmOpportunities ?? [])
    .filter((o) => o.status === 'open')
    .reduce((s, o) => s + (o.estimatedValueMinor ?? 0), 0);
}

export function getBrokerageEconomics(store: DemoStore, range: ManagementDateRange): BrokerageEconomicsSummary {
  const brokerageLoads = store.loads.filter(
    (l) => l.sourceType === 'brokerage' && l.operationalStatus === 'complete',
  );
  let shipperRevenueMinor = 0;
  let carrierPayMinor = 0;
  for (const load of brokerageLoads) {
    const fin = store.brokerageLoadFinancials.find((f) => f.loadId === load.id);
    if (!fin) continue;
    const completedAt = load.updatedAt ?? load.createdAt;
    if (!isDateInRange(completedAt, range)) continue;
    shipperRevenueMinor += fin.confirmedShipperChargeMinor;
    carrierPayMinor += fin.confirmedCarrierPayMinor;
  }
  const grossMarginMinor = computeBrokerageGrossMargin(shipperRevenueMinor, carrierPayMinor);
  return {
    shipperRevenueMinor,
    carrierPayMinor,
    grossMarginMinor,
    grossMarginPercent: computeGrossMarginPercent(shipperRevenueMinor, grossMarginMinor),
    completedLoads: brokerageLoads.length,
  };
}

export function getDispatchSummary(store: DemoStore, range: ManagementDateRange) {
  const dispatch = getOfficeDispatchMetrics(store);
  const dispatchLoads = store.loads.filter((l) => l.sourceType !== 'brokerage');
  const completed = dispatchLoads.filter(
    (l) => l.operationalStatus === 'complete' && isDateInRange(l.updatedAt ?? l.createdAt, range),
  );
  const carrierGrossMinor = completed.reduce((s, l) => s + l.confirmedGrossMinor, 0);
  const dispatchFeesMinor = (store.dispatchBillingEvents ?? [])
    .filter((e) => isDateInRange(e.createdAt, range))
    .reduce((s, e) => s + e.dispatchFeeMinor, 0);
  return {
    ...dispatch,
    loadsCompleted: completed.length,
    carrierGrossRevenueMinor: carrierGrossMinor,
    dispatchServiceFeesMinor: dispatchFeesMinor,
    inTransit: dispatchLoads.filter((l) => l.operationalStatus === 'in_transit').length,
  };
}

export function getFactoringSummary(store: DemoStore) {
  const metrics = getOfficeFactoringMetrics(store);
  const subs = store.factoringSubmissions;
  const faceValueMinor = subs.reduce((s, sub) => s + sub.submittedAmountMinor, 0);
  const fundedMinor = subs
    .filter((sub) => sub.status === 'funded')
    .reduce((s, sub) => s + (sub.reportedAdvanceMinor ?? sub.approvedAmountMinor ?? 0), 0);
  const aioFeesMinor = subs.reduce((s, sub) => s + (sub.reportedFeeMinor ?? 0), 0);
  return { ...metrics, faceValueMinor, fundedMinor, pendingMinor: faceValueMinor - fundedMinor, aioFeesMinor };
}

export function getInsuranceSummary(store: DemoStore) {
  return getInsuranceMetrics(store);
}

export function getCommunicationHealth(store: DemoStore) {
  const inbox = getInboxMetrics(store);
  const appts = store.appointments ?? [];
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...inbox,
    appointmentsToday: appts.filter((a) => a.scheduledStart.startsWith(today) && a.status !== 'cancelled').length,
    appointmentsUpcoming: appts.filter((a) => a.scheduledStart.slice(0, 10) > today && a.status === 'confirmed').length,
    noShows: appts.filter((a) => a.status === 'no_show').length,
    failedDeliveries: getOutboxMessages(store).filter((m) => m.status === 'failed').length,
  };
}

export function getServiceVolume(store: DemoStore, range: ManagementDateRange): ServiceVolumeSummary {
  const inRange = store.requests.filter((r) => isDateInRange(r.createdAt, range));
  return {
    newRequests: inRange.length,
    active: store.requests.filter((r) => !['completed', 'cancelled', 'approved'].includes(r.status)).length,
    waitingCustomer: store.requests.filter((r) => ['information_needed', 'documents_needed'].includes(r.status)).length,
    waitingExternal: store.requests.filter((r) => ['awaiting_agency', 'submitted'].includes(r.status)).length,
    completed: inRange.filter((r) => r.status === 'completed').length,
    cancelled: inRange.filter((r) => r.status === 'cancelled').length,
  };
}

export function getWorkflowPerformance(store: DemoStore) {
  const instances = store.workflowInstances ?? [];
  const health = getWorkflowHealthCounts(store);
  return {
    active: health.active,
    waitingCustomer: health.waitingCustomer,
    waitingStaff: instances.filter((i) => ['waiting_internal', 'ready_for_review'].includes(i.status)).length,
    waitingExternal: health.waitingExternal,
    stalled: health.blocked,
    failedAutomation: health.automationExceptions,
    completed: health.completed,
  };
}

export function getTeamWorkload(store: DemoStore): TeamWorkloadSummary {
  const items = store.officeWorkItems ?? [];
  const open = items.filter((w) => !['completed', 'cancelled'].includes(w.status));
  const now = Date.now();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const dueToday = open.filter((w) => w.dueAt && new Date(w.dueAt).getTime() <= todayEnd.getTime()).length;
  const overdue = open.filter((w) => w.dueAt && new Date(w.dueAt).getTime() < now).length;
  const teams = store.officeTeams ?? [];
  const byTeam = teams.map((t) => ({
    teamId: t.id,
    teamName: t.name,
    count: open.filter((w) => w.assignedTeamId === t.id).length,
  }));
  return {
    openWorkItems: open.length,
    dueToday,
    overdue,
    unassigned: open.filter((w) => !w.assignedUserId).length,
    approvalsWaiting: (store.officeApprovals ?? []).filter((a) => a.status === 'pending').length,
    handoffsWaiting: (store.officeHandoffs ?? []).filter((h) => h.status === 'pending').length,
    byTeam,
  };
}

export function getDeadlineWindows(store: DemoStore): DeadlineWindowCounts {
  const now = startOfDay(new Date());
  const d7 = addDays(now, 7);
  const d30 = addDays(now, 30);
  const d60 = addDays(now, 60);
  const d90 = addDays(now, 90);
  const all: { dueDate: string; status?: string; complete?: boolean }[] = [
    ...store.deadlines.map((d) => ({ dueDate: d.dueDate, complete: d.complete })),
    ...store.renewals.map((r) => ({ dueDate: r.expirationDate, status: r.status })),
  ];
  let overdue = 0;
  let next7 = 0;
  let next30 = 0;
  let next60 = 0;
  let next90 = 0;
  let later = 0;
  for (const item of all) {
    const dueAt = item.dueDate;
    if (!dueAt) continue;
    if (item.complete || item.status === 'completed') continue;
    const due = new Date(dueAt);
    if (due < now) overdue += 1;
    else if (due <= d7) next7 += 1;
    else if (due <= d30) next30 += 1;
    else if (due <= d60) next60 += 1;
    else if (due <= d90) next90 += 1;
    else later += 1;
  }
  return { overdue, next7, next30, next60, next90, later };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function getCustomerSummary(store: DemoStore, range: ManagementDateRange) {
  const newCustomers = store.clients.filter((c) => isDateInRange(c.customerSince, range)).length;
  const withOverdue = store.invoices.filter((i) => i.status === 'past_due').length;
  const waitingOnUs = store.requests.filter((r) => ['in_progress', 'under_review', 'submitted'].includes(r.status)).length;
  const waitingOnCustomer = store.requests.filter((r) => ['information_needed', 'documents_needed'].includes(r.status)).length;
  const renewalsUpcoming = store.renewals.filter((r) => r.status !== 'completed').length;
  return {
    total: store.clients.length,
    newCustomers,
    withOverdueBalances: new Set(store.invoices.filter((i) => i.status === 'past_due').map((i) => i.organizationId)).size,
    overdueInvoices: withOverdue,
    waitingOnUs,
    waitingOnCustomer,
    renewalsUpcoming,
  };
}

export function compareFinancialMetric(
  store: DemoStore,
  range: ManagementDateRange,
  field: keyof ReturnType<typeof getFinancialSummary>,
): PeriodComparison {
  const current = getFinancialSummary(store, range)[field] as number;
  if (!range.previousStart || !range.previousEnd) {
    return { current, previous: null, changePct: null, label: 'No prior data' };
  }
  const prevRange: ManagementDateRange = {
    ...range,
    start: range.previousStart,
    end: range.previousEnd,
    comparePrevious: false,
  };
  const previous = getFinancialSummary(store, prevRange)[field] as number;
  const changePct = previous === 0 ? null : ((current - previous) / previous) * 100;
  return {
    current,
    previous,
    changePct,
    label: formatComparison(current, previous),
  };
}

export function getReceivableDetail(store: DemoStore, bucket?: ReceivablesBucket) {
  const aging = getReceivablesAging(store, bucket);
  const invoiceIds = bucket ? aging[0]?.invoiceIds ?? [] : aging.flatMap((r) => r.invoiceIds);
  return invoiceIds.map((id) => {
    const inv = store.invoices.find((i) => i.id === id)!;
    const client = store.clients.find((c) => c.id === inv.organizationId);
    const due = inv.dueAt ? new Date(inv.dueAt) : null;
    const days = due ? Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000)) : 0;
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customer: client?.companyName ?? 'Unknown',
      originalMinor: inv.totalMinor,
      outstandingMinor: inv.balanceDueMinor,
      serviceMinor: inv.subtotalServiceFeesMinor,
      passThroughMinor: inv.subtotalExternalFeesMinor + inv.taxTotalMinor,
      dueAt: inv.dueAt,
      daysOutstanding: days,
      status: inv.status,
      href: aioPaths.officeInvoice(inv.id),
    };
  });
}

export function getCrmMetricsForManagement(store: DemoStore) {
  return getCrmMetrics(store);
}

export function getBrokerageMetricsForManagement(store: DemoStore) {
  return getBrokerageMetrics(store);
}

export type AreaHealth = { area: string; state: HealthState; detail: string };

export function getBusinessHealthAreas(store: DemoStore, range: ManagementDateRange): AreaHealth[] {
  const financial = getFinancialSummary(store, range);
  const crm = getCrmMetrics(store);
  const comm = getInboxMetrics(store);
  const dq = getDataQualityCount(store);
  const deadlines = getDeadlineWindows(store);

  return [
    {
      area: 'Financial',
      state: financial.hasIncompleteAllocation ? 'action_needed' : financial.totalOutstandingMinor > 500000 ? 'watch' : 'on_track',
      detail: financial.hasIncompleteAllocation ? 'Incomplete payment allocation' : 'Receivables monitored',
    },
    {
      area: 'Sales',
      state: crm.overdueFollowUp > 3 ? 'action_needed' : crm.overdueFollowUp > 0 ? 'watch' : 'on_track',
      detail: `${crm.overdueFollowUp} overdue follow-ups`,
    },
    {
      area: 'Operations',
      state: getWorkflowPerformance(store).stalled > 2 ? 'action_needed' : 'on_track',
      detail: `${getServiceVolume(store, range).active} active service requests`,
    },
    {
      area: 'Customer Response',
      state: comm.needsReply > 5 ? 'action_needed' : comm.needsReply > 0 ? 'watch' : 'on_track',
      detail: `${comm.needsReply} conversations need reply`,
    },
    {
      area: 'Deadlines',
      state: deadlines.overdue > 0 ? 'action_needed' : deadlines.next7 > 5 ? 'watch' : 'on_track',
      detail: `${deadlines.overdue} overdue · ${deadlines.next7} in 7 days`,
    },
    {
      area: 'Data Quality',
      state: dq > 0 ? 'watch' : 'on_track',
      detail: dq > 0 ? `${dq} exceptions detected` : 'No open exceptions',
    },
  ];
}
