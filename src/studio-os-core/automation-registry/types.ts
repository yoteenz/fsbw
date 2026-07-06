import type {
  AUTOMATION_CATEGORIES,
  AUTOMATION_REGISTRY_PHILOSOPHY,
  AUTOMATION_RISK_LEVELS,
  AUTOMATION_STATUSES,
} from './constants';

export type AutomationCategory = (typeof AUTOMATION_CATEGORIES)[number];
export type AutomationStatus = (typeof AUTOMATION_STATUSES)[number];
export type AutomationRiskLevel = (typeof AUTOMATION_RISK_LEVELS)[number];
export type AutomationPhilosophyLine = (typeof AUTOMATION_REGISTRY_PHILOSOPHY)[number];

export type AutomationEntry = {
  automationId: string;
  name: string;
  description: string;
  category: AutomationCategory;
  owner: string;
  department: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  dependencies: string[];
  permissions: string[];
  organizations: string[];
  status: AutomationStatus;
  confidencePct: number;
  riskLevel: AutomationRiskLevel;
  approvalRequired: boolean;
  successRatePct: number;
  failureRatePct: number;
  avgDurationMs: number;
  version: string;
  documentation: string[];
  executionCount: number;
  lastExecutedAt?: string;
  registered: boolean;
};

export type AutomationExecutionRecord = {
  executionId: string;
  automationId: string;
  automationName: string;
  executedAt: string;
  status: 'succeeded' | 'failed' | 'partial';
  durationMs: number;
  triggerSummary: string;
  approvedBy?: string;
};

export type AutomationDashboardSection = {
  sectionId: string;
  label: string;
  automationIds: string[];
  description: string;
};

export type AutomationImprovementRecommendation = {
  id: string;
  automationId?: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type AutomationGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  automationId?: string;
  message: string;
  recommendation: string;
};

export type AutomationHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type OrganizationAutomationRegistryProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  registryScore: number;
  totalAutomations: number;
  activeCount: number;
  pausedCount: number;
  failedCount: number;
  pendingApprovalCount: number;
  categoryCounts: Record<string, number>;
  automations: AutomationEntry[];
  executionHistory: AutomationExecutionRecord[];
  dashboardSections: AutomationDashboardSection[];
  recommendations: AutomationImprovementRecommendation[];
  governanceFindings: AutomationGovernanceFinding[];
  healthMetrics: AutomationHealthMetric[];
  avgSuccessRatePct: number;
  dockRegistryLine: string;
  transparentAutomation: true;
  lastSyncedAt: string;
};

export type AutomationRegistryStore = {
  version: string;
  profiles: OrganizationAutomationRegistryProfile[];
};

export type AutomationRegistryDockAdvice = {
  response: string;
  concierge: string;
  registryScore?: number;
};

export type AutomationSearchHit = {
  entry: AutomationEntry;
  score: number;
  matchReason: string;
};
