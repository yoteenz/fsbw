import type { PolicyCategory, PolicyEntry, PolicyLevel } from './types';

function policy(
  partial: Pick<
    PolicyEntry,
    'policyId' | 'name' | 'description' | 'category' | 'level' | 'owner' | 'rules'
  > &
    Partial<PolicyEntry>
): PolicyEntry {
  return {
    scope: partial.scope ?? ['all'],
    status: partial.status ?? 'active',
    version: partial.version ?? '1.0.0',
    documentation: partial.documentation ?? [`docs/studio-os/${partial.category}.md`],
    lastUpdated: partial.lastUpdated ?? new Date().toISOString(),
    registered: true,
    enforcementPriority: partial.enforcementPriority ?? 50,
    appliesTo: partial.appliesTo ?? ['concierge', 'automation', 'workflow', 'department'],
    ...partial,
  };
}

/** Canonical Policy Engine™ catalog — centralized organizational rulebook. */
export function buildPolicyCatalog(): PolicyEntry[] {
  return [
    policy({
      policyId: 'platform.approval-gate',
      name: 'Platform Approval Gate',
      description: 'High-risk actions require founder approval before execution platform-wide.',
      category: 'approval',
      level: 'platform',
      owner: 'Studio OS Platform',
      rules: ['High-risk automations require approval', 'Financial actions above threshold require approval', 'External publishing requires approval'],
      enforcementPriority: 95,
      appliesTo: ['automation', 'workflow'],
    }),
    policy({
      policyId: 'platform.ai-usage',
      name: 'Platform AI Usage Rules',
      description: 'All AI requests route through Model Orchestrator; no direct model calls.',
      category: 'ai-usage',
      level: 'platform',
      owner: 'Model Orchestrator',
      rules: ['Route via Model Orchestrator', 'Register prompts in Prompt Registry', 'Professional Trust Framework applies to all AI output'],
      enforcementPriority: 98,
      appliesTo: ['concierge', 'automation', 'workflow'],
    }),
    policy({
      policyId: 'org.approval-workflow',
      name: 'Organization Approval Workflow',
      description: 'Department heads approve operational changes; founder approves strategic changes.',
      category: 'approval',
      level: 'organization',
      owner: 'Executive',
      department: 'Executive',
      rules: ['Operational changes: department head approval', 'Strategic changes: founder approval', 'Emergency override logged to Executive Timeline'],
      parentPolicyId: 'platform.approval-gate',
      enforcementPriority: 85,
    }),
    policy({
      policyId: 'org.professional-trust',
      name: 'Professional Trust Framework',
      description: 'AI and automations must comply with Professional Trust scope boundaries.',
      category: 'professional-trust',
      level: 'organization',
      owner: 'Professional Trust Framework',
      department: 'Compliance',
      rules: ['Verify scope before AI response', 'Flag out-of-scope requests', 'Never provide legal/medical advice without disclaimer'],
      parentPolicyId: 'platform.ai-usage',
      enforcementPriority: 92,
    }),
    policy({
      policyId: 'org.privacy',
      name: 'Organization Privacy Rules',
      description: 'Customer and employee data protected; no cross-org sharing without consent.',
      category: 'privacy',
      level: 'organization',
      owner: 'Privacy Officer',
      department: 'Legal',
      rules: ['PII never in AI training without consent', 'Cross-org sharing requires permission', 'Data retention per compliance schedule'],
      enforcementPriority: 96,
    }),
    policy({
      policyId: 'org.marketplace',
      name: 'Marketplace Policies',
      description: 'Expert listings require verification; attribution permanent on contributions.',
      category: 'marketplace',
      level: 'organization',
      owner: 'Marketplace',
      department: 'Revenue',
      rules: ['Verified expertise before listing', 'Permanent attribution on shared assets', 'Pricing transparency required'],
      enforcementPriority: 80,
    }),
    policy({
      policyId: 'org.automation-limits',
      name: 'Automation Limits',
      description: 'Automations must register; high-risk require approval; nothing executes unregistered.',
      category: 'automation-limits',
      level: 'organization',
      owner: 'Automation Registry',
      department: 'Operations',
      rules: ['Register in Automation Registry before execution', 'Pause on policy violation', 'Log all executions to audit trail'],
      parentPolicyId: 'platform.approval-gate',
      enforcementPriority: 88,
    }),
    policy({
      policyId: 'org.knowledge-sharing',
      name: 'Knowledge Sharing Rules',
      description: 'Internal knowledge default private; Legacy Network sharing voluntary with attribution.',
      category: 'knowledge-sharing',
      level: 'organization',
      owner: 'Legacy Network',
      department: 'Knowledge',
      rules: ['Private knowledge never auto-shared', 'Legacy Network contribution voluntary', 'Attribution permanent on shared assets'],
      enforcementPriority: 82,
    }),
    policy({
      policyId: 'org.content-publishing',
      name: 'Content Publishing Policies',
      description: 'Brand guidelines and approval required before external content publish.',
      category: 'content-publishing',
      level: 'organization',
      owner: 'Brand Positioning',
      department: 'Marketing',
      rules: ['Brand voice compliance check', 'Founder approval for external campaigns', 'Scheduled content review window'],
      parentPolicyId: 'org.approval-workflow',
      enforcementPriority: 84,
    }),
    policy({
      policyId: 'dept.marketing-standards',
      name: 'Marketing Department Standards',
      description: 'Marketing automations follow brand guidelines and content publishing policies.',
      category: 'department-standards',
      level: 'department',
      owner: 'Marketing Director',
      department: 'Marketing',
      rules: ['All social content follows brand voice', 'Campaign approval before launch', 'A/B tests documented'],
      extendsPolicyId: 'org.content-publishing',
      enforcementPriority: 75,
    }),
    policy({
      policyId: 'dept.finance-permissions',
      name: 'Finance Employee Permissions',
      description: 'Finance team access to payroll and billing automations with audit logging.',
      category: 'employee-permissions',
      level: 'department',
      owner: 'Finance Director',
      department: 'Finance',
      rules: ['Payroll automations: finance admin only', 'Billing changes logged', 'Dual approval for refunds above threshold'],
      enforcementPriority: 90,
    }),
    policy({
      policyId: 'dept.security',
      name: 'Department Security Policies',
      description: 'MFA required for admin access; session timeout enforced.',
      category: 'security',
      level: 'department',
      owner: 'IT Security',
      department: 'Operations',
      rules: ['MFA for admin roles', 'Session timeout 8 hours', 'Failed login lockout after 5 attempts'],
      enforcementPriority: 94,
    }),
    policy({
      policyId: 'org.brand-guidelines',
      name: 'Brand Guidelines',
      description: 'Studio OS brand voice and visual language enforced across all surfaces.',
      category: 'brand-guidelines',
      level: 'organization',
      owner: 'Brand Positioning',
      department: 'Marketing',
      rules: ['Official tagline preserved', 'Design Token Engine tokens required', 'No hardcoded brand colors on pages'],
      enforcementPriority: 78,
    }),
    policy({
      policyId: 'org.organization-preferences',
      name: 'Organization Preferences',
      description: 'Founder preferences from Relationship Memory applied to Concierge behavior.',
      category: 'organization-preferences',
      level: 'organization',
      owner: 'Relationship Memory',
      department: 'Executive',
      rules: ['Apply learned communication preferences', 'Respect working hours', 'Visual review before implementation when preferred'],
      enforcementPriority: 70,
    }),
    policy({
      policyId: 'org.notification-rules',
      name: 'Notification Rules',
      description: 'Notification frequency and channels per department and role.',
      category: 'notification',
      level: 'organization',
      owner: 'Presence Engine',
      department: 'Operations',
      rules: ['Executive notifications: urgent only during focus blocks', 'Department digest: daily max', 'Customer notifications: opt-in required'],
      enforcementPriority: 65,
    }),
    policy({
      policyId: 'org.compliance',
      name: 'Compliance Requirements',
      description: 'Industry-specific compliance rules from Organization Genome.',
      category: 'compliance',
      level: 'organization',
      owner: 'Organization Genome',
      department: 'Legal',
      rules: ['Industry regulations from Genome applied', 'Audit trail for compliance actions', 'Annual compliance review scheduled'],
      enforcementPriority: 93,
    }),
    policy({
      policyId: 'team.sales-approvals',
      name: 'Sales Team Approval Rules',
      description: 'Discounts above 15% require manager approval.',
      category: 'approval',
      level: 'team',
      owner: 'Sales Manager',
      department: 'Sales',
      rules: ['Discounts ≤15%: auto-approve', 'Discounts >15%: manager approval', 'Custom pricing: founder approval'],
      extendsPolicyId: 'org.approval-workflow',
      enforcementPriority: 72,
    }),
    policy({
      policyId: 'individual.concierge-scope',
      name: 'Individual Concierge Scope',
      description: 'Concierge responses scoped to individual role permissions.',
      category: 'employee-permissions',
      level: 'individual',
      owner: 'Digital Concierge',
      department: 'Executive',
      rules: ['Responses limited to role permissions', 'Escalate beyond scope to department head', 'Never expose other employee data'],
      enforcementPriority: 86,
    }),
    policy({
      policyId: 'future.custom-policy',
      name: 'Future Organizational Rule Slot',
      description: 'Reserved slot for organization-specific custom policies.',
      category: 'future',
      level: 'organization',
      owner: 'Organization Admin',
      department: 'Platform',
      rules: ['Define custom rules without duplicating platform policies'],
      status: 'draft',
      version: '0.1.0',
    }),
  ];
}

export function getPolicyEntry(policyId: string): PolicyEntry | undefined {
  return buildPolicyCatalog().find((p) => p.policyId === policyId);
}

export function listPoliciesByCategory(category: PolicyCategory): PolicyEntry[] {
  return buildPolicyCatalog().filter((p) => p.category === category);
}

export function listPoliciesByLevel(level: PolicyLevel): PolicyEntry[] {
  return buildPolicyCatalog().filter((p) => p.level === level);
}

export function listPoliciesByStatus(status: PolicyEntry['status']): PolicyEntry[] {
  return buildPolicyCatalog().filter((p) => p.status === status);
}
