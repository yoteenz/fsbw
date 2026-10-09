/** Organization-agnostic workflow journal. AIO copy lives in `aio/profile.ts`. */

export type KnowledgeLayer = 'industry' | 'company' | 'private';

export type ExpertiseVisibility =
  | 'company_standard'
  | 'team_only'
  | 'owner_only'
  | 'restricted_expert';

export type JournalLifecycle =
  | 'researched'
  | 'draft'
  | 'expert_review'
  | 'needs_correction'
  | 'expert_confirmed'
  | 'owner_approved'
  | 'available_for_authorized_use'
  | 'superseded'
  | 'retired';

export type StepKind =
  | 'trigger'
  | 'action'
  | 'decision'
  | 'approval'
  | 'handoff'
  | 'exception'
  | 'completion';

export type StepDisposition =
  | 'unreviewed'
  | 'confirmed'
  | 'different'
  | 'not_applicable'
  | 'removed';

export type RequirementClass =
  | 'legal_requirement'
  | 'standard_industry_practice'
  | 'common_business_option'
  | 'organization_specific'
  | 'research_uncertainty';

export type ServiceCommercialState = 'active' | 'paused' | 'limited_pilot' | 'internal' | 'missing' | 'coming_soon' | 'hold' | 'blocked';

export type ResearchSource = {
  id: string;
  publisher: string;
  title: string;
  url: string;
  dateChecked: string;
  publishedOrUpdated: string | null;
  jurisdiction: string;
  applicability: string;
  confidence: 'high' | 'medium' | 'low';
  verification: 'page_read' | 'indexed_excerpt' | 'repository_catalog';
  notes?: string;
};

export type JournalStep = {
  id: string;
  order: number;
  title: string;
  researchedWording: string;
  proposedWording: string | null;
  confirmedWording: string | null;
  expertResponse: string | null;
  kind: StepKind;
  disposition: StepDisposition;
  layer: KnowledgeLayer;
  visibility: ExpertiseVisibility;
  requirementClass: RequirementClass;
  sourceIds: string[];
  approvalRequired: boolean;
  neverAutomate: boolean;
  guidanceMayHaveChanged: boolean;
};

export type PrivateNote = {
  id: string;
  workflowId: string;
  body: string;
  visibility: ExpertiseVisibility;
  layer: 'private';
  confirmed: boolean;
};

export type WorkflowMapNode = {
  id: string;
  engineNodeType: 'trigger' | 'decision' | 'approval' | 'document-creation' | 'end';
  label: string;
  kind: StepKind;
  sourceStepId: string;
};

export type WorkflowMapDraft = {
  status: 'proposed' | 'approved';
  executable: false;
  nodes: WorkflowMapNode[];
};

export type JournalDocument = {
  id: string;
  organizationId: string;
  workflowId: string;
  serviceFamilyId: string;
  expertLabel: string;
  lifecycle: JournalLifecycle;
  steps: JournalStep[];
  privateNotes: PrivateNote[];
  map: WorkflowMapDraft;
  /** Separate from owner approval. Never set by interview completion. */
  workerUseGranted: false;
  updatedAt: string;
  appliedMutationIds: string[];
  persistence: 'device' | 'process_memory' | 'durable_server';
};

export type JournalInvite = {
  id: string;
  organizationId: string;
  expertLabel: string;
  workflowId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type JournalReader = {
  organizationId: string;
  role: 'expert' | 'team' | 'owner' | 'founder';
  inviteId: string | null;
};

export type CaptureMode = 'quick_review' | 'just_tell_me' | 'start_with_a_file';
