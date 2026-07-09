import type {
  XcosDemoBrandId,
  XcosEconomyAssetType,
  XcosEvolutionTarget,
  XcosExecutiveId,
  XcosFounderDecision,
  XcosMemoryType,
  XcosOrgState,
  XcosRoomPath,
  XcosConsumerSystem,
} from './constants';

export type XcosExecutiveBrief = {
  executiveId: XcosExecutiveId;
  label: string;
  recommendation: string;
  evidence: string[];
  risks: string[];
  opportunities: string[];
  confidence: number;
};

export type XcosTradeOff = {
  tradeOffId: string;
  summary: string;
  optionA: string;
  optionB: string;
  recommendation: string;
};

export type XcosBoardMeeting = {
  meetingId: string;
  packageId: string;
  blueprintId: string;
  brandId: XcosDemoBrandId;
  topic: string;
  agenda: string[];
  executiveBriefs: XcosExecutiveBrief[];
  unifiedRecommendation: string;
  evidence: string[];
  tradeOffs: XcosTradeOff[];
  risks: string[];
  expectedOutcomes: string[];
  founderDecision: XcosFounderDecision | 'pending';
  founderRationale?: string;
  decidedAt?: string;
  archivedToMemory: boolean;
  createdAt: string;
  updatedAt: string;
};

export type XcosCreativeMemoryRecord = {
  recordId: string;
  memoryType: XcosMemoryType;
  brandId: XcosDemoBrandId;
  packageId?: string;
  blueprintId?: string;
  meetingId?: string;
  summary: string;
  reasoning: string;
  evidenceRefs: string[];
  tags: string[];
  instituteLinked: boolean;
  searchableText: string;
  createdAt: string;
};

export type XcosEvolutionProposal = {
  proposalId: string;
  target: XcosEvolutionTarget;
  brandId: XcosDemoBrandId;
  packageId: string;
  summary: string;
  predictedOutcome: string;
  actualOutcome: string;
  delta: string;
  recommendation: string;
  confidence: number;
  status: 'proposed' | 'approved' | 'rejected';
  createdAt: string;
};

export type XcosEconomyAsset = {
  assetId: string;
  assetType: XcosEconomyAssetType;
  title: string;
  description: string;
  brandId: XcosDemoBrandId;
  sourcePackageId?: string;
  sourceDepartment?: string;
  status: 'draft' | 'reusable' | 'preferred' | 'canon' | 'deprecated';
  performanceNotes: string[];
  reuseRecommendation: string;
  version: string;
  createdAt: string;
};

export type XcosGovernanceRecord = {
  recordId: string;
  policy: string;
  status: 'active' | 'warning' | 'violation';
  summary: string;
  recommendation: string;
};

export type XcosStore = {
  version: string;
  orgState: XcosOrgState;
  boardMeetings: XcosBoardMeeting[];
  memoryRecords: XcosCreativeMemoryRecord[];
  evolutionProposals: XcosEvolutionProposal[];
  economyAssets: XcosEconomyAsset[];
  governanceRecords: XcosGovernanceRecord[];
  constitutionLocked: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type XcosControlRoomOverlay = {
  orgState: XcosOrgState;
  orgStateLabel: string;
  executiveBoard: { executiveId: XcosExecutiveId; label: string; status: string }[];
  activeMeetings: XcosBoardMeeting[];
  pendingFounderDecisions: number;
  departmentActivity: { department: string; status: string; productionId?: string }[];
  liveProductionCount: number;
  recentMemory: XcosCreativeMemoryRecord[];
  memoryCount: number;
  evolutionInsights: XcosEvolutionProposal[];
  economyAssetCount: number;
  recentEconomyAssets: XcosEconomyAsset[];
  studioIntelligenceStatus: string;
  instituteLinkCount: number;
};

export type XcosReadyView = {
  activeRoom: XcosRoomPath;
  activeBrandId: XcosDemoBrandId;
  orgState: XcosOrgState;
  boardMeetings: XcosBoardMeeting[];
  pendingMeetings: XcosBoardMeeting[];
  memoryRecords: XcosCreativeMemoryRecord[];
  evolutionProposals: XcosEvolutionProposal[];
  economyAssets: XcosEconomyAsset[];
  governanceRecords: XcosGovernanceRecord[];
  controlRoomOverlay: XcosControlRoomOverlay;
  consumerBindings: { system: XcosConsumerSystem; status: string }[];
  demoBrandIds: XcosDemoBrandId[];
  orbNote: string;
  constitutionLocked: boolean;
};

export type XcosRuntimeInput = {
  pathname?: string;
  brandId?: XcosDemoBrandId;
};

export type XcosBoardMeetingInput = {
  packageId: string;
  blueprintId: string;
  brandId: XcosDemoBrandId;
  topic: string;
  goal: string;
  audience: string;
  platform: string;
};
