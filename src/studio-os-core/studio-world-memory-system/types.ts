import type {
  ArchitectReviewAction,
  KnowledgeCoreDomain,
  KnowledgeCoreEntry,
  MemorySystemLayer,
} from '../studio-world-knowledge-core/types';

export type ConversationArchiveStatus = 'Archived';

/** Layer 1 — immutable historical record. */
export type ConversationArchive = {
  id: string;
  title: string;
  date: string;
  status: ConversationArchiveStatus;
  transcript: string;
  transcriptPath?: string;
  summaryForIndex: string;
  preservedExactly: true;
  immutable: true;
  ingestedAt: string;
  relatedExtractionReportId?: string;
  tags: string[];
};

export type ExtractionReportStatus =
  | 'Awaiting Founder Review'
  | 'Approved'
  | 'Modified'
  | 'Rejected'
  | 'Merged'
  | 'Delayed';

/** Layer 2 — extracted understanding, not canon. */
export type MemoryExtractionReport = {
  id: string;
  title: string;
  sourceConversationId: string;
  status: ExtractionReportStatus;
  reportPath?: string;
  conversationSummary: string;
  architecturalDecisions: string[];
  systemsIntroduced: string[];
  designPrinciples: string[];
  conflictsDetected: string[];
  potentialAdrs: string[];
  constitutionUpdates: string[];
  worldBibleUpdates: string[];
  promptStandardUpdates: string[];
  engineeringRecommendations: string[];
  futureOpportunities: string[];
  itemsAwaitingApproval: string[];
  proposedEntries: ProposedKnowledgeEntry[];
  createdAt: string;
  reviewedAt?: string;
  reviewAction?: ArchitectReviewAction;
  reviewNotes?: string;
};

/** Proposed entry — awaits founder review; never Canon. */
export type ProposedKnowledgeEntry = {
  id: string;
  title: string;
  domain: KnowledgeCoreDomain;
  summary: string;
  reasoning: string;
  architectureAdded: string[];
  relatedSystems: string[];
  constitutionArticles: string[];
  adrReferences: string[];
  worldBibleReferences: string[];
  tags: string[];
};

/** Layer 3 — approval queue item. */
export type FounderReviewItem = {
  id: string;
  extractionReportId: string;
  conversationId: string;
  title: string;
  status: ExtractionReportStatus;
  queuedAt: string;
  itemsAwaitingApproval: string[];
};

/** Layer 4 — curator-approved Knowledge Core entry (Approved™, not auto-Canon). */
export type PublishedKnowledgeEntry = KnowledgeCoreEntry & {
  sourceConversationId: string;
  sourceExtractionReportId: string;
  publishedAt: string;
  approvedBy: 'founder';
  reviewAction: ArchitectReviewAction;
};

export type ConversationIngestInput = {
  title: string;
  transcript: string;
  date?: string;
  transcriptPath?: string;
  summaryForIndex?: string;
  tags?: string[];
  autoExtract?: boolean;
};

export type FounderReviewInput = {
  reviewItemId: string;
  action: ArchitectReviewAction;
  notes?: string;
  modifications?: Partial<ProposedKnowledgeEntry>[];
};

export type MemoryGraphNodeKind =
  | 'conversation-archive'
  | 'knowledge-extraction'
  | 'founder-approval'
  | 'knowledge-core-entry'
  | 'historical-impact';

export type MemoryGraphNode = {
  id: string;
  kind: MemoryGraphNodeKind;
  layer: MemorySystemLayer;
  label: string;
  summary: string;
  status: string;
  date: string;
};

export type MemoryGraphEdgeType =
  | 'generated-from'
  | 'references'
  | 'approved-into'
  | 'supersedes'
  | 'historical-impact'
  | 'conversation-source';

export type MemoryGraphEdge = {
  id: string;
  from: string;
  to: string;
  type: MemoryGraphEdgeType;
  label?: string;
};

export type MemoryGraph = {
  nodes: MemoryGraphNode[];
  edges: MemoryGraphEdge[];
  syncedAt: string;
};

export type MemorySearchHit = {
  layer: MemorySystemLayer;
  id: string;
  title: string;
  summary: string;
  score: number;
  matchReason: string;
  conversationRef?: string;
};

export type MemoryVersionRecord = {
  entityId: string;
  entityKind: MemoryGraphNodeKind;
  version: string;
  createdAt: string;
  summary: string;
  status: string;
  supersededBy?: string;
};

export type MemorySystemStore = {
  version: string;
  conversationArchives: ConversationArchive[];
  extractionReports: MemoryExtractionReport[];
  reviewQueue: FounderReviewItem[];
  publishedEntries: PublishedKnowledgeEntry[];
  versionLineage: MemoryVersionRecord[];
};

export type OrganizationMemorySystemProfile = {
  organizationId: string;
  syncedAt: string;
  archiveCount: number;
  extractionCount: number;
  pendingReviewCount: number;
  publishedCount: number;
  memoryGraphNodeCount: number;
  archivistLines: string[];
};
