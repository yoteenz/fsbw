import type {
  HqAdvisoryKind,
  HqMissionStatus,
  HqOrbMode,
  HqPriorityKind,
  HqRoomClass,
  HqRoomId,
  HqRoomMaturityLevel,
} from './constants';

export type HeadquartersRoomRecord = {
  roomId: HqRoomId;
  title: string;
  officialName: string;
  purpose: string;
  roomClass: HqRoomClass;
  maturityLevel: HqRoomMaturityLevel;
  launchStackV1: boolean;
  locked: boolean;
  lockReason?: string;
  unlockDependency?: string;
  routePath: string;
  relatedSystems: string[];
  departmentId?: string;
  sortOrder: number;
};

export type HeadquartersArrivalSession = {
  sessionId: string;
  actorIdentityId: string;
  companyIdentityId: string;
  organizationIdentityId: string | null;
  activeRoomId: HqRoomId;
  arrivedAt: string;
  lastRoomChangeAt: string;
  orbMode: HqOrbMode;
  founderFocusActive: boolean;
};

export type HeadquartersPriorityCard = {
  priorityId: string;
  kind: HqPriorityKind;
  title: string;
  detail: string;
  confidence: number;
  sourceSystems: string[];
  targetRoomId: HqRoomId;
  createdAt: string;
};

export type HeadquartersRecommendedAction = {
  actionId: string;
  action: string;
  reason: string;
  confidence: number;
  sourceSystems: string[];
  requiresApproval: boolean;
  permissionKey?: string;
  targetRoomId: HqRoomId;
};

export type HeadquartersMissionItem = {
  missionId: string;
  title: string;
  status: HqMissionStatus;
  departmentLabel: string;
  blockerNote?: string;
  updatedAt: string;
  targetRoomId: HqRoomId;
};

export type HeadquartersAdvisory = {
  advisoryId: string;
  kind: HqAdvisoryKind;
  title: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
  sourceSystems: string[];
  targetRoomId?: HqRoomId;
};

export type HeadquartersPulseMetric = {
  metricId: string;
  label: string;
  score: number;
  trend: 'up' | 'down' | 'flat';
  sourceSystem: string;
};

export type HeadquartersDepartmentEntry = {
  departmentId: string;
  title: string;
  purpose: string;
  roomId: HqRoomId;
  maturityLevel: HqRoomMaturityLevel;
  locked: boolean;
  headcountLabel?: string;
};

/** Projection contracts — v1 adapters until upstream systems ship */
export type HeadquartersBriefingProjection = {
  projectionId: string;
  owningSystem: 'Ambient Awareness™' | 'Executive Headquarters™';
  replacementPlan: string;
  greeting: string;
  briefingParagraph: string;
  whatChanged: string;
  requiresAttention: string;
  canWait: string;
  activeDepartments: string[];
  generatedAt: string;
  stale: boolean;
};

export type HeadquartersHealthProjection = {
  projectionId: string;
  owningSystem: 'Analytics™' | 'Company Health Index™';
  replacementPlan: string;
  overallScore: number;
  overallLabel: string;
  operationalPulse: string;
  riskNotes: string[];
  metrics: HeadquartersPulseMetric[];
  generatedAt: string;
};

export type HeadquartersMissionProjection = {
  projectionId: string;
  owningSystem: 'Mission Engine™';
  replacementPlan: string;
  queue: HeadquartersMissionItem[];
  activeCount: number;
  blockedCount: number;
  awaitingApprovalCount: number;
  generatedAt: string;
};

export type HeadquartersCompanyProjection = {
  projectionId: string;
  owningSystem: 'Identity Engine™' | 'Company Genome™';
  replacementPlan: string;
  companyDisplayName: string;
  companyOfficialName: string;
  founderDisplayName: string;
  organizationDisplayName: string;
  atmosphereLabel: string;
  currentFocus: string;
  companyIdentityId: string;
  actorIdentityId: string;
};

export type HeadquartersRoomProjection = {
  projectionId: string;
  owningSystem: 'Atlas™' | 'Executive Headquarters™';
  replacementPlan: string;
  rooms: HeadquartersRoomRecord[];
  activeRoomId: HqRoomId;
  departmentDirectory: HeadquartersDepartmentEntry[];
};

export type HeadquartersOrbDockState = {
  mode: HqOrbMode;
  presenceLine: string;
  orientationLine: string;
  citationSystems: string[];
  expandable: boolean;
};

export type ExecutiveHeadquartersStore = {
  version: string;
  rooms: HeadquartersRoomRecord[];
  arrivalSession: HeadquartersArrivalSession | null;
  priorities: HeadquartersPriorityCard[];
  recommendedAction: HeadquartersRecommendedAction | null;
  advisories: HeadquartersAdvisory[];
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type ExecutiveHeadquartersReadyView = {
  company: HeadquartersCompanyProjection;
  briefing: HeadquartersBriefingProjection;
  health: HeadquartersHealthProjection;
  missions: HeadquartersMissionProjection;
  rooms: HeadquartersRoomProjection;
  priorities: HeadquartersPriorityCard[];
  recommendedAction: HeadquartersRecommendedAction | null;
  advisories: HeadquartersAdvisory[];
  orb: HeadquartersOrbDockState;
  arrivalSession: HeadquartersArrivalSession;
};

export type ExecutiveHeadquartersStats = {
  roomCount: number;
  launchStackRoomCount: number;
  lockedRoomCount: number;
  priorityCount: number;
  missionCount: number;
  advisoryCount: number;
  activeRoomId: HqRoomId;
};
