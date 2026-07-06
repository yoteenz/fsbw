import { ROLE_PROFILES } from './constants';
import { buildCapabilityCatalog } from './capability-catalog';
import type { RoleComposition, RoleProfileId } from './types';

const ROLE_CAPS: Record<RoleProfileId, string[]> = {
  founder: buildCapabilityCatalog().map((c) => c.capabilityId),
  executive: [
    'content.view', 'content.create', 'content.edit', 'content.approve', 'content.publish',
    'campaigns.view', 'campaigns.create', 'campaigns.publish', 'campaigns.approve',
    'automations.view', 'automations.configure-automations', 'automations.approve',
    'financials.view-financials', 'invoices.view', 'invoices.approve',
    'users.view', 'users.manage-users', 'legacy-vault.access-legacy-vault',
    'profession-brain.view', 'concierges.manage-concierges',
  ],
  manager: [
    'content.view', 'content.create', 'content.edit', 'content.approve',
    'campaigns.view', 'campaigns.create', 'campaigns.publish',
    'automations.view', 'invoices.view', 'invoices.approve',
    'users.view', 'profession-brain.view',
  ],
  marketing: [
    'content.view', 'content.create', 'content.edit', 'content.publish',
    'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.publish',
    'knowledge.view', 'knowledge.create', 'marketplace.view',
  ],
  finance: [
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.approve',
    'financials.view-financials', 'data-exports.view', 'automations.view',
  ],
  operations: [
    'automations.view', 'automations.configure-automations', 'packs.install-packs',
    'policies.view', 'users.view', 'profession-brain.view',
  ],
  'customer-support': [
    'content.view', 'knowledge.view', 'users.view', 'concierges.view',
  ],
  hr: [
    'users.view', 'users.manage-users', 'policies.view', 'profession-brain.view',
  ],
  developer: [
    'automations.view', 'automations.configure-automations', 'prompts.view', 'prompts.edit',
    'packs.install-packs', 'policies.view', 'data-exports.export-data',
  ],
  contractor: [
    'content.view', 'content.create', 'campaigns.view', 'knowledge.view',
  ],
  guest: ['content.view', 'knowledge.view', 'marketplace.view'],
};

const ROLE_LABELS: Record<RoleProfileId, { label: string; description: string; dept?: string }> = {
  founder: { label: 'Founder', description: 'Full organizational capability — all modular permissions.' },
  executive: { label: 'Executive', description: 'Strategic operations, approvals, and financial visibility.' },
  manager: { label: 'Manager', description: 'Department oversight with approval authority.' },
  marketing: { label: 'Marketing', description: 'Content creation, campaigns, and publishing.' },
  finance: { label: 'Finance', description: 'Invoices, financials, and billing approvals.' },
  operations: { label: 'Operations', description: 'Automations, packs, and operational configuration.' },
  'customer-support': { label: 'Customer Support', description: 'Customer-facing content and knowledge access.' },
  hr: { label: 'HR', description: 'User management and organizational policies.' },
  developer: { label: 'Developer', description: 'Platform configuration, automations, and exports.' },
  contractor: { label: 'Contractor', description: 'Limited project-scoped create access.' },
  guest: { label: 'Guest', description: 'Read-only access to public content and marketplace.' },
};

/** Reusable permission profiles — organizations customize every role. */
export function buildRoleCompositions(): RoleComposition[] {
  return ROLE_PROFILES.map((roleId) => ({
    roleId,
    label: ROLE_LABELS[roleId].label,
    description: ROLE_LABELS[roleId].description,
    capabilityIds: ROLE_CAPS[roleId],
    customizable: roleId !== 'founder',
    defaultForDepartment: ROLE_LABELS[roleId].dept,
  }));
}

export function getRoleComposition(roleId: RoleProfileId): RoleComposition | undefined {
  return buildRoleCompositions().find((r) => r.roleId === roleId);
}

export function roleHasCapability(roleId: RoleProfileId, capabilityId: string): boolean {
  return ROLE_CAPS[roleId]?.includes(capabilityId) ?? false;
}

export function findRolesWithCapability(capabilityId: string): RoleComposition[] {
  return buildRoleCompositions().filter((r) => r.capabilityIds.includes(capabilityId));
}

export function findRolesWithVerb(verb: string, resource?: string): RoleComposition[] {
  const capId = resource ? `${resource}.${verb}` : verb;
  return buildRoleCompositions().filter((r) =>
    r.capabilityIds.some((id) => id.includes(capId) || id.endsWith(`.${verb}`))
  );
}
