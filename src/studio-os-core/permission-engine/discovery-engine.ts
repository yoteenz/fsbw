import { getAllCapabilities } from './registration';
import { buildRoleCompositions, findRolesWithCapability, findRolesWithVerb } from './role-composition';
import type { PermissionSearchHit } from './types';

export function queryPermissionEngine(query: string, limit = 12): PermissionSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const hits: PermissionSearchHit[] = [];

  for (const entry of getAllCapabilities()) {
    const blob = `${entry.name} ${entry.capabilityId} ${entry.verb} ${entry.resource} ${entry.description}`.toLowerCase();
    let score = 0;
    let reason = 'capability';
    for (const term of terms) {
      if (entry.capabilityId.includes(term)) score += 12;
      if (entry.verb.includes(term)) score += 10;
      if (entry.resource.includes(term)) score += 9;
      if (entry.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ entry, type: 'capability', score, matchReason: reason });
  }

  for (const role of buildRoleCompositions()) {
    const blob = `${role.label} ${role.roleId} ${role.description}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (role.roleId.includes(term)) score += 10;
      if (role.label.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ entry: role, type: 'role', score, matchReason: 'role' });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainCapability(capabilityId: string): string | null {
  const entry = getAllCapabilities().find((c) => c.capabilityId === capabilityId);
  if (!entry) return null;
  const roles = findRolesWithCapability(capabilityId);
  return `${entry.name} — ${entry.description} Granted to: ${roles.map((r) => r.label).join(', ') || 'none'}.`;
}

export function whoCanPerform(action: string, resource?: string): ReturnType<typeof findRolesWithVerb> {
  return findRolesWithVerb(action, resource);
}
