import type {
  BOTTLENECK_TYPES,
  MONITOR_METRICS,
  PERFORMANCE_MONITOR_PHILOSOPHY,
  PERFORMANCE_SEVERITIES,
  SIMULATION_SCENARIOS,
  SPEED_TRENDS,
} from './constants';

export type MonitorMetric = (typeof MONITOR_METRICS)[number];
export type SimulationScenario = (typeof SIMULATION_SCENARIOS)[number];
export type BottleneckType = (typeof BOTTLENECK_TYPES)[number];
export type PerformanceSeverity = (typeof PERFORMANCE_SEVERITIES)[number];
export type SpeedTrend = (typeof SPEED_TRENDS)[number];
export type PerformancePhilosophyLine = (typeof PERFORMANCE_MONITOR_PHILOSOPHY)[number];

export type PerformanceBottleneck = {
  id: string;
  bottleneckType: BottleneckType;
  bottleneckLabel: string;
  metric: MonitorMetric;
  metricLabel: string;
  severity: PerformanceSeverity;
  moduleId: string;
  moduleLabel: string;
  description: string;
  measuredValue: string;
  budgetLimit: string;
  estimatedUserImpact: string;
  recommendedImprovement: string;
};

export type PerformanceBudget = {
  id: string;
  featureId: string;
  featureLabel: string;
  metric: MonitorMetric;
  metricLabel: string;
  budgetLimit: string;
  currentValue: string;
  utilizationPct: number;
  status: 'within-budget' | 'approaching-limit' | 'exceeded';
  flaggedBeforeProduction: boolean;
  studioIntelligenceNote: string;
};

export type ModulePerformanceReport = {
  id: string;
  moduleId: string;
  moduleLabel: string;
  route: string;
  performanceScore: number;
  speedTrend: SpeedTrend;
  optimizationOpportunities: string[];
  largestBottlenecks: string[];
  historicalPerformance: string;
  recommendedImprovements: string[];
  estimatedUserImpact: string;
  withinPerformanceBudget: boolean;
  performanceVerdict: string;
  bottlenecksCount: number;
  auditedAt: string;
};

export type ScenarioSimulationResult = {
  id: string;
  scenario: SimulationScenario;
  scenarioLabel: string;
  moduleId: string;
  moduleLabel: string;
  performanceScore: number;
  latencyMs: number;
  summary: string;
  passed: boolean;
};

export type MetricMonitorScore = {
  metric: MonitorMetric;
  label: string;
  score: number;
  status: 'excellent' | 'watch' | 'degraded';
  summary: string;
};

export type OrganizationPerformanceMonitorProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallPerformanceScore: number;
  modulesMonitored: number;
  bottlenecksOpen: number;
  budgetsExceeded: number;
  averageSpeedTrend: SpeedTrend;
  metricScores: MetricMonitorScore[];
  bottlenecks: PerformanceBottleneck[];
  moduleReports: ModulePerformanceReport[];
  performanceBudgets: PerformanceBudget[];
  simulations: ScenarioSimulationResult[];
  selectedModuleId: string | null;
  dockPerformanceLine: string;
  performanceIsAFeature: true;
  lastSyncedAt: string;
};

export type PerformanceMonitorStore = {
  version: string;
  profiles: OrganizationPerformanceMonitorProfile[];
};

export type PerformanceMonitorDockAdvice = {
  response: string;
  concierge: string;
  overallPerformanceScore?: number;
  bottlenecksOpen?: number;
};

export type PerformanceMonitorSearchHit = {
  type: 'bottleneck' | 'report' | 'budget' | 'simulation' | 'metric';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
