import { buildPolicyCatalog } from './policy-catalog';
import type { PolicySimulationResult } from './types';

function simulation(
  partial: Pick<
    PolicySimulationResult,
    'simulationId' | 'policyId' | 'policyName' | 'changeSummary'
  > &
    Partial<PolicySimulationResult>
): PolicySimulationResult {
  return {
    simulatedAt: partial.simulatedAt ?? new Date().toISOString(),
    affectedDepartments: partial.affectedDepartments ?? [],
    affectedAutomations: partial.affectedAutomations ?? [],
    affectedEmployees: partial.affectedEmployees ?? 0,
    affectedCustomers: partial.affectedCustomers ?? 0,
    potentialRisks: partial.potentialRisks ?? [],
    recommendedChanges: partial.recommendedChanges ?? [],
    riskLevel: partial.riskLevel ?? 'low',
    ...partial,
  };
}

/** Seed simulation results — impact preview before publishing policy changes. */
export function buildSeedSimulationResults(): PolicySimulationResult[] {
  return [
    simulation({
      simulationId: 'sim-001',
      policyId: 'org.content-publishing',
      policyName: 'Content Publishing Policies',
      changeSummary: 'Add mandatory 48-hour review window for external campaigns',
      affectedDepartments: ['Marketing', 'Executive'],
      affectedAutomations: ['content-creation.social-calendar', 'content-creation.newsletter'],
      affectedEmployees: 12,
      affectedCustomers: 0,
      potentialRisks: ['Campaign launch delays', 'Reduced publishing velocity'],
      recommendedChanges: ['Phased rollout over 2 weeks', 'Notify marketing team'],
      riskLevel: 'medium',
    }),
    simulation({
      simulationId: 'sim-002',
      policyId: 'org.approval-workflow',
      policyName: 'Organization Approval Workflow',
      changeSummary: 'Raise founder approval threshold for operational changes',
      affectedDepartments: ['Operations', 'Finance', 'Marketing'],
      affectedAutomations: ['workflow.approval-chain', 'workflow.autonomous-preparation'],
      affectedEmployees: 28,
      affectedCustomers: 150,
      potentialRisks: ['Slower operational velocity', 'Founder approval queue growth'],
      recommendedChanges: ['Delegate threshold approvals to department heads', 'Add SLA for founder review'],
      riskLevel: 'high',
    }),
    simulation({
      simulationId: 'sim-003',
      policyId: 'dept.marketing-standards',
      policyName: 'Marketing Department Standards',
      changeSummary: 'Require A/B test documentation for all campaigns',
      affectedDepartments: ['Marketing'],
      affectedAutomations: ['content-creation.social-calendar'],
      affectedEmployees: 6,
      affectedCustomers: 0,
      potentialRisks: ['Minor workflow overhead'],
      recommendedChanges: ['Provide A/B test template in Operating Manual'],
      riskLevel: 'low',
    }),
  ];
}

/** Simulate policy change impact before publishing. */
export function simulatePolicyChange(
  policyId: string,
  changeSummary: string
): PolicySimulationResult {
  const entry = buildPolicyCatalog().find((p) => p.policyId === policyId);
  const dept = entry?.department ?? 'Operations';

  const deptMap: Record<string, { automations: string[]; employees: number; customers: number; risk: PolicySimulationResult['riskLevel'] }> = {
    Marketing: { automations: ['content-creation.social-calendar', 'content-creation.newsletter'], employees: 8, customers: 0, risk: 'medium' },
    Finance: { automations: ['automation.payroll-batch', 'workflow.approval-chain'], employees: 5, customers: 0, risk: 'high' },
    Operations: { automations: ['workflow.autonomous-preparation', 'command-dock.routing'], employees: 15, customers: 50, risk: 'medium' },
    Legal: { automations: ['workflow.knowledge-export'], employees: 3, customers: 200, risk: 'high' },
    Executive: { automations: ['command-dock.proactive-briefing', 'executive-council.meeting-synthesis'], employees: 4, customers: 0, risk: 'low' },
  };

  const impact = deptMap[dept] ?? deptMap.Operations;

  return simulation({
    simulationId: `sim-${Date.now()}`,
    policyId,
    policyName: entry?.name ?? policyId,
    changeSummary,
    affectedDepartments: [dept, 'Executive'],
    affectedAutomations: impact.automations,
    affectedEmployees: impact.employees,
    affectedCustomers: impact.customers,
    potentialRisks: [
      `Workflow adjustments in ${dept}`,
      entry?.level === 'platform' ? 'Platform-wide compliance review required' : 'Department retraining may be needed',
    ],
    recommendedChanges: [
      'Run Policy Simulation before publishing',
      'Notify affected departments via Command Dock',
      'Update Operating Manual section',
    ],
    riskLevel: impact.risk,
    simulatedAt: new Date().toISOString(),
  });
}
