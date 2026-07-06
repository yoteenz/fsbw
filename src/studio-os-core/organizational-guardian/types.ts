import type {
  DASHBOARD_METRICS,
  GUARDIAN_ALERT_SEVERITIES,
  GUARDIAN_ALERT_STATUSES,
  GUARDIAN_MONITOR_DOMAINS,
  GUARDIAN_PHILOSOPHY,
  GUARDIAN_RESPONSIBILITIES,
} from './constants';

export type GuardianMonitorDomain = (typeof GUARDIAN_MONITOR_DOMAINS)[number];
export type GuardianResponsibility = (typeof GUARDIAN_RESPONSIBILITIES)[number];
export type GuardianAlertSeverity = (typeof GUARDIAN_ALERT_SEVERITIES)[number];
export type GuardianAlertStatus = (typeof GUARDIAN_ALERT_STATUSES)[number];
export type DashboardMetric = (typeof DASHBOARD_METRICS)[number];
export type GuardianPhilosophyLine = (typeof GUARDIAN_PHILOSOPHY)[number];

export type GuardianDomainStatus = {
  domain: GuardianMonitorDomain;
  label: string;
  score: number;
  trend: 'rising' | 'stable' | 'declining';
  status: 'healthy' | 'watch' | 'at-risk';
  summary: string;
};

export type GuardianAlert = {
  id: string;
  title: string;
  message: string;
  domain: GuardianMonitorDomain;
  domainLabel: string;
  severity: GuardianAlertSeverity;
  status: GuardianAlertStatus;
  recommendation: string;
  coordinatedSystems: string[];
  detectedAt: string;
  explainBeforeActing: true;
};

export type GuardianDashboardMetric = {
  metric: DashboardMetric;
  label: string;
  score: number;
  trend: 'rising' | 'stable' | 'declining';
  summary: string;
};

export type GuardianCoordination = {
  system: string;
  status: 'active' | 'monitoring' | 'escalated';
  lastSync: string;
  summary: string;
};

export type OrganizationGuardianProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  guardianScore: number;
  domainsMonitored: number;
  activeAlerts: number;
  urgentAlerts: number;
  systemsCoordinated: number;
  domainStatuses: GuardianDomainStatus[];
  alerts: GuardianAlert[];
  dashboardMetrics: GuardianDashboardMetric[];
  coordinations: GuardianCoordination[];
  selectedAlertId: string | null;
  dockGuardianLine: string;
  silentProtectorNotMonitor: true;
  lastSyncedAt: string;
};

export type OrganizationalGuardianStore = {
  version: string;
  profiles: OrganizationGuardianProfile[];
};

export type OrganizationalGuardianDockAdvice = {
  response: string;
  concierge: string;
  guardianScore?: number;
  activeAlerts?: number;
};

export type OrganizationalGuardianSearchHit = {
  type: 'alert' | 'domain' | 'metric';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
