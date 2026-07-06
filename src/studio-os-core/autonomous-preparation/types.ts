import type {
  APPROVAL_ACTIONS,
  PREPARATION_STATUSES,
  PREPARATION_TYPES,
} from './constants';

export type PreparationType = (typeof PREPARATION_TYPES)[number];
export type ApprovalAction = (typeof APPROVAL_ACTIONS)[number];
export type PreparationStatus = (typeof PREPARATION_STATUSES)[number];

export type PendingPreparation = {
  id: string;
  type: PreparationType;
  title: string;
  summary: string;
  whyPrepared: string;
  trigger: string;
  expectedBenefit: string;
  confidencePct: number;
  status: PreparationStatus;
  preparedAt: string;
  availableActions: ApprovalAction[];
};

export type LearningLoopSnapshot = {
  approvalRatePct: number;
  rejectionsLogged: number;
  approvalsLogged: number;
  qualityImprovementPct: number;
  frequentlyApprovedTypes: PreparationType[];
  frequentlyRejectedTypes: PreparationType[];
  professionBrainLearning: string;
};

export type OrganizationAutonomousPreparationProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  preparationScore: number;
  pendingQueueCount: number;
  awaitingApprovalCount: number;
  pendingPreparations: PendingPreparation[];
  learningLoop: LearningLoopSnapshot;
  dockPreparationLine: string;
  nothingAutoExecutes: true;
  syncedSources: string[];
};

export type AutonomousPreparationStore = {
  version: string;
  profiles: OrganizationAutonomousPreparationProfile[];
};

export type AutonomousPreparationDockAdvice = {
  response: string;
  concierge: string;
  preparationScore?: number;
  awaitingApprovalCount?: number;
};
