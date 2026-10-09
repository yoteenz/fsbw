import type { CodexBlenderHandoffWithTechnicalArt } from '../technical-art/codex-handoff-extension';

export type ExecutionPhase =
  | 'PREPARE_ASSIGNMENT'
  | 'VALIDATE_INPUTS'
  | 'AUTHORIZE_EXECUTION'
  | 'DISPATCH_JOB'
  | 'TRACK_STATUS'
  | 'COLLECT_OUTPUTS'
  | 'VERIFY_OUTPUTS'
  | 'REGISTER_LINEAGE'
  | 'PREPARE_REVIEW';

export type ExecutionJobStatus =
  | 'PREPARED'
  | 'AUTHORIZED'
  | 'DISPATCHED'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'BLOCKED'
  | 'TIMEOUT';

export type FabricationExecutionBackend = 'BLENDER_LOCAL' | 'CODEX_EXTERNAL' | 'UNAVAILABLE';

export type FabricationAssignmentManifest = {
  assignmentId: string;
  projectId: string;
  assetId: string;
  fabricationVersion: string;
  productionLane: 'PROP_INTERACTIVE_OBJECT_ART';
  targetRuntime: 'WEB_3D';
  secondaryProfile?: 'UNREAL_WORLD';
  packageRoot: string;
  returnRoot: string;
  approvedReferenceIds: string[];
  sourceAssetRefs: string[];
  expectedDeliverables: string[];
  performanceProfile: string;
  executionBudget: { allowPaidGeneration: false; maxAttempts: number };
  founderApprovalGate: 'FOUNDER_VISUAL_APPROVAL';
  handoff: CodexBlenderHandoffWithTechnicalArt;
  createdAt: string;
};

export type ExecutionJobRecord = {
  jobId: string;
  assignmentId: string;
  backend: FabricationExecutionBackend;
  status: ExecutionJobStatus;
  phasesCompleted: ExecutionPhase[];
  blenderBin?: string;
  blenderVersion?: string;
  startedAt?: string;
  finishedAt?: string;
  exitCode?: number;
  stdoutLogPath?: string;
  stderrLogPath?: string;
  returnPackageRoot?: string;
  codexDispatch: 'VERIFIED' | 'BLOCKED' | 'NOT_APPLICABLE';
  errors: string[];
};

export type ExecutionLoopEvidence = {
  handoffPrepared: boolean;
  jobDispatched: boolean;
  blenderExecuted: boolean;
  outputsVerified: boolean;
  returnIngested: boolean;
  founderReviewReady: boolean;
  classification: 'FULL_LOOP_VERIFIED' | 'PARTIAL_BLENDER_VERIFIED' | 'PARTIAL_CONTRACT_ONLY' | 'BLOCKED';
};
