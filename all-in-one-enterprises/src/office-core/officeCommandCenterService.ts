import type { DemoStore } from '../demo/demoTypes';
import { aioPaths } from '../utils/paths';
import { aggregateOfficeAttention, collectOfficeAttentionCandidates } from './officeAttentionEngine';
import { greetingForStaff, hasOfficePermission, resolveOfficeStaffContext } from './officeContext';
import { selectOfficeNextAction } from './officeNextActionEngine';
import { getCrmLeads, getCrmMetrics } from '../demo/crmActions';
import {
  enrichWorkItem,
  filterDueToday,
  filterOverdue,
  getUnassignedWork,
  getWorkByWaitingOn,
  getWorkItemsForStaff,
  isActiveWorkStatus,
} from './officeWorkEngine';
import type {
  OfficeBottleneck,
  OfficeCommandCenterView,
  OfficeQueueSummary,
  OfficeRoleModule,
  OfficeWorkItemView,
} from './officeWorkTypes';

const QUEUE_DEFS: Omit<OfficeQueueSummary, 'count'>[] = [
  { id: 'new_service_requests', label: 'New Service Requests', href: aioPaths.officeServices, scope: 'company', division: 'permitting_compliance' },
  { id: 'missing_documents', label: 'Missing Documents', href: aioPaths.officeDocumentsReview, scope: 'team', division: 'permitting_compliance' },
  { id: 'document_review', label: 'Document Review', href: aioPaths.officeDocumentsReview, scope: 'team' },
  { id: 'renewals', label: 'Renewals', href: aioPaths.officeRenewals, scope: 'team', division: 'permitting_compliance' },
  { id: 'insurance_requests', label: 'Insurance Requests', href: aioPaths.officeInsuranceRequests, scope: 'team', division: 'insurance' },
  { id: 'dispatch_actions', label: 'Dispatch Actions', href: aioPaths.officeDispatch, scope: 'team', division: 'dispatch' },
  { id: 'factoring_submissions', label: 'Factoring Submissions', href: aioPaths.officeFactoringSubmissions, scope: 'team', division: 'factoring' },
  { id: 'brokerage_coverage', label: 'Brokerage Coverage', href: aioPaths.officeBrokerageCoverage, scope: 'team', division: 'brokerage' },
  { id: 'billing_issues', label: 'Billing Issues', href: aioPaths.officeBilling, scope: 'team', division: 'billing' },
  { id: 'customer_replies', label: 'Customer Replies', href: aioPaths.officeInbox, scope: 'personal' },
  { id: 'approvals', label: 'Approvals', href: aioPaths.officeApprovals, scope: 'company', division: 'management' },
  { id: 'unassigned', label: 'Unassigned', href: `${aioPaths.officeQueues}?view=unassigned`, scope: 'company', division: 'management' },
  { id: 'customers_waiting_on_us', label: 'Customers Waiting on Us', href: `${aioPaths.officeWork}?view=waiting-on-us`, scope: 'company' },
  { id: 'waiting_on_customer', label: 'Waiting on Customer', href: `${aioPaths.officeWork}?view=waiting-on-customer`, scope: 'team' },
  { id: 'waiting_externally', label: 'Waiting Externally', href: `${aioPaths.officeWork}?view=waiting-externally`, scope: 'team' },
  { id: 'crm_new_leads', label: 'New Leads', href: `${aioPaths.officeCrmLeads}?filter=new`, scope: 'company', division: 'customer_support' },
  { id: 'crm_follow_up', label: 'Follow Up Today', href: aioPaths.officeCrm, scope: 'personal', division: 'customer_support' },
  { id: 'crm_quote_needed', label: 'Quote Needed', href: aioPaths.officeCrmPipeline, scope: 'team', division: 'customer_support' },
  { id: 'crm_decision_pending', label: 'Decision Pending', href: aioPaths.officeCrmPipeline, scope: 'team', division: 'customer_support' },
  { id: 'business_name_review', label: 'Business Name Review', href: aioPaths.officeBusinessNameReview, scope: 'team', division: 'permitting_compliance' },
];

function countByQueue(store: DemoStore, queueId: string): number {
  if (queueId === 'unassigned') return getUnassignedWork(store).length;
  if (queueId === 'customers_waiting_on_us') return getWorkByWaitingOn(store, 'all_in_one').length;
  if (queueId === 'waiting_on_customer') return getWorkByWaitingOn(store, 'customer').length;
  if (queueId === 'waiting_externally') {
    return (store.officeWorkItems ?? []).filter(
      (w) => w.waitingOn === 'external_provider' || w.waitingOn === 'government' || w.waitingOn === 'insurance_partner' || w.waitingOn === 'factoring_provider' || w.waitingOn === 'carrier' || w.waitingOn === 'shipper',
    ).filter((w) => isActiveWorkStatus(w.status)).length;
  }
  if (queueId === 'approvals') {
    return (store.officeApprovals ?? []).filter((a) => a.status === 'pending').length;
  }
  if (queueId === 'new_service_requests') {
    return store.requests.filter((r) => r.status === 'new_request').length;
  }
  if (queueId === 'customer_replies') {
    return store.messages.filter((m) => m.from === 'customer' && !m.read).length;
  }
  if (queueId === 'crm_new_leads') {
    return getCrmLeads(store).filter((l) => l.status === 'new').length;
  }
  if (queueId === 'crm_follow_up') {
    return getCrmMetrics(store).followUpToday + getCrmMetrics(store).overdueFollowUp;
  }
  if (queueId === 'crm_quote_needed') {
    return (store.crmOpportunities ?? []).filter((o) => o.status === 'open' && o.pipelineStageId === 'cs-solution' && !o.quoteId).length;
  }
  if (queueId === 'crm_decision_pending') {
    return getCrmMetrics(store).decisionPending;
  }
  if (queueId === 'business_name_review') {
    return (store.officeWorkItems ?? []).filter(
      (w) => w.queueId === 'business_name_review' && isActiveWorkStatus(w.status),
    ).length;
  }
  return (store.officeWorkItems ?? []).filter((w) => w.queueId === queueId && isActiveWorkStatus(w.status)).length;
}

function buildRoleModules(ctx: ReturnType<typeof resolveOfficeStaffContext>, store: DemoStore): OfficeRoleModule[] {
  const modules: OfficeRoleModule[] = [];
  const myWork = getWorkItemsForStaff(store, ctx.staffId);

  switch (ctx.role) {
    case 'permitting_specialist':
      modules.push({
        id: 'permitting',
        title: 'Permitting Desk',
        items: [
          { label: 'My Work', value: myWork.length, href: aioPaths.officeWork },
          { label: 'New Requests', value: store.requests.filter((r) => r.status === 'new_request').length, href: aioPaths.officeServices },
          { label: 'Missing Documents', value: countByQueue(store, 'missing_documents'), href: aioPaths.officeDocumentsReview },
          { label: 'Renewals', value: countByQueue(store, 'renewals'), href: aioPaths.officeRenewals },
          { label: 'Customers Waiting', value: countByQueue(store, 'customers_waiting_on_us'), href: `${aioPaths.officeWork}?view=waiting-on-us` },
        ],
      });
      break;
    case 'dispatcher':
      modules.push({
        id: 'dispatch',
        title: 'Dispatch Desk',
        items: [
          { label: "Today's Pickups", value: store.loads.filter((l) => ['en_route_pickup', 'at_pickup'].includes(l.operationalStatus)).length, href: aioPaths.officeDispatch },
          { label: 'POD Needed', value: store.loads.filter((l) => l.operationalStatus === 'pod_needed' || (l.operationalStatus === 'delivered' && !l.podDocumentId)).length, href: aioPaths.officeDispatchLoads },
          { label: 'Load Issues', value: countByQueue(store, 'dispatch_actions'), href: aioPaths.officeDispatch },
          { label: 'Messages', value: countByQueue(store, 'customer_replies'), href: aioPaths.officeInbox },
        ],
      });
      break;
    case 'factoring_coordinator':
      modules.push({
        id: 'factoring',
        title: 'Factoring Desk',
        items: [
          { label: 'Ready to Submit', value: (store.factoringSubmissions ?? []).filter((s) => s.status === 'ready').length, href: aioPaths.officeFactoringSubmissions },
          { label: 'Missing Documents', value: countByQueue(store, 'missing_documents'), href: aioPaths.officeFactoring },
          { label: 'Provider Review', value: (store.factoringSubmissions ?? []).filter((s) => s.status === 'submitted').length, href: aioPaths.officeFactoringSubmissions },
          { label: 'Exceptions', value: (store.factoringIssues ?? []).filter((i) => !i.resolvedAt).length, href: aioPaths.officeFactoring },
        ],
      });
      break;
    case 'insurance_coordinator':
      modules.push({
        id: 'insurance',
        title: 'Insurance Desk',
        items: [
          { label: 'New Requests', value: (store.insuranceRequests ?? []).filter((r) => r.status === 'submitted').length, href: aioPaths.officeInsuranceRequests },
          { label: 'Information Needed', value: (store.insuranceRequests ?? []).filter((r) => r.status === 'information_needed').length, href: aioPaths.officeInsuranceRequests },
          { label: 'Partner Review', value: (store.insuranceRequests ?? []).filter((r) => r.status === 'partner_review').length, href: aioPaths.officeInsuranceRequests },
          { label: 'Expiring Policies', value: (store.insuranceIssues ?? []).filter((i) => i.type === 'policy_expiring').length, href: aioPaths.officeInsuranceRenewals },
        ],
      });
      break;
    case 'broker':
      modules.push({
        id: 'brokerage',
        title: 'Brokerage Desk',
        items: [
          { label: 'Needs Coverage', value: countByQueue(store, 'brokerage_coverage'), href: aioPaths.officeBrokerageCoverage },
          { label: 'Quotes Pending', value: (store.brokerageFreightQuotes ?? []).filter((q) => ['sent', 'viewed'].includes(q.status)).length, href: aioPaths.officeBrokerage },
          { label: "Today's Loads", value: store.loads.filter((l) => l.sourceType === 'brokerage' && l.operationalStatus !== 'complete').length, href: aioPaths.officeBrokerageLoads },
          { label: 'POD Needed', value: store.loads.filter((l) => l.sourceType === 'brokerage' && l.operationalStatus === 'delivered').length, href: aioPaths.officeBrokerageLoads },
        ],
      });
      break;
    case 'billing_specialist':
      modules.push({
        id: 'billing',
        title: 'Billing Desk',
        items: [
          { label: 'Quotes', value: store.quotes.filter((q) => q.status === 'sent').length, href: aioPaths.officeQuotes },
          { label: 'Past Due', value: store.invoices.filter((i) => i.status === 'past_due').length, href: aioPaths.officeInvoices },
          { label: 'Disputes', value: countByQueue(store, 'billing_issues'), href: aioPaths.officeBilling },
          { label: 'Payment Exceptions', value: (store.officeApprovals ?? []).filter((a) => a.actionType.includes('payment')).length, href: aioPaths.officeApprovals },
        ],
      });
      break;
    default:
      if (hasOfficePermission(ctx, 'crm.read')) {
        const crm = getCrmMetrics(store);
        modules.push({
          id: 'crm',
          title: 'CRM & Sales',
          items: [
            { label: 'New Leads', value: crm.newLeads, href: aioPaths.officeCrmLeads },
            { label: 'Follow-Up Due', value: crm.followUpToday + crm.overdueFollowUp, href: aioPaths.officeCrm },
            { label: 'Quotes Out', value: crm.quotesOut, href: aioPaths.officeCrmPipeline },
            { label: 'Decision Pending', value: crm.decisionPending, href: aioPaths.officeCrmPipeline },
            { label: 'Recent Conversions', value: crm.converted, href: aioPaths.officeCrmReports },
          ],
        });
      }
      if (ctx.isManager) {
        modules.push({
          id: 'management',
          title: 'Management',
          items: [
            { label: 'Unassigned', value: countByQueue(store, 'unassigned'), href: `${aioPaths.officeQueues}?view=unassigned` },
            { label: 'Overdue', value: filterOverdue(store.officeWorkItems ?? []).length, href: `${aioPaths.officeWork}?view=overdue` },
            { label: 'Escalations', value: (store.officeEscalations ?? []).filter((e) => !e.resolvedAt).length, href: aioPaths.officeEscalations },
            { label: 'Approvals', value: countByQueue(store, 'approvals'), href: aioPaths.officeApprovals },
            { label: 'Customers Waiting', value: countByQueue(store, 'customers_waiting_on_us'), href: `${aioPaths.officeWork}?view=waiting-on-us` },
            { label: 'Workload', value: '→', href: aioPaths.officeWorkload },
          ],
        });
      }
  }
  return modules;
}

function buildBottlenecks(store: DemoStore): OfficeBottleneck[] {
  const items: OfficeBottleneck[] = [];
  const docWaiting = store.documents.filter((d) => ['uploaded', 'under_review'].includes(d.status)).length;
  if (docWaiting) items.push({ label: `${docWaiting} documents awaiting review`, count: docWaiting, href: aioPaths.officeDocumentsReview });
  const extRenewals = (store.officeWorkItems ?? []).filter((w) => w.waitingOn === 'government' && isActiveWorkStatus(w.status)).length;
  if (extRenewals) items.push({ label: `${extRenewals} renewals waiting externally`, count: extRenewals, href: `${aioPaths.officeWork}?view=waiting-externally` });
  const insPartner = (store.insuranceRequests ?? []).filter((r) => r.status === 'partner_review').length;
  if (insPartner) items.push({ label: `${insPartner} insurance requests waiting on partner`, count: insPartner, href: aioPaths.officeInsuranceRequests });
  const coverage = store.loads.filter((l) => l.sourceType === 'brokerage' && l.brokerageCoverageStatus === 'needs_coverage').length;
  if (coverage) items.push({ label: `${coverage} brokerage loads need coverage`, count: coverage, href: aioPaths.officeBrokerageCoverage });
  return items;
}

export function getOfficeCommandCenterView(store: DemoStore): OfficeCommandCenterView {
  const ctx = resolveOfficeStaffContext(store);
  const now = new Date();
  const allWork = (store.officeWorkItems ?? []).map((w) => enrichWorkItem(w, store, now));
  const myWork = allWork.filter((w) => w.assignedUserId === ctx.staffId && isActiveWorkStatus(w.status));
  const candidates = collectOfficeAttentionCandidates(store);
  const attentionItems = aggregateOfficeAttention(candidates);
  const nextAction = selectOfficeNextAction(myWork, candidates, ctx.isManager);

  const dueToday = filterDueToday(store.officeWorkItems ?? [], now).map((w) => enrichWorkItem(w, store, now));
  const overdue = filterOverdue(store.officeWorkItems ?? [], now).map((w) => enrichWorkItem(w, store, now));

  const queues: OfficeQueueSummary[] = QUEUE_DEFS.filter((q) => {
    if (q.id.startsWith('crm_') && !hasOfficePermission(ctx, 'crm.read')) return false;
    if (q.division === 'factoring' && !hasOfficePermission(ctx, 'factoring_finance.read')) return false;
    if (q.division === 'brokerage' && !hasOfficePermission(ctx, 'brokerage_finance.read')) return false;
    if (q.id === 'approvals' && !hasOfficePermission(ctx, 'approvals.read')) return false;
    if (q.scope === 'company' && q.id === 'unassigned' && !ctx.isManager) return false;
    return true;
  }).map((q) => ({ ...q, count: countByQueue(store, q.id) }));

  const managerSummary = ctx.isManager
    ? {
        customersActive: store.clients.filter((c) => c.accountStatus === 'active').length,
        openServiceRequests: store.requests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length,
        customersWaitingOnUs: countByQueue(store, 'customers_waiting_on_us'),
        waitingOnCustomer: countByQueue(store, 'waiting_on_customer'),
        waitingExternally: countByQueue(store, 'waiting_externally'),
        overdueWork: overdue.length,
        unassignedWork: getUnassignedWork(store).length,
        escalations: (store.officeEscalations ?? []).filter((e) => !e.resolvedAt).length,
        approvals: (store.officeApprovals ?? []).filter((a) => a.status === 'pending').length,
      }
    : undefined;

  const assignedCount = myWork.length;
  const customersWaitingOnUsCount = countByQueue(store, 'customers_waiting_on_us');

  return {
    context: ctx,
    greeting: greetingForStaff(ctx.staffName),
    assignedCount,
    dueTodayCount: dueToday.filter((w) => w.assignedUserId === ctx.staffId).length,
    customersWaitingOnUsCount,
    nextAction,
    attentionItems: attentionItems.slice(0, 8),
    dueToday: dueToday.filter((w) => !ctx.isManager ? w.assignedUserId === ctx.staffId : true).slice(0, 6),
    overdue: overdue.filter((w) => !ctx.isManager ? w.assignedUserId === ctx.staffId : true).slice(0, 6),
    unassignedCount: getUnassignedWork(store).length,
    approvalsPendingCount: (store.officeApprovals ?? []).filter((a) => a.status === 'pending').length,
    escalationsActiveCount: (store.officeEscalations ?? []).filter((e) => !e.resolvedAt).length,
    queues: queues.filter((q) => q.count > 0 || ['unassigned', 'customers_waiting_on_us'].includes(q.id)).slice(0, 10),
    roleModules: buildRoleModules(ctx, store),
    managerSummary,
    bottlenecks: buildBottlenecks(store),
    allCaughtUp: assignedCount === 0 && !nextAction && attentionItems.length === 0,
    loadingErrors: {},
  };
}

export function filterMyWorkSections(myWork: OfficeWorkItemView[], now = new Date()): Record<string, OfficeWorkItemView[]> {
  const today = now.toISOString().slice(0, 10);
  return {
    dueToday: myWork.filter((w) => w.dueAt?.slice(0, 10) === today),
    overdue: myWork.filter((w) => w.isOverdue),
    upcoming: myWork.filter((w) => w.dueAt && w.dueAt.slice(0, 10) > today),
    waitingOnCustomer: myWork.filter((w) => w.waitingOn === 'customer'),
    waitingExternally: myWork.filter((w) => ['external_provider', 'government', 'insurance_partner', 'factoring_provider', 'carrier', 'shipper'].includes(w.waitingOn)),
    readyForReview: myWork.filter((w) => w.status === 'ready_for_review'),
    recentlyCompleted: [],
  };
}
