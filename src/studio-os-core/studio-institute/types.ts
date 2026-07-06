/** Studio Institute V1.0 — permanent organizational learning institution (Milestone 75 + 93). */

import type { InstituteLearningArtifactType, InstituteLearningAudience, InstituteOrgRole } from './learning-types';

export type { InstituteLearningArtifactType, InstituteLearningAudience, InstituteOrgRole } from './learning-types';

export type StudioInstituteWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type LearningCommunity = {
  id: string;
  role: string;
  description: string;
  personalizedJourney: string;
  active: boolean;
};

export type SchoolOfExcellence = {
  id: string;
  name: string;
  focus: string;
  disciplines: string[];
  status: 'active' | 'emerging';
};

export type ExecutiveFaculty = {
  id: string;
  executive: string;
  teaches: string[];
  source: string;
};

export type OrganizationFirstLesson = {
  id: string;
  source: string;
  title: string;
  teachesWhy: string;
  category: string;
};

export type AdaptiveLearningPath = {
  id: string;
  learner: string;
  role: string;
  maturityStage: string;
  modules: string[];
  knowledgeGaps: string[];
  aspirations: string;
};

export type ImmersiveLearningModule = {
  id: string;
  type: string;
  title: string;
  description: string;
  experiential: boolean;
};

export type OrganizationalCertification = {
  id: string;
  name: string;
  category: string;
  requirement: string;
  demonstrates: string;
  status: 'available' | 'earned' | 'in-progress';
};

export type KnowledgeCompoundingContribution = {
  id: string;
  lesson: string;
  contributesTo: string;
  benefit: string;
};

export type InstituteCampusSpace = {
  id: string;
  space: string;
  atmosphere: string;
  purpose: string;
};

export type DailyLearningRecommendation = {
  id: string;
  type: string;
  title: string;
  recommendedFor: string;
  priority: 'high' | 'medium' | 'low';
};

export type NdxbookIntegration = {
  id: string;
  flow: string;
  destination: string;
  description: string;
};

export type StudioInstituteStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: StudioInstituteWorkspaceId;
  companyName: string;
  instituteMotto: string;
  dashboard: {
    summary: string;
    activeLearners: number;
    schoolsActive: number;
    facultyMembers: number;
    certificationsEarned: number;
    knowledgeContributions: number;
  };
  institutePhilosophy: string[];
  learningCommunities: LearningCommunity[];
  schoolsOfExcellence: SchoolOfExcellence[];
  executiveFaculty: ExecutiveFaculty[];
  organizationFirstLessons: OrganizationFirstLesson[];
  adaptiveLearningPaths: AdaptiveLearningPath[];
  immersiveLearning: ImmersiveLearningModule[];
  organizationalCertifications: OrganizationalCertification[];
  knowledgeCompounding: KnowledgeCompoundingContribution[];
  instituteCampus: InstituteCampusSpace[];
  dailyLearning: DailyLearningRecommendation[];
  ndxbookIntegration: NdxbookIntegration[];
  futureOpportunities: string[];
};

/** Milestone 93 — Profession Brain-driven org profile */
export type InstituteLearningArtifact = {
  id: string;
  brainId: string;
  type: InstituteLearningArtifactType;
  title: string;
  summary: string;
  audiences: InstituteLearningAudience[];
  durationMinutes: number;
  sourceEntryIds: string[];
  syncedFromBrainAt: string;
  brainVersion: number;
};

export type InstituteScenario = {
  id: string;
  brainId: string;
  title: string;
  narrative: string;
  teachFocus: string;
  audiences: InstituteLearningAudience[];
  difficulty: 'foundational' | 'intermediate' | 'advanced';
  decisionBased: boolean;
};

export type InstituteRolePath = {
  id: string;
  brainId: string;
  role: InstituteOrgRole | string;
  recommendedModules: string[];
  masteryTopics: string[];
  progressPct: number;
};

export type InstituteCertification = {
  id: string;
  brainId: string;
  name: string;
  category: string;
  requirement: string;
  progressPct: number;
  status: 'available' | 'in-progress' | 'earned';
  holdersCount: number;
  pendingEmployees: number;
};

export type InstituteDashboardMetrics = {
  learningProgressPct: number;
  completedCertifications: number;
  recommendedLessons: number;
  knowledgeUpdatesPending: number;
  recentlyAddedTopics: string[];
  employeeProgressPct: number;
  customerCoursesAvailable: number;
  instituteActivitySummary: string;
  totalArtifacts: number;
};

export type InstituteKnowledgeUpdate = {
  id: string;
  brainId?: string;
  title: string;
  description: string;
  affectedArtifacts: string[];
  detectedAt: string;
};

export type InstituteCustomerCourse = {
  id: string;
  brainId: string;
  title: string;
  description: string;
  capabilities: string[];
  lessonCount: number;
  published: boolean;
};

export type OrganizationStudioInstituteProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  brainSyncedAt: string;
  artifacts: InstituteLearningArtifact[];
  scenarios: InstituteScenario[];
  rolePaths: InstituteRolePath[];
  certifications: InstituteCertification[];
  customerCourses: InstituteCustomerCourse[];
  dashboard: InstituteDashboardMetrics;
  knowledgeUpdates: InstituteKnowledgeUpdate[];
  evolutionSummary: string;
};

export type StudioInstituteOrgStore = {
  version: string;
  profiles: OrganizationStudioInstituteProfile[];
};

export type StudioInstituteDockAdvice = {
  response: string;
  concierge: string;
  lessonId?: string;
  certificationId?: string;
  suggestGenerateLesson?: boolean;
};
