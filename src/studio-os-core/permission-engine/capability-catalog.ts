import type { CapabilityEntry, CapabilityVerb, RoleProfileId } from './types';

function cap(verb: CapabilityVerb, resource: string, description: string): CapabilityEntry {
  const capabilityId = `${resource}.${verb}`;
  const name = `Can ${verb.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} ${resource.replace(/-/g, ' ')}`;
  return { capabilityId, verb, name, description, resource, modular: true, registered: true };
}

function descriptionForVerb(verb: CapabilityVerb): string {
  const map: Partial<Record<CapabilityVerb, string>> = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    approve: 'Approve',
    reject: 'Reject',
    publish: 'Publish',
    archive: 'Archive',
    restore: 'Restore',
  };
  return map[verb] ?? verb;
}

/** Modular capability catalog — permissions describe what people can do. */
export function buildCapabilityCatalog(): CapabilityEntry[] {
  const resources = [
    { id: 'content', desc: 'marketing and published content' },
    { id: 'campaigns', desc: 'marketing campaigns and schedules' },
    { id: 'automations', desc: 'Automation Registry workflows' },
    { id: 'prompts', desc: 'Prompt Registry AI templates' },
    { id: 'policies', desc: 'Policy Engine organizational rules' },
    { id: 'invoices', desc: 'finance invoices and billing' },
    { id: 'financials', desc: 'organization financial reports' },
    { id: 'users', desc: 'user accounts and roles' },
    { id: 'profession-brain', desc: 'Profession Brain training modules' },
    { id: 'concierges', desc: 'Digital Concierge configuration' },
    { id: 'packs', desc: 'department and profession packs' },
    { id: 'data-exports', desc: 'organization data exports' },
    { id: 'legacy-vault', desc: 'Legacy Vault archival assets' },
    { id: 'knowledge', desc: 'Knowledge Commerce products' },
    { id: 'marketplace', desc: 'Expert marketplace listings' },
  ];

  const verbs: CapabilityVerb[] = [
    'view',
    'create',
    'edit',
    'delete',
    'approve',
    'reject',
    'publish',
    'archive',
    'restore',
  ];

  const catalog: CapabilityEntry[] = [];
  for (const r of resources) {
    for (const v of verbs) {
      if (v === 'publish' && !['content', 'campaigns', 'knowledge', 'marketplace'].includes(r.id)) continue;
      if (v === 'approve' && ['legacy-vault', 'data-exports'].includes(r.id)) continue;
      catalog.push(cap(v, r.id, `${descriptionForVerb(v)} ${r.desc}`));
    }
  }

  catalog.push(
    cap('train-profession-brain', 'profession-brain', 'Train and extend Profession Brain modules'),
    cap('manage-concierges', 'concierges', 'Configure Digital Concierge behavior and scope'),
    cap('configure-automations', 'automations', 'Register and configure Automation Registry workflows'),
    cap('install-packs', 'packs', 'Install department and profession packs'),
    cap('export-data', 'data-exports', 'Export organization data with audit trail'),
    cap('view-financials', 'financials', 'View organization financial reports and dashboards'),
    cap('manage-users', 'users', 'Manage user accounts, roles, and delegations'),
    cap('change-policies', 'policies', 'Modify Policy Engine organizational rules'),
    cap('access-legacy-vault', 'legacy-vault', 'Access Legacy Vault archival assets')
  );

  return catalog;
}

export function getCapabilityEntry(capabilityId: string): CapabilityEntry | undefined {
  return buildCapabilityCatalog().find((c) => c.capabilityId === capabilityId);
}

export function listCapabilitiesByVerb(verb: CapabilityVerb): CapabilityEntry[] {
  return buildCapabilityCatalog().filter((c) => c.verb === verb);
}

export function listCapabilitiesByResource(resource: string): CapabilityEntry[] {
  return buildCapabilityCatalog().filter((c) => c.resource === resource);
}

export function whoCanPublishCampaigns(): { roleId: RoleProfileId; label: string }[] {
  return [
    { roleId: 'founder', label: 'Founder' },
    { roleId: 'executive', label: 'Executive' },
    { roleId: 'marketing', label: 'Marketing' },
    { roleId: 'manager', label: 'Manager (Marketing dept)' },
  ];
}
