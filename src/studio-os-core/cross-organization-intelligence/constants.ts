/** Milestone 111 — Cross-Organization Intelligence™ V1.0 */

export const CROSS_ORG_INTELLIGENCE_STORAGE_KEY = 'studioOsCrossOrgIntelligence_v1';
export const CROSS_ORG_INTELLIGENCE_VERSION = '1.0.0';
export const STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED = 'studio-os-cross-org-intelligence-updated';

export const CROSS_ORG_PHILOSOPHY = [
  'Organizations should not exist in isolation — collaboration, not surveillance.',
  'Studio OS recognizes opportunities for organizations to benefit one another when authorized.',
  'Private operational knowledge is never shared automatically — complete trust and ownership preserved.',
] as const;

export const RESOURCE_TYPES = [
  'available-departments',
  'digital-staff',
  'services',
  'knowledge-products',
  'profession-brains',
  'marketplace-offerings',
] as const;

export const RESOURCE_TYPE_LABELS: Record<(typeof RESOURCE_TYPES)[number], string> = {
  'available-departments': 'Available Departments',
  'digital-staff': 'Digital Staff',
  services: 'Available Services',
  'knowledge-products': 'Knowledge Products',
  'profession-brains': 'Published Profession Brains™',
  'marketplace-offerings': 'Marketplace Offerings',
};

export const NETWORK_TYPES = [
  'preferred-partners',
  'internal-companies',
  'family-businesses',
  'agencies',
  'clients',
  'suppliers',
] as const;

export const NETWORK_TYPE_LABELS: Record<(typeof NETWORK_TYPES)[number], string> = {
  'preferred-partners': 'Preferred Partners',
  'internal-companies': 'Internal Companies',
  'family-businesses': 'Family Businesses',
  agencies: 'Agencies',
  clients: 'Clients',
  suppliers: 'Suppliers',
};

export const PRIVACY_CONTROLS = [
  'visibility',
  'permissions',
  'published-expertise',
  'shared-resources',
  'accessible-departments',
  'collaboration-settings',
] as const;

export const PRIVACY_CONTROL_LABELS: Record<(typeof PRIVACY_CONTROLS)[number], string> = {
  visibility: 'Visibility',
  permissions: 'Permissions',
  'published-expertise': 'Published Expertise',
  'shared-resources': 'Shared Resources',
  'accessible-departments': 'Accessible Departments',
  'collaboration-settings': 'Collaboration Settings',
};

export const DEFAULT_PRIVACY_SETTINGS: Record<(typeof PRIVACY_CONTROLS)[number], 'private' | 'network-only' | 'discoverable'> = {
  visibility: 'network-only',
  permissions: 'private',
  'published-expertise': 'network-only',
  'shared-resources': 'network-only',
  'accessible-departments': 'private',
  'collaboration-settings': 'network-only',
};
