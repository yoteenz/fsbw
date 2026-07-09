import type { AutomationOpportunity } from '../business-types';

export function listAutomationOpportunities(opportunities: AutomationOpportunity[]): AutomationOpportunity[] {
  return [...opportunities].sort((a, b) => b.priority - a.priority);
}

export function getAutomationOpportunity(
  opportunities: AutomationOpportunity[],
  id: string
): AutomationOpportunity | null {
  return opportunities.find((o) => o.id === id) ?? null;
}

export function getAutomationForSystem(
  opportunities: AutomationOpportunity[],
  systemId: string
): AutomationOpportunity[] {
  return opportunities.filter((o) => o.systemIds.includes(systemId));
}
