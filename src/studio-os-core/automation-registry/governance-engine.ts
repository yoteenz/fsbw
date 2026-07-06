import { buildAutomationCatalog } from './automation-catalog';
import { getAllEventTypes } from '../event-bus/registration';
import type { AutomationGovernanceFinding } from './types';

/** Automation governance — nothing executes without registration. */
export function runAutomationGovernanceAudit(): AutomationGovernanceFinding[] {
  const findings: AutomationGovernanceFinding[] = [];
  const catalog = buildAutomationCatalog();
  const eventTypes = getAllEventTypes();

  const unregistered = catalog.filter((a) => !a.registered);
  if (unregistered.length > 0) {
    findings.push({
      id: 'unregistered-automations',
      severity: 'critical',
      message: `${unregistered.length} automation(s) not registered — execution blocked.`,
      recommendation: 'Register all automations via registerAutomation() before enabling.',
    });
  }

  const noOwner = catalog.filter((a) => !a.owner || a.owner === 'Unknown');
  if (noOwner.length > 0) {
    findings.push({
      id: 'missing-owner',
      severity: 'warning',
      message: `${noOwner.length} automation(s) missing owner assignment.`,
      recommendation: 'Assign department owner for accountability and audit trail.',
    });
  }

  const highRiskNoApproval = catalog.filter((a) => a.riskLevel === 'high' && !a.approvalRequired && a.status === 'active');
  for (const a of highRiskNoApproval) {
    findings.push({
      id: `high-risk-no-approval-${a.automationId}`,
      severity: 'warning',
      automationId: a.automationId,
      message: `${a.name} is high-risk but approval not required.`,
      recommendation: 'Enable approvalRequired for high-risk automations.',
    });
  }

  const failedActive = catalog.filter((a) => a.status === 'failed');
  if (failedActive.length > 0) {
    findings.push({
      id: 'failed-automations',
      severity: 'warning',
      message: `${failedActive.length} automation(s) in failed state — review execution history.`,
      recommendation: 'Debug via Automation Registry dashboard or pause until resolved.',
    });
  }

  const busAutomations = eventTypes.filter((e) => e.subscribers.includes('automation-registry'));
  findings.push({
    id: 'event-bus-integration',
    severity: 'info',
    message: `${busAutomations.length} Event Bus event types trigger automation-registry reactions.`,
    recommendation: 'All automations should subscribe via Event Bus — never direct module calls.',
  });

  findings.push({
    id: 'transparent-automation',
    severity: 'info',
    message: `${catalog.filter((a) => a.registered).length} registered automations — visible, searchable, auditable.`,
    recommendation: 'Automation builds trust when organizations understand what, why, who, and how.',
  });

  return findings.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function computeRegistrationCoveragePct(): number {
  const catalog = buildAutomationCatalog();
  const registered = catalog.filter((a) => a.registered).length;
  return Math.round((registered / Math.max(1, catalog.length)) * 100);
}
