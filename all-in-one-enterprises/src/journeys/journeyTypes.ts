/** Reusable service journey domain types (Refinement 06). */

export type JourneyStepId =
  | 'build'
  | 'authorize'
  | 'protect'
  | 'register'
  | 'activate'
  | 'roll';

export type JourneyStepStatus =
  | 'not_started'
  | 'ready'
  | 'in_progress'
  | 'action_required'
  | 'waiting_aio'
  | 'waiting_partner'
  | 'complete'
  | 'not_applicable';

export type JourneyApplicability = 'required' | 'recommended' | 'optional' | 'not_applicable';

export interface JourneySubStepDef {
  id: string;
  label: string;
  description: string;
  roadReadyKeys: string[];
  serviceSlug?: string;
  route?: string;
  applicability?: JourneyApplicability;
}

export interface ServiceJourneyStepDef {
  id: JourneyStepId;
  order: number;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  route: string;
  /** Primary service slug for workflow routing */
  serviceSlug?: string;
  roadReadyKeys: string[];
  subSteps?: JourneySubStepDef[];
  optional?: boolean;
  weight: number;
}

export interface ServiceJourneyDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  steps: ServiceJourneyStepDef[];
}

export interface JourneyStepView {
  def: ServiceJourneyStepDef;
  status: JourneyStepStatus;
  statusLabel: string;
  ctaLabel: string;
  ctaRoute: string;
  applicable: boolean;
  optional: boolean;
  completedAt?: string;
  subProgress?: { completed: number; total: number; percent: number };
  subSteps?: JourneySubStepView[];
  lockedReason?: string;
}

export interface JourneySubStepView {
  def: JourneySubStepDef;
  status: JourneyStepStatus;
  statusLabel: string;
  ctaLabel: string;
  ctaRoute: string;
  applicable: boolean;
}

export interface JourneyProgressView {
  percent: number;
  completedCount: number;
  applicableCount: number;
  label: string;
}

export interface JourneyAttentionItem {
  stepId: JourneyStepId | string;
  label: string;
  route: string;
}

export interface StartBusinessJourneyView {
  journey: ServiceJourneyDef;
  steps: JourneyStepView[];
  progress: JourneyProgressView;
  nextAction: JourneyStepView | null;
  attention: JourneyAttentionItem[];
  isComplete: boolean;
  selectedStepId: JourneyStepId;
}

export const JOURNEY_STEP_STATUS_LABELS: Record<JourneyStepStatus, string> = {
  not_started: 'Not Started',
  ready: 'Ready to Start',
  in_progress: 'In Progress',
  action_required: 'Needs Your Attention',
  waiting_aio: "We're Working On It",
  waiting_partner: 'With Partner',
  complete: 'Complete',
  not_applicable: 'Not Needed',
};

export const JOURNEY_CONTEXT_PARAM = 'journey';
export const JOURNEY_STEP_PARAM = 'step';
export const JOURNEY_FROM_PARAM = 'from';
export const START_BUSINESS_JOURNEY_SLUG = 'start-your-business';
