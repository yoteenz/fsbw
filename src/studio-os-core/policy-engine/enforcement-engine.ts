import { buildPolicyCatalog } from './policy-catalog';
import { getApplicablePoliciesForLevel } from './hierarchy-engine';
import type {
  EnforcementAction,
  PolicyEnforcementResult,
  PolicyEntry,
  WorkflowComplianceCheck,
} from './types';

function enforcementRecord(
  partial: Pick<
    PolicyEnforcementResult,
    'enforcementId' | 'workflowId' | 'workflowName' | 'compliant' | 'action' | 'explanation'
  > &
    Partial<PolicyEnforcementResult>
): PolicyEnforcementResult {
  return {
    checkedAt: partial.checkedAt ?? new Date().toISOString(),
    violatedPolicyIds: partial.violatedPolicyIds ?? [],
    recommendations: partial.recommendations ?? [],
    pausedExecution: partial.pausedExecution ?? !partial.compliant,
    ...partial,
  };
}

/** Seed enforcement history — audit trail of compliance checks. */
export function buildSeedEnforcementHistory(): PolicyEnforcementResult[] {
  const now = Date.now();
  return [
    enforcementRecord({
      enforcementId: 'enf-001',
      workflowId: 'workflow.content-publishing',
      workflowName: 'Content Publishing Pipeline',
      compliant: true,
      action: 'allow',
      explanation: 'Brand guidelines and approval workflow satisfied.',
      violatedPolicyIds: [],
      pausedExecution: false,
      checkedAt: new Date(now - 3600000).toISOString(),
    }),
    enforcementRecord({
      enforcementId: 'enf-002',
      workflowId: 'automation.marketplace-listing',
      workflowName: 'Marketplace Expert Listing',
      compliant: false,
      action: 'pause',
      explanation: 'Expertise verification incomplete — Marketplace policy requires verified listing.',
      violatedPolicyIds: ['org.marketplace'],
      recommendations: ['Complete expertise verification', 'Resubmit listing for approval'],
      pausedExecution: true,
      checkedAt: new Date(now - 7200000).toISOString(),
    }),
    enforcementRecord({
      enforcementId: 'enf-003',
      workflowId: 'automation.payroll-batch',
      workflowName: 'Payroll Automation Batch',
      compliant: false,
      action: 'require-approval',
      explanation: 'High-risk financial automation — Platform Approval Gate requires founder approval.',
      violatedPolicyIds: ['platform.approval-gate', 'dept.finance-permissions'],
      recommendations: ['Submit for founder approval', 'Verify dual approval for threshold amounts'],
      pausedExecution: true,
      checkedAt: new Date(now - 14400000).toISOString(),
    }),
    enforcementRecord({
      enforcementId: 'enf-004',
      workflowId: 'concierge.ai-response',
      workflowName: 'Concierge AI Response',
      compliant: true,
      action: 'allow',
      explanation: 'Professional Trust Framework scope verified; prompt registered in Prompt Registry.',
      violatedPolicyIds: [],
      pausedExecution: false,
      checkedAt: new Date(now - 1800000).toISOString(),
    }),
    enforcementRecord({
      enforcementId: 'enf-005',
      workflowId: 'workflow.knowledge-export',
      workflowName: 'Knowledge Export Workflow',
      compliant: false,
      action: 'block',
      explanation: 'Cross-org knowledge sharing blocked — privacy policy requires explicit consent.',
      violatedPolicyIds: ['org.privacy', 'org.knowledge-sharing'],
      recommendations: ['Obtain cross-org consent', 'Review Knowledge Sharing rules'],
      pausedExecution: true,
      checkedAt: new Date(now - 86400000).toISOString(),
    }),
  ].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
}

export function getPoliciesForWorkflow(workflowCategory: string, department?: string): PolicyEntry[] {
  const catalog = buildPolicyCatalog();
  const applicable = getApplicablePoliciesForLevel('individual', department);

  return applicable.filter(
    (p) =>
      p.appliesTo.some((a) => workflowCategory.includes(a) || a === 'workflow') ||
      p.category.includes(workflowCategory.split('.')[0] ?? '')
  ).length > 0
    ? applicable
    : catalog.filter((p) => p.status === 'active' && p.registered).slice(0, 6);
}

/** Verify workflow compliance before execution — pause, explain, recommend if not compliant. */
export function verifyWorkflowCompliance(
  workflowId: string,
  workflowName: string,
  context: {
    category?: string;
    department?: string;
    requiresApproval?: boolean;
    hasVerifiedExpertise?: boolean;
    hasPrivacyConsent?: boolean;
    isRegisteredAutomation?: boolean;
    isRegisteredPrompt?: boolean;
  } = {}
): WorkflowComplianceCheck {
  const policies = getPoliciesForWorkflow(context.category ?? workflowId, context.department);
  const violated: PolicyEntry[] = [];
  const recommendations: string[] = [];

  if (context.requiresApproval && !context.hasVerifiedExpertise) {
    const approval = policies.find((p) => p.policyId === 'platform.approval-gate');
    if (approval) violated.push(approval);
    recommendations.push('Submit for founder or department head approval');
  }

  if (workflowId.includes('marketplace') && context.hasVerifiedExpertise === false) {
    const marketplace = policies.find((p) => p.policyId === 'org.marketplace');
    if (marketplace) violated.push(marketplace);
    recommendations.push('Complete expertise verification before marketplace listing');
  }

  if (workflowId.includes('knowledge') && context.hasPrivacyConsent === false) {
    const privacy = policies.find((p) => p.policyId === 'org.privacy');
    if (privacy) violated.push(privacy);
    recommendations.push('Obtain cross-org consent before knowledge export');
  }

  if (workflowId.includes('automation') && context.isRegisteredAutomation === false) {
    const automation = policies.find((p) => p.policyId === 'org.automation-limits');
    if (automation) violated.push(automation);
    recommendations.push('Register automation in Automation Registry before execution');
  }

  if (workflowId.includes('concierge') && context.isRegisteredPrompt === false) {
    const ai = policies.find((p) => p.policyId === 'platform.ai-usage');
    if (ai) violated.push(ai);
    recommendations.push('Register prompt in Prompt Registry before AI execution');
  }

  const compliant = violated.length === 0;
  let action: EnforcementAction = 'allow';
  if (!compliant) {
    action = violated.some((p) => p.enforcementPriority >= 90) ? 'block' : 'pause';
    if (violated.some((p) => p.category === 'approval')) action = 'require-approval';
  }

  const explanation = compliant
    ? `All ${policies.length} applicable policies satisfied for ${workflowName}.`
    : `Blocked by ${violated.map((p) => p.name).join(', ')}.`;

  return {
    workflowId,
    workflowName,
    compliant,
    action,
    violatedPolicies: violated,
    explanation,
    recommendations: recommendations.length > 0 ? recommendations : ['Review Policy Engine enforcement history'],
  };
}

export function filterBlockedToday(history: PolicyEnforcementResult[]): PolicyEnforcementResult[] {
  const today = new Date().toISOString().slice(0, 10);
  return history.filter((e) => !e.compliant && e.checkedAt.startsWith(today));
}

export function computeComplianceRate(history: PolicyEnforcementResult[]): number {
  if (history.length === 0) return 100;
  const compliant = history.filter((e) => e.compliant).length;
  return Math.round((compliant / history.length) * 100);
}
