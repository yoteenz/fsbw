/** Milestone 167 — Organizational Hierarchy™ · How organizations actually function */

export const ORGANIZATIONAL_HIERARCHY_STORAGE_KEY = 'studioOsOrganizationalHierarchy_v1';
export const ORGANIZATIONAL_HIERARCHY_VERSION = '1.0.0';
export const STUDIO_OS_ORGANIZATIONAL_HIERARCHY_UPDATED = 'studio-os-organizational-hierarchy-updated';

export const ORGANIZATIONAL_HIERARCHY_ACCENT = '#0F766E';

export const ORGANIZATIONAL_HIERARCHY_PHILOSOPHY = [
  'Hierarchy should represent how organizations actually function — not just an org chart.',
  'Studio OS maps how every person, department, team, and organization connects — including matrix lines, shared services, and temporary project teams.',
  'Organizational Hierarchy™ supports matrix organizations, holding companies, family businesses, franchises, and multi-location companies.',
  'Studio Intelligence™ routes approvals, surfaces cross-department support, and flags structural gaps like teams without active managers.',
] as const;

export const HIERARCHY_NODE_TYPES = [
  'founder',
  'executive',
  'department',
  'team',
  'manager',
  'employee',
  'contractor',
  'partner',
  'advisor',
  'shared-service',
  'organization',
  'location',
  'project-team',
] as const;

export const HIERARCHY_NODE_LABELS: Record<(typeof HIERARCHY_NODE_TYPES)[number], string> = {
  founder: 'Founder',
  executive: 'Executive',
  department: 'Department',
  team: 'Team',
  manager: 'Manager',
  employee: 'Employee',
  contractor: 'Contractor',
  partner: 'Partner',
  advisor: 'Advisor',
  'shared-service': 'Shared Service',
  organization: 'Organization',
  location: 'Location',
  'project-team': 'Project Team',
};

export const STRUCTURE_TYPES = [
  'standard',
  'matrix',
  'holding-company',
  'family-business',
  'franchise',
  'multi-location',
  'shared-department',
  'project-team',
] as const;

export const STRUCTURE_TYPE_LABELS: Record<(typeof STRUCTURE_TYPES)[number], string> = {
  standard: 'Standard Hierarchy',
  matrix: 'Matrix Organization',
  'holding-company': 'Holding Company',
  'family-business': 'Family Business',
  franchise: 'Franchise Network',
  'multi-location': 'Multi-Location Company',
  'shared-department': 'Shared Department',
  'project-team': 'Temporary Project Team',
};

export const HIERARCHY_LINK_TYPES = [
  'reports-to',
  'dotted-line',
  'matrix-support',
  'shared-service',
  'advisory',
  'partnership',
  'ownership',
  'temporary',
  'approval-route',
] as const;

export const HIERARCHY_LINK_LABELS: Record<(typeof HIERARCHY_LINK_TYPES)[number], string> = {
  'reports-to': 'Reports To',
  'dotted-line': 'Dotted-Line Reporting',
  'matrix-support': 'Matrix Support',
  'shared-service': 'Shared Service',
  advisory: 'Advisory',
  partnership: 'Partnership',
  ownership: 'Ownership',
  temporary: 'Temporary Assignment',
  'approval-route': 'Approval Route',
};

export const HIERARCHY_DOMAINS = [
  'people',
  'departments',
  'teams',
  'connections',
  'matrix',
  'routing',
] as const;

export const HIERARCHY_DOMAIN_LABELS: Record<(typeof HIERARCHY_DOMAINS)[number], string> = {
  people: 'People & Roles',
  departments: 'Departments',
  teams: 'Teams',
  connections: 'Connections',
  matrix: 'Matrix & Shared Services',
  routing: 'Approval Routing',
};
