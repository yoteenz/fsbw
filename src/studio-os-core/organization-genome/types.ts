import type {
  AI_CONSULTATION_CONTEXTS,
  GENOME_APPROVAL_STYLES,
  GENOME_COMMUNICATION_STYLES,
  GENOME_IDENTITY_LAYERS,
  GENOME_RISK_LEVELS,
} from './constants';

import type { ReleaseChannelId } from '../release-channel-system/constants';

export type GenomeIdentityLayer = (typeof GENOME_IDENTITY_LAYERS)[number];
export type AiConsultationContext = (typeof AI_CONSULTATION_CONTEXTS)[number];
export type GenomeRiskLevel = (typeof GENOME_RISK_LEVELS)[number];
export type GenomeApprovalStyle = (typeof GENOME_APPROVAL_STYLES)[number];
export type GenomeCommunicationStyle = (typeof GENOME_COMMUNICATION_STYLES)[number];

export type GenomeIdentityLayerEntry = {
  layer: GenomeIdentityLayer;
  label: string;
  value: string;
  source: 'blueprint' | 'charter' | 'workspace' | 'derived';
  lastUpdated: string;
};

export type OrganizationIdentityCore = {
  mission: string;
  vision: string;
  coreValues: string[];
  longTermObjectives: string[];
  founderPhilosophy: string;
};

export type OrganizationBrandVoice = {
  brandPersonality: string;
  toneOfVoice: string;
  communicationStyle: GenomeCommunicationStyle;
  brandVocabulary: string[];
  internalTerminology: string[];
  designPhilosophy: string;
  brandRules: string[];
};

export type OrganizationDecisionDna = {
  leadershipPhilosophy: string;
  decisionPrinciples: string[];
  approvalPreferences: GenomeApprovalStyle;
  approvalNotes: string;
  riskTolerance: GenomeRiskLevel;
  riskNotes: string;
};

export type OrganizationCustomerStandards = {
  experienceStandards: string[];
  servicePromise: string;
  escalationTone: string;
};

export type GenomeAiConsultationRule = {
  context: AiConsultationContext;
  mustReflect: string[];
  mustAvoid: string[];
  sampleGuidance: string;
};

export type OrganizationGenomeProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  /** Constitutional Release Channel assignment (CA-001) */
  releaseChannel: ReleaseChannelId;
  updatedAt: string;
  blueprintSyncedAt?: string;
  charterSyncedAt?: string;
  identityCore: OrganizationIdentityCore;
  brandVoice: OrganizationBrandVoice;
  decisionDna: OrganizationDecisionDna;
  customerStandards: OrganizationCustomerStandards;
  identityLayers: GenomeIdentityLayerEntry[];
  aiConsultationRules: GenomeAiConsultationRule[];
  genomeCompletenessPct: number;
  evolutionNotes: string[];
};

export type OrganizationGenomeStore = {
  version: string;
  profiles: OrganizationGenomeProfile[];
};

export type OrganizationGenomeDockAdvice = {
  response: string;
  concierge: string;
  genomeApplied?: boolean;
};

export type GenomeConsultationResult = {
  organizationId: string;
  context: AiConsultationContext;
  constraints: string[];
  toneGuidance: string;
  vocabularyToUse: string[];
  vocabularyToAvoid: string[];
  mustReflectIdentity: boolean;
};
