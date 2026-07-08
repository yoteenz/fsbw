import type { PRODUCTION_MODEL_ROLES, PRODUCTION_ORCHESTRATOR_STAGES } from './constants';

export type ProductionOrchestratorStage = (typeof PRODUCTION_ORCHESTRATOR_STAGES)[number];
export type ProductionModelRole = (typeof PRODUCTION_MODEL_ROLES)[number];

export type ProductionTaskStatus = 'queued' | 'running' | 'blocked' | 'ready' | 'complete' | 'approved' | 'archived';
export type ProductionReviewState = 'not-started' | 'founder-review' | 'changes-requested' | 'approved';

export type ProductionAutomationGate = {
  architectureComplete: boolean;
  dependenciesResolved: boolean;
  founderApproval: boolean;
  autoApprovalAllowed: boolean;
};

export type ProductionPackage = {
  architecturePrompt: string;
  architectureOutput: string;
  composerPrompt: string;
  assetPrompts: string[];
  motionPrompts: string[];
  testingChecklist: string[];
  knowledgeCoreUpdates: string[];
  adrUpdates: string[];
  integrationChecklist: string[];
};

export type ProductionBoardTask = {
  id: string;
  featureName: string;
  founderIntent: string;
  currentStage: ProductionOrchestratorStage;
  assignedModel: ProductionModelRole;
  prompt: string;
  output: string;
  dependencies: string[];
  status: ProductionTaskStatus;
  nextRequiredAction: string;
  blockingIssues: string[];
  reviewState: ProductionReviewState;
  requiresAssets: boolean;
  requiresMotion: boolean;
  createdAt: string;
  updatedAt: string;
  gate: ProductionAutomationGate;
  productionPackage: ProductionPackage;
  handoffLog: string[];
};

export type ProductionOrchestratorProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  tasks: ProductionBoardTask[];
  activeTaskId: string;
  architectureQueuedCount: number;
  implementationReadyCount: number;
  blockedCount: number;
  reviewNeededCount: number;
  approvedCount: number;
  dockLine: string;
};

export type ProductionOrchestratorStore = {
  version: string;
  profiles: ProductionOrchestratorProfile[];
};

export type CreateProductionTaskInput = {
  featureName: string;
  founderIntent: string;
  dependencies?: string[];
  requiresAssets?: boolean;
  requiresMotion?: boolean;
  autoApprovalAllowed?: boolean;
};
