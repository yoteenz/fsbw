/**
 * Milestone 90.5 — Organization Inauguration & Founder Ceremony V1.0
 * Ceremonial experience immediately after Business Discovery Blueprint completion.
 */

import type { OrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/types';

export type InaugurationPhase =
  | 'ceremony'
  | 'activation'
  | 'charter'
  | 'founder-message'
  | 'walkthrough'
  | 'recommendations'
  | 'timeline'
  | 'legacy'
  | 'final';

export type OrganizationCharter = {
  organizationName: string;
  mission: string;
  vision: string;
  coreServices: string[];
  founder: string;
  dateEstablished: string;
  coreValues: string;
  primaryDepartments: string[];
  growthObjectives: string;
  digitalWorkforceSummary: string;
};

export type FounderWelcomeMessage = {
  founderName: string;
  paragraphs: string[];
  closingLine: string;
};

export type HeadquartersActivationStep = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  order: number;
};

export type WalkthroughStop = {
  id: string;
  title: string;
  purpose: string;
  routeSegment?: string;
  order: number;
};

export type InaugurationRecommendation = {
  id: string;
  category:
    | 'automation'
    | 'digital-staff'
    | 'process'
    | 'department-pack'
    | 'expansion'
    | 'training'
    | 'quick-win';
  headline: string;
  detail: string;
};

export type FoundingTimelineMilestone = {
  id: string;
  label: string;
  occurredAt: string;
  permanent: boolean;
};

/** Immutable founding Blueprint — never overwritten by living discovery edits. */
export type FoundingBlueprintSnapshot = {
  snapshotId: string;
  preservedAt: string;
  blueprint: OrganizationDiscoveryBlueprint;
};

export type OrganizationInaugurationProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  blueprintCompletedAt: string;
  inauguratedAt: string;
  inaugurationComplete: boolean;
  headquartersEnteredAt?: string;
  currentPhase: InaugurationPhase;
  walkthroughIndex: number;
  charter: OrganizationCharter;
  founderWelcome: FounderWelcomeMessage;
  activationSteps: HeadquartersActivationStep[];
  walkthroughStops: WalkthroughStop[];
  recommendations: InaugurationRecommendation[];
  foundingTimeline: FoundingTimelineMilestone[];
  foundingBlueprintSnapshot: FoundingBlueprintSnapshot;
  ceremonialLines: string[];
};

export type OrganizationInaugurationStore = {
  version: string;
  profiles: OrganizationInaugurationProfile[];
};

export type InaugurationCeremonyState = {
  profile: OrganizationInaugurationProfile;
  phaseIndex: number;
  totalPhases: number;
  activationProgressPct: number;
  canEnterHeadquarters: boolean;
};
