import type {
  HISTORY_TRACKED_FIELDS,
  LIFECYCLE_STATES,
  STATE_ENGINE_PHILOSOPHY,
  STATE_OBJECT_TYPES,
  TRANSITION_REQUIREMENTS,
} from './constants';

export type LifecycleState = (typeof LIFECYCLE_STATES)[number];
export type StateObjectType = (typeof STATE_OBJECT_TYPES)[number];
export type TransitionRequirement = (typeof TRANSITION_REQUIREMENTS)[number];
export type HistoryTrackedField = (typeof HISTORY_TRACKED_FIELDS)[number];
export type StatePhilosophyLine = (typeof STATE_ENGINE_PHILOSOPHY)[number];

export type LifecycleStateEntry = {
  state: LifecycleState;
  label: string;
  description: string;
  terminal: boolean;
  extensible: true;
};

export type StateObjectEntry = {
  objectType: StateObjectType;
  label: string;
  description: string;
  currentCount: number;
  managed: true;
};

export type StateTransitionRule = {
  transitionId: string;
  from: LifecycleState;
  to: LifecycleState;
  label: string;
  requiresApproval: boolean;
  requiresPermission: boolean;
  policyEnforced: true;
  automationTrigger?: string;
  notification?: string;
};

export type StateHistoryRecord = {
  recordId: string;
  objectType: StateObjectType;
  objectName: string;
  previousState: LifecycleState;
  currentState: LifecycleState;
  reason: string;
  user: string;
  date: string;
  approvalChain?: string;
  automationTrigger?: string;
  comments?: string;
};

export type StateGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
};

export type StateImprovementRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type OrganizationStateEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  consistencyScore: number;
  lifecycleCoveragePct: number;
  transitionIntegrityPct: number;
  historyCompletenessPct: number;
  lifecycleStates: LifecycleStateEntry[];
  stateObjects: StateObjectEntry[];
  transitionRules: StateTransitionRule[];
  historyRecords: StateHistoryRecord[];
  governanceFindings: StateGovernanceFinding[];
  recommendations: StateImprovementRecommendation[];
  objectsAwaitingApproval: number;
  pausedObjectCount: number;
  failedTodayCount: number;
  dockConsistencyLine: string;
  predictableLifecycle: true;
  lastSyncedAt: string;
};

export type StateEngineStore = {
  version: string;
  profiles: OrganizationStateEngineProfile[];
};

export type StateEngineDockAdvice = {
  response: string;
  concierge: string;
  consistencyScore?: number;
};

export type StateSearchHit = {
  type: 'state' | 'object' | 'transition' | 'history';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
