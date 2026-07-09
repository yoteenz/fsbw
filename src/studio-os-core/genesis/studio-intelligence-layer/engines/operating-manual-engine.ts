import { getOperatingManual } from '../registries/intelligence-registries';
import type { XsilOperatingManualRecord } from '../types';

/** Operating Manual Engine™ — doctrine every AI worker consults */
export function resolveManualForAction(
  companyId: string,
  domain: string
): { manual: XsilOperatingManualRecord | undefined; workflow?: string; owner?: string } {
  const manual = getOperatingManual(companyId);
  if (!manual) return { manual: undefined };

  const workflow = manual.approvalWorkflows.find((w) => w.domain.toLowerCase().includes(domain.toLowerCase()));
  const owner = manual.decisionOwnership.find((d) => d.domain.toLowerCase().includes(domain.toLowerCase()));

  return {
    manual,
    workflow: workflow?.workflowId,
    owner: owner?.owner,
  };
}

export function buildManualConsultationChecklist(companyId: string): string[] {
  const manual = getOperatingManual(companyId);
  if (!manual) return ['Operating manual not found — escalate to founder'];

  return [
    `Philosophy: ${manual.operatingPhilosophy}`,
    `Quality standards: ${manual.qualityStandards.join(' · ')}`,
    `Canon status: ${manual.canonStatus}`,
    `Automation rules: ${manual.automationRules.length} registered`,
    `Escalation paths: ${manual.escalationPaths.map((e) => e.riskClass).join(', ')}`,
  ];
}
