/**
 * Architecture Decision Records™ — constitutional history for Studio World.
 *
 * ADRs are not documentation. They preserve why a foundational decision exists,
 * which alternatives were rejected, and how that decision shaped the civilization.
 */

export const ADR_STATUSES = ['Proposed', 'Accepted', 'Superseded', 'Deprecated'] as const;
export type ArchitectureDecisionRecordStatus = (typeof ADR_STATUSES)[number];

export const ADR_REVIEW_STAGES = [
  'Draft',
  'Review',
  'Challenge',
  'Approved',
  'Implemented',
  'Historical',
  'Superseded',
] as const;
export type ArchitectureDecisionRecordReviewStage = (typeof ADR_REVIEW_STAGES)[number];

export type ArchitectureDecisionAlternative = {
  name: string;
  summary: string;
  rejectedBecause: string;
};

export type ArchitectureDecisionJournal = {
  title: string;
  narrative: string;
};

export type ArchitectureDecisionGraphLinks = {
  createdSystems: string[];
  dependedOnDecisions: string[];
  supersededDecisions: string[];
  futureIdeasOriginated: string[];
};

export type ArchitectureDecisionRecord = {
  adrNumber: string;
  title: string;
  dateApproved: string;
  status: ArchitectureDecisionRecordStatus;
  author: string;
  decisionSummary: string;
  problemStatement: string;
  goals: string[];
  alternativesConsidered: ArchitectureDecisionAlternative[];
  tradeoffs: string[];
  finalDecision: string;
  constitutionArticlesAffected: string[];
  worldBibleReferences: string[];
  experienceSystemsAffected: string[];
  engineeringImpact: string[];
  futureExpansionOpportunities: string[];
  relatedAdrs: string[];
  visualReferences: string[];
  implementationSprint: string;
  lessonsLearned: string[];
  reviewStage: ArchitectureDecisionRecordReviewStage;
  journal: ArchitectureDecisionJournal;
  graph: ArchitectureDecisionGraphLinks;
};

export type ArchitectureDecisionDraftInput = {
  title: string;
  author: string;
  problemStatement: string;
  decisionSummary?: string;
  goals?: string[];
  constitutionArticlesAffected?: string[];
  worldBibleReferences?: string[];
  experienceSystemsAffected?: string[];
  implementationSprint?: string;
};
