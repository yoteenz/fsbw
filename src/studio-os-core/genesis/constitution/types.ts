import type {
  CONSTITUTION_AMENDMENT_STAGES,
  CONSTITUTION_RELATIONSHIP_TYPES,
} from './constants';
import type { GenesisVersion } from '../types';

export type ConstitutionAmendmentStage = (typeof CONSTITUTION_AMENDMENT_STAGES)[number];

export type ConstitutionRelationshipType = (typeof CONSTITUTION_RELATIONSHIP_TYPES)[number];

export type ConstitutionArticleStatus =
  | 'proposed'
  | 'draft'
  | 'review'
  | 'approved'
  | 'canonical'
  | 'superseded'
  | 'deprecated'
  | 'archived';

export type ConstitutionCanonicalStatus =
  | 'non-canonical'
  | 'working'
  | 'review-pending'
  | 'canonical'
  | 'historical';

export type ConstitutionApprovalRecord = {
  approvalId: string;
  decision: 'approve' | 'reject' | 'return' | 'defer';
  stage: ConstitutionAmendmentStage | 'initial-canonical';
  approver: string;
  notes: string;
  createdAt: string;
};

export type ConstitutionArticleRevision = {
  revisionId: string;
  version: GenesisVersion;
  summary: string;
  author: string;
  changeNote: string;
  createdAt: string;
  snapshot?: Partial<ConstitutionArticle>;
};

export type ConstitutionArticle = {
  articleId: string;
  officialName: string;
  status: ConstitutionArticleStatus;
  version: GenesisVersion;
  category: string;
  summary: string;
  purpose: string;
  constitutionalText: string;
  interpretation: string;
  examples: string[];
  antiPatterns: string[];
  dependencies: string[];
  relatedArticles: string[];
  revisionHistory: ConstitutionArticleRevision[];
  approvalHistory: ConstitutionApprovalRecord[];
  canonicalStatus: ConstitutionCanonicalStatus;
  author: string;
  contributors: string[];
  tags: string[];
  sourcePath?: string;
  createdAt: string;
  updatedAt: string;
};

export type ConstitutionRelationship = {
  id: string;
  fromArticleId: string;
  toArticleId: string;
  type: ConstitutionRelationshipType;
  rationale?: string;
  required?: boolean;
  createdAt: string;
};

export type ConstitutionCrossReference = {
  refId: string;
  label: string;
  relationship?: ConstitutionRelationshipType;
  targetArticleId: string;
};

export type ConstitutionAmendment = {
  amendmentId: string;
  targetArticleId: string;
  title: string;
  amendmentClass: 'clarification' | 'extension' | 'correction' | 'repeal' | 'constitutional-change';
  before: string;
  after: string;
  rationale: string;
  stage: ConstitutionAmendmentStage;
  status: 'open' | 'in-progress' | 'approved' | 'rejected' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  discussionNotes: string[];
  architectureReviewNotes: string[];
  founderApproval?: ConstitutionApprovalRecord;
  codexSyncRequired: boolean;
  genesisSyncRequired: boolean;
};

export type ConstitutionReviewSession = {
  sessionId: string;
  articleId?: string;
  amendmentId?: string;
  stage: ConstitutionAmendmentStage;
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'returned';
  reviewer?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
};

export type ConstitutionVote = {
  voteId: string;
  amendmentId: string;
  voter: string;
  decision: 'approve' | 'reject' | 'abstain';
  notes?: string;
  createdAt: string;
};

export type ConstitutionHistoricalEntry = {
  historyId: string;
  articleId: string;
  revision: ConstitutionArticleRevision;
  amendmentId?: string;
  archivedAt: string;
  reason: string;
};

export type ConstitutionStore = {
  version: string;
  articles: ConstitutionArticle[];
  relationships: ConstitutionRelationship[];
  amendments: ConstitutionAmendment[];
  reviews: ConstitutionReviewSession[];
  votes: ConstitutionVote[];
  historicalArchive: ConstitutionHistoricalEntry[];
  bootstrappedAt?: string;
};

export type ConstitutionRegistryStats = {
  articleCount: number;
  canonicalCount: number;
  amendmentCount: number;
  openAmendments: number;
  relationshipCount: number;
  reviewQueue: number;
  historicalEntries: number;
};
