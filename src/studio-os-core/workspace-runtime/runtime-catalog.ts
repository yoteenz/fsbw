import { RUNTIME_COMPONENTS } from './constants';
import type { RuntimeComponentEntry, RuntimeComponentId } from './types';

const COMPONENT_META: Record<
  RuntimeComponentId,
  { name: string; description: string; version?: string }
> = {
  headquarters: { name: 'Headquarters', description: 'Mission Control digital headquarters — isolated per organization.' },
  departments: { name: 'Departments', description: 'Department structure and packs scoped to this runtime.' },
  'digital-concierges': { name: 'Digital Concierges', description: 'Concierge voices and scope — never shared across orgs.' },
  'profession-brain': { name: 'Profession Brain™', description: 'Profession expertise modules isolated to organization.' },
  'organization-genome': { name: 'Organization Genome™', description: 'Industry DNA and organizational identity.' },
  'knowledge-fabric': { name: 'Knowledge Fabric™', description: 'Knowledge graph nodes private to organization.' },
  'memory-engine': { name: 'Memory Engine™', description: 'Institutional memory — organization-scoped only.' },
  'command-dock': { name: 'Command Dock™', description: 'Founder command interface bound to organization context.' },
  'executive-council': { name: 'Executive Council™', description: 'Advisor deliberations scoped to organization.' },
  policies: { name: 'Policies', description: 'Policy Engine rules — organization layer only.' },
  permissions: { name: 'Permissions', description: 'Permission Engine capabilities — organization roles.' },
  automation: { name: 'Automation', description: 'Automation Registry workflows — runtime-isolated execution.' },
  assets: { name: 'Assets', description: 'Brand, media, and organizational assets.' },
  marketplace: { name: 'Marketplace', description: 'Expert listings and marketplace presence.' },
  'studio-institute': { name: 'Studio Institute™', description: 'Academy and training paths for organization.' },
  'legacy-vault': { name: 'Legacy Vault™', description: 'Archival assets — strict runtime boundary.' },
  'organization-timeline': { name: 'Organization Timeline', description: 'Executive timeline history — organization only.' },
  'organization-pulse': { name: 'Organization Pulse™', description: 'Pulse indicators and health — scoped runtime.' },
};

/** Isolated organization runtime components — nothing leaks unless authorized. */
export function buildRuntimeComponents(): RuntimeComponentEntry[] {
  return RUNTIME_COMPONENTS.map((componentId) => {
    const meta = COMPONENT_META[componentId];
    return {
      componentId,
      name: meta.name,
      description: meta.description,
      isolated: true,
      status: componentId === 'automation' ? 'updating' : 'active',
      version: meta.version ?? '1.0.0',
    };
  });
}

export function getRuntimeComponent(componentId: RuntimeComponentId): RuntimeComponentEntry | undefined {
  return buildRuntimeComponents().find((c) => c.componentId === componentId);
}

export function listActiveComponents(): RuntimeComponentEntry[] {
  return buildRuntimeComponents().filter((c) => c.status === 'active');
}
