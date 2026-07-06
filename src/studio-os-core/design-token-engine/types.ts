import type { DESIGN_TOKEN_ENGINE_PHILOSOPHY, STUDIO_OS_THEMES, TOKEN_CATEGORIES } from './constants';

export type TokenCategory = (typeof TOKEN_CATEGORIES)[number];
export type StudioOsThemeId = (typeof STUDIO_OS_THEMES)[number];
export type DesignTokenPhilosophyLine = (typeof DESIGN_TOKEN_ENGINE_PHILOSOPHY)[number];

export type DesignTokenEntry = {
  tokenId: string;
  name: string;
  category: TokenCategory;
  value: string;
  cssVariable?: string;
  description: string;
  source: string;
  themes: StudioOsThemeId[];
  consumedBy: string[];
  immutable: boolean;
};

export type ThemeTokenSet = {
  themeId: StudioOsThemeId;
  label: string;
  active: boolean;
  tokenCount: number;
  accentColor: string;
  backgroundGlass: string;
};

export type DesignGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  componentId?: string;
  message: string;
  recommendation: string;
};

export type DesignTokenHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type OrganizationDesignTokenEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  engineScore: number;
  totalTokens: number;
  categoryCounts: Record<string, number>;
  tokens: DesignTokenEntry[];
  themes: ThemeTokenSet[];
  governanceFindings: DesignGovernanceFinding[];
  healthMetrics: DesignTokenHealthMetric[];
  componentCoveragePct: number;
  dockEngineLine: string;
  designBibleProtected: true;
  lastSyncedAt: string;
};

export type DesignTokenEngineStore = {
  version: string;
  profiles: OrganizationDesignTokenEngineProfile[];
};

export type DesignTokenEngineDockAdvice = {
  response: string;
  concierge: string;
  engineScore?: number;
};

export type DesignTokenSearchHit = {
  entry: DesignTokenEntry;
  score: number;
  matchReason: string;
};
