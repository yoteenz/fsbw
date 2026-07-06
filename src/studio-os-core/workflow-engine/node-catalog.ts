import { WORKFLOW_NODE_TYPES } from './constants';
import type { WorkflowNodeEntry, WorkflowNodeType } from './types';

const NODE_META: Record<
  WorkflowNodeType,
  { label: string; description: string; category: WorkflowNodeEntry['category']; iconHint: string }
> = {
  trigger: {
    label: 'Trigger',
    description: 'Start workflow when an event, schedule, or manual action occurs.',
    category: 'flow',
    iconHint: 'bolt',
  },
  decision: {
    label: 'Decision',
    description: 'Branch workflow based on organizational rules or AI reasoning.',
    category: 'flow',
    iconHint: 'fork',
  },
  condition: {
    label: 'Condition',
    description: 'Evaluate if/then rules against workflow variables.',
    category: 'flow',
    iconHint: 'filter',
  },
  approval: {
    label: 'Approval',
    description: 'Route to founder, executive, or department approval chain.',
    category: 'flow',
    iconHint: 'check',
  },
  delay: {
    label: 'Delay',
    description: 'Wait for duration, business day, or calendar event.',
    category: 'flow',
    iconHint: 'clock',
  },
  notification: {
    label: 'Notification',
    description: 'Send in-app alert or account notification.',
    category: 'communication',
    iconHint: 'bell',
  },
  'command-dock': {
    label: 'Command Dock',
    description: 'Invoke Command Dock skill or executive command.',
    category: 'intelligence',
    iconHint: 'terminal',
  },
  'executive-council': {
    label: 'Executive Council',
    description: 'Conduct collaborative executive briefing on decision.',
    category: 'intelligence',
    iconHint: 'council',
  },
  'digital-concierge': {
    label: 'Digital Concierge',
    description: 'Assign task to department Digital Concierge.',
    category: 'intelligence',
    iconHint: 'concierge',
  },
  'ai-reasoning': {
    label: 'AI Reasoning',
    description: 'Studio Intelligence™ reasoning step via Model Orchestrator.',
    category: 'intelligence',
    iconHint: 'brain',
  },
  'profession-brain': {
    label: 'Profession Brain™',
    description: 'Consult institutional expertise before proceeding.',
    category: 'intelligence',
    iconHint: 'expertise',
  },
  'memory-lookup': {
    label: 'Memory Lookup',
    description: 'Query Memory Engine™ — have we done this before?',
    category: 'intelligence',
    iconHint: 'memory',
  },
  'document-creation': {
    label: 'Document Creation',
    description: 'Generate SOP, contract, or Operating Manual section.',
    category: 'integration',
    iconHint: 'document',
  },
  calendar: {
    label: 'Calendar',
    description: 'Schedule meeting or block executive calendar time.',
    category: 'integration',
    iconHint: 'calendar',
  },
  email: {
    label: 'Email',
    description: 'Send branded transactional email via Resend.',
    category: 'communication',
    iconHint: 'email',
  },
  sms: {
    label: 'SMS',
    description: 'Send SMS notification to client or employee.',
    category: 'communication',
    iconHint: 'sms',
  },
  marketplace: {
    label: 'Marketplace',
    description: 'Trigger Expert Marketplace or knowledge commerce action.',
    category: 'integration',
    iconHint: 'store',
  },
  'studio-institute': {
    label: 'Studio Institute™',
    description: 'Assign training path or certification checkpoint.',
    category: 'integration',
    iconHint: 'academy',
  },
  automation: {
    label: 'Automation',
    description: 'Execute registered Automation Registry™ action.',
    category: 'integration',
    iconHint: 'gear',
  },
  'custom-plugin': {
    label: 'Custom Plugin',
    description: 'Invoke Plugin SDK™ custom plugin node.',
    category: 'integration',
    iconHint: 'plugin',
  },
  end: {
    label: 'End',
    description: 'Complete workflow and archive execution record.',
    category: 'terminal',
    iconHint: 'stop',
  },
};

export function buildWorkflowNodeCatalog(): WorkflowNodeEntry[] {
  return WORKFLOW_NODE_TYPES.map((nodeType) => ({
    nodeType,
    draggable: true as const,
    ...NODE_META[nodeType],
  }));
}

export function getNodeByType(nodeType: WorkflowNodeType): WorkflowNodeEntry | undefined {
  return buildWorkflowNodeCatalog().find((n) => n.nodeType === nodeType);
}
