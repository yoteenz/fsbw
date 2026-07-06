import { STATE_OBJECT_TYPES } from './constants';
import type { StateObjectEntry, StateObjectType } from './types';

const OBJECT_META: Record<
  StateObjectType,
  { label: string; description: string; currentCount: number }
> = {
  documents: { label: 'Documents', description: 'SOPs, contracts, Operating Manual sections.', currentCount: 142 },
  'knowledge-products': { label: 'Knowledge Products', description: 'Expert Marketplace and Knowledge Commerce offerings.', currentCount: 28 },
  'profession-brains': { label: 'Profession Brains™', description: 'Institutional intelligence surfaces.', currentCount: 6 },
  departments: { label: 'Departments', description: 'Department packs and concierge assignments.', currentCount: 12 },
  projects: { label: 'Projects', description: 'Active initiatives tracked in Memory Engine™.', currentCount: 34 },
  customers: { label: 'Customers', description: 'Client records and relationship history.', currentCount: 891 },
  employees: { label: 'Employees', description: 'Team members and role assignments.', currentCount: 47 },
  'marketplace-listings': { label: 'Marketplace Listings', description: 'Expert profiles and published offerings.', currentCount: 15 },
  'academy-courses': { label: 'Academy Courses', description: 'Studio Institute™ learning paths.', currentCount: 22 },
  'automation-workflows': { label: 'Automation Workflows', description: 'Automation Registry™ registered processes.', currentCount: 18 },
  'command-dock-tasks': { label: 'Command Dock Tasks', description: 'Executive commands and pending preparations.', currentCount: 56 },
  assets: { label: 'Assets', description: 'Visual assets in Asset Director.', currentCount: 203 },
  announcements: { label: 'Announcements', description: 'Organization-wide communications.', currentCount: 8 },
  policies: { label: 'Policies', description: 'Policy Engine™ organizational rules.', currentCount: 24 },
  plugins: { label: 'Plugins', description: 'Plugin SDK™ installed extensions.', currentCount: 4 },
};

export function buildStateObjectCatalog(): StateObjectEntry[] {
  return STATE_OBJECT_TYPES.map((objectType) => ({
    objectType,
    managed: true as const,
    ...OBJECT_META[objectType],
  }));
}

export function countManagedObjects(): number {
  return buildStateObjectCatalog().reduce((sum, o) => sum + o.currentCount, 0);
}

export function findObjectsByState(_state: string, objectType?: StateObjectType): StateObjectEntry[] {
  const catalog = buildStateObjectCatalog();
  return objectType ? catalog.filter((o) => o.objectType === objectType) : catalog;
}
