import type {
  MARKETPLACE_TIERS,
  PLUGIN_SDK_PHILOSOPHY,
  PLUGIN_TYPES,
  SANDBOX_VIOLATIONS,
  SDK_REGISTRATION_CAPABILITIES,
} from './constants';

export type PluginTypeId = (typeof PLUGIN_TYPES)[number];
export type SdkRegistrationCapability = (typeof SDK_REGISTRATION_CAPABILITIES)[number];
export type MarketplaceTier = (typeof MARKETPLACE_TIERS)[number];
export type SandboxViolation = (typeof SANDBOX_VIOLATIONS)[number];
export type PluginPhilosophyLine = (typeof PLUGIN_SDK_PHILOSOPHY)[number];

export type PluginTypeEntry = {
  typeId: PluginTypeId;
  name: string;
  description: string;
  extensible: true;
  status: 'available' | 'beta' | 'planned';
  exampleUse: string;
};

export type SdkCapabilityEntry = {
  capabilityId: SdkRegistrationCapability;
  label: string;
  description: string;
  registeredCount: number;
  firstClassCitizen: true;
};

export type InstalledPluginEntry = {
  pluginId: string;
  name: string;
  typeId: PluginTypeId;
  tier: MarketplaceTier;
  version: string;
  status: 'active' | 'disabled' | 'update-available';
  sandboxed: true;
  organizationScoped: true;
};

export type MarketplaceTierEntry = {
  tier: MarketplaceTier;
  label: string;
  description: string;
  pluginCount: number;
  installable: boolean;
};

export type SandboxGuardFinding = {
  id: string;
  violation: SandboxViolation;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  blocked: true;
  recommendation: string;
};

export type PluginGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
};

export type PluginImprovementRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type OrganizationPluginSdkProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  platformScore: number;
  extensibilityScorePct: number;
  sandboxScorePct: number;
  pluginTypes: PluginTypeEntry[];
  sdkCapabilities: SdkCapabilityEntry[];
  installedPlugins: InstalledPluginEntry[];
  marketplaceTiers: MarketplaceTierEntry[];
  sandboxFindings: SandboxGuardFinding[];
  governanceFindings: PluginGovernanceFinding[];
  recommendations: PluginImprovementRecommendation[];
  pluginsRequiringUpdate: number;
  activePluginCount: number;
  dockPlatformLine: string;
  ecosystemReady: true;
  lastSyncedAt: string;
};

export type PluginSdkStore = {
  version: string;
  profiles: OrganizationPluginSdkProfile[];
};

export type PluginSdkDockAdvice = {
  response: string;
  concierge: string;
  platformScore?: number;
};

export type PluginSearchHit = {
  type: 'plugin-type' | 'capability' | 'plugin' | 'marketplace';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
