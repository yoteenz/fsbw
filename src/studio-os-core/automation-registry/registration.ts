import type { AutomationEntry } from './types';
import { buildAutomationCatalog, getAutomationEntry } from './automation-catalog';

const customAutomations: AutomationEntry[] = [];

export function registerAutomation(entry: AutomationEntry): AutomationEntry {
  const registered = { ...entry, registered: true };
  const idx = customAutomations.findIndex((a) => a.automationId === entry.automationId);
  if (idx >= 0) customAutomations[idx] = registered;
  else customAutomations.push(registered);
  return registered;
}

export function getAllAutomations(): AutomationEntry[] {
  const byId = new Map(buildAutomationCatalog().map((a) => [a.automationId, a]));
  for (const custom of customAutomations) {
    byId.set(custom.automationId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredAutomation(automationId: string): AutomationEntry | undefined {
  return getAllAutomations().find((a) => a.automationId === automationId) ?? getAutomationEntry(automationId);
}

/** Gate — unregistered automations must not execute. */
export function canAutomationExecute(automationId: string): boolean {
  const entry = getRegisteredAutomation(automationId);
  return entry?.registered === true && entry.status === 'active';
}
