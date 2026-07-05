/** Organizational Apprenticeship V1.0 — permanent learning & trust-building (Milestone 76). */

export type OrganizationalApprenticeshipWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ApprenticeshipTrustStage =
  | 'observe'
  | 'understand'
  | 'recommend'
  | 'co-create'
  | 'co-review'
  | 'trusted-contributor'
  | 'organizational-steward';

export type OrganizationalApprentice = {
  id: string;
  type: string;
  name: string;
  description: string;
  active: boolean;
};

export type FounderCalibrationArea = {
  id: string;
  area: string;
  description: string;
  signalsLearned: number;
  understandingPct: number;
};

export type ShadowingObservation = {
  id: string;
  context: string;
  observed: string;
  captured: string;
  apprentice: string;
};

export type GuidedLearningQuestion = {
  id: string;
  apprentice: string;
  question: string;
  status: 'asked' | 'answered' | 'recommended';
  insight?: string;
};

export type PracticeExercise = {
  id: string;
  type: string;
  apprentice: string;
  task: string;
  organizationalDecision: string;
  apprenticeReasoning: string;
  alignmentPct: number;
};

export type OrganizationalCalibration = {
  id: string;
  domain: string;
  alignmentScorePct: number;
  confidencePct: number;
  learningVelocity: string;
  mentorshipNeeded: string;
};

export type TrustProgression = {
  id: string;
  apprentice: string;
  currentStage: ApprenticeshipTrustStage;
  alignmentPct: number;
  experiencesCompleted: number;
  nextStageRequirement: string;
};

export type ChiefOfStaffMentorship = {
  id: string;
  recommendation: string;
  category: string;
  targetApprentice: string;
  rationale: string;
};

export type LearningLibraryEntry = {
  id: string;
  category: string;
  title: string;
  preservedFor: string;
};

export type GraduationRecommendation = {
  id: string;
  apprentice: string;
  recommendation: string;
  readinessPct: number;
  evidenceBasis: string;
  founderAction: 'approve' | 'delay' | 'expand' | 'reduce' | 'pending';
};

export type OrganizationalApprenticeshipStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: OrganizationalApprenticeshipWorkspaceId;
  companyName: string;
  organizationalOath: string[];
  dashboard: {
    summary: string;
    activeApprentices: number;
    averageAlignmentPct: number;
    averageLearningVelocity: string;
    graduationReady: number;
    organizationalConfidencePct: number;
    futureLeadersIdentified: number;
  };
  apprenticeshipPhilosophy: string[];
  organizationalApprentices: OrganizationalApprentice[];
  founderCalibration: FounderCalibrationArea[];
  shadowingObservations: ShadowingObservation[];
  guidedLearning: GuidedLearningQuestion[];
  practiceExercises: PracticeExercise[];
  organizationalCalibration: OrganizationalCalibration[];
  trustProgressions: TrustProgression[];
  chiefOfStaffMentorship: ChiefOfStaffMentorship[];
  learningLibrary: LearningLibraryEntry[];
  graduationRecommendations: GraduationRecommendation[];
  founderDashboardHighlights: {
    recommendedMentorship: string[];
    graduationReadiness: string[];
    futureLeaders: string[];
    recentImprovements: string[];
  };
  futureOpportunities: string[];
};
