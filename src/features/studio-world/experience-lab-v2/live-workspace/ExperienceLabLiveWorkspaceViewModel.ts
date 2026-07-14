import type { CanonicalMainDepartmentId } from '../../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import type { ExperienceLabProgram } from '../../../../studio-os-core/canonical-studio-world/experience-lab-program';
import type { EnvironmentPackageOutputStatus } from '../../../../studio-os-core/environment-asset-package/EnvironmentPackageOutputs';
import type { PackageLifecycleState } from '../../../../studio-os-core/environment-asset-package/ProductionReadinessGate';
import type { FounderRenderJobView } from '../../../../studio-os-core/founder-render';
import type { ExperienceLabV2ApprovalState } from '../experience-lab-v2.types';
import type { WorkbenchEditingToolId } from '../experience-lab-v2-workbench-config';
import type { DesignVariantId } from '../experience-lab-design-variants';

/** Blueprint display state machine — derived from active package output registry. */
export type BlueprintDisplayState =
  | 'NOT_REQUESTED'
  | 'BLOCKED'
  | 'QUEUED'
  | 'GENERATING'
  | 'GENERATED'
  | 'STALE'
  | 'FAILED'
  | 'APPROVED'
  | 'CANONICAL';

export type LiveWorkspaceReviewEntry = {
  id: string;
  revision: number;
  previewThumbnailUrl: string | null;
  outputType: 'environment' | 'blueprint' | 'construction' | 'render';
  variantId: DesignVariantId;
  variantName: string;
  theme: 'light' | 'dark';
  generatedAt: string | null;
  provider: string;
  model: string;
  generationCostUsd: number | null;
  status: string;
  founderComment: string | null;
  approvalState: 'pending' | 'approved' | 'rejected' | 'archived' | 'canonical';
  isCanonical: boolean;
  isArchived: boolean;
  isHistoricalPreview: boolean;
};

export type LiveWorkspaceTimelineEventType =
  | 'package-created'
  | 'variant-selected'
  | 'preview-generated'
  | 'revision-started'
  | 'generation-started'
  | 'output-completed'
  | 'output-failed'
  | 'revision-completed'
  | 'founder-approved'
  | 'founder-rejected'
  | 'revision-requested'
  | 'archived'
  | 'promoted-to-production'
  | 'promoted-to-canonical'
  | 'superseded'
  | 'cds-handoff-created'
  | 'readiness-evaluated'
  | 'queue-authorized';

export type LiveWorkspaceTimelineEvent = {
  id: string;
  eventType: LiveWorkspaceTimelineEventType;
  revision: number;
  timestamp: string;
  actor: string | null;
  output: string | null;
  costUsd: number | null;
  note: string;
  status: string;
};

export type LiveWorkspaceDesignBrief = {
  currentObjective: string;
  programLabel: string;
  departmentOrPackLabel: string;
  environmentLabel: string;
  variantName: string;
  theme: 'light' | 'dark';
  packageRevision: number;
  packageStatus: string;
  promptVersion: string;
  provider: string;
  model: string;
  readinessPercent: number;
  estimatedCostUsd: number | null;
  actualCostUsd: number | null;
  founderNotes: string | null;
  blockers: string[];
  moodLine: string | null;
};

export type LiveWorkspaceBlueprintDisplay = {
  packageId: string;
  variantId: DesignVariantId;
  environmentName: string;
  artifactUrl: string | null;
  outputStatus: EnvironmentPackageOutputStatus;
  displayState: BlueprintDisplayState;
  revision: number;
  generationJobKind: string | null;
  checksum: string | null;
  generatedAt: string | null;
  approvalState: 'pending' | 'approved' | 'rejected';
  isStale: boolean;
  isCanonical: boolean;
  blockerReason: string | null;
  dependency: string | null;
  queuePosition: number | null;
  failureCode: string | null;
  source: 'active-revision' | 'latest-approved' | 'cached' | 'pending' | 'unavailable';
  canGenerate: boolean;
  canRetry: boolean;
  canApprove: boolean;
  canOpen: boolean;
};

export type LiveWorkspaceWorkbenchModuleData = {
  architectural: {
    blueprintStatus: string;
    constructionStatus: string;
    activeRevision: number;
    architectureReadiness: number;
    dependencies: string[];
  };
  materials: {
    profileStatus: string;
    summary: string;
    revision: number;
    appliedMaterials: string[];
    pendingSelections: string[];
    generationJobStatus: string;
  };
  assetReference: {
    manifestStatus: string;
    attachedCount: number;
    missingCount: number;
    goldenReferences: string[];
    summary: string;
  };
  budget: {
    estimatedCostUsd: number;
    actualCostUsd: number | null;
    outputsGenerated: number;
    outputsPending: number;
    outputsFailed: number;
    outputsRemaining: number;
    retryReserveUsd: number;
    projectedFinalUsd: number;
    displayEstimate: string;
  };
  workforce: {
    activeAssignments: string[];
    generationWorkers: string[];
    schedulerJobs: string[];
    responsibleDepartment: string;
    blockedAssignments: string[];
  };
  permit: {
    lifecycleState: PackageLifecycleState;
    readinessPercent: number;
    blockers: string[];
    founderApproved: boolean;
    canApproveForProduction: boolean;
    canPromoteToCanonical: boolean;
    cdsHandoffEligible: boolean;
    permitStatus: 'clear' | 'pending' | 'blocked';
  };
};

export type LiveWorkspaceDiagnostics = {
  activePackageId: string | null;
  activeRevision: number;
  selectedWorkbenchTool: WorkbenchEditingToolId | null;
  resolvedContextModule: string | null;
  blueprintOutputSource: string;
  blueprintOutputStatus: string;
  latestPackageEvent: string | null;
  realtimeConnected: boolean;
  designBriefSource: string;
  reviewWallSourceCount: number;
  timelineSourceCount: number;
  packageReadinessPercent: number;
  approvalEligible: boolean;
  repositoryMode: 'durable' | 'in-memory';
  eventSync?: Record<string, unknown>;
};

/** Canonical Experience Lab live workspace view model — single source for all sections. */
export type ExperienceLabLiveWorkspaceViewModel = {
  programId: ExperienceLabProgram;
  departmentId: CanonicalMainDepartmentId;
  departmentName: string;
  industryPackId: string | null;
  environmentId: string | null;
  environmentName: string;
  variantId: DesignVariantId;
  variantName: string;
  theme: 'light' | 'dark';
  environmentPackageId: string;
  packageRevision: number;
  packageStatus: string;
  packageHealth: number;
  readinessPercent: number;
  readinessBlockers: string[];
  promptVersion: string;
  promptHash: string;
  provider: string;
  model: string;
  seed: string;
  estimatedCost: number;
  actualCost: number | null;
  currentObjective: string;
  founderNotes: string | null;
  activeRevision: number;
  revisionHistory: Array<{ revision: number; status: string; changedAt: string; reason: string }>;
  generationJobs: Array<{ kind: string; status: string; outputKeys: string[] }>;
  generatedOutputs: string[];
  pendingOutputs: string[];
  failedOutputs: string[];
  activeWorkbenchTool: WorkbenchEditingToolId | null;
  activeContextModule: string | null;
  blueprintOutput: LiveWorkspaceBlueprintDisplay;
  blueprintStatus: BlueprintDisplayState;
  approvalState: ExperienceLabV2ApprovalState;
  canonicalState: boolean;
  cdsHandoffState: 'none' | 'eligible' | 'created';
  updatedAt: string;
  designBrief: LiveWorkspaceDesignBrief;
  founderReviewEntries: LiveWorkspaceReviewEntry[];
  timelineEvents: LiveWorkspaceTimelineEvent[];
  workbenchModules: LiveWorkspaceWorkbenchModuleData;
  founderRender: FounderRenderJobView | null;
  historicalPreviewRevision: number | null;
  isHistoricalPreviewMode: boolean;
  diagnostics: LiveWorkspaceDiagnostics;
  loading: boolean;
  error: string | null;
  empty: boolean;
};
