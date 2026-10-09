/**
 * Studio World Guided Apprenticeship.
 * Organization copy, rooms, and characters stay outside this file.
 */

export type ApprenticeshipMode = 'show_me' | 'let_me_take_over' | 'try_it_my_way' | 'teach_my_team';

export type GuidePresence = 'spatial_host' | 'workspace_presenter';

/** Visual slot only. Appearance, voice, and likeness are not decided here. */
export type GuideExpression = 'aside' | 'spotlight' | 'compact_panel';

export type GuideBeat =
  | 'arrival'
  | 'orientation'
  | 'demonstration'
  | 'takeover'
  | 'observation'
  | 'interpretation'
  | 'replay'
  | 'confirmation'
  | 'completion';

export type KnowledgeLayer = 'industry' | 'company' | 'private';

export type RequirementClass = 'legal_requirement' | 'industry_practice' | 'company_preference';

/** Stored status is the Studio Institute knowledge lifecycle. These names are a view. */
export type KnowledgeMirrorStatus =
  | 'draft'
  | 'interpreted'
  | 'needs_clarification'
  | 'expert_reviewed'
  | 'owner_visible'
  | 'approved_for_training'
  | 'superseded'
  | 'archived';

export type TraineeRole = 'founder' | 'manager' | 'staff' | 'client' | 'ai_team_member';

export type ObservationKind =
  | 'selected_item'
  | 'opened_record'
  | 'changed_value'
  | 'reordered_step'
  | 'changed_decision'
  | 'requested_approval'
  | 'rejected_action'
  | 'explained_why';

export type PracticeStep = {
  id: string;
  order: number;
  title: string;
  /** Workspace surface that currently holds this check. Not a route in production. */
  surfaceId: string;
  requirement: RequirementClass;
  sourceIds: string[];
};

export type ObservationEvent = {
  id: string;
  kind: ObservationKind;
  stepId?: string;
  /** The event this explanation belongs to. */
  aboutEventId?: string;
  fromOrder?: number;
  toOrder?: number;
  reason?: string;
  simulated: true;
};

export type ProposedStep = PracticeStep & {
  reason: string | null;
  unexplained: boolean;
};

export type WorkspaceChangeRequest = {
  id: string;
  organizationId: string;
  finding: string;
  opportunity: string;
  status: 'founder_review';
  appliedToProduction: false;
};

export type OwnerQueueItem = {
  id: string;
  organizationId: string;
  workflowId: string;
  knowledgeStatus: KnowledgeMirrorStatus;
  summary: string;
  workerAuthorized: false;
  executionAuthorized: false;
};

export type ApprenticeshipSession = {
  id: string;
  organizationId: string;
  workflowId: string;
  mode: ApprenticeshipMode;
  beat: GuideBeat;
  presence: GuidePresence;
  expression: GuideExpression;
  control: 'guide' | 'expert';
  baseline: PracticeStep[];
  proposed: ProposedStep[];
  events: ObservationEvent[];
  knowledgeStatus: KnowledgeMirrorStatus;
  clarificationRequired: boolean;
  workerAuthorized: false;
  executionAuthorized: false;
  trainingPublished: boolean;
  simulated: true;
};
