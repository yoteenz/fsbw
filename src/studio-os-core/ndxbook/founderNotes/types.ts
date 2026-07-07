import type { ProductionDepartmentId } from '../../content-pipeline/departments';

export type FounderNoteStatus =
  | 'open'
  | 'assigned'
  | 'in-revision'
  | 'resolved'
  | 'needs-founder-review'
  | 'deferred';

export type ProductionConciergeId =
  | 'brand'
  | 'editorial'
  | 'legal'
  | 'social-media'
  | 'visual-design'
  | 'strategy'
  | 'studio-orb';

export type FounderNoteRevisionField = 'hook' | 'script' | 'caption' | 'visual' | 'general';

export type FounderNoteRevisionStatus = 'pending' | 'approved' | 'rejected' | 'edited';

export type FounderNoteRevision = {
  id: string;
  noteId: string;
  createdAt: string;
  conciergeId: ProductionConciergeId;
  reason: string;
  field: FounderNoteRevisionField;
  originalVersion: string;
  suggestedVersion: string;
  status: FounderNoteRevisionStatus;
};

export type FounderNote = {
  id: string;
  assetId: string;
  departmentId: ProductionDepartmentId;
  body: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  status: FounderNoteStatus;
  assignedConcierge: ProductionConciergeId;
  instinctFlag: boolean;
  returnDepartmentId: ProductionDepartmentId | null;
  revisions: FounderNoteRevision[];
};

export type FounderInstinctInsight = {
  id: string;
  label: string;
  likelihood: 'high' | 'medium' | 'low';
  detail: string;
  suggestedConcierge: ProductionConciergeId;
};

export type FounderInstinctAnalysis = {
  id: string;
  assetId: string;
  noteId: string | null;
  createdAt: string;
  summary: string;
  insights: FounderInstinctInsight[];
};

export type FounderNotesStore = {
  byAssetId: Record<string, FounderNote[]>;
  instinctAnalyses: Record<string, FounderInstinctAnalysis[]>;
};

export const FOUNDER_NOTE_STATUSES: FounderNoteStatus[] = [
  'open',
  'assigned',
  'in-revision',
  'resolved',
  'needs-founder-review',
  'deferred',
];

export const PRODUCTION_CONCIERGE_LABELS: Record<ProductionConciergeId, string> = {
  brand: 'Brand Concierge™',
  editorial: 'Editorial Concierge™',
  legal: 'Legal Concierge™',
  'social-media': 'Social Media Concierge™',
  'visual-design': 'Visual Design Concierge™',
  strategy: 'Strategy Concierge™',
  'studio-orb': 'Studio Orb · Studio Intelligence™',
};
