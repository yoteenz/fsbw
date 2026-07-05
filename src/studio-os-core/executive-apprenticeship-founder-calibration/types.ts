/** Executive Apprenticeship & Founder Calibration V1.0 (Milestone 74). */

export type ExecutiveApprenticeshipWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type TrustLevel =
  | 'observe'
  | 'recommend'
  | 'co-review'
  | 'soft-approval'
  | 'trusted-approval'
  | 'organizational-stewardship';

export type FounderCalibrationDimension = {
  id: string;
  dimension: string;
  description: string;
  signalsCaptured: number;
  alignmentPct: number;
};

export type ShadowingObservation = {
  id: string;
  context: string;
  observed: string;
  captured: string;
  executive: string;
};

export type LearningConversation = {
  id: string;
  executive: string;
  question: string;
  status: 'asked' | 'answered' | 'recommended';
  insight?: string;
};

export type CalibrationMeasurement = {
  id: string;
  domain: string;
  alignmentScorePct: number;
  confidencePct: number;
  learningVelocity: string;
  observationNeeded: string;
};

export type PracticeReview = {
  id: string;
  type: string;
  executive: string;
  task: string;
  founderChoice: string;
  executiveRecommendation: string;
  matchPct: number;
};

export type TrustProgression = {
  id: string;
  executive: string;
  currentLevel: TrustLevel;
  alignmentPct: number;
  reviewsCompleted: number;
  nextLevelRequirement: string;
};

export type SoftApprovalExample = {
  id: string;
  executive: string;
  statement: string;
  confidencePct: number;
  reasoning: string;
  historicalComparisons: string;
  evidence: string;
};

export type ChiefOfStaffMentorship = {
  id: string;
  recommendation: string;
  category: string;
  targetExecutive: string;
  rationale: string;
};

export type LearningLibraryItem = {
  id: string;
  category: string;
  title: string;
  preservedFor: string;
};

export type ExecutiveGraduation = {
  id: string;
  executive: string;
  recommendation: string;
  alignmentPct: number;
  evidenceBasis: string;
  founderAction: 'approve' | 'maintain' | 'reduce' | 'pending';
};

export type ExecutiveApprenticeshipStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ExecutiveApprenticeshipWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    organizationalConfidencePct: number;
    executivesInApprenticeship: number;
    averageAlignmentPct: number;
    averageLearningVelocity: string;
    softApprovalsActive: number;
  };
  apprenticeshipPhilosophy: string[];
  founderCalibration: FounderCalibrationDimension[];
  shadowingObservations: ShadowingObservation[];
  learningConversations: LearningConversation[];
  calibrationMeasurements: CalibrationMeasurement[];
  practiceReviews: PracticeReview[];
  trustProgressions: TrustProgression[];
  softApprovalExamples: SoftApprovalExample[];
  chiefOfStaffMentorship: ChiefOfStaffMentorship[];
  learningLibrary: LearningLibraryItem[];
  executiveGraduations: ExecutiveGraduation[];
  founderDashboardHighlights: {
    executiveStrengths: string[];
    recommendedAuthorityChanges: string[];
    recentCalibrationImprovements: string[];
  };
  futureOpportunities: string[];
};
