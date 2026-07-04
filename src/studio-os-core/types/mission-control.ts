/**
 * StudioOS Mission Control — executive operating room platform types.
 */

export type MissionStatus = 'on-track' | 'attention' | 'critical' | 'complete';

export type MissionPhaseId =
  | 'brief'
  | 'strategy'
  | 'production'
  | 'distribution'
  | 'review'
  | 'launch'
  | 'legacy';

export type MissionControlHeaderState = {
  workspaceName: string;
  missionTitle: string;
  phase: MissionPhaseId;
  status: MissionStatus;
  lastUpdated: string;
};

export type ExecutiveBriefData = {
  headline: string;
  objective: string;
  keyResults: string[];
  constraints: string[];
};

export type DepartmentCard = {
  id: string;
  label: string;
  status: MissionStatus;
  summary: string;
  route?: string;
};

export type WorkspaceStudioHubCard = {
  id: string;
  title: string;
  route: string;
  subtitle?: string;
  description?: string;
  metric?: string;
  accentHex?: string;
};

export type WorkspaceStudioHubDashboardItem = {
  id?: string;
  label: string;
  value: string;
  color?: string;
};

export type WorkspaceStudioHubData = {
  cards: WorkspaceStudioHubCard[];
  dashboardItems: WorkspaceStudioHubDashboardItem[];
  dashboardMetric: number;
};
