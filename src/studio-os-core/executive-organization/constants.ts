import type { ExecutiveId } from './types';

export const EXECUTIVE_ORGANIZATION_STORAGE_KEY = 'studioOsExecutiveOrganization_v1';
export const EXECUTIVE_ORGANIZATION_VERSION = '1.0.0';
export const EXECUTIVE_ORGANIZATION_ID = 'executive-organization';

export const ORG_HIERARCHY_CHAIN = [
  { level: 'founder' as const, label: 'FOUNDER', description: 'Leads vision · sets priorities · founder judgment on strategy' },
  { level: 'chief-of-staff' as const, label: 'CHIEF OF STAFF', description: 'Coordinates leadership team · soft approvals · attention protection' },
  { level: 'executive-leadership' as const, label: 'EXECUTIVE LEADERSHIP', description: 'Department leaders executing organizational genetics' },
  { level: 'departments' as const, label: 'DEPARTMENTS', description: 'Functional headquarters with objectives and playbooks' },
  { level: 'teams' as const, label: 'TEAMS', description: 'Specialized units within departments' },
  { level: 'workers' as const, label: 'WORKERS', description: 'AI specialists · automation agents · future human talent' },
  { level: 'projects' as const, label: 'PROJECTS', description: 'Initiatives spanning teams and departments' },
  { level: 'tasks' as const, label: 'TASKS', description: 'Atomic work units feeding institutional knowledge' },
];

export const EXECUTIVE_ROSTER: { id: ExecutiveId; title: string; department: string }[] = [
  { id: 'chief-of-staff', title: 'Chief of Staff', department: 'Executive Office' },
  { id: 'chief-marketing-officer', title: 'Chief Marketing Officer', department: 'Marketing' },
  { id: 'chief-creative-officer', title: 'Chief Creative Officer', department: 'Creative' },
  { id: 'chief-operations-officer', title: 'Chief Operations Officer', department: 'Operations' },
  { id: 'chief-financial-officer', title: 'Chief Financial Officer', department: 'Finance' },
  { id: 'chief-technology-officer', title: 'Chief Technology Officer', department: 'Technology' },
  { id: 'chief-product-officer', title: 'Chief Product Officer', department: 'Product' },
  { id: 'chief-content-officer', title: 'Chief Content Officer', department: 'Content' },
  { id: 'chief-brand-officer', title: 'Chief Brand Officer', department: 'Brand' },
  { id: 'chief-legal-officer', title: 'Chief Legal Officer', department: 'Legal' },
  { id: 'chief-growth-officer', title: 'Chief Growth Officer', department: 'Growth' },
];

export const DNA_ALIGNMENT_LAYERS = [
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Leadership DNA',
  'Operational DNA',
] as const;
