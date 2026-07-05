/** Architect Studio V1.0 — immersive innovation headquarters (Milestone 58). */

export type ArchitectStudioWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio-campus';

export type ArchitectStudioId =
  | 'business-studio'
  | 'brand-studio'
  | 'experience-studio'
  | 'digital-studio'
  | 'growth-studio';

export type SpatialNavMode =
  | 'campus'
  | 'studio'
  | 'forum'
  | 'evolution-wall'
  | 'innovation-lab'
  | 'portfolio';

export type ArchitectStudioRoom = {
  id: ArchitectStudioId;
  label: string;
  tagline: string;
  architectModule: string;
  healthPct: number;
  activeProjects: number;
  liveDiscussions: number;
  accentColor: string;
};

export type CollaborationForum = {
  summary: string;
  activeParticipants: string[];
  pendingDecisions: number;
  lastGathering: string;
};

export type LivingWorkspaceActivity = {
  id: string;
  studioId: ArchitectStudioId;
  activityType: string;
  label: string;
  status: 'active' | 'review' | 'simulation';
};

export type ArchitectCollaboration = {
  id: string;
  fromArchitect: string;
  toArchitect: string;
  topic: string;
  status: 'open' | 'coordinated' | 'resolved';
};

export type EvolutionWallEntry = {
  id: string;
  date: string;
  category: string;
  label: string;
  genomeImpact?: string;
};

export type InnovationLabExperiment = {
  id: string;
  title: string;
  phase: 'brainstorm' | 'prototype' | 'simulate' | 'compare';
  status: string;
};

export type StudioIntelligenceGuide = {
  id: string;
  category: string;
  signal: string;
  recommendedStudio: ArchitectStudioId | 'forum' | 'innovation-lab';
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export type EnvironmentPersonalization = {
  architecture: string;
  lighting: string;
  materials: string;
  ambientSound: string;
  theme: string;
};

export type PortfolioCampusCompany = {
  id: string;
  name: string;
  studioHealthPct: number;
  activeArchitects: number;
};

export type ArchitectStudioStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ArchitectStudioWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    studioHealthPct: number;
    activeProjects: number;
    collaborationScorePct: number;
    innovationPct: number;
    genomeSyncPct: number;
    activeSpatialMode: SpatialNavMode;
    focusedStudioId: ArchitectStudioId | null;
  };
  studioPhilosophy: string[];
  studios: ArchitectStudioRoom[];
  collaborationForum: CollaborationForum;
  livingActivities: LivingWorkspaceActivity[];
  architectCollaborations: ArchitectCollaboration[];
  evolutionWall: EvolutionWallEntry[];
  innovationLab: InnovationLabExperiment[];
  intelligenceGuides: StudioIntelligenceGuide[];
  personalization: EnvironmentPersonalization;
  portfolioCampus: PortfolioCampusCompany[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
