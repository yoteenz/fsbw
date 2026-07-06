import type {
  AI_RED_TEAM_PHILOSOPHY,
  RED_TEAM_CHALLENGES,
  RED_TEAM_EXPOSURE_TARGETS,
  RED_TEAM_FINDING_STATUSES,
  RED_TEAM_SEVERITIES,
} from './constants';

export type RedTeamExposureTarget = (typeof RED_TEAM_EXPOSURE_TARGETS)[number];
export type RedTeamChallengeId = (typeof RED_TEAM_CHALLENGES)[number];
export type RedTeamSeverity = (typeof RED_TEAM_SEVERITIES)[number];
export type RedTeamFindingStatus = (typeof RED_TEAM_FINDING_STATUSES)[number];
export type AiRedTeamPhilosophyLine = (typeof AI_RED_TEAM_PHILOSOPHY)[number];

export type AiRedTeamFinding = {
  id: string;
  issue: string;
  exposureTarget: RedTeamExposureTarget;
  exposureLabel: string;
  severity: RedTeamSeverity;
  confidencePct: number;
  rootCause: string;
  affectedSystems: string[];
  suggestedResolution: string;
  status: RedTeamFindingStatus;
  detectedAt: string;
  adversarialOnly: true;
};

export type RedTeamChallengeRun = {
  id: string;
  challengeId: RedTeamChallengeId;
  challengeLabel: string;
  query: string;
  startedAt: string;
  completedAt: string;
  findingsProduced: number;
  summary: string;
};

export type RedTeamExposureMetric = {
  target: RedTeamExposureTarget;
  label: string;
  stressTestsRun: number;
  weaknessesFound: number;
  lastProbedAt: string;
};

export type OrganizationAiRedTeamProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  redTeamScore: number;
  openFindings: number;
  criticalFindings: number;
  challengesRun: number;
  assumeWrongUntilProven: true;
  findings: AiRedTeamFinding[];
  exposureMetrics: RedTeamExposureMetric[];
  recentChallenges: RedTeamChallengeRun[];
  dockRedTeamLine: string;
  lastSyncedAt: string;
};

export type AiRedTeamStore = {
  version: string;
  profiles: OrganizationAiRedTeamProfile[];
};

export type AiRedTeamDockAdvice = {
  response: string;
  concierge: string;
  openFindings?: number;
};

export type AiRedTeamSearchHit = {
  type: 'finding' | 'challenge' | 'exposure';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
