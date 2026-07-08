/** Multi-Company Route Architecture™ — Studio World company-scoped navigation. */

export type CompanyDepartmentId =
  | 'marketing'
  | 'finance'
  | 'operations'
  | 'product'
  | 'customer-experience'
  | 'intelligence'
  | 'distribution'
  | 'hiring'
  | 'legal';

export type CompanyHeadquartersRoomId =
  | 'grand-atrium'
  | 'founder-office'
  | 'company-pulse'
  | 'concierge'
  | 'daily-briefing';

export type CompanyStudioWorldCompany = {
  companySlug: string;
  companyId: string;
  companyName: string;
  workspaceId: string;
  genomeId: string;
  isLive: boolean;
  atlasNodeId: string;
  headquartersLabel: string;
};

export type CompanyRouteKind =
  | 'company-home'
  | 'headquarters-room'
  | 'creative-direction'
  | 'creative-direction-room'
  | 'department'
  | 'department-overview'
  | 'global'
  | 'unknown';

export type CompanyRouteResolution = {
  kind: CompanyRouteKind;
  companySlug: string | null;
  company: StudioWorldCompany | null;
  segments: string[];
  activeHeadquarters: string | null;
  activeDepartment: CompanyDepartmentId | null;
  activeRoom: string | null;
  activeScene: string | null;
  legacyPath: string;
  displayLabel: string;
};

export type StudioWorldCompany = CompanyStudioWorldCompany;

export type CompanyRouteContextValue = {
  companySlug: string;
  companyId: string;
  companyName: string;
  companyGenome: {
    genomeId: string;
    brandVoice: string;
    industry?: string;
  };
  activeHeadquarters: string | null;
  activeDepartment: CompanyDepartmentId | null;
  activeRoom: string | null;
  activeScene: string | null;
  isGlobalRoute: boolean;
  breadcrumbs: Array<{ label: string; path: string }>;
  companyPath: (...segments: string[]) => string;
};
