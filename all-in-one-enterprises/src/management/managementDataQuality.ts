import type { DemoStore } from '../demo/demoTypes';
import { allocatePayment } from './managementFinancial';
import type { CrmLead } from '../crm/crmTypes';

import { aioPaths } from '../utils/paths';
import type { DataQualityIssue } from './managementTypes';

function leadDisplayName(lead: CrmLead): string {
  const person = [lead.firstName, lead.lastName].filter(Boolean).join(' ');
  return lead.businessName ?? person ?? 'Lead';
}

export interface DataQualityRule {
  id: string;
  name: string;
  severity: 'info' | 'watch' | 'action' | 'urgent';
  description: string;
  entity: string;
  resolutionGuidance: string;
}

export const DATA_QUALITY_RULES: DataQualityRule[] = [
  {
    id: 'payment_missing_allocation',
    name: 'Payment missing allocation',
    severity: 'action',
    description: 'Payment succeeded but could not be allocated to invoice line categories.',
    entity: 'payment',
    resolutionGuidance: 'Link payment to invoice or classify fee categories on invoice.',
  },
  {
    id: 'invoice_missing_classification',
    name: 'Invoice missing fee classification',
    severity: 'watch',
    description: 'Invoice has no service fee or external fee breakdown.',
    entity: 'invoice',
    resolutionGuidance: 'Ensure line items use canonical fee categories.',
  },
  {
    id: 'orphan_service_request',
    name: 'Orphaned service request',
    severity: 'watch',
    description: 'Service request references unknown client organization.',
    entity: 'service_request',
    resolutionGuidance: 'Link request to valid customer or archive.',
  },
  {
    id: 'workflow_without_owner',
    name: 'Workflow without owner',
    severity: 'info',
    description: 'Active workflow has no assigned staff on related request.',
    entity: 'workflow',
    resolutionGuidance: 'Assign staff to service request or workflow step.',
  },
  {
    id: 'conversation_without_context',
    name: 'Conversation without context',
    severity: 'info',
    description: 'Conversation lacks organization or lead context.',
    entity: 'conversation',
    resolutionGuidance: 'Link conversation to customer or lead record.',
  },
  {
    id: 'duplicate_lead_candidate',
    name: 'Duplicate lead candidate',
    severity: 'watch',
    description: 'Lead email matches another lead or existing customer.',
    entity: 'lead',
    resolutionGuidance: 'Review deduplication and merge if appropriate.',
  },
];

export function detectDataQualityIssues(store: DemoStore): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];
  const clientIds = new Set(store.clients.map((c) => c.id));
  const emails = new Map<string, string>();

  for (const pay of store.payments) {
    if (pay.status !== 'succeeded') continue;
    const inv = store.invoices.find((i) => i.id === pay.invoiceId);
    const alloc = allocatePayment(pay, inv);
    if (alloc.unallocatedMinor > 0 || (!inv && pay.amountMinor > 0)) {
      issues.push({
        ruleId: 'payment_missing_allocation',
        name: 'Payment missing allocation',
        severity: 'action',
        description: `Payment ${pay.id.slice(0, 8)} has ${(alloc.unallocatedMinor / 100).toFixed(2)} unallocated.`,
        entityType: 'payment',
        entityId: pay.id,
        resolutionGuidance: DATA_QUALITY_RULES[0].resolutionGuidance,
        ctaHref: aioPaths.officePayments,
      });
    }
  }

  for (const inv of store.invoices) {
    if (inv.subtotalServiceFeesMinor === 0 && inv.subtotalExternalFeesMinor === 0 && inv.totalMinor > 0) {
      issues.push({
        ruleId: 'invoice_missing_classification',
        name: 'Invoice missing fee classification',
        severity: 'watch',
        description: `Invoice ${inv.invoiceNumber} lacks fee category breakdown.`,
        entityType: 'invoice',
        entityId: inv.id,
        resolutionGuidance: DATA_QUALITY_RULES[1].resolutionGuidance,
        ctaHref: aioPaths.officeInvoice(inv.id),
      });
    }
  }

  for (const req of store.requests) {
    if (!clientIds.has(req.clientId)) {
      issues.push({
        ruleId: 'orphan_service_request',
        name: 'Orphaned service request',
        severity: 'watch',
        description: `Request ${req.requestNumber} references missing client.`,
        entityType: 'service_request',
        entityId: req.id,
        resolutionGuidance: DATA_QUALITY_RULES[2].resolutionGuidance,
        ctaHref: aioPaths.officeRequest(req.id),
      });
    }
  }

  for (const wf of store.workflowInstances ?? []) {
    if (!['active', 'blocked'].includes(wf.status)) continue;
    const req = store.requests.find((r) => r.id === wf.serviceRequestId);
    if (req && !req.assignedStaffId) {
      issues.push({
        ruleId: 'workflow_without_owner',
        name: 'Workflow without owner',
        severity: 'info',
        description: `Workflow for ${req.requestNumber} has no assigned staff.`,
        entityType: 'workflow',
        entityId: wf.id,
        resolutionGuidance: DATA_QUALITY_RULES[3].resolutionGuidance,
        ctaHref: aioPaths.officeWorkflow(wf.id),
      });
    }
  }

  for (const conv of store.commConversations ?? []) {
    if (!conv.organizationId && !conv.leadId && !['closed', 'archived', 'resolved'].includes(conv.status)) {
      issues.push({
        ruleId: 'conversation_without_context',
        name: 'Conversation without context',
        severity: 'info',
        description: `Conversation "${conv.subject}" lacks customer context.`,
        entityType: 'conversation',
        entityId: conv.id,
        resolutionGuidance: DATA_QUALITY_RULES[4].resolutionGuidance,
        ctaHref: aioPaths.officeCommunication(conv.id),
      });
    }
  }

  for (const lead of store.crmLeads ?? []) {
    const email = lead.email?.toLowerCase();
    if (!email) continue;
    if (emails.has(email)) {
      issues.push({
        ruleId: 'duplicate_lead_candidate',
        name: 'Duplicate lead candidate',
        severity: 'watch',
        description: `Lead ${leadDisplayName(lead)} email matches another record.`,
        entityType: 'lead',
        entityId: lead.id,
        resolutionGuidance: DATA_QUALITY_RULES[5].resolutionGuidance,
        ctaHref: aioPaths.officeCrmLead(lead.id),
      });
    }
    emails.set(email, lead.id);
    const clientMatch = store.clients.find((c) => c.contactEmail.toLowerCase() === email);
    if (clientMatch && lead.status !== 'converted') {
      issues.push({
        ruleId: 'duplicate_lead_candidate',
        name: 'Duplicate lead candidate',
        severity: 'watch',
        description: `Lead ${leadDisplayName(lead)} matches existing customer ${clientMatch.companyName}.`,
        entityType: 'lead',
        entityId: lead.id,
        resolutionGuidance: DATA_QUALITY_RULES[5].resolutionGuidance,
        ctaHref: aioPaths.officeCrmLead(lead.id),
      });
    }
  }

  return issues;
}

export function getDataQualityCount(store: DemoStore): number {
  return detectDataQualityIssues(store).length;
}
