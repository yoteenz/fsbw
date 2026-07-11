/** Expert Trust Framework™ + Knowledge Vault™ — canonical types (Studio Institute v1.1) */

export type ProtectionCardId =
  | 'confidentiality'
  | 'ownership'
  | 'training_scope'
  | 'version_history'
  | 'audit_trail'
  | 'encryption'
  | 'review_before_training'
  | 'knowledge_updates'
  | 'access_control'
  | 'withdrawal_rights';

export type TrustAgreementId =
  | 'confidentiality_nda'
  | 'intellectual_property'
  | 'training_license'
  | 'privacy_policy'
  | 'expert_consent';

export type ProtectionCard = {
  id: ProtectionCardId;
  title: string;
  summary: string;
  detail: string;
};

export type TrustAgreement = {
  id: TrustAgreementId;
  title: string;
  subtitle: string;
  placeholderText: string;
  required: boolean;
};

export type ExpertTrustRecord = {
  welcomeCompletedAt: string | null;
  agreementsSignedAt: string | null;
  signatureName: string | null;
  agreementsAccepted: Partial<Record<TrustAgreementId, boolean>>;
  vaultIntroCompletedAt: string | null;
  agreementVersion: string;
};

export type VaultSectionId =
  | 'original_recordings'
  | 'audio'
  | 'video'
  | 'transcripts'
  | 'ai_summaries'
  | 'knowledge_graph'
  | 'workflow_maps'
  | 'corrections'
  | 'published_knowledge'
  | 'draft_knowledge'
  | 'retired_knowledge'
  | 'version_history'
  | 'training_sessions'
  | 'worker_progress'
  | 'competency_reports'
  | 'permissions'
  | 'access_logs'
  | 'audit_history'
  | 'exports'
  | 'backups'
  | 'legal_agreements'
  | 'trust_settings';

export type VaultSection = {
  id: VaultSectionId;
  title: string;
  description: string;
  icon: string;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  user: string;
  worker: string | null;
  purpose: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  organizationId: string;
  profileId: string;
};

export type WorkerIsolationManifest = {
  organizationId: string;
  organizationLabel: string;
  workerName: string;
  workerScope: string;
  learnsFrom: string;
  neverMixesWith: string;
  publicRegulationSharing: 'intentional_public_sources_only';
  proprietaryIsolation: true;
};

export type ContinuousEducationLessonType =
  | 'teach_something_new'
  | 'correct_previous_lesson'
  | 'industry_update'
  | 'law_change'
  | 'better_method'
  | 'common_mistake'
  | 'faq'
  | 'case_study'
  | 'new_client_scenario'
  | 'emergency_update';

export type KnowledgeVaultLifecycleStage =
  | 'recorded'
  | 'transcribed'
  | 'ai_interpretation'
  | 'expert_review'
  | 'corrections'
  | 'founder_approval'
  | 'worker_training'
  | 'published'
  | 'active'
  | 'updated'
  | 'retired';

export type VaultTimelineEvent = {
  id: string;
  timestamp: string;
  stage: KnowledgeVaultLifecycleStage | string;
  title: string;
  summary: string;
  actor: string;
  entryId: string | null;
  sessionId: string | null;
};

export type LivingWorkerSnapshot = {
  workerName: string;
  knowledgeVersion: number;
  competencyLevel: string;
  lastUpdated: string;
  pendingLessons: number;
  trainingProgressPercent: number;
  confidenceSummary: string;
  weakAreas: string[];
  needsReview: string[];
  sourceCount: number;
  evolutionVersions: WorkerEvolutionVersion[];
};

export type WorkerEvolutionVersion = {
  version: number;
  label: string;
  changedAt: string;
  changeSummary: string;
  packetIds: string[];
};

export type TrustDashboardMetrics = {
  knowledgeUploaded: number;
  hoursRecorded: number;
  trainingCompletionPercent: number;
  approvalQueueCount: number;
  pendingReviews: number;
  correctionsNeeded: number;
  workerAccuracyLabel: string;
  workerConfidenceLabel: string;
  latestSessionAt: string | null;
  recentUpdatesCount: number;
  knowledgeHealthScore: number;
};

export type VaultExportKind =
  | 'recordings'
  | 'transcripts'
  | 'knowledge_graph'
  | 'workflow_maps'
  | 'ai_summaries'
  | 'worker_reports'
  | 'competency_reports'
  | 'audit_history'
  | 'approved_knowledge'
  | 'version_history';

export type KnowledgeVaultSnapshot = {
  organizationId: string;
  organizationLabel: string;
  expertName: string;
  profileId: string;
  workerIsolation: WorkerIsolationManifest;
  trustRecord: ExpertTrustRecord | null;
  sections: VaultSection[];
  timeline: VaultTimelineEvent[];
  auditLog: AuditLogEntry[];
  dashboard: TrustDashboardMetrics;
  livingWorker: LivingWorkerSnapshot;
  searchableItems: Array<{ id: string; sectionId: VaultSectionId; title: string; snippet: string; timestamp: string }>;
};

export const TRUST_AGREEMENT_VERSION = 'studio-institute-trust-v1.1';
