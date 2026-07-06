/** Milestone 163 — Identity Graph™ · Foundational people intelligence layer */

export const IDENTITY_GRAPH_STORAGE_KEY = 'studioOsIdentityGraph_v1';
export const IDENTITY_GRAPH_VERSION = '1.0.0';
export const STUDIO_OS_IDENTITY_GRAPH_UPDATED = 'studio-os-identity-graph-updated';

export const IDENTITY_GRAPH_ACCENT = '#7C3AED';

export const IDENTITY_GRAPH_PHILOSOPHY = [
  'People are first-class citizens inside Studio OS — organizations are built from people, and Studio OS should understand both.',
  'Every identity becomes a living profile — not a simple user account, but a person with relationships, expertise, history, and organizational context.',
  'Studio Intelligence™ should understand how people connect, collaborate, and contribute across the entire organization.',
  'Identity Graph™ is the foundational intelligence layer that makes every person visible, contextual, and respected.',
] as const;

export const IDENTITY_TYPES = [
  'founder',
  'employee',
  'customer',
  'expert',
  'vendor',
  'partner',
  'investor',
  'advisor',
  'contractor',
  'applicant',
] as const;

export const IDENTITY_TYPE_LABELS: Record<(typeof IDENTITY_TYPES)[number], string> = {
  founder: 'Founder',
  employee: 'Employee',
  customer: 'Customer',
  expert: 'Expert',
  vendor: 'Vendor',
  partner: 'Partner',
  investor: 'Investor',
  advisor: 'Advisor',
  contractor: 'Contractor',
  applicant: 'Applicant',
};

export const RELATIONSHIP_EDGE_TYPES = [
  'reports-to',
  'works-with',
  'mentors',
  'collaborates-with',
  'referred-by',
  'family-business',
  'ownership',
  'clients-served',
  'teams',
  'departments',
  'organizations',
] as const;

export const RELATIONSHIP_EDGE_LABELS: Record<(typeof RELATIONSHIP_EDGE_TYPES)[number], string> = {
  'reports-to': 'Reports To',
  'works-with': 'Works With',
  mentors: 'Mentors',
  'collaborates-with': 'Collaborates With',
  'referred-by': 'Referred By',
  'family-business': 'Family Business',
  ownership: 'Ownership',
  'clients-served': 'Clients Served',
  teams: 'Teams',
  departments: 'Departments',
  organizations: 'Organizations',
};

export const IDENTITY_GRAPH_DOMAINS = [
  'people',
  'relationships',
  'expertise',
  'responsibilities',
  'knowledge',
  'permissions',
  'culture',
] as const;

export const IDENTITY_GRAPH_DOMAIN_LABELS: Record<(typeof IDENTITY_GRAPH_DOMAINS)[number], string> = {
  people: 'People',
  relationships: 'Relationships',
  expertise: 'Expertise',
  responsibilities: 'Responsibilities',
  knowledge: 'Knowledge Contributions',
  permissions: 'Permissions',
  culture: 'Life & Culture Preferences™',
};

export const COMMUNICATION_PREFERENCE_TYPES = [
  'email',
  'async',
  'video',
  'in-person',
  'formal-written',
  'visual-first',
] as const;

export const PERMISSION_LEVELS = ['owner', 'admin', 'editor', 'contributor', 'viewer', 'guest'] as const;
