import type {
  AplLifecycleStage,
  AplPromptCategory,
  AplQualityDimension,
  AplRelationshipType,
  AplRoomPath,
  AplSupportedModel,
} from './constants';

export type AplQualityScore = {
  dimension: AplQualityDimension;
  score: number;
  evidence: string[];
  evaluatedAt: string;
};

export type AplPromptVersion = {
  versionId: string;
  promptId: string;
  semver: string;
  changedSections: string[];
  rationale: string;
  author: string;
  reviewer?: string;
  fromExecutionLesson: boolean;
  supersedes?: string;
  compatibility: string;
  bodySnapshot: string;
  approvedAt?: string;
  retiredAt?: string;
  status: 'draft' | 'approved' | 'retired' | 'superseded';
};

export type AplDependency = {
  dependencyId: string;
  promptId: string;
  dependencyType:
    | 'genesis-article'
    | 'core-system'
    | 'launch-stack-milestone'
    | 'existing-prompt'
    | 'model-capability'
    | 'company-context'
    | 'design-system'
    | 'environment-config'
    | 'source-asset'
    | 'research-packet'
    | 'validation-data';
  targetRef: string;
  label: string;
  required: boolean;
  satisfied: boolean;
};

export type AplPromptRelationship = {
  relationshipId: string;
  fromPromptId: string;
  toRef: string;
  toLabel: string;
  toKind: 'prompt' | 'genesis-article' | 'core-system' | 'launch-stack' | 'knowledge' | 'implementation';
  relationshipType: AplRelationshipType;
  rationale?: string;
};

export type AplExecutionRecord = {
  executionId: string;
  promptId: string;
  promptVersion: string;
  model: AplSupportedModel;
  operator: string;
  contextSummary: string;
  startedAt: string;
  completedAt: string;
  outputSummary: string;
  generatedArtifacts: string[];
  followUpTasks: string[];
  validationPassed: boolean;
  qualityScore: number;
  costUsd?: number;
  runtimeMs?: number;
  linkedCommits?: string[];
  genesisProposalRef?: string;
};

export type AplValidationResult = {
  validationId: string;
  promptId: string;
  executionId?: string;
  deliverablesComplete: boolean;
  buildPassed: boolean;
  founderApproved: boolean;
  genesisUpdated: boolean;
  reusable: boolean;
  contradictionsFound: boolean;
  canonizationEligible: boolean;
  notes: string;
  validatedAt: string;
};

export type AplModelPerformanceRecord = {
  recordId: string;
  promptId: string;
  category: AplPromptCategory;
  model: AplSupportedModel;
  successRate: number;
  consistencyScore: number;
  avgLatencyMs: number;
  avgQualityScore: number;
  executionCount: number;
  lastExecutedAt: string;
  strengths: string[];
  weaknesses: string[];
};

export type AplLessonLearned = {
  lessonId: string;
  promptId: string;
  title: string;
  context: string;
  insight: string;
  recommendation: string;
  recordedAt: string;
};

export type AplGeneratedOutput = {
  outputId: string;
  promptId: string;
  executionId: string;
  outputType:
    | 'genesis-article'
    | 'implementation-file'
    | 'ui-component'
    | 'design-guide'
    | 'migration'
    | 'test-suite'
    | 'validation-report'
    | 'executive-brief'
    | 'launch-stack-milestone'
    | 'adr';
  label: string;
  ref: string;
  createdAt: string;
};

export type AplGenesisReference = {
  refId: string;
  promptId: string;
  articlePath: string;
  articleTitle: string;
  relationship: 'implements' | 'references' | 'proposes' | 'validates';
};

export type AplLaunchStackReference = {
  refId: string;
  promptId: string;
  milestoneId: string;
  milestoneLabel: string;
  systemId: string;
};

export type AplCoreSystemReference = {
  refId: string;
  promptId: string;
  systemId: string;
  systemLabel: string;
};

export type AplPromptTemplate = {
  promptId: string;
  officialName: string;
  purpose: string;
  category: AplPromptCategory;
  collectionIds: string[];
  recommendedModel: AplSupportedModel;
  alternativeModels: AplSupportedModel[];
  requiredContext: string[];
  body: string;
  expectedDeliverables: string[];
  expectedArtifacts: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex' | 'constitutional';
  estimatedRuntimeMin: number;
  lifecycleStage: AplLifecycleStage;
  reviewStatus: 'pending' | 'in-review' | 'approved' | 'rejected';
  approvalStatus: 'unapproved' | 'founder-approved' | 'canonized';
  canonical: boolean;
  author: string;
  currentVersion: string;
  tags: string[];
  knownLimitations: string[];
  lastUpdated: string;
  archivedAt?: string;
  retirementReason?: string;
};

export type AplPromptCollection = {
  collectionId: string;
  officialName: string;
  purpose: string;
  steward: string;
  categories: AplPromptCategory[];
  promptIds: string[];
  healthScore: number;
  lastReviewed: string;
};

export type AplVersionComparison = {
  comparisonId: string;
  promptId: string;
  versionA: string;
  versionB: string;
  summary: string;
  qualityDelta: number;
  bodyDiffSummary: string;
};

export type AplRecommendation = {
  recommendationId: string;
  promptId?: string;
  category?: AplPromptCategory;
  title: string;
  reason: string;
  confidence: number;
  kind: 'use-prompt' | 'improve-prompt' | 'new-prompt' | 'retire-prompt' | 'model-switch' | 'fill-gap';
  orbCuratorNote: string;
};

export type AplAnalyticsSnapshot = {
  totalPrompts: number;
  canonicalCount: number;
  draftCount: number;
  archivedCount: number;
  executionCount: number;
  avgQualityScore: number;
  categoryCoverage: Record<string, number>;
  modelUsage: Record<string, number>;
  stalePromptCount: number;
  duplicateRiskCount: number;
  conflictCount: number;
  gapCount: number;
};

export type AplGraphNode = {
  nodeId: string;
  label: string;
  kind: 'prompt' | 'genesis' | 'system' | 'milestone' | 'output';
  category?: AplPromptCategory;
  canonical?: boolean;
};

export type AplGraphEdge = {
  edgeId: string;
  fromId: string;
  toId: string;
  relationshipType: AplRelationshipType | 'executed' | 'produced';
};

export type AplStore = {
  version: string;
  prompts: AplPromptTemplate[];
  versions: AplPromptVersion[];
  collections: AplPromptCollection[];
  dependencies: AplDependency[];
  relationships: AplPromptRelationship[];
  executions: AplExecutionRecord[];
  validations: AplValidationResult[];
  modelPerformance: AplModelPerformanceRecord[];
  lessons: AplLessonLearned[];
  outputs: AplGeneratedOutput[];
  genesisRefs: AplGenesisReference[];
  launchStackRefs: AplLaunchStackReference[];
  coreSystemRefs: AplCoreSystemReference[];
  comparisons: AplVersionComparison[];
  recommendations: AplRecommendation[];
  archivedPromptIds: string[];
  orbLibrarianMode: boolean;
  lastOpenedAt?: string;
  seededAt?: string;
  bootstrappedAt?: string;
};

export type AplPlatformStats = {
  promptCount: number;
  canonicalCount: number;
  collectionCount: number;
  executionCount: number;
  avgQualityScore: number;
  relationshipCount: number;
  validationPassRate: number;
  modelRecordCount: number;
};

export type AplReadyView = {
  activeRoom: AplRoomPath;
  stats: AplPlatformStats;
  analytics: AplAnalyticsSnapshot;
  prompts: AplPromptTemplate[];
  collections: AplPromptCollection[];
  versions: AplPromptVersion[];
  dependencies: AplDependency[];
  relationships: AplPromptRelationship[];
  executions: AplExecutionRecord[];
  validations: AplValidationResult[];
  modelPerformance: AplModelPerformanceRecord[];
  lessons: AplLessonLearned[];
  outputs: AplGeneratedOutput[];
  genesisRefs: AplGenesisReference[];
  launchStackRefs: AplLaunchStackReference[];
  coreSystemRefs: AplCoreSystemReference[];
  comparisons: AplVersionComparison[];
  recommendations: AplRecommendation[];
  qualityScores: AplQualityScore[];
  graphNodes: AplGraphNode[];
  graphEdges: AplGraphEdge[];
  searchResults: AplPromptTemplate[];
  selectedPromptId?: string;
  orbLibrarianMode: boolean;
  orbCuratorBrief: string;
  lineageForSelected: AplPromptVersion[];
  executionTimeline: AplExecutionRecord[];
};

export type AplRuntimeInput = {
  pathname?: string;
  searchQuery?: string;
  selectedPromptId?: string;
  founderDisplayName?: string;
};
