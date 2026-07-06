import type {
  CONFIDENCE_LEVELS,
  ESCALATION_ACTIONS,
  REGULATED_PROFESSIONS,
  REVIEW_STATUSES,
} from './constants';

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type ProfessionalReviewStatus = (typeof REVIEW_STATUSES)[number];
export type EscalationAction = (typeof ESCALATION_ACTIONS)[number];
export type RegulatedProfession = (typeof REGULATED_PROFESSIONS)[number];

export type ProfessionalScope = {
  brainId: string;
  canDo: string[];
  cannotDo: string[];
  reviewRecommended: string[];
  reviewRequired: string[];
  internalVisible: boolean;
  externalVisible: boolean;
};

export type BrainConfidenceProfile = {
  brainId: string;
  brainLabel: string;
  knowledgeCoveragePct: number;
  confidenceLevel: ConfidenceLevel;
  professionalReviewStatus: ProfessionalReviewStatus;
  conciergeId?: string;
  regulatedProfession?: RegulatedProfession;
};

export type NaturalGuidanceMessage = {
  id: string;
  brainId: string;
  context: string;
  message: string;
  tone: 'natural' | 'educational' | 'escalation';
};

export type RegulatedIndustryRule = {
  profession: RegulatedProfession;
  industryId: string;
  additionalRequirements: string[];
  reviewRequiredActions: string[];
};

export type EscalationRecommendation = {
  id: string;
  action: EscalationAction;
  label: string;
  reason: string;
  brainId?: string;
};

export type BrainTrustDeclaration = {
  brainId: string;
  brainLabel: string;
  scope: ProfessionalScope;
  confidence: BrainConfidenceProfile;
  guidanceSamples: NaturalGuidanceMessage[];
};

export type OrganizationTrustFrameworkProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  brainSyncedAt: string;
  brainDeclarations: BrainTrustDeclaration[];
  regulatedRules: RegulatedIndustryRule[];
  escalationPlaybook: EscalationRecommendation[];
  overallTrustScore: number;
};

export type ProfessionalTrustStore = {
  version: string;
  profiles: OrganizationTrustFrameworkProfile[];
};

export type ProfessionalTrustDockAdvice = {
  response: string;
  concierge: string;
  escalation?: EscalationRecommendation;
  beyondScope?: boolean;
};
