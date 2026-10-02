import type { ResidentCastRoleContract, ResidentCanonicalIdentity, ResidentId } from '../types';
import type {
  AutonomyLevel,
  CareerStateKind,
  EmotionalOperatingDimension,
  FounderInterventionKind,
  MemoryClass,
  NeedDimension,
  ResidentPresenceState,
  SimulationMode,
} from './types-core';
import type { ResidentLifeEventEnvelope } from './event-envelope';

export type NeedLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type NeedStateCause = {
  causeType: 'EVENT' | 'ENVIRONMENT' | 'WORKLOAD' | 'RELATIONSHIP' | 'MEMORY' | 'FOUNDER' | 'NEED' | 'TIME' | 'SUCCESS' | 'FAILURE';
  summary: string;
  eventId?: string;
  at: string;
};

export type ResidentNeedSnapshot = {
  residentId: ResidentId;
  levels: Partial<Record<NeedDimension, NeedLevel>>;
  emotional: Partial<Record<EmotionalOperatingDimension, NeedLevel>>;
  causes: NeedStateCause[];
  updatedAt: string;
};

export type ResidentCurrentState = {
  residentId: ResidentId;
  presence: ResidentPresenceState;
  locationId: string;
  locationLabel: string;
  destinationId?: string;
  movementState: 'STATIONARY' | 'WALKING' | 'IN_TRANSIT' | 'ARRIVING';
  activity: string;
  currentIntent: string;
  currentTaskId?: string;
  socialContext?: string;
  nearbyResidentIds: ResidentId[];
  blockers: string[];
  availability: 'OPEN' | 'LIMITED' | 'UNAVAILABLE';
  castContractId?: string;
  updatedAt: string;
};

export type ApproachProfile = {
  residentId: ResidentId;
  whenApproachFounder: string[];
  howApproach: string;
  contextPrepared: 'minimal' | 'moderate' | 'extensive';
  preferPrivate: boolean;
  solveFirstReportLater: boolean;
  askBeforeActing: boolean;
  escalationStyle: string;
  whenUncertain: string;
  whenMistake: string;
  whenExcited: string;
  whenWorried: string;
};

export type PersonalityDecisionWeights = {
  residentId: ResidentId;
  /** Explainable tendencies 0–1 — not caricature locks. */
  riskTolerance: number;
  conflictAvoidance: number;
  founderCandor: number;
  socialInitiative: number;
  detailOrientation: number;
  spectacleAppetite: number;
  autonomyPreference: number;
};

export type ResidentMemoryRecord = {
  memoryId: string;
  residentId: ResidentId;
  memoryClass: MemoryClass;
  summary: string;
  significance: number;
  emotionalIntensity: number;
  recencyWeight: number;
  identityRelevance: number;
  resolutionState: 'OPEN' | 'RESOLVED' | 'DORMANT';
  formedAt: string;
  sourceEventId?: string;
  visibility: import('./types-core').VisibilityScope;
};

export type ResidentBeliefRecord = {
  residentId: ResidentId;
  subjectKey: string;
  knowledgeState: import('./types-core').KnowledgeState;
  beliefSummary: string;
  confidence: number;
  sourceEventId?: string;
  updatedAt: string;
};

export type SocialTruthEvent = {
  truthEventId: string;
  summary: string;
  authoritativePayload: Record<string, unknown>;
  occurredAt: string;
  visibility: import('./types-core').VisibilityScope;
  directWitnessIds: ResidentId[];
  disclosedTo: ResidentId[];
  founderKnows: boolean;
};

export type RumorFragment = {
  rumorId: string;
  truthEventId: string;
  holderId: ResidentId;
  holderKind: 'resident' | 'founder';
  versionSummary: string;
  accuracy: number;
  receivedFromId?: ResidentId;
  mutatedFromRumorId?: string;
  receivedAt: string;
};

export type FounderInterventionRecord = {
  interventionId: string;
  kind: FounderInterventionKind;
  targetResidentId: ResidentId;
  directive: string;
  reason?: string;
  at: string;
  durationMinutes?: number;
  residentAware: boolean;
  stateBeforeSummary: string;
  stateAfterSummary?: string;
};

export type ResidentCareerSnapshot = {
  residentId: ResidentId;
  careerState: CareerStateKind;
  title: string;
  department: string;
  reportingTo?: ResidentId;
  scopeSummary: string;
  employmentActive: boolean;
  noticePeriodEnd?: string;
  alumniSince?: string;
};

export type ResidentWorkNow = {
  residentId: ResidentId;
  currentActivity: string;
  activeProjectIds: string[];
  waitingOn: string[];
  delegatedOut: string[];
  selfInitiated: string[];
  completedToday: string[];
  founderBlockers: string[];
  teamBlockers: string[];
};

export type ResidentGoalStack = {
  residentId: ResidentId;
  aspirations: string[];
  mediumGoals: string[];
  currentWants: string[];
  fears: string[];
  personalObjectives: string[];
};

export type ResidentAutonomyProfile = {
  residentId: ResidentId;
  level: AutonomyLevel;
  allowedVerbs: import('./types-core').ResidentAgencyVerb[];
  founderGatedCategories: string[];
};

export type ResidentLifeRhythm = {
  residentId: ResidentId;
  coreObligations: string[];
  preferredRoutes: string[];
  optionalStops: string[];
  socialDependencies: string[];
  varianceNotes: string;
};

export type ResidentHomeRef = {
  residentId: ResidentId;
  homeId: string;
  label: string;
  publicRooms: string[];
  privateRooms: string[];
  meaningfulObjectIds: string[];
};

export type WorldClockState = {
  worldId: string;
  simulationMode: SimulationMode;
  isoTimestamp: string;
  workday: boolean;
  seasonLabel: string;
  calendarWeek: number;
};

export type ResidentRelationshipLifeDimensions = {
  residentAId: ResidentId;
  residentBId: ResidentId;
  trust: number;
  affection: number;
  respect: number;
  familiarity: number;
  resentment: number;
  rivalry: number;
  candor: number;
  sentiments: Array<{ tag: string; since: string; intensity: number }>;
};

export type ResidentDecisionRecord = {
  decisionId: string;
  residentId: ResidentId;
  decisionSummary: string;
  disposition: import('./types-core').DecisionDisposition;
  inputs: string[];
  memoryIds: string[];
  authoritySummary: string;
  confidence: number;
  reasoningSummary: string;
  risks: string[];
  founderRequired: boolean;
  outcomeSummary?: string;
  at: string;
};

/** Aggregate view — composed from normalized slices, not one blob store. */
export type ResidentLifeTwin = {
  identity: ResidentCanonicalIdentity;
  worldId: string;
  organizationId: string;
  current: ResidentCurrentState;
  needs: ResidentNeedSnapshot;
  approach: ApproachProfile;
  decisionWeights: PersonalityDecisionWeights;
  autonomy: ResidentAutonomyProfile;
  career: ResidentCareerSnapshot;
  workNow: ResidentWorkNow;
  goals: ResidentGoalStack;
  rhythm: ResidentLifeRhythm;
  home: ResidentHomeRef;
  activeCastRoles: ResidentCastRoleContract[];
  recentEvents: ResidentLifeEventEnvelope[];
  memoryCount: number;
  openLoopCount: number;
};

export type OrganizationalMemoryRecord = {
  orgMemoryId: string;
  organizationId: string;
  summary: string;
  source: string;
  confidence: number;
  scope: string;
  recordedAt: string;
  applicableUntil?: string;
  supersededBy?: string;
};

export type ReturnBriefItem = {
  summary: string;
  groundedEventId: string;
  residentIds: ResidentId[];
  at: string;
};

export type ReturnBrief = {
  organizationId: string;
  fromIso: string;
  toIso: string;
  items: ReturnBriefItem[];
};
