/** Studio Institute — Expert Capture Interview (MVP v1) */

import type { ExpertTrustRecord } from './trust-vault/types';

export type KnowledgeStatus =
  | 'recorded'
  | 'transcribed'
  | 'interpreted'
  | 'awaiting_approval'
  | 'approved'
  | 'eligible_for_training'
  | 'corrected'
  | 'deleted'
  | 'rejected'
  | 'needs_clarification'
  | 'skipped';

export type KnowledgeStatementType =
  | 'workflow_step'
  | 'workflow'
  | 'decision_rule'
  | 'quality_control'
  | 'quality_check'
  | 'edge_case'
  | 'communication_style'
  | 'communication_rule'
  | 'customer_experience_rule'
  | 'exception'
  | 'principle'
  | 'gap'
  | 'municipality_rule'
  | 'required_document'
  | 'inspection_rule'
  | 'submission_rule'
  | 'time_estimate'
  | 'common_failure'
  | 'best_practice'
  | 'personal_technique'
  | 'escalation_rule';

export type ExpertCapturePhase =
  | 'landing'
  | 'welcome_back'
  | 'trust_welcome'
  | 'trust_agreements'
  | 'vault_gate'
  | 'consent'
  | 'media_setup'
  | 'interview'
  | 'understanding_review'
  | 'clarify'
  | 'interrupted_recovery'
  | 'session_complete'
  | 'knowledge_review'
  | 'export'
  | 'save_exit'
  | 'session_dashboard'
  | 'device_conflict';

export type AnswerConfirmation = 'correct' | 'partial' | 'misunderstood' | null;

export type ExpertCaptureSessionMeta = {
  id: string;
  profileId: string;
  expertName: string;
  expertRole: string;
  organizationLabel: string;
  createdAt: string;
  updatedAt: string;
  consentAcceptedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  pausedAt: string | null;
  status: 'draft' | 'in_progress' | 'paused' | 'completed' | 'deleted';
  currentQuestionIndex: number;
  estimatedMinutesRemaining: number;
  aiGreetingDelivered: boolean;
  trustFramework: ExpertTrustRecord | null;
};

export type StructuredKnowledgeItem = {
  id: string;
  answerId: string;
  statement: string;
  type: KnowledgeStatementType;
  condition: string | null;
  action: string | null;
  purpose: string | null;
  confidence: number;
  needsReview: boolean;
  status: KnowledgeStatus;
  sourceTimestampMs: number | null;
  videoTimestampMs: number | null;
  conversationReference: string | null;
};

export type ExpertCaptureAnswer = {
  id: string;
  questionId: string;
  questionText: string;
  followUpOf: string | null;
  skipped: boolean;
  deleted: boolean;
  deletedAt: string | null;
  recordedAt: string | null;
  durationMs: number | null;
  transcript: string;
  correctedTranscript: string | null;
  transcriptExpertCorrected: boolean;
  aiUnderstanding: string | null;
  confirmation: AnswerConfirmation;
  clarificationNotes: string | null;
  knowledgeItems: StructuredKnowledgeItem[];
  media: {
    videoBlobId: string | null;
    audioBlobId: string | null;
  };
  status: KnowledgeStatus;
};

export type ExpertCaptureQuestion = {
  id: string;
  text: string;
  category: string;
  order: number;
  optional: boolean;
};

export type SessionSummaryReport = {
  topicsCovered: string[];
  workflowSteps: string[];
  decisionRules: string[];
  exceptions: string[];
  knowledgeGaps: string[];
  followUpOpportunities: string[];
  questionsSkipped: number;
  questionsDeleted: number;
  questionsCorrected: number;
  questionsApproved: number;
  totalAnswers: number;
  /** Permitting profile extensions */
  businessAreasCovered?: string[];
  municipalityRules?: string[];
  bestPractices?: string[];
  remainingTopics?: string[];
};

export type ExpertCaptureSession = {
  meta: ExpertCaptureSessionMeta;
  questions: ExpertCaptureQuestion[];
  answers: ExpertCaptureAnswer[];
  summary: SessionSummaryReport | null;
};

export type InterviewAiRequest =
  | { action: 'greet'; expertName: string; expertRole: string; profileId?: string; industryContext?: string }
  | {
      action: 'analyze_answer';
      question: string;
      transcript: string;
      expertRole: string;
      profileId?: string;
      industryContext?: string;
    }
  | { action: 'follow_up'; question: string; transcript: string; understanding: string; profileId?: string; industryContext?: string }
  | {
      action: 'clarify';
      question: string;
      transcript: string;
      misunderstanding: string;
      expertCorrection: string;
      profileId?: string;
      industryContext?: string;
    };

export type InterviewAiResponse = {
  text: string;
  understanding?: string;
  knowledgeItems?: Omit<StructuredKnowledgeItem, 'id' | 'answerId' | 'status'>[];
  followUpQuestion?: string | null;
  needsFollowUp?: boolean;
};
