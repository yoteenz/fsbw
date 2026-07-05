/** Workspace Registry — per-organization snapshot for campus landing cards. */

export type WorkspaceAutonomyLevel = 'founder-led' | 'guided' | 'semi-autonomous' | 'autonomous';

export type WorkspaceConciergeStatus = 'available' | 'briefing-ready' | 'in-review' | 'awaiting-founder';

export type WorkspaceRegistrySnapshot = {
  workspaceId: string;
  todaysBriefing: string;
  unreadExecutiveUpdates: number;
  pendingApprovals: number;
  autonomyLevel: WorkspaceAutonomyLevel;
  organizationalHealthPct: number;
  revenueSnapshot: string;
  recentActivity: string;
  lastActiveAt: string;
  conciergeStatus: WorkspaceConciergeStatus;
  isFavorite: boolean;
  recentlyViewedRank?: number;
};

export type StudioPortfolioInsight = {
  id: string;
  sourceWorkspaceId: string;
  targetWorkspaceId: string;
  insight: string;
  metric?: string;
  requiresFounderApproval: true;
};

export type WorkspaceRegistryStore = {
  version: string;
  lastUpdatedAt: string;
  snapshots: WorkspaceRegistrySnapshot[];
  favorites: string[];
  recentWorkspaceIds: string[];
  studioPortfolioInsights: StudioPortfolioInsight[];
};

export const WORKSPACE_REGISTRY_STORAGE_KEY = 'studioOsWorkspaceRegistry_v1';
export const WORKSPACE_REGISTRY_VERSION = '1.0.0';
