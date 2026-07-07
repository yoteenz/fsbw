import type {
  DECISION_AUTHORITY_LEVELS,
  ROLE_EVOLUTION_STAGES,
  ROLE_INTELLIGENCE_DOMAINS,
  ROLE_INTELLIGENCE_PHILOSOPHY,
  ROLE_TEMPLATES,
} from './constants';

export type RoleTemplate = (typeof ROLE_TEMPLATES)[number];
export type DecisionAuthorityLevel = (typeof DECISION_AUTHORITY_LEVELS)[number];
export type RoleEvolutionStage = (typeof ROLE_EVOLUTION_STAGES)[number];
export type RoleIntelligenceDomain = (typeof ROLE_INTELLIGENCE_DOMAINS)[number];
export type RolePhilosophyLine = (typeof ROLE_INTELLIGENCE_PHILOSOPHY)[number];

export type DailyWorkflow = {
  id: string;
  label: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as-needed';
  steps: string[];
  automationEligible: boolean;
};

export type RolePerformanceMetric = {
  id: string;
  label: string;
  target: string;
  current: string;
  trend: 'rising' | 'stable' | 'declining';
};

export type AiEmployeeCounterpart = {
  id: string;
  name: string;
  conciergeId?: string;
  capabilities: string[];
  handlesWorkflows: string[];
  humanOversight: string;
};

export type RoleEvolutionEvent = {
  id: string;
  stage: RoleEvolutionStage;
  stageLabel: string;
  title: string;
  description: string;
  occurredAt: string;
  triggeredBy: string;
};

export type OrganizationalRoleDefinition = {
  id: string;
  roleKey: RoleTemplate | string;
  title: string;
  displayTitle: string;
  department: string;
  actualWorkSummary: string;
  titleVsWorkGap: string | null;
  peopleCount: number;
  peopleNames: string[];
  responsibilities: string[];
  dailyWorkflows: DailyWorkflow[];
  decisionAuthority: DecisionAuthorityLevel;
  decisionAuthorityLabel: string;
  authorityScope: string[];
  requiredSkills: string[];
  relatedProfessionBrains: string[];
  requiredDocuments: string[];
  requiredAutomations: string[];
  performanceMetrics: RolePerformanceMetric[];
  learningRequirements: string[];
  aiCounterparts: AiEmployeeCounterpart[];
  evolutionStage: RoleEvolutionStage;
  evolutionStageLabel: string;
  evolutionScore: number;
  evolutionEvents: RoleEvolutionEvent[];
  understandsWorkNotTitle: true;
};

export type RoleIntelligenceInsight = {
  id: string;
  insight: string;
  roleTitle: string;
  category: 'title-mismatch' | 'evolution' | 'gap' | 'automation' | 'learning' | 'authority';
  severity: 'info' | 'watch' | 'attention';
  recommendedAction: string;
};

export type RoleDomainStatus = {
  domain: RoleIntelligenceDomain;
  label: string;
  score: number;
  count: number;
  summary: string;
};

export type OrganizationRoleIntelligenceProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  intelligenceScore: number;
  rolesDefined: number;
  peopleMapped: number;
  evolutionEventsTotal: number;
  titleWorkGaps: number;
  aiCounterpartsActive: number;
  roles: OrganizationalRoleDefinition[];
  insights: RoleIntelligenceInsight[];
  domainStatuses: RoleDomainStatus[];
  selectedRoleId: string | null;
  dockRoleLine: string;
  workNotTitles: true;
  syncedSources: string[];
  lastSyncedAt: string;
};

export type RoleIntelligenceStore = {
  version: string;
  profiles: OrganizationRoleIntelligenceProfile[];
};

export type RoleIntelligenceDockAdvice = {
  response: string;
  concierge: string;
  intelligenceScore?: number;
  rolesDefined?: number;
};

export type RoleIntelligenceSearchHit = {
  type: 'role' | 'responsibility' | 'workflow' | 'insight';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
