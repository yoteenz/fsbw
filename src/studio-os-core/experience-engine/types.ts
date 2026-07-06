import type {
  ADAPTIVE_ENVIRONMENT_CONTROLS,
  CONTEXT_AWARENESS_SIGNALS,
  EXPERIENCE_ENGINE_PHILOSOPHY,
  EXPERIENCE_MODES,
  EXPERIENCE_TRANSITIONS,
} from './constants';

export type ExperienceModeId = (typeof EXPERIENCE_MODES)[number];
export type AdaptiveEnvironmentControl = (typeof ADAPTIVE_ENVIRONMENT_CONTROLS)[number];
export type ContextAwarenessSignal = (typeof CONTEXT_AWARENESS_SIGNALS)[number];
export type ExperienceTransitionId = (typeof EXPERIENCE_TRANSITIONS)[number];
export type ExperiencePhilosophyLine = (typeof EXPERIENCE_ENGINE_PHILOSOPHY)[number];

export type ExperienceModeEntry = {
  modeId: ExperienceModeId;
  label: string;
  description: string;
  atmosphere: string;
  status: 'active' | 'available' | 'planned';
  tasteful: true;
};

export type AdaptiveEnvironmentSetting = {
  control: AdaptiveEnvironmentControl;
  label: string;
  currentValue: string;
  modeInfluence: string;
  professional: true;
};

export type ContextSignalReading = {
  signal: ContextAwarenessSignal;
  label: string;
  currentReading: string;
  suggestedMode?: ExperienceModeId;
  active: boolean;
};

export type ExperienceTransitionRule = {
  transitionId: ExperienceTransitionId;
  trigger: string;
  fromContext: string;
  toMode: ExperienceModeId;
  subtle: true;
  description: string;
};

export type ExperienceGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
};

export type ExperienceImprovementRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type OrganizationExperienceEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  atmosphereScore: number;
  adaptabilityPct: number;
  contextAwarenessPct: number;
  transitionQualityPct: number;
  experienceModes: ExperienceModeEntry[];
  environmentSettings: AdaptiveEnvironmentSetting[];
  contextSignals: ContextSignalReading[];
  transitionRules: ExperienceTransitionRule[];
  governanceFindings: ExperienceGovernanceFinding[];
  recommendations: ExperienceImprovementRecommendation[];
  activeMode: ExperienceModeId;
  activeModeLabel: string;
  dockExperienceLine: string;
  infrastructureChapterComplete: true;
  lastSyncedAt: string;
};

export type ExperienceEngineStore = {
  version: string;
  profiles: OrganizationExperienceEngineProfile[];
};

export type ExperienceEngineDockAdvice = {
  response: string;
  concierge: string;
  atmosphereScore?: number;
};

export type ExperienceSearchHit = {
  type: 'mode' | 'environment' | 'context' | 'transition';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
