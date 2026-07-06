import type { AccessCheckResult, CapabilityEntry, RoleProfileId } from './types';
import { buildCapabilityCatalog, getCapabilityEntry } from './capability-catalog';
import { evaluateContextualAccess } from './contextual-engine';
import { explainDeniedApproval } from './audit-history';
import { roleHasCapability } from './role-composition';

const customCapabilities: CapabilityEntry[] = [];

export function registerCapability(entry: CapabilityEntry): CapabilityEntry {
  const registered = { ...entry, registered: true };
  const idx = customCapabilities.findIndex((c) => c.capabilityId === entry.capabilityId);
  if (idx >= 0) customCapabilities[idx] = registered;
  else customCapabilities.push(registered);
  return registered;
}

export function getAllCapabilities(): CapabilityEntry[] {
  const byId = new Map(buildCapabilityCatalog().map((c) => [c.capabilityId, c]));
  for (const custom of customCapabilities) {
    byId.set(custom.capabilityId, custom);
  }
  return [...byId.values()];
}

/** Check if role may perform capability — with contextual evaluation. */
export function checkAccess(
  roleId: RoleProfileId,
  capabilityId: string,
  context?: Parameters<typeof evaluateContextualAccess>[1]
): AccessCheckResult {
  const hasCap = roleHasCapability(roleId, capabilityId);
  const ctx = evaluateContextualAccess(capabilityId, context ?? {});

  if (!hasCap) {
    return {
      allowed: false,
      capabilityId,
      roleId,
      explanation: explainDeniedApproval(roleId, capabilityId),
      missingCapabilities: [capabilityId],
    };
  }

  if (!ctx.allowed) {
    return {
      allowed: false,
      capabilityId,
      roleId,
      explanation: ctx.blockReason ?? 'Contextual permission rule blocked access.',
      contextualBlock: ctx.blockReason,
    };
  }

  return {
    allowed: true,
    capabilityId,
    roleId,
    explanation: `${roleId} authorized for ${capabilityId}.`,
  };
}

export function canPerformCapability(roleId: RoleProfileId, capabilityId: string): boolean {
  return checkAccess(roleId, capabilityId).allowed;
}

export function getRegisteredCapability(capabilityId: string): CapabilityEntry | undefined {
  return getAllCapabilities().find((c) => c.capabilityId === capabilityId) ?? getCapabilityEntry(capabilityId);
}
