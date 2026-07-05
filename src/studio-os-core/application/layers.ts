/**
 * Studio OS product hierarchy — permanent foundation for platform extraction.
 *
 * Studio OS
 *   └── Workspace Registry
 *         └── Organizations (Frontal Slayer, NDXBOOK, VXD INC, …)
 *
 * Studio OS owns platform capabilities; organizations consume them.
 * Future standalone deployment changes routing only — business logic stays here.
 */

export const STUDIO_OS_PRODUCT_LAYERS = {
  studioOs: {
    id: 'studio-os',
    label: 'Studio OS',
    description:
      'Standalone operating system — authentication, org management, permissions, executives, concierge, intelligence, production, publishing, knowledge, automation, institute, campaigns, rendering, screening, analytics.',
  },
  workspaceRegistry: {
    id: 'workspace-registry',
    label: 'Workspace Registry',
    description: 'Master catalog of organizations running on Studio OS.',
  },
  organization: {
    id: 'organization',
    label: 'Organization',
    description: 'A company workspace — isolated knowledge, executives, customers, media, campaigns, branding, voice, AI memory, and genome.',
  },
} as const;

/** Known production organizations on this deployment. */
export const STUDIO_OS_KNOWN_ORGANIZATIONS = [
  { id: 'frontal-slayer', label: 'FRONTAL SLAYER', role: 'commerce-media' as const },
  { id: 'ai-media', label: 'NDXBOOK', role: 'public-media' as const },
  { id: 'vxd-inc', label: 'VXD INC', role: 'platform-owner' as const },
  { id: 'all-in-one-enterprise', label: 'ALL IN ONE ENTERPRISE', role: 'enterprise' as const },
] as const;

export type StudioOsKnownOrganizationId = (typeof STUDIO_OS_KNOWN_ORGANIZATIONS)[number]['id'];
