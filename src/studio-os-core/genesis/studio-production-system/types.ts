import type {
  XpsApprovalGateId,
  XpsConsumerSystem,
  XpsDemoBrandId,
  XpsDepartmentId,
  XpsPlatform,
  XpsProductionStage,
  XpsRoomPath,
} from './constants';
import type { XcosControlRoomOverlay } from '../creative-operating-system/types';
import type { XniNarrativeBlueprint } from '../narrative-intelligence/types';

export type XpsDepartmentAssignment = {
  departmentId: XpsDepartmentId;
  label: string;
  specialist: string;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked';
  outputs: string[];
  gateId?: XpsApprovalGateId;
};

export type XpsApprovalRecord = {
  gateId: XpsApprovalGateId;
  label: string;
  status: 'pending' | 'approved' | 'rejected';
  required: boolean;
  note?: string;
  decidedAt?: string;
};

export type XpsBlockingIssue = {
  issueId: string;
  departmentId: XpsDepartmentId;
  severity: 'info' | 'warning' | 'blocker';
  summary: string;
  recommendation: string;
};

export type XpsTimelineEvent = {
  eventId: string;
  stage: XpsProductionStage;
  label: string;
  departmentId?: XpsDepartmentId;
  status: 'upcoming' | 'active' | 'complete';
  scheduledAt?: string;
};

export type XpsTrackedAsset = {
  assetId: string;
  label: string;
  departmentId: XpsDepartmentId;
  status: 'required' | 'in-production' | 'ready' | 'approved';
  source: 'blueprint' | 'department' | 'distribution';
};

export type XpsPublishingStatus = {
  platform: XpsPlatform;
  label: string;
  status: 'planned' | 'ready' | 'published';
  format: string;
};

export type XpsPerformanceSnapshot = {
  completionRate?: number;
  ctaRate?: number;
  watchThrough?: number;
  notes: string[];
};

/** Production Package™ — governed production company plan */
export type XpsProductionPackage = {
  packageId: string;
  blueprintId: string;
  brandId: XpsDemoBrandId;
  companyId: XpsDemoBrandId;
  topic: string;
  goal: string;
  audience: string;
  platform: XpsPlatform;
  desiredEmotion: string;
  currentStage: XpsProductionStage;
  departments: XpsDepartmentAssignment[];
  approvals: XpsApprovalRecord[];
  blockingIssues: XpsBlockingIssue[];
  timeline: XpsTimelineEvent[];
  assets: XpsTrackedAsset[];
  publishing: XpsPublishingStatus[];
  performance?: XpsPerformanceSnapshot;
  virtualSet: {
    room: string;
    environment: string;
    atmosphere: string;
    focalObject: string;
  };
  createdAt: string;
  updatedAt: string;
  version: string;
};

export type XpsPlaygroundInput = {
  topic: string;
  audience: string;
  goal: string;
  brandId: XpsDemoBrandId;
  companyId: XpsDemoBrandId;
  platform: XpsPlatform;
  desiredEmotion: string;
};

export type XpsPlaygroundPreview = {
  input: XpsPlaygroundInput;
  blueprint: XniNarrativeBlueprint;
  productionTeam: XpsDepartmentAssignment[];
  departmentWorkflow: XpsTimelineEvent[];
  virtualSet: XpsProductionPackage['virtualSet'];
  assetChecklist: XpsTrackedAsset[];
  publishingPlan: XpsPublishingStatus[];
  productionPackage: XpsProductionPackage;
  productionGate: { allowed: boolean; reason: string };
};

export type XpsStore = {
  version: string;
  packageRegistry: XpsProductionPackage[];
  playground: XpsPlaygroundInput;
  lastPreview?: XpsPlaygroundPreview;
  constitutionLocked: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type XpsControlRoomProduction = {
  package: XpsProductionPackage;
  blueprint?: XniNarrativeBlueprint;
  currentStageLabel: string;
  assignedDepartments: XpsDepartmentAssignment[];
  blockingIssues: XpsBlockingIssue[];
  pendingApprovals: XpsApprovalRecord[];
  assets: XpsTrackedAsset[];
  timeline: XpsTimelineEvent[];
  publishing: XpsPublishingStatus[];
  performance?: XpsPerformanceSnapshot;
};

export type XpsReadyView = {
  activeRoom: XpsRoomPath;
  activeBrandId: XpsDemoBrandId;
  activePackages: XpsProductionPackage[];
  controlRoom: XpsControlRoomProduction[];
  playground: XpsPlaygroundInput;
  preview?: XpsPlaygroundPreview;
  consumerBindings: { system: XpsConsumerSystem; status: string }[];
  organizationOverlay?: XcosControlRoomOverlay;
  demoBrandIds: XpsDemoBrandId[];
  orbNote: string;
  constitutionLocked: boolean;
};

export type XpsRuntimeInput = {
  pathname?: string;
  playground?: Partial<XpsPlaygroundInput>;
  brandId?: XpsDemoBrandId;
};
