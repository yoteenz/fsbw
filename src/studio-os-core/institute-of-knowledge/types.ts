/**
 * The Institute of Knowledge™ — publication, review, and governance schemas.
 * Reusable institutional infrastructure; not a documentation website.
 */

export type InstituteDivisionId =
  | 'publishing-bureau'
  | 'research-bureau'
  | 'knowledge-validation-bureau'
  | 'historical-archives'
  | 'constitution-office'
  | 'standards-bureau'
  | 'world-chronicle'
  | 'publication-office';

export type InstitutePublicationType =
  | 'book'
  | 'collection'
  | 'volume'
  | 'article'
  | 'whitepaper'
  | 'research-paper'
  | 'sdk-documentation'
  | 'developer-documentation'
  | 'guide'
  | 'letter'
  | 'release-notes'
  | 'manual'
  | 'specification'
  | 'roadmap'
  | 'official-edition'
  | 'profession-guide'
  | 'civilization-report'
  | 'founder-letter'
  | 'expansion-manual';

export type InstitutePublicationStatus =
  | 'Draft'
  | 'Working'
  | 'Review'
  | 'Approved'
  | 'Canonical'
  | 'Deprecated'
  | 'Historical';

export type InstituteRelationshipType =
  | 'supports'
  | 'depends-on'
  | 'supersedes'
  | 'extends'
  | 'contradicts'
  | 'related-to'
  | 'referenced-by'
  | 'governs'
  | 'published-by'
  | 'derived-from';

export type KnowledgeSubmissionSource =
  | 'profession-brain'
  | 'research-engine'
  | 'mentor-ai'
  | 'knowledge-core'
  | 'founder'
  | 'manual'
  | 'future-ai';

export type KnowledgeReviewDecision = 'approve' | 'reject' | 'return' | 'defer';

export type InstituteApprovalRecord = {
  recordId: string;
  decision: KnowledgeReviewDecision | 'promote' | 'deprecate' | 'archive';
  statusBefore: InstitutePublicationStatus;
  statusAfter: InstitutePublicationStatus;
  reviewer: string;
  divisionId: InstituteDivisionId;
  notes: string;
  createdAt: string;
};

export type InstitutePublicationRevision = {
  revisionId: string;
  edition: string;
  revision: string;
  createdAt: string;
  author: string;
  summary: string;
  changeNote: string;
};

export type InstitutePublicationRelationship = {
  id: string;
  fromPublicationId: string;
  toPublicationId: string;
  type: InstituteRelationshipType;
  label?: string;
  createdAt: string;
};

export type InstitutePublication = {
  publicationId: string;
  title: string;
  type: InstitutePublicationType;
  edition: string;
  revision: string;
  status: InstitutePublicationStatus;
  divisionId: InstituteDivisionId;
  summary: string;
  abstract?: string;
  contributors: string[];
  approvalHistory: InstituteApprovalRecord[];
  revisionHistory: InstitutePublicationRevision[];
  relatedPublicationIds: string[];
  codexArticleIds: string[];
  constitutionalArticleIds: string[];
  professionIds: string[];
  tags: string[];
  docPaths?: string[];
  codePaths?: string[];
  worldGraphNodeId?: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeSubmission = {
  submissionId: string;
  source: KnowledgeSubmissionSource;
  sourceRef?: string;
  proposedTitle: string;
  proposedType: InstitutePublicationType;
  proposedSummary: string;
  proposedContent?: string;
  targetDivisionId: InstituteDivisionId;
  relatedPublicationIds: string[];
  codexArticleIds: string[];
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'returned' | 'promoted';
  submittedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  reviewNotes?: string;
  resultingPublicationId?: string;
};

export type ChronicleEntry = {
  entryId: string;
  title: string;
  summary: string;
  eventAt: string;
  recordedAt: string;
  publicationIds: string[];
  codexArticleIds: string[];
  tags: string[];
  divisionId: InstituteDivisionId;
};

export type InstituteDivision = {
  id: InstituteDivisionId;
  title: string;
  purpose: string;
  responsibilities: string[];
  governsSystems: string[];
  modulePath: string;
  expandable: boolean;
};

export type InstituteStore = {
  version: string;
  publications: InstitutePublication[];
  relationships: InstitutePublicationRelationship[];
  submissions: KnowledgeSubmission[];
  chronicle: ChronicleEntry[];
  bootstrappedAt?: string;
  codexSyncVersion?: string;
};

export type InstituteSearchFilters = {
  divisionId?: InstituteDivisionId;
  type?: InstitutePublicationType;
  status?: InstitutePublicationStatus;
  tag?: string;
  codexArticleId?: string;
  relatedPublicationId?: string;
};

export type InstituteSearchHit = {
  publication: InstitutePublication;
  score: number;
  matchReason: string;
};

export type InstituteOrbCitation = {
  publicationId: string;
  title: string;
  edition: string;
  revision: string;
  status: InstitutePublicationStatus;
  constitutionalArticleIds: string[];
  codexArticleIds: string[];
};

export type InstituteOrbRecommendation = {
  kind:
    | 'canonical-publication'
    | 'constitutional-source'
    | 'related-publication'
    | 'pending-review'
    | 'division-guidance';
  title: string;
  detail: string;
  publicationId?: string;
  citation?: InstituteOrbCitation;
};
