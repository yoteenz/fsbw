import type {
  EVALUATION_CATEGORIES,
  EXPERIENCE_ISSUE_TYPES,
  EXPERIENCE_QA_PHILOSOPHY,
  EXPERIENCE_QA_SEVERITIES,
  EXPERIENCE_QUESTIONS,
  SIMULATION_PERSONAS,
} from './constants';

export type EvaluationCategory = (typeof EVALUATION_CATEGORIES)[number];
export type ExperienceQuestion = (typeof EXPERIENCE_QUESTIONS)[number];
export type SimulationPersona = (typeof SIMULATION_PERSONAS)[number];
export type ExperienceIssueType = (typeof EXPERIENCE_ISSUE_TYPES)[number];
export type ExperienceQaSeverity = (typeof EXPERIENCE_QA_SEVERITIES)[number];
export type ExperienceQaPhilosophyLine = (typeof EXPERIENCE_QA_PHILOSOPHY)[number];

export type ExperienceFinding = {
  id: string;
  issueType: ExperienceIssueType;
  issueLabel: string;
  category: EvaluationCategory;
  categoryLabel: string;
  severity: ExperienceQaSeverity;
  pageId: string;
  pageLabel: string;
  description: string;
  emotionalImpact: string;
  suggestedImprovement: string;
};

export type ExperiencePageReport = {
  id: string;
  pageId: string;
  pageLabel: string;
  route: string;
  experienceScore: number;
  clarityScore: number;
  emotionalLoad: number;
  estimatedLearningTime: string;
  estimatedTaskCompletionTime: string;
  pointsOfConfusion: string[];
  suggestedImprovements: string[];
  feelsEffortless: boolean;
  experienceVerdict: string;
  findingsCount: number;
  auditedAt: string;
};

export type PersonaSimulationResult = {
  id: string;
  persona: SimulationPersona;
  personaLabel: string;
  pageId: string;
  pageLabel: string;
  experienceScore: number;
  frictionScore: number;
  confidenceScore: number;
  summary: string;
  passed: boolean;
};

export type CategoryEvaluationScore = {
  category: EvaluationCategory;
  label: string;
  score: number;
  status: 'excellent' | 'watch' | 'needs-work';
  summary: string;
};

export type ExperienceQuestionAnswer = {
  question: ExperienceQuestion;
  answer: string;
  score: number;
  pageId: string;
};

export type OrganizationExperienceQaProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallExperienceScore: number;
  pagesAudited: number;
  findingsOpen: number;
  pagesNeedingRefinement: number;
  averageEmotionalLoad: number;
  categoryScores: CategoryEvaluationScore[];
  findings: ExperienceFinding[];
  pageReports: ExperiencePageReport[];
  simulations: PersonaSimulationResult[];
  questionAnswers: ExperienceQuestionAnswer[];
  selectedPageId: string | null;
  dockExperienceLine: string;
  optimizesForConfidence: true;
  lastSyncedAt: string;
};

export type ExperienceQaStore = {
  version: string;
  profiles: OrganizationExperienceQaProfile[];
};

export type ExperienceQaDockAdvice = {
  response: string;
  concierge: string;
  overallExperienceScore?: number;
  findingsOpen?: number;
};

export type ExperienceQaSearchHit = {
  type: 'finding' | 'report' | 'simulation' | 'category';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
