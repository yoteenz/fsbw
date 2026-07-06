import type {
  ACCESSIBILITY_REQUIREMENTS,
  INTERACTION_ENGINE_PHILOSOPHY,
  INTERACTION_PATTERN_TYPES,
  INTERACTION_STATES,
  MOTION_STANDARD_TYPES,
} from './constants';

export type InteractionPatternType = (typeof INTERACTION_PATTERN_TYPES)[number];
export type InteractionStateId = (typeof INTERACTION_STATES)[number];
export type MotionStandardType = (typeof MOTION_STANDARD_TYPES)[number];
export type AccessibilityRequirementId = (typeof ACCESSIBILITY_REQUIREMENTS)[number];
export type InteractionPhilosophyLine = (typeof INTERACTION_ENGINE_PHILOSOPHY)[number];

export type InteractionPatternEntry = {
  patternId: string;
  name: string;
  type: InteractionPatternType;
  trigger: string;
  behavior: string;
  feedback: string;
  states: InteractionStateId[];
  motionRef?: string;
  accessibility: AccessibilityRequirementId[];
  consumedBy: string[];
  platformStandard: boolean;
};

export type InteractionStateSpec = {
  stateId: InteractionStateId;
  label: string;
  description: string;
  visualCue: string;
  required: boolean;
};

export type MotionStandardEntry = {
  motionId: string;
  name: string;
  type: MotionStandardType;
  value: string;
  description: string;
  usedBy: string[];
};

export type AccessibilitySpec = {
  requirementId: AccessibilityRequirementId;
  label: string;
  description: string;
  implementation: string;
  mandatory: boolean;
};

export type InteractionGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  componentId?: string;
  message: string;
  recommendation: string;
};

export type InteractionHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type OrganizationInteractionEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  engineScore: number;
  totalPatterns: number;
  totalStates: number;
  patternTypeCounts: Record<string, number>;
  patterns: InteractionPatternEntry[];
  states: InteractionStateSpec[];
  motionStandards: MotionStandardEntry[];
  accessibilitySpecs: AccessibilitySpec[];
  governanceFindings: InteractionGovernanceFinding[];
  healthMetrics: InteractionHealthMetric[];
  componentCompliancePct: number;
  dockEngineLine: string;
  behavioralCohesion: true;
  lastSyncedAt: string;
};

export type InteractionEngineStore = {
  version: string;
  profiles: OrganizationInteractionEngineProfile[];
};

export type InteractionEngineDockAdvice = {
  response: string;
  concierge: string;
  engineScore?: number;
};

export type InteractionSearchHit = {
  entry: InteractionPatternEntry;
  score: number;
  matchReason: string;
};
