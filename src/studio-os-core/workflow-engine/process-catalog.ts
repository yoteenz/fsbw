import { WORKFLOW_PROCESS_TYPES } from './constants';
import type { WorkflowProcessTemplate, WorkflowProcessType } from './types';

const PROCESS_META: Record<
  WorkflowProcessType,
  { name: string; description: string; nodeCount: number; status: WorkflowProcessTemplate['status'] }
> = {
  'client-onboarding': {
    name: 'Client Onboarding',
    description: 'Welcome new clients — intake, contracts, kickoff, concierge assignment.',
    nodeCount: 12,
    status: 'published',
  },
  hiring: {
    name: 'Hiring',
    description: 'Recruit, interview, approve, onboard employees with Institute training.',
    nodeCount: 15,
    status: 'published',
  },
  'invoice-approval': {
    name: 'Invoice Approval',
    description: 'Finance review, executive approval, payment notification.',
    nodeCount: 8,
    status: 'published',
  },
  'content-publishing': {
    name: 'Content Publishing',
    description: 'Draft, council review, brand compliance, schedule publish.',
    nodeCount: 11,
    status: 'published',
  },
  'fuel-tax-processing': {
    name: 'Fuel Tax Processing',
    description: 'Profession Brain-guided quarterly filing with compliance checkpoints.',
    nodeCount: 14,
    status: 'testing',
  },
  'permit-processing': {
    name: 'Permit Processing',
    description: 'Application, document creation, approval delays tracked in analytics.',
    nodeCount: 10,
    status: 'published',
  },
  'lead-qualification': {
    name: 'Lead Qualification',
    description: 'AI reasoning, Memory lookup, sales pipeline routing.',
    nodeCount: 9,
    status: 'published',
  },
  'customer-support': {
    name: 'Customer Support',
    description: 'Ticket triage, concierge assignment, escalation to council.',
    nodeCount: 10,
    status: 'draft',
  },
  'knowledge-capture': {
    name: 'Knowledge Capture',
    description: 'Wisdom detection, Profession Brain update, Institute lesson generation.',
    nodeCount: 7,
    status: 'published',
  },
  'sales-pipeline': {
    name: 'Sales Pipeline',
    description: 'Lead to close — approvals, notifications, CRM integration nodes.',
    nodeCount: 13,
    status: 'published',
  },
  'marketing-campaigns': {
    name: 'Marketing Campaigns',
    description: 'Campaign orchestration from brief to publish with council review.',
    nodeCount: 16,
    status: 'testing',
  },
  'employee-training': {
    name: 'Employee Training',
    description: 'Institute paths, certification checkpoints, completion tracking.',
    nodeCount: 8,
    status: 'published',
  },
};

export function buildWorkflowProcessTemplates(): WorkflowProcessTemplate[] {
  return WORKFLOW_PROCESS_TYPES.map((processId) => ({
    processId,
    repeatable: true as const,
    ...PROCESS_META[processId],
  }));
}

export function buildOrganizationWorkflows(organizationId: string): import('./types').WorkflowDefinition[] {
  const suffix = organizationId.slice(0, 4).toUpperCase();
  return [
    {
      workflowId: 'wf-client-onboarding',
      name: 'New Client Onboarding',
      processType: 'client-onboarding',
      status: 'published',
      nodeCount: 12,
      lastRunAt: new Date(Date.now() - 86400000).toISOString(),
      completionRatePct: 94,
    },
    {
      workflowId: 'wf-permit-processing',
      name: 'Permit Processing',
      processType: 'permit-processing',
      status: 'published',
      nodeCount: 10,
      lastRunAt: new Date(Date.now() - 3600000).toISOString(),
      completionRatePct: 78,
    },
    {
      workflowId: `wf-${suffix}-custom`,
      name: `${suffix} Custom Approval`,
      processType: 'invoice-approval',
      status: 'testing',
      nodeCount: 6,
      completionRatePct: 0,
    },
  ];
}
