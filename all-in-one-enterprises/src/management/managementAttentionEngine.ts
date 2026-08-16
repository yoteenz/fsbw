import type { DemoStore } from '../demo/demoTypes';
import { getCrmMetrics, getDueFollowUps } from '../demo/crmActions';
import { getOutboxMessages } from '../demo/communicationActions';
import type { CrmLead } from '../crm/crmTypes';
import { aioPaths } from '../utils/paths';
import type { ManagementAttentionItem, AttentionSeverity } from './managementTypes';

function leadDisplayName(lead: CrmLead): string {
  const person = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
  return lead.businessName ?? person ?? 'Lead';
}

const SEVERITY_ORDER: Record<AttentionSeverity, number> = {
  urgent: 0,
  action: 1,
  watch: 2,
  info: 3,
};

function daysSince(iso: string): string {
  const d = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  if (d === 0) return 'Today';
  if (d === 1) return '1 day';
  return `${d} days`;
}

function pushItem(
  items: ManagementAttentionItem[],
  seen: Set<string>,
  item: ManagementAttentionItem,
  acks: string[],
): void {
  if (seen.has(item.dedupeKey) || acks.includes(item.dedupeKey)) return;
  seen.add(item.dedupeKey);
  items.push(item);
}

export function getManagementAttentionItems(store: DemoStore): ManagementAttentionItem[] {
  const items: ManagementAttentionItem[] = [];
  const seen = new Set<string>();
  const acks = store.managementAttentionAcks ?? [];

  for (const inv of store.invoices) {
    if (inv.status !== 'past_due' || inv.balanceDueMinor <= 0) continue;
    const client = store.clients.find((c) => c.id === inv.organizationId);
    pushItem(items, seen, {
      id: `att-overdue-${inv.id}`,
      dedupeKey: `overdue-receivable:${inv.id}`,
      severity: inv.balanceDueMinor > 100000 ? 'urgent' : 'action',
      title: 'Overdue receivable',
      explanation: `Invoice ${inv.invoiceNumber} is past due with ${(inv.balanceDueMinor / 100).toFixed(2)} outstanding.`,
      whyItMatters: 'Uncollected balances affect cash flow and may require follow-up.',
      recommendedAction: 'Review invoice and assign billing follow-up.',
      entityType: 'invoice',
      entityId: inv.id,
      organizationId: inv.organizationId,
      organizationName: client?.companyName,
      ownerLabel: client?.assignedStaffId ? store.staff.find((s) => s.id === client.assignedStaffId)?.name : undefined,
      ageLabel: inv.dueAt ? daysSince(inv.dueAt) : undefined,
      ctaLabel: 'Open invoice',
      ctaHref: aioPaths.officeInvoice(inv.id),
    }, acks);
  }

  for (const opp of store.crmOpportunities ?? []) {
    if (opp.pipelineStageId !== 'cs-decision' || opp.status !== 'open') continue;
    if ((opp.estimatedValueMinor ?? 0) < 50000) continue;
    const lead = store.crmLeads?.find((l) => l.id === opp.leadId);
    if (!lead) continue;
    pushItem(items, seen, {
      id: `att-quote-${opp.id}`,
      dedupeKey: `high-value-quote:${opp.id}`,
      severity: 'watch',
      title: 'High-value quote awaiting decision',
      explanation: `${leadDisplayName(lead)} has an open opportunity with estimated value.`,
      whyItMatters: 'Delayed decisions may lose revenue opportunities.',
      recommendedAction: 'Follow up on quote status with sales.',
      entityType: 'opportunity',
      entityId: opp.id,
      organizationName: leadDisplayName(lead),
      ageLabel: daysSince(opp.updatedAt ?? opp.createdAt),
      ctaLabel: 'Open opportunity',
      ctaHref: aioPaths.officeCrmOpportunity(opp.id),
    }, acks);
  }

  for (const wf of store.workflowInstances ?? []) {
    if (wf.status !== 'blocked' && wf.status !== 'active') continue;
    const updated = wf.startedAt ?? wf.completedAt ?? '';
    const ageDays = Math.floor((Date.now() - new Date(updated).getTime()) / 86400000);
    if (ageDays < 7) continue;
    const req = store.requests.find((r) => r.id === wf.serviceRequestId);
    const client = req ? store.clients.find((c) => c.id === req.clientId) : undefined;
    pushItem(items, seen, {
      id: `att-wf-${wf.id}`,
      dedupeKey: `workflow-stalled:${wf.id}`,
      severity: ageDays >= 14 ? 'action' : 'watch',
      title: 'Service workflow stalled',
      explanation: `Workflow for ${req?.requestNumber ?? wf.id} has not progressed in ${ageDays} days.`,
      whyItMatters: 'Stalled workflows delay customer service completion.',
      recommendedAction: 'Review workflow steps and waiting state.',
      entityType: 'workflow',
      entityId: wf.id,
      organizationId: client?.id,
      organizationName: client?.companyName,
      ageLabel: `${ageDays} days`,
      ctaLabel: 'Open workflow',
      ctaHref: aioPaths.officeWorkflow(wf.id),
    }, acks);
  }

  for (const conv of store.commConversations ?? []) {
    const needsReply = conv.status !== 'waiting_on_customer' && !['closed', 'archived', 'resolved'].includes(conv.status);
    const lastAt = conv.lastMessageAt ?? conv.createdAt;
    const waitDays = Math.floor((Date.now() - new Date(lastAt).getTime()) / 86400000);
    if (!needsReply || !conv.assignedUserId || waitDays < 2) continue;
    const client = conv.organizationId ? store.clients.find((c) => c.id === conv.organizationId) : undefined;
    pushItem(items, seen, {
      id: `att-comm-${conv.id}`,
      dedupeKey: `customer-waiting:${conv.id}`,
      severity: waitDays >= 5 ? 'action' : 'watch',
      title: 'Customer waiting too long',
      explanation: `Conversation "${conv.subject}" awaiting staff response.`,
      whyItMatters: 'Slow response times affect customer satisfaction.',
      recommendedAction: 'Reply or reassign conversation.',
      entityType: 'conversation',
      entityId: conv.id,
      organizationId: conv.organizationId,
      organizationName: client?.companyName,
      ageLabel: daysSince(lastAt),
      ctaLabel: 'Open conversation',
      ctaHref: aioPaths.officeCommunication(conv.id),
    }, acks);
  }

  for (const load of store.loads) {
    if (load.operationalStatus === 'pod_needed' && !load.podDocumentId) {
      pushItem(items, seen, {
        id: `att-pod-${load.id}`,
        dedupeKey: `load-pod:${load.id}`,
        severity: 'action',
        title: 'Missing POD',
        explanation: `Load ${load.loadNumber} delivered but proof of delivery is missing.`,
        whyItMatters: 'POD may block billing and factoring handoff.',
        recommendedAction: 'Obtain POD from carrier or customer.',
        entityType: 'load',
        entityId: load.id,
        organizationId: load.organizationId,
        ageLabel: daysSince(load.updatedAt ?? load.createdAt),
        ctaLabel: 'Open load',
        ctaHref: aioPaths.officeDispatchLoad(load.id),
      }, acks);
    }
  }

  for (const fin of store.brokerageLoadFinancials) {
    const load = store.loads.find((l) => l.id === fin.loadId);
    if (!load || load.operationalStatus !== 'complete') continue;
    const margin = fin.confirmedShipperChargeMinor - fin.confirmedCarrierPayMinor;
    const pct = fin.confirmedShipperChargeMinor > 0 ? (margin / fin.confirmedShipperChargeMinor) * 100 : 100;
    if (pct >= 10) continue;
    pushItem(items, seen, {
      id: `att-margin-${fin.loadId}`,
      dedupeKey: `brokerage-margin:${fin.loadId}`,
      severity: 'watch',
      title: 'Margin review',
      explanation: `Load ${load.loadNumber} gross margin is ${pct.toFixed(1)}% — below threshold.`,
      whyItMatters: 'Low margins may require pricing review.',
      recommendedAction: 'Review shipper charge and carrier pay.',
      entityType: 'brokerage_load',
      entityId: fin.loadId,
      ctaLabel: 'Open load',
      ctaHref: aioPaths.officeBrokerageLoad(fin.loadId),
    }, acks);
  }

  for (const sub of store.factoringSubmissions) {
    if (!['submitted', 'provider_review'].includes(sub.status)) continue;
    const ageDays = Math.floor((Date.now() - new Date(sub.updatedAt).getTime()) / 86400000);
    if (ageDays < 5) continue;
    pushItem(items, seen, {
      id: `att-fact-${sub.id}`,
      dedupeKey: `factoring-stalled:${sub.id}`,
      severity: 'watch',
      title: 'Factoring submission stalled',
      explanation: `Submission awaiting provider response for ${ageDays} days.`,
      whyItMatters: 'Delayed funding affects customer cash flow.',
      recommendedAction: 'Follow up with factoring provider.',
      entityType: 'factoring_submission',
      entityId: sub.id,
      organizationId: sub.organizationId,
      ageLabel: `${ageDays} days`,
      ctaLabel: 'Open submission',
      ctaHref: aioPaths.officeFactoringSubmission(sub.id),
    }, acks);
  }

  for (const fu of getDueFollowUps(store)) {
    if (fu.status !== 'overdue') continue;
    pushItem(items, seen, {
      id: `att-crm-${fu.id}`,
      dedupeKey: `crm-followup:${fu.id}`,
      severity: 'action',
      title: 'Overdue CRM follow-up',
      explanation: fu.purpose ?? 'Scheduled follow-up is overdue.',
      whyItMatters: 'Missed follow-ups reduce conversion rates.',
      recommendedAction: 'Complete follow-up or reschedule.',
      entityType: 'crm_followup',
      entityId: fu.id,
      ctaLabel: 'Open lead',
      ctaHref: fu.leadId ? aioPaths.officeCrmLead(fu.leadId) : aioPaths.officeCrm,
    }, acks);
  }

  for (const conv of store.commConversations ?? []) {
    if (conv.assignedUserId || ['closed', 'archived', 'resolved'].includes(conv.status)) continue;
    pushItem(items, seen, {
      id: `att-unassigned-${conv.id}`,
      dedupeKey: `unassigned-conversation:${conv.id}`,
      severity: 'info',
      title: 'Unassigned conversation',
      explanation: `"${conv.subject}" has no assigned staff.`,
      whyItMatters: 'Unassigned conversations may be missed.',
      recommendedAction: 'Assign to appropriate team member.',
      entityType: 'conversation',
      entityId: conv.id,
      ctaLabel: 'Open conversation',
      ctaHref: aioPaths.officeCommunication(conv.id),
    }, acks);
  }

  for (const ex of store.automationExceptions ?? []) {
    if (ex.resolvedAt) continue;
    pushItem(items, seen, {
      id: `att-auto-${ex.id}`,
      dedupeKey: `automation-failed:${ex.id}`,
      severity: 'action',
      title: 'Failed automation',
      explanation: ex.message ?? 'Automation rule requires manual intervention.',
      whyItMatters: 'Failed automations may block service progression.',
      recommendedAction: 'Review exception and resolve or retry.',
      entityType: 'automation_exception',
      entityId: ex.id,
      ctaLabel: 'Open exceptions',
      ctaHref: aioPaths.officeAutomationExceptions,
    }, acks);
  }

  for (const msg of getOutboxMessages(store)) {
    if (msg.status !== 'failed') continue;
    pushItem(items, seen, {
      id: `att-msg-${msg.id}`,
      dedupeKey: `comm-failed:${msg.id}`,
      severity: 'watch',
      title: 'Failed communication delivery',
      explanation: 'A message failed to deliver through the configured provider.',
      whyItMatters: 'Customer may not have received important information.',
      recommendedAction: 'Review outbox and retry or record externally.',
      entityType: 'message',
      entityId: msg.id,
      ctaLabel: 'Open outbox',
      ctaHref: aioPaths.officeCommunicationsOutbox,
    }, acks);
  }

  const crm = getCrmMetrics(store);
  if (crm.overdueFollowUp > 0) {
    pushItem(items, seen, {
      id: 'att-crm-summary',
      dedupeKey: 'crm-followup-summary',
      severity: crm.overdueFollowUp >= 3 ? 'action' : 'watch',
      title: `${crm.overdueFollowUp} overdue CRM follow-ups`,
      explanation: 'Multiple sales follow-ups are past due.',
      whyItMatters: 'Pipeline health depends on timely follow-up.',
      recommendedAction: 'Review CRM calendar and follow-up queue.',
      ctaLabel: 'Open CRM',
      ctaHref: aioPaths.officeCrmCalendar,
    }, acks);
  }

  for (const conn of store.integrationConnections ?? []) {
    if (conn.status === 'AUTHORIZATION_REQUIRED' || conn.status === 'REAUTHORIZATION_REQUIRED') {
      pushItem(items, seen, {
        id: `att-int-auth-${conn.id}`,
        dedupeKey: `integration-auth:${conn.id}`,
        severity: 'action',
        title: 'Integration authorization required',
        explanation: `${conn.name} requires reauthorization before external operations can continue.`,
        whyItMatters: 'External workflows may be blocked until credentials are restored.',
        recommendedAction: 'Open integration settings and complete authorization.',
        entityType: 'integration_connection',
        entityId: conn.id,
        ctaLabel: 'Open integration',
        ctaHref: aioPaths.officeIntegrationConnection(conn.id),
      }, acks);
    }
    if (conn.health === 'OFFLINE' || conn.health === 'DEGRADED') {
      pushItem(items, seen, {
        id: `att-int-health-${conn.id}`,
        dedupeKey: `integration-health:${conn.id}`,
        severity: conn.health === 'OFFLINE' ? 'urgent' : 'watch',
        title: `Integration ${conn.health.toLowerCase().replace('_', ' ')}`,
        explanation: `${conn.name} (${conn.environment}) is reporting degraded provider health.`,
        whyItMatters: 'Dependent workflows may fail or show stale external data.',
        recommendedAction: 'Review integration operations center.',
        entityType: 'integration_connection',
        entityId: conn.id,
        ctaLabel: 'Operations center',
        ctaHref: aioPaths.officeIntegrations,
      }, acks);
    }
  }

  for (const issue of store.integrationReconciliationIssues ?? []) {
    if (issue.status !== 'open' || issue.severity !== 'critical') continue;
    pushItem(items, seen, {
      id: `att-recon-${issue.id}`,
      dedupeKey: `reconciliation:${issue.id}`,
      severity: 'urgent',
      title: 'Integration reconciliation required',
      explanation: `${issue.issueType.replace(/_/g, ' ')} on ${issue.entityType}.`,
      whyItMatters: 'Financial mismatch must be resolved by authorized staff.',
      recommendedAction: 'Open reconciliation center.',
      entityType: 'reconciliation',
      entityId: issue.id,
      ctaLabel: 'Reconciliation',
      ctaHref: aioPaths.officeIntegrationsReconciliation,
    }, acks);
  }

  return items.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

export function acknowledgeAttentionItem(store: DemoStore, dedupeKey: string): DemoStore {
  const acks = new Set(store.managementAttentionAcks ?? []);
  acks.add(dedupeKey);
  return { ...store, managementAttentionAcks: [...acks] };
}
