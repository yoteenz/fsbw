/** Living Knowledge Mirror™ — canonical platform models (shared across all Expert Capture professions) */

export type KnowledgeEntryType =
  | 'interview_answer'
  | 'follow_up_answer'
  | 'workflow_rule'
  | 'decision_rule'
  | 'quality_control_rule'
  | 'exception'
  | 'personal_technique'
  | 'industry_update'
  | 'regulation_update'
  | 'software_update'
  | 'process_improvement'
  | 'correction'
  | 'retraction'
  | 'new_discovery'
  | 'case_reflection'
  | 'confessional_update'
  | 'continued_education_lesson'
  | 'knowledge_refresh'
  | 'superseding_instruction';

export type KnowledgeVisibility =
  | 'private_draft'
  | 'expert_only'
  | 'owner_review'
  | 'approved_training'
  | 'restricted_internal'
  | 'archived';

export type KnowledgeLifecycleStatus =
  | 'draft'
  | 'recorded'
  | 'transcribed'
  | 'interpreted'
  | 'needs_clarification'
  | 'partially_approved'
  | 'expert_reviewed'
  | 'owner_visible'
  | 'approved_for_training'
  | 'scenario_tested'
  | 'active_knowledge'
  | 'superseded'
  | 'outdated'
  | 'disputed'
  | 'rejected'
  | 'archived'
  | 'deleted'
  | 'restricted';

export type FreshnessStatus = 'current' | 'review_due' | 'potentially_outdated' | 'conflicting' | 'superseded' | 'retired';

export type TrainingPacketStatus =
  | 'draft'
  | 'expert_approved'
  | 'owner_approved'
  | 'ready_for_scenario_testing'
  | 'passed'
  | 'failed'
  | 'active'
  | 'needs_refresh'
  | 'superseded'
  | 'retired';

export type CompetencyLevel =
  | 'not_introduced'
  | 'introduced'
  | 'learning'
  | 'practicing'
  | 'scenario_tested'
  | 'provisional'
  | 'competent'
  | 'expert_approved'
  | 'needs_refresh'
  | 'restricted'
  | 'retired';

export type OwnerReviewDecision =
  | 'approve_for_training'
  | 'return_for_clarification'
  | 'hold'
  | 'reject'
  | 'restrict_use'
  | 'request_scenario_test';

export type KnowledgeSource = {
  sessionId: string;
  answerId: string;
  questionId: string;
  questionText: string;
  videoTimestampMs: number | null;
  mediaRef: string | null;
  transcript: string;
  correctedTranscript: string | null;
  aiInterpretation: string | null;
  expertApprovedAt: string | null;
  ownerApprovedAt: string | null;
};

export type KnowledgeEntry = {
  id: string;
  knowledgeObjectId: string;
  version: number;
  previousVersionId: string | null;
  entryType: KnowledgeEntryType;
  expertName: string;
  profession: string;
  companyId: string;
  profileId: string;
  knowledgeArea: string;
  statement: string;
  structuredType: string;
  condition: string | null;
  action: string | null;
  purpose: string | null;
  lifecycleStatus: KnowledgeLifecycleStatus;
  visibility: KnowledgeVisibility;
  freshnessStatus: FreshnessStatus;
  trainingStatus: 'not_eligible' | 'pending_packet' | 'in_packet' | 'active_training' | 'completed';
  workerConfidenceImpact: number | null;
  source: KnowledgeSource;
  expertCorrection: string | null;
  ownerNotes: string | null;
  scenarioTestStatus: 'none' | 'required' | 'pending' | 'passed' | 'failed';
  effectiveFrom: string;
  effectiveUntil: string | null;
  reviewDueAt: string | null;
  jurisdiction: string | null;
  industryContext: string | null;
  softwareContext: string | null;
  createdAt: string;
  updatedAt: string;
  submittedForOwnerReviewAt: string | null;
};

export type KnowledgeVersion = {
  id: string;
  knowledgeObjectId: string;
  version: number;
  previousVersionId: string | null;
  supersedesVersionId: string | null;
  entryId: string;
  status: KnowledgeLifecycleStatus;
  effectiveFrom: string;
  effectiveUntil: string | null;
  createdBy: string;
  approvedByExpert: string | null;
  approvedByOwner: string | null;
  sourceSessionId: string;
  reasonForChange: string;
  changeSummary: string;
  jurisdiction: string | null;
  industryContext: string | null;
  softwareContext: string | null;
  reviewDueAt: string | null;
  createdAt: string;
};

export type TrainingPacket = {
  id: string;
  slug: string;
  title: string;
  knowledgeArea: string;
  profileId: string;
  companyId: string;
  status: TrainingPacketStatus;
  entryIds: string[];
  approvedStatements: string[];
  workflowSteps: string[];
  exceptions: string[];
  requiredInputs: string[];
  prohibitedAssumptions: string[];
  humanReviewBoundaries: string[];
  examples: string[];
  unansweredQuestions: string[];
  confidenceLevel: number;
  effectiveDate: string;
  trainerIdentity: string;
  ownerApprovedAt: string | null;
  expertApprovedAt: string | null;
  scenarioTestRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContinuingEducationAssignment = {
  id: string;
  topic: string;
  reason: string;
  affectedRole: string;
  sourceEntryId: string | null;
  requiredCompletionDate: string | null;
  scenarioTestRequired: boolean;
  passingThreshold: number;
  ownerVisible: boolean;
  completionStatus: 'assigned' | 'learning' | 'testing' | 'passed' | 'failed' | 'reauthorized';
  competencyImpact: string | null;
  assignedBy: string;
  assignedAt: string;
};

export type WorkerCompetency = {
  id: string;
  area: string;
  profileId: string;
  level: CompetencyLevel;
  evidenceEntryIds: string[];
  packetIds: string[];
  lastChangedAt: string;
  changeReason: string;
};

export type WorkerAuthorization = {
  id: string;
  capability: string;
  profileId: string;
  granted: boolean;
  evidencePacketIds: string[];
  scenarioTestPassed: boolean;
  restrictedReason: string | null;
  updatedAt: string;
};

export type ScenarioTest = {
  id: string;
  packetId: string;
  status: 'pending' | 'passed' | 'failed';
  conductedAt: string | null;
  notes: string | null;
};

export type OwnerReview = {
  id: string;
  entryIds: string[];
  packetId: string | null;
  decision: OwnerReviewDecision | null;
  notes: string;
  reviewedAt: string | null;
  createdAt: string;
};

export type KnowledgeConflict = {
  id: string;
  entryIdA: string;
  entryIdB: string;
  summary: string;
  detectedAt: string;
  resolved: boolean;
  resolution: string | null;
};

export type OwnerNotification = {
  id: string;
  type:
    | 'expert_approved'
    | 'packet_ready'
    | 'conflict_detected'
    | 'knowledge_corrected'
    | 'rule_retired'
    | 'scenario_failed'
    | 'authorization_change'
    | 'ce_assigned'
    | 'review_due'
    | 'confessional_update'
    | 'section_complete';
  title: string;
  summary: string;
  relatedEntryIds: string[];
  relatedPacketId: string | null;
  read: boolean;
  createdAt: string;
};

export type KnowledgeProgram = {
  programId: string;
  profileId: string;
  companyId: string;
  expertName: string;
  profession: string;
  organizationLabel: string;
  sessionIds: string[];
  entries: KnowledgeEntry[];
  versions: KnowledgeVersion[];
  packets: TrainingPacket[];
  competencies: WorkerCompetency[];
  authorizations: WorkerAuthorization[];
  scenarioTests: ScenarioTest[];
  continuingEducation: ContinuingEducationAssignment[];
  ownerReviews: OwnerReview[];
  conflicts: KnowledgeConflict[];
  notifications: OwnerNotification[];
  createdAt: string;
  updatedAt: string;
};

export type OwnerMirrorSnapshot = {
  program: KnowledgeProgram;
  trainingProgressPercent: number;
  recentEntries: KnowledgeEntry[];
  readyForReview: KnowledgeEntry[];
  activePackets: TrainingPacket[];
  pendingPackets: TrainingPacket[];
  competencySummary: WorkerCompetency[];
  authorizationSummary: WorkerAuthorization[];
  knowledgeGaps: string[];
  conflicts: KnowledgeConflict[];
  outdatedEntries: KnowledgeEntry[];
  continuingEducation: ContinuingEducationAssignment[];
  unreadNotifications: OwnerNotification[];
};

export const TRAINING_ELIGIBLE_STATUSES: KnowledgeLifecycleStatus[] = [
  'approved_for_training',
  'scenario_tested',
  'active_knowledge',
];

export const NEVER_TRAINING_STATUSES: KnowledgeLifecycleStatus[] = [
  'draft',
  'recorded',
  'transcribed',
  'interpreted',
  'needs_clarification',
  'deleted',
  'rejected',
  'disputed',
];
