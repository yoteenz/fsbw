/**
 * Studio World™ Experience Intelligence Engine™ — Creative Director types.
 * Evaluates human experience, not engineering correctness.
 */

export type ExperienceIssueCategory =
  | 'flat-experience'
  | 'empty-space'
  | 'generic-template'
  | 'static-lifeless'
  | 'ui-heavy'
  | 'text-heavy'
  | 'no-discovery'
  | 'no-movement'
  | 'no-atmosphere'
  | 'no-landmark'
  | 'weak-emotional-payoff'
  | 'flow-friction';

export type ExperienceIssueSeverity = 'critical' | 'major' | 'minor';

export type ExperienceIssue = {
  id: string;
  category: ExperienceIssueCategory;
  severity: ExperienceIssueSeverity;
  problem: string;
  reason: string;
  affectedDestinations: string[];
  creativeQuestionsFailed: string[];
};

export type ExperienceScores = {
  immersion: number;
  wonder: number;
  luxury: number;
  emotionalImpact: number;
  navigationClarity: number;
  environmentalStorytelling: number;
  cinematicQuality: number;
  personality: number;
  senseOfDiscovery: number;
  senseOfScale: number;
  believability: number;
  flow: number;
  replayability: number;
  founderDelight: number;
  guestDelight: number;
  overallMagic: number;
};

/** Founder-facing observatory installations */
export type ExperienceObservatoryMetrics = {
  immersionHealth: number;
  wonderIndex: number;
  luxuryScore: number;
  discoveryDensity: number;
  sceneVariety: number;
  environmentalDepth: number;
  emotionalImpact: number;
  interactionQuality: number;
  navigationFlow: number;
  founderDelight: number;
};

export type ExperienceImprovement = {
  id: string;
  issueId: string;
  problem: string;
  recommendation: string;
  category:
    | 'lighting'
    | 'atmosphere'
    | 'camera'
    | 'sound'
    | 'animation'
    | 'storytelling'
    | 'props'
    | 'landmark'
    | 'pacing'
    | 'arrival'
    | 'transition'
    | 'concierge'
    | 'discovery'
    | 'micro-interaction'
    | 'delight';
  affectedDestinations: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
};

export type DiscoveryOpportunity = {
  id: string;
  destination: string;
  type:
    | 'hidden-room'
    | 'collectible'
    | 'founder-memory'
    | 'artifact'
    | 'interactive-object'
    | 'milestone'
    | 'seasonal'
    | 'concierge-npc'
    | 'dynamic-weather'
    | 'time-of-day'
    | 'music-shift'
    | 'environmental-surprise';
  suggestion: string;
};

export type FlowFrictionPoint = {
  id: string;
  destination: string;
  frictionType: 'hesitation' | 'lost' | 'awkward-nav' | 'repetitive-movement' | 'scene-too-long' | 'abrupt-transition';
  observation: string;
  architecturalRecommendation: string;
};

export type ExperienceIntelligenceReport = {
  evaluatedAt: string;
  scores: ExperienceScores;
  observatory: ExperienceObservatoryMetrics;
  issues: ExperienceIssue[];
  improvements: ExperienceImprovement[];
  discoveryOpportunities: DiscoveryOpportunity[];
  flowFriction: FlowFrictionPoint[];
  recommendedUpgrades: string[];
  passed: boolean;
};

export type ExperienceIntelligenceGateContext = {
  kind: 'destination' | 'scene' | 'interaction' | 'continuous';
  route?: string;
  departmentId?: string;
  projectId?: string;
  stationId?: string;
  metadata?: Record<string, unknown>;
};

export type ExperienceIntelligenceGateResult = {
  ok: true;
  passed: boolean;
  proceed: boolean;
  report: ExperienceIntelligenceReport;
  reason?: string;
};

export type ApprovedExperiencePattern = {
  id: string;
  approvedAt: string;
  patternType:
    | 'pacing'
    | 'atmosphere'
    | 'transition'
    | 'scale'
    | 'discovery'
    | 'lighting'
    | 'emotional-tone';
  label: string;
  route?: string;
  departmentId?: string;
  notes?: string;
};

export type ExperienceMemoryStore = {
  version: 1;
  patterns: ApprovedExperiencePattern[];
};

export const EXPERIENCE_INTELLIGENCE_EVENT = 'studio-world-experience-intelligence-requested';
