import type { NETWORK_TYPES, PRIVACY_CONTROLS, RESOURCE_TYPES } from './constants';

export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type NetworkType = (typeof NETWORK_TYPES)[number];
export type PrivacyControl = (typeof PRIVACY_CONTROLS)[number];
export type PrivacyLevel = 'private' | 'network-only' | 'discoverable';

export type DiscoverableResource = {
  id: string;
  type: ResourceType;
  label: string;
  summary: string;
  discoverable: boolean;
  capacityPct?: number;
};

export type IntelligentConnectionSuggestion = {
  id: string;
  title: string;
  needSummary: string;
  offerSummary: string;
  partnerOrganization: string;
  permissionRequired: true;
  confidencePct: number;
  status: 'suggested' | 'awaiting-approval' | 'declined';
};

export type FounderNetworkMember = {
  id: string;
  organizationName: string;
  networkType: NetworkType;
  relationship: string;
  sharedCapabilities: string[];
  trustLevel: 'trusted' | 'verified' | 'pending';
};

export type PrivacySettingsSnapshot = {
  control: PrivacyControl;
  label: string;
  level: PrivacyLevel;
  description: string;
};

export type OrganizationCrossOrgIntelligenceProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  collaborationScore: number;
  connectionsSuggested: number;
  networkMembers: number;
  discoverableResources: DiscoverableResource[];
  connectionSuggestions: IntelligentConnectionSuggestion[];
  founderNetwork: FounderNetworkMember[];
  privacySettings: PrivacySettingsSnapshot[];
  dockHeadline: string;
  privacyFirst: true;
  syncedSources: string[];
};

export type CrossOrgIntelligenceStore = {
  version: string;
  profiles: OrganizationCrossOrgIntelligenceProfile[];
};

export type CrossOrgIntelligenceDockAdvice = {
  response: string;
  concierge: string;
  collaborationScore?: number;
  connectionsSuggested?: number;
};
