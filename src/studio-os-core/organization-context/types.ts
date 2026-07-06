import type { WorkspaceBrandColors, WorkspacePermissions, WorkspaceTypography } from '../workspace/types';
import type { ModuleTenantId } from '../workspace/tenant-ids';
import type { TimelineOrganizationId } from '../executive-timeline/types';

export type OrganizationGenomeSummary = {
  industry?: string;
  brandVoice: string;
  brandRules: string[];
  dnaLayers: string[];
};

export type OrganizationExecutiveRef = {
  id: string;
  title: string;
  role: string;
};

export type OrganizationConciergeRef = {
  id: string;
  title: string;
  domain: string;
};

export type OrganizationKnowledgeRef = {
  id: string;
  label: string;
  route?: string;
};

/** Mandatory active organization boundary — every Studio OS module receives this context. */
export type ActiveOrganizationContext = {
  organizationId: string;
  moduleTenantId: ModuleTenantId;
  timelineOrganizationId: TimelineOrganizationId;
  organizationName: string;
  organizationBrand: {
    brandName: string;
    displayName: string;
    colors: WorkspaceBrandColors;
    typography: WorkspaceTypography;
    brandVoice: string;
    logoSrc: string;
  };
  organizationGenome: OrganizationGenomeSummary;
  organizationSettings: {
    industry?: string;
    description: string;
    tags: string[];
  };
  organizationPermissions: WorkspacePermissions;
  organizationExecutives: OrganizationExecutiveRef[];
  organizationConcierges: OrganizationConciergeRef[];
  organizationKnowledge: OrganizationKnowledgeRef[];
  studioModulePath: (segment: string) => string;
  studioEntryPath: string;
  accentColor: string;
  isPortfolioAdministration: boolean;
};
